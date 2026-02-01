/**
 * Gauge-Pro Scoring Logic
 * PRD-049: Word selection scoring (10 steps: 5 dimensions × 2 perspectives)
 * PRD-050: Scenario scoring, final composite, archetype determination
 */

import type {
  AdjectiveWord,
  DimensionScores,
  DimensionClassification,
  GaugeProDimension,
  ScenarioResponse,
  Scenario,
  WordStepResponse,
} from '@/types/gaugePro';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

function emptyScores(): DimensionScores {
  return { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };
}

/**
 * Fisher-Yates shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Part 1: Calculate word selection scores from 10 step responses
 * For each dimension: self selections (weight 1.0) + others selections (weight 0.5)
 * Each word: high polarity = +2, low polarity = -2
 * User selects 5 words per step from 20 available
 * Max per dimension: (5 × +2 × 1.0) + (5 × +2 × 0.5) = +15
 * Min per dimension: (5 × -2 × 1.0) + (5 × -2 × 0.5) = -15
 */
export function calculateWordSelectionScores(
  stepResponses: WordStepResponse[],
  allWords: AdjectiveWord[]
): DimensionScores {
  const raw = emptyScores();
  const { listAWeight, listBWeight } = GAUGE_PRO_CONFIG.part1;
  const wordMap = new Map(allWords.map(w => [w.id, w]));

  for (const step of stepResponses) {
    const weight = step.perspective === 'self' ? listAWeight : listBWeight;

    for (const wordId of step.selectedWordIds) {
      const word = wordMap.get(wordId);
      if (word && word.dimension === step.dimension) {
        const value = word.polarity === 'high' ? 2 : -2;
        raw[step.dimension] += value * weight;
      }
    }
  }

  // Normalize: range is -15 to +15
  const maxRaw = 15;
  const minRaw = -15;
  const range = maxRaw - minRaw;

  const normalized = emptyScores();
  for (const dim of DIMENSIONS) {
    normalized[dim] = Math.round(Math.max(0, Math.min(100, ((raw[dim] - minRaw) / range) * 100)));
  }

  return normalized;
}

/**
 * Part 2: Calculate scenario scores
 * Each selected option gives +1 to mapped dimensions (direction '+') or -1 (direction '-')
 */
export function calculateScenarioScores(
  responses: ScenarioResponse[],
  scenarios: Scenario[]
): DimensionScores {
  const raw = emptyScores();
  const scenarioMap = new Map(scenarios.map(s => [s.id, s]));

  for (const resp of responses) {
    const scenario = scenarioMap.get(resp.scenarioId);
    if (!scenario) continue;
    const option = scenario.options.find(o => o.key === resp.selectedOption);
    if (!option) continue;

    for (const mapping of option.mappings) {
      raw[mapping.dimension] += mapping.direction === '+' ? 1 : -1;
    }
  }

  const maxPossible = 10;
  const minPossible = -10;
  const range = maxPossible - minPossible;

  const normalized = emptyScores();
  for (const dim of DIMENSIONS) {
    const clamped = Math.max(minPossible, Math.min(maxPossible, raw[dim]));
    normalized[dim] = Math.round(((clamped - minPossible) / range) * 100);
  }

  return normalized;
}

/**
 * Combine Part 1 (60%) + Part 2 (40%) into final scores
 */
export function calculateFinalScores(
  part1: DimensionScores,
  part2: DimensionScores
): DimensionScores {
  const { part1Weight, part2Weight } = GAUGE_PRO_CONFIG.scoring;
  const final = emptyScores();

  for (const dim of DIMENSIONS) {
    final[dim] = Math.round(part1[dim] * part1Weight + part2[dim] * part2Weight);
  }

  return final;
}

/**
 * Classify dimension score as low/medium/high
 */
export function classifyScore(score: number): DimensionClassification {
  const { low, medium } = GAUGE_PRO_CONFIG.classification;
  if (score <= low.max) return 'low';
  if (score <= medium.max) return 'medium';
  return 'high';
}

/**
 * Classify all dimensions
 */
export function classifyAllDimensions(
  scores: DimensionScores
): Record<GaugeProDimension, DimensionClassification> {
  return {
    D1: classifyScore(scores.D1),
    D2: classifyScore(scores.D2),
    D3: classifyScore(scores.D3),
    D4: classifyScore(scores.D4),
    D5: classifyScore(scores.D5),
  };
}

/**
 * Get top N strengths from archetype based on highest dimensions
 */
export function getTopStrengths(scores: DimensionScores, count = 3): GaugeProDimension[] {
  return DIMENSIONS
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, count);
}

/**
 * Get development areas (lowest scoring dimensions)
 */
export function getDevelopmentDimensions(scores: DimensionScores, count = 2): GaugeProDimension[] {
  return DIMENSIONS
    .sort((a, b) => scores[a] - scores[b])
    .slice(0, count);
}
