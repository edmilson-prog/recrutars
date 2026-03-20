/**
 * AI Agent Settings Loader (PRD-051 + PRD-080)
 * Lê configurações do agente do Supabase (com fallback localStorage)
 * PRD-080: dual-read — integrations.llmProviders (novo) + ai.analysisAgent (fallback)
 */

import type { AIAgentSettings, LLMProvider } from '@/types/aiAnalysis';
import { supabase } from '@/lib/supabase';

const SETTINGS_KEY = 'recrutars-settings-admin';

const DEFAULT_SETTINGS: AIAgentSettings = {
  agentEnabled: true,
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  claudeModel: 'claude-sonnet-4-20250514',
  apiKey: '',
  practicalAnalysisEnabled: true,
  technicalAnalysisEnabled: true,
  temperature: 0.7,
  maxTokens: 2000,
};

function parseAgentSettingsLegacy(agentSettings: Record<string, unknown>): AIAgentSettings {
  const model = (agentSettings.claudeModel as string) ?? DEFAULT_SETTINGS.model;
  return {
    agentEnabled: (agentSettings.agentEnabled as boolean) ?? DEFAULT_SETTINGS.agentEnabled,
    provider: 'anthropic',
    model,
    claudeModel: model,
    apiKey: (agentSettings.apiKey as string) ?? DEFAULT_SETTINGS.apiKey,
    practicalAnalysisEnabled:
      (agentSettings.practicalAnalysisEnabled as boolean) ??
      DEFAULT_SETTINGS.practicalAnalysisEnabled,
    technicalAnalysisEnabled:
      (agentSettings.technicalAnalysisEnabled as boolean) ??
      DEFAULT_SETTINGS.technicalAnalysisEnabled,
    temperature: (agentSettings.temperature as number) ?? DEFAULT_SETTINGS.temperature,
    maxTokens: (agentSettings.maxTokens as number) ?? DEFAULT_SETTINGS.maxTokens,
  };
}

/**
 * Sync loader — reads from localStorage (legacy fallback).
 * Used as a quick fallback when async is not feasible.
 */
export function loadAgentSettings(): AIAgentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const allSettings = JSON.parse(raw);
    const agentSettings = allSettings?.ai?.analysisAgent;
    if (!agentSettings) return DEFAULT_SETTINGS;

    return parseAgentSettingsLegacy(agentSettings);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Async loader — reads from Supabase (unmasked, protected by RLS).
 * PRD-080: reads from new integrations.llmProviders location first,
 * falls back to ai.analysisAgent for backward compatibility.
 */
export async function loadAgentSettingsAsync(): Promise<AIAgentSettings> {
  try {
    // Load LLM config via SECURITY DEFINER RPC (bypasses RLS for all user types)
    const { data: llm } = await supabase.rpc('get_llm_config');

    // Load analysis mode toggles + custom prompts (admin-only via SettingsService)
    // These may return null/error for non-admin or unauthenticated users — defaults apply
    let agent: Record<string, unknown> | undefined;
    let promptSettings: Record<string, unknown> | undefined;
    try {
      const { SettingsServiceSupabase } = await import(
        '@/services/settings/settingsService.supabase'
      );
      const service = new SettingsServiceSupabase();
      const aiValues = await service.getSettingsRaw('admin', 'ai');
      agent = aiValues?.analysisAgent as Record<string, unknown> | undefined;
      promptSettings = aiValues?.prompts as Record<string, unknown> | undefined;
    } catch {
      // RLS blocks system_settings for unauthenticated users (collaborator flow) — use defaults
    }

    if (llm && (llm.anthropicApiKey || llm.openaiApiKey || llm.openrouterApiKey)) {
      const provider = (llm.defaultProvider as LLMProvider) || 'anthropic';
      const prefix = provider === 'openai' ? 'openai' : provider === 'openrouter' ? 'openrouter' : 'anthropic';
      const model = (llm[`${prefix}Model`] as string) ?? DEFAULT_SETTINGS.model;

      return {
        agentEnabled: (llm.agentEnabled as boolean) ?? DEFAULT_SETTINGS.agentEnabled,
        provider,
        model,
        claudeModel: model,
        apiKey: (llm[`${prefix}ApiKey`] as string) ?? '',
        practicalAnalysisEnabled:
          (agent?.practicalAnalysisEnabled as boolean) ?? DEFAULT_SETTINGS.practicalAnalysisEnabled,
        technicalAnalysisEnabled:
          (agent?.technicalAnalysisEnabled as boolean) ?? DEFAULT_SETTINGS.technicalAnalysisEnabled,
        temperature: (llm[`${prefix}Temperature`] as number) ?? DEFAULT_SETTINGS.temperature,
        maxTokens: (llm[`${prefix}MaxTokens`] as number) ?? DEFAULT_SETTINGS.maxTokens,
        systemPrompt: (promptSettings?.systemPrompt as string) || undefined,
        practicalPromptTemplate: (promptSettings?.practicalPromptTemplate as string) || undefined,
        technicalPromptTemplate: (promptSettings?.technicalPromptTemplate as string) || undefined,
      };
    }

    // Fallback to legacy location (ai.analysisAgent)
    if (agent) {
      return parseAgentSettingsLegacy(agent);
    }

    return DEFAULT_SETTINGS;
  } catch {
    return loadAgentSettings();
  }
}
