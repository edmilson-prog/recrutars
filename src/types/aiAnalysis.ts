/**
 * AI Analysis Types (PRD-051)
 * Agente de Análise Comportamental por IA
 */

import type { GaugeProResult } from './gaugePro';

// --- Analysis ---

export type AnalysisType = 'practical' | 'technical';
export type AnalysisStatus = 'pending' | 'generating' | 'completed' | 'error';

export interface AIAnalysis {
  id: string;
  testResultId: string;
  candidateId: string;
  analysisType: AnalysisType;
  content: string;
  status: AnalysisStatus;
  modelUsed: string;
  tokensInput: number;
  tokensOutput: number;
  generationTimeMs: number;
  createdAt: string;
  regeneratedAt?: string;
  regeneratedBy?: string;
  errorMessage?: string;
}

export interface AIAnalysisResult {
  candidateId: string;
  testResultId: string;
  practical?: AIAnalysis;
  technical?: AIAnalysis;
  generatedAt: string;
}

// --- Claude API ---

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeApiRequest {
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: ClaudeMessage[];
}

export interface ClaudeApiResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{ type: 'text'; text: string }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeApiError {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}

// --- Agent Settings ---

export type LLMProvider = 'anthropic' | 'openai';

export interface AIAgentSettings {
  agentEnabled: boolean;
  provider: LLMProvider;
  model: string;
  apiKey: string;
  practicalAnalysisEnabled: boolean;
  technicalAnalysisEnabled: boolean;
  temperature: number;
  maxTokens: number;
  /** @deprecated Use `model` instead */
  claudeModel: string;
}

// --- LLM Provider Config (PRD-080) ---

export interface LLMProviderConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  lastTestAt: string;
  lastTestStatus: 'success' | 'error' | '';
}

export interface LLMProvidersState {
  agentEnabled: boolean;
  defaultProvider: LLMProvider;
  anthropic: LLMProviderConfig;
  openai: LLMProviderConfig;
}

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  latencyMs: number;
}

export interface LLMModelInfo {
  id: string;
  name: string;
}

// Re-export for convenience
export type { GaugeProResult };
