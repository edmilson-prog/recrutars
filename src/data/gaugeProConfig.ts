/**
 * Gauge-Pro Assessment Configuration
 * PRD-049 & PRD-050
 */

export const GAUGE_PRO_CONFIG = {
  part1: {
    totalWords: 100,
    wordsPerDimension: 20,
    selectionsPerList: 5,
    listAWeight: 1.0,
    listBWeight: 0.5,
    totalSteps: 10, // 5 dimensions × 2 perspectives
    estimatedMinutes: 15,
  },
  part2: {
    totalScenarios: 15,
    estimatedMinutes: 20,
  },
  scoring: {
    part1Weight: 0.6,
    part2Weight: 0.4,
  },
  classification: {
    low: { min: 0, max: 33 },
    medium: { min: 34, max: 66 },
    high: { min: 67, max: 100 },
  },
  rewards: {
    xpReward: 150,
    badgeId: 'gauge_pro_behavioral',
  },
  cooldownDays: 180,
  sessionValidDays: 7,
  storageKeys: {
    assessment: (candidateId: string) => `gauge-pro-assessment-${candidateId}`,
    result: (candidateId: string) => `gauge-pro-result-${candidateId}`,
    lastCompleted: (candidateId: string) => `gauge-pro-last-completed-${candidateId}`,
  },
};
