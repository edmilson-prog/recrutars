/**
 * AI Analysis Storage Service (PRD-051)
 * Persistência via localStorage
 */

import type { AIAnalysisResult } from '@/types/aiAnalysis';

const STORAGE_KEY_PREFIX = 'gauge-ai-analysis-';

function getKey(candidateId: string): string {
  return `${STORAGE_KEY_PREFIX}${candidateId}`;
}

export function saveAnalysisResult(result: AIAnalysisResult): void {
  localStorage.setItem(getKey(result.candidateId), JSON.stringify(result));
}

export function loadAnalysisResult(
  candidateId: string,
): AIAnalysisResult | null {
  const raw = localStorage.getItem(getKey(candidateId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AIAnalysisResult;
  } catch {
    return null;
  }
}

export function deleteAnalysisResult(candidateId: string): void {
  localStorage.removeItem(getKey(candidateId));
}
