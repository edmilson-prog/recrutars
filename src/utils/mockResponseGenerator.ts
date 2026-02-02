/**
 * Mock Response Generator
 * Deterministically reconstructs test responses from final scores
 */

import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';
import type { MockTestResponses, MockWordSelection, MockScenarioResponse } from '@/types/companyTest';
import { GAUGE_PRO_ADJECTIVES } from '@/data/gaugeProWords';
import { GAUGE_PRO_SCENARIOS } from '@/data/gaugeProScenarios';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

// Simple seeded pseudo-random for determinism
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function shuffleWithSeed<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateMockResponses(
  candidateId: string,
  scores: DimensionScores
): MockTestResponses {
  const rng = seededRandom(candidateId);

  // Part 1: Word Selections
  const wordSelections: MockWordSelection[] = [];
  for (const dim of DIMENSIONS) {
    for (const perspective of ['self', 'others'] as const) {
      const dimWords = GAUGE_PRO_ADJECTIVES.filter(w => w.dimension === dim);
      const highWords = dimWords.filter(w => w.polarity === 'high');
      const lowWords = dimWords.filter(w => w.polarity === 'low');

      const score = scores[dim];
      // score >= 60 → mostly high words; < 40 → mostly low; otherwise mixed
      let highCount: number;
      if (score >= 70) highCount = 3;
      else if (score >= 60) highCount = 2;
      else if (score >= 40) highCount = 1;
      else highCount = 0;
      const lowCount = 3 - highCount;

      const shuffledHigh = shuffleWithSeed(highWords, rng);
      const shuffledLow = shuffleWithSeed(lowWords, rng);

      const selected = [
        ...shuffledHigh.slice(0, highCount).map(w => ({ id: w.id, text: w.text, polarity: w.polarity })),
        ...shuffledLow.slice(0, lowCount).map(w => ({ id: w.id, text: w.text, polarity: w.polarity })),
      ];

      wordSelections.push({
        dimension: dim,
        perspective,
        selectedWords: selected,
      });
    }
  }

  // Part 2: Scenario Responses
  const scenarioResponses: MockScenarioResponse[] = GAUGE_PRO_SCENARIOS.map(scenario => {
    // Score each option based on alignment with candidate scores
    const optionScores = scenario.options.map(opt => {
      let optScore = 0;
      for (const mapping of opt.mappings) {
        const dimScore = scores[mapping.dimension];
        if (mapping.direction === '+') {
          optScore += dimScore;
        } else {
          optScore += (100 - dimScore);
        }
      }
      // Add small random tiebreaker
      optScore += rng() * 5;
      return { key: opt.key, score: optScore };
    });

    const bestOption = optionScores.reduce((a, b) => a.score > b.score ? a : b);
    const selectedOpt = scenario.options.find(o => o.key === bestOption.key)!;

    return {
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      situation: scenario.situation,
      selectedOption: selectedOpt.key,
      selectedText: selectedOpt.text,
      allOptions: scenario.options.map(o => ({
        key: o.key,
        text: o.text,
        isSelected: o.key === selectedOpt.key,
      })),
    };
  });

  return { wordSelections, scenarioResponses };
}
