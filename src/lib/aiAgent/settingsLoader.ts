/**
 * AI Agent Settings Loader (PRD-051 + PRD-080)
 * Lê configurações do agente do Supabase (com fallback localStorage)
 * PRD-080: dual-read — integrations.llmProviders (novo) + ai.analysisAgent (fallback)
 */

import type { AIAgentSettings, LLMProvider } from '@/types/aiAnalysis';

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
    const { SettingsServiceSupabase } = await import(
      '@/services/settings/settingsService.supabase'
    );
    const service = new SettingsServiceSupabase();

    // Try new location first (PRD-080: integrations.llmProviders)
    const integrationsValues = await service.getSettingsRaw('admin', 'integrations');
    const llm = integrationsValues?.llmProviders as Record<string, unknown> | undefined;

    // Read analysis mode toggles (stay in ai.analysisAgent)
    const aiValues = await service.getSettingsRaw('admin', 'ai');
    const agent = aiValues?.analysisAgent as Record<string, unknown> | undefined;

    // Read custom prompts (ai.prompts)
    const promptSettings = aiValues?.prompts as Record<string, unknown> | undefined;

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
