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

export interface AIAgentSettings {
  agentEnabled: boolean;
  claudeModel: string;
  apiKey: string;
  practicalAnalysisEnabled: boolean;
  technicalAnalysisEnabled: boolean;
  temperature: number;
  maxTokens: number;
}

// Re-export for convenience
export type { GaugeProResult };
