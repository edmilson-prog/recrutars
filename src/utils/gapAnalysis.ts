/**
 * Gap Analysis Algorithm for Team Management
 *
 * PRD-056: Gestao de Equipes - Compatibilidade & Team Builder
 *
 * Analyses the average behavioural scores of a team (or department) against an
 * ideal zone (default 40-75) per Gauge-Pro dimension, identifies gaps and
 * excesses, recommends an ideal hire profile, and suggests an archetype to
 * compensate for the largest deficits.
 */

import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { GapItem, GapAnalysisResult } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const DEFAULT_IDEAL_MIN = 40;
const DEFAULT_IDEAL_MAX = 75;
const IDEAL_ZONE_CENTER = 57.5;

/**
 * Archetype lookup table.
 * Each entry maps one or two primary gap dimensions to a recommended archetype
 * name that would best compensate for the team deficit.
 */
const ARCHETYPE_MAP: Record<string, string> = {
  D1: 'Executor Estrategico',
  D2: 'Comunicador Influente',
  D3: 'Harmonizador Paciente',
  D4: 'Analista Estruturado',
  D5: 'Conector Relacional',
  'D1+D2': 'Lider Inspirador',
  'D1+D4': 'Gestor Disciplinado',
  'D2+D5': 'Embaixador Social',
  'D3+D4': 'Operador Meticuloso',
  'D3+D5': 'Mentor Acolhedor',
};

// ---------------------------------------------------------------------------
// Helper: determine severity
// ---------------------------------------------------------------------------

function classifySeverity(value: number): 'critical' | 'moderate' | 'minor' {
  const abs = Math.abs(value);
  if (abs >= 20) return 'critical';
  if (abs >= 10) return 'moderate';
  return 'minor';
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Calculate the element-wise average of an array of DimensionScores.
 *
 * If the array is empty every dimension returns 0.
 */
export function calculateTeamAverage(memberScores: DimensionScores[]): DimensionScores {
  const result: DimensionScores = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };

  if (memberScores.length === 0) return result;

  for (const scores of memberScores) {
    for (const dim of ALL_DIMENSIONS) {
      result[dim] += scores[dim];
    }
  }

  for (const dim of ALL_DIMENSIONS) {
    result[dim] = Math.round((result[dim] / memberScores.length) * 100) / 100;
  }

  return result;
}

/**
 * Analyse the team average against the ideal zone and return the list of
 * dimensions that fall below (`gaps`) or above (`excesses`) the ideal range.
 *
 * Dimensions inside the ideal zone are omitted from both lists.
 */
export function analyzeGaps(
  teamAverage: DimensionScores,
  idealMin: number = DEFAULT_IDEAL_MIN,
  idealMax: number = DEFAULT_IDEAL_MAX,
): { gaps: GapItem[]; excesses: GapItem[] } {
  const gaps: GapItem[] = [];
  const excesses: GapItem[] = [];

  for (const dim of ALL_DIMENSIONS) {
    const avg = teamAverage[dim];
    const idealRange = { min: idealMin, max: idealMax };

    if (avg < idealMin) {
      const gapValue = idealMin - avg;
      gaps.push({
        dimension: dim,
        currentAverage: avg,
        idealRange,
        gap: -gapValue, // negative = deficit (lacuna)
        severity: classifySeverity(gapValue),
      });
    } else if (avg > idealMax) {
      const excessValue = avg - idealMax;
      excesses.push({
        dimension: dim,
        currentAverage: avg,
        idealRange,
        gap: excessValue, // positive = excess
        severity: classifySeverity(excessValue),
      });
    }
    // If idealMin <= avg <= idealMax the dimension is balanced — no entry.
  }

  // Sort by absolute gap descending so the most severe items appear first.
  gaps.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  excesses.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));

  return { gaps, excesses };
}

/**
 * Recommend the ideal Gauge-Pro profile for a new hire that would best
 * compensate for the identified gaps and excesses.
 *
 * - Gap dimensions: ideal score = centre + |gap|
 * - Excess dimensions: ideal score = centre - excess
 * - Balanced dimensions: keep at centre (57.5)
 *
 * All resulting scores are clamped to the [0, 100] range.
 */
export function recommendIdealProfile(
  gaps: GapItem[],
  excesses: GapItem[],
): DimensionScores {
  const profile: DimensionScores = { D1: IDEAL_ZONE_CENTER, D2: IDEAL_ZONE_CENTER, D3: IDEAL_ZONE_CENTER, D4: IDEAL_ZONE_CENTER, D5: IDEAL_ZONE_CENTER };

  for (const item of gaps) {
    // gap is stored as negative; we add its absolute value to the centre
    profile[item.dimension] = IDEAL_ZONE_CENTER + Math.abs(item.gap);
  }

  for (const item of excesses) {
    // excess is stored as positive; we subtract it from the centre
    profile[item.dimension] = IDEAL_ZONE_CENTER - item.gap;
  }

  // Clamp every dimension to [0, 100]
  for (const dim of ALL_DIMENSIONS) {
    profile[dim] = Math.round(Math.min(100, Math.max(0, profile[dim])) * 100) / 100;
  }

  return profile;
}

/**
 * Determine the recommended archetype based on which dimensions have the
 * largest gaps (deficits).  The algorithm looks at the top-1 and top-2 gap
 * dimensions to find a matching archetype; when no gaps exist it falls back
 * to a generic "Perfil Equilibrado" recommendation.
 */
function determineArchetype(gaps: GapItem[]): string {
  if (gaps.length === 0) return 'Perfil Equilibrado';

  // gaps are already sorted by absolute value descending (from analyzeGaps)
  const topDim = gaps[0].dimension;

  if (gaps.length >= 2) {
    const secondDim = gaps[1].dimension;
    // Build a canonical key (sorted so order does not matter)
    const sorted = [topDim, secondDim].sort();
    const comboKey = `${sorted[0]}+${sorted[1]}`;
    if (ARCHETYPE_MAP[comboKey]) {
      return ARCHETYPE_MAP[comboKey];
    }
  }

  return ARCHETYPE_MAP[topDim] ?? `Perfil orientado a ${DIMENSION_SHORT_NAMES[topDim]}`;
}

/**
 * Perform the full gap analysis pipeline:
 *
 * 1. Calculate team average
 * 2. Identify gaps and excesses
 * 3. Recommend an ideal profile
 * 4. Suggest an archetype
 *
 * Returns a complete `GapAnalysisResult` ready for rendering.
 */
export function performGapAnalysis(
  memberScores: DimensionScores[],
  departmentId?: string,
): GapAnalysisResult {
  const teamAverage = calculateTeamAverage(memberScores);
  const { gaps, excesses } = analyzeGaps(teamAverage);
  const idealProfile = recommendIdealProfile(gaps, excesses);
  const recommendedArchetype = determineArchetype(gaps);

  return {
    departmentId,
    teamAverage,
    gaps,
    excesses,
    idealProfile,
    recommendedArchetype,
  };
}

/**
 * Return a colour hex string corresponding to a gap severity level.
 *
 * - critical: red  (#ef4444)
 * - moderate: amber (#f59e0b)
 * - minor:    lime  (#84cc16)
 */
export function getGapSeverityColor(severity: 'critical' | 'moderate' | 'minor'): string {
  switch (severity) {
    case 'critical':
      return '#ef4444';
    case 'moderate':
      return '#f59e0b';
    case 'minor':
      return '#84cc16';
  }
}
