/**
 * Team Balance Calculations for Team Builder (PRD-056)
 *
 * Computes team-level behavioral metrics from individual Gauge-Pro
 * dimension scores, including balance score, strongest/weakest dimensions,
 * and the impact of adding or removing a member.
 */

import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';

// ── Constants ────────────────────────────────────────────────────────────────

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface TeamMetrics {
  averages: DimensionScores;
  stdDevs: Record<GaugeProDimension, number>;
  balanceScore: number;
  strongestDimension: GaugeProDimension;
  weakestDimension: GaugeProDimension;
  memberCount: number;
}

export interface ChangeImpact {
  before: TeamMetrics;
  after: TeamMetrics;
  balanceDelta: number;
  improvedDimensions: GaugeProDimension[];
  worsenedDimensions: GaugeProDimension[];
}

// ── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Compute the mean of an array of numbers.
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Compute the population standard deviation of an array of numbers.
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Clamp a number between a minimum and maximum (inclusive).
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ── Public Functions ─────────────────────────────────────────────────────────

/**
 * Calculate aggregate team metrics from individual member dimension scores.
 *
 * The balance score is derived from the standard deviation of dimension
 * averages: `balance = 100 - stdDev * 2` (clamped to 0-100). A perfectly
 * balanced team where every dimension average is identical yields 100; the
 * more variation between dimensions, the lower the score.
 */
export function calculateTeamMetrics(memberScores: DimensionScores[]): TeamMetrics {
  const memberCount = memberScores.length;

  // Compute per-dimension averages and standard deviations
  const averages = {} as DimensionScores;
  const stdDevs = {} as Record<GaugeProDimension, number>;

  for (const dim of DIMENSIONS) {
    const values = memberScores.map((s) => s[dim]);
    averages[dim] = mean(values);
    stdDevs[dim] = standardDeviation(values);
  }

  // Balance score: based on how evenly distributed the dimension averages are
  const dimensionAverages = DIMENSIONS.map((dim) => averages[dim]);
  const stdDevOfAverages = standardDeviation(dimensionAverages);
  const balanceScore = clamp(100 - stdDevOfAverages * 2, 0, 100);

  // Strongest & weakest dimensions (by average)
  let strongestDimension: GaugeProDimension = 'D1';
  let weakestDimension: GaugeProDimension = 'D1';
  let highestAvg = -Infinity;
  let lowestAvg = Infinity;

  for (const dim of DIMENSIONS) {
    if (averages[dim] > highestAvg) {
      highestAvg = averages[dim];
      strongestDimension = dim;
    }
    if (averages[dim] < lowestAvg) {
      lowestAvg = averages[dim];
      weakestDimension = dim;
    }
  }

  return {
    averages,
    stdDevs,
    balanceScore,
    strongestDimension,
    weakestDimension,
    memberCount,
  };
}

/**
 * Calculate the impact of adding and/or removing a member from the team.
 *
 * - Pass `addedScore` to simulate adding a new member.
 * - Pass `removedScore` to simulate removing an existing member.
 * - Pass both to simulate a swap.
 *
 * Returns before/after metrics and lists which dimensions improved or worsened
 * (by comparing the absolute distance from the overall team average).
 */
export function calculateChangeImpact(
  currentScores: DimensionScores[],
  addedScore?: DimensionScores,
  removedScore?: DimensionScores,
): ChangeImpact {
  const before = calculateTeamMetrics(currentScores);

  // Build the "after" scores array
  const afterScores = [...currentScores];

  if (removedScore) {
    const idx = afterScores.findIndex((s) =>
      DIMENSIONS.every((dim) => s[dim] === removedScore[dim]),
    );
    if (idx !== -1) {
      afterScores.splice(idx, 1);
    }
  }

  if (addedScore) {
    afterScores.push(addedScore);
  }

  const after = calculateTeamMetrics(afterScores);

  const balanceDelta = after.balanceScore - before.balanceScore;

  // Determine which dimensions improved or worsened.
  // A dimension "improves" when its average moves closer to the global mean,
  // reducing spread (which contributes to a higher balance score).
  const beforeGlobalMean = mean(DIMENSIONS.map((dim) => before.averages[dim]));
  const afterGlobalMean = mean(DIMENSIONS.map((dim) => after.averages[dim]));

  const improvedDimensions: GaugeProDimension[] = [];
  const worsenedDimensions: GaugeProDimension[] = [];

  for (const dim of DIMENSIONS) {
    const beforeDistance = Math.abs(before.averages[dim] - beforeGlobalMean);
    const afterDistance = Math.abs(after.averages[dim] - afterGlobalMean);

    if (afterDistance < beforeDistance) {
      improvedDimensions.push(dim);
    } else if (afterDistance > beforeDistance) {
      worsenedDimensions.push(dim);
    }
  }

  return {
    before,
    after,
    balanceDelta,
    improvedDimensions,
    worsenedDimensions,
  };
}

/**
 * Return a color hex string for the given balance score.
 *
 * - >= 80: green  (#22c55e)
 * - >= 60: lime   (#84cc16)
 * - >= 40: amber  (#f59e0b)
 * - <  40: red    (#ef4444)
 */
export function getBalanceColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

/**
 * Return a human-readable label for the given balance score.
 *
 * - >= 80: 'Excelente'
 * - >= 60: 'Bom'
 * - >= 40: 'Moderado'
 * - <  40: 'Desequilibrado'
 */
export function getBalanceLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Moderado';
  return 'Desequilibrado';
}
