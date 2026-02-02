/**
 * AI Agent Settings Loader (PRD-051)
 * Lê configurações do agente do localStorage
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

export function loadAgentSettings(): AIAgentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const allSettings = JSON.parse(raw);
    const agentSettings = allSettings?.ai?.analysisAgent;
    if (!agentSettings) return DEFAULT_SETTINGS;

    return {
      agentEnabled: agentSettings.agentEnabled ?? DEFAULT_SETTINGS.agentEnabled,
      claudeModel: agentSettings.claudeModel ?? DEFAULT_SETTINGS.claudeModel,
      apiKey: agentSettings.apiKey ?? DEFAULT_SETTINGS.apiKey,
      practicalAnalysisEnabled:
        agentSettings.practicalAnalysisEnabled ??
        DEFAULT_SETTINGS.practicalAnalysisEnabled,
      technicalAnalysisEnabled:
        agentSettings.technicalAnalysisEnabled ??
        DEFAULT_SETTINGS.technicalAnalysisEnabled,
      temperature: agentSettings.temperature ?? DEFAULT_SETTINGS.temperature,
      maxTokens: agentSettings.maxTokens ?? DEFAULT_SETTINGS.maxTokens,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
