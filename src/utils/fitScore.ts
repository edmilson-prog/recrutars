/**
 * Fit Score Calculation
 * PRD-053: Score de Fit = Sum(Score*Peso) / Sum(100*Peso) * 100
 */

import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';
import type { FitClassification } from '@/types/companyTest';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export function calculateFitScore(
  candidateScores: DimensionScores,
  weights: Record<GaugeProDimension, number>
): number {
  let weightedSum = 0;
  let maxWeightedSum = 0;

  for (const dim of DIMENSIONS) {
    weightedSum += candidateScores[dim] * weights[dim];
    maxWeightedSum += 100 * weights[dim];
  }

  if (maxWeightedSum === 0) return 0;
  return Math.round((weightedSum / maxWeightedSum) * 1000) / 10;
}

export function classifyFitScore(score: number): FitClassification {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'regular';
  return 'low';
}

export function getFitScoreLabel(classification: FitClassification): string {
  const labels: Record<FitClassification, string> = {
    excellent: 'Excelente',
    good: 'Bom',
    regular: 'Regular',
    low: 'Baixo',
  };
  return labels[classification];
}

export function getFitScoreColor(classification: FitClassification): string {
  const colors: Record<FitClassification, string> = {
    excellent: '#16a34a',
    good: '#2563eb',
    regular: '#ca8a04',
    low: '#dc2626',
  };
  return colors[classification];
}
