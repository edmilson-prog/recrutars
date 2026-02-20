/**
 * AI Analysis Generator (PRD-051)
 * Orquestração da geração de análises
 */

import type {
  AIAgentSettings,
  AIAnalysis,
  AIAnalysisResult,
  AnalysisType,
} from '@/types/aiAnalysis';
import type { GaugeProResult } from '@/types/gaugePro';
import { callLLMApi } from './llmApiService';
import {
  DEFAULT_SYSTEM_PROMPT,
  buildPracticalPrompt,
  buildTechnicalPrompt,
} from './prompts';

function createAnalysisId(type: AnalysisType): string {
  return `aia-${type}-${Date.now()}`;
}

export async function generateSingleAnalysis(
  type: AnalysisType,
  result: GaugeProResult,
  candidateName: string,
  settings: AIAgentSettings,
  jobTitle?: string,
): Promise<AIAnalysis> {
  const startTime = performance.now();
  const id = createAnalysisId(type);

  const systemPrompt = settings.systemPrompt || DEFAULT_SYSTEM_PROMPT;

  const userMessage =
    type === 'practical'
      ? buildPracticalPrompt(result, candidateName, jobTitle, settings.practicalPromptTemplate)
      : buildTechnicalPrompt(result, candidateName, settings.technicalPromptTemplate);

  try {
    const response = await callLLMApi(
      {
        model: settings.model,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      },
      settings.apiKey,
      settings.provider,
    );

    const content =
      response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n') || '';

    return {
      id,
      testResultId: result.id,
      candidateId: result.candidateId,
      analysisType: type,
      content,
      status: 'completed',
      modelUsed: response.model,
      tokensInput: response.usage.input_tokens,
      tokensOutput: response.usage.output_tokens,
      generationTimeMs: Math.round(performance.now() - startTime),
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      id,
      testResultId: result.id,
      candidateId: result.candidateId,
      analysisType: type,
      content: '',
      status: 'error',
      modelUsed: settings.model,
      tokensInput: 0,
      tokensOutput: 0,
      generationTimeMs: Math.round(performance.now() - startTime),
      createdAt: new Date().toISOString(),
      errorMessage:
        error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export async function generateBothAnalyses(
  result: GaugeProResult,
  candidateName: string,
  settings: AIAgentSettings,
  jobTitle?: string,
): Promise<AIAnalysisResult> {
  const promises: Promise<AIAnalysis | null>[] = [];

  if (settings.practicalAnalysisEnabled) {
    promises.push(
      generateSingleAnalysis('practical', result, candidateName, settings, jobTitle),
    );
  } else {
    promises.push(Promise.resolve(null));
  }

  if (settings.technicalAnalysisEnabled) {
    promises.push(
      generateSingleAnalysis('technical', result, candidateName, settings),
    );
  } else {
    promises.push(Promise.resolve(null));
  }

  const [practicalResult, technicalResult] = await Promise.allSettled(promises);

  const practical =
    practicalResult.status === 'fulfilled' ? practicalResult.value : null;
  const technical =
    technicalResult.status === 'fulfilled' ? technicalResult.value : null;

  return {
    candidateId: result.candidateId,
    testResultId: result.id,
    practical: practical ?? undefined,
    technical: technical ?? undefined,
    generatedAt: new Date().toISOString(),
  };
}
