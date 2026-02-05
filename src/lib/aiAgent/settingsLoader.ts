/**
 * AI Agent Settings Loader (PRD-051 + Supabase migration)
 * Lê configurações do agente do Supabase (com fallback localStorage)
 */

import type { AIAgentSettings } from '@/types/aiAnalysis';

const SETTINGS_KEY = 'recrutars-settings-admin';

const DEFAULT_SETTINGS: AIAgentSettings = {
  agentEnabled: true,
  claudeModel: 'claude-sonnet-4-20250514',
  apiKey: '',
  practicalAnalysisEnabled: true,
  technicalAnalysisEnabled: true,
  temperature: 0.7,
  maxTokens: 2000,
};

function parseAgentSettings(agentSettings: Record<string, unknown>): AIAgentSettings {
  return {
    agentEnabled: (agentSettings.agentEnabled as boolean) ?? DEFAULT_SETTINGS.agentEnabled,
    claudeModel: (agentSettings.claudeModel as string) ?? DEFAULT_SETTINGS.claudeModel,
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

    return parseAgentSettings(agentSettings);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Async loader — reads from Supabase (unmasked, protected by RLS).
 * Used by AI analysis generation where the real API key is needed.
 */
export async function loadAgentSettingsAsync(): Promise<AIAgentSettings> {
  try {
    const { SettingsServiceSupabase } = await import(
      '@/services/settings/settingsService.supabase'
    );
    const service = new SettingsServiceSupabase();
    const rawValues = await service.getSettingsRaw('admin', 'ai');

    if (!rawValues) return loadAgentSettings();

    const agentSettings = rawValues.analysisAgent;
    if (!agentSettings) return loadAgentSettings();

    return parseAgentSettings(agentSettings as Record<string, unknown>);
  } catch {
    return loadAgentSettings();
  }
}
