/**
 * Behavioral Profile Helpers
 * PRD-072: Extracted from mockData.ts
 *
 * idealBehavioralProfiles is reference data mapping job IDs to ideal DISC profiles.
 * These will eventually come from job configuration in the database.
 */

import type { BehavioralProfile } from '@/types';

/**
 * Perfis comportamentais ideais por vaga
 * Cada vaga tem um perfil comportamental ideal para o cargo
 */
export const idealBehavioralProfiles: Record<string, BehavioralProfile> = {
  'job-1': { d: 75, i: 45, s: 40, c: 80 },
  'job-2': { d: 65, i: 80, s: 50, c: 55 },
  'job-3': { d: 40, i: 75, s: 70, c: 60 },
  'job-4': { d: 35, i: 40, s: 65, c: 85 },
  'job-5': { d: 55, i: 70, s: 60, c: 50 },
  'job-6': { d: 80, i: 60, s: 35, c: 70 },
  'job-7': { d: 45, i: 55, s: 75, c: 65 },
  'job-8': { d: 70, i: 75, s: 45, c: 50 },
  'job-9': { d: 50, i: 60, s: 55, c: 75 },
  'job-10': { d: 85, i: 50, s: 30, c: 65 },
  'job-11': { d: 40, i: 80, s: 65, c: 45 },
  'job-12': { d: 60, i: 45, s: 70, c: 80 },
  'job-13': { d: 75, i: 70, s: 40, c: 55 },
  'job-14': { d: 55, i: 65, s: 60, c: 70 },
  'job-15': { d: 45, i: 50, s: 80, c: 75 },
};

/**
 * Função auxiliar para obter perfil comportamental ideal de uma vaga
 */
export function getIdealBehavioralProfile(jobId: string): BehavioralProfile | undefined {
  return idealBehavioralProfiles[jobId];
}

/**
 * Função auxiliar para obter perfil comportamental de um candidato a partir de testes
 * Aceita array de testes comportamentais como parâmetro (desacoplado de mocks)
 */
export function getCandidateBehavioralProfile(
  candidateId: string,
  tests: Array<{ candidateId: string; status: string; result?: { dominance: number; influence: number; steadiness: number; compliance: number } | null }>
): BehavioralProfile | undefined {
  const test = tests.find(
    (t) => t.candidateId === candidateId && t.status === 'completed' && t.result
  );
  if (!test?.result) return undefined;
  return {
    d: test.result.dominance,
    i: test.result.influence,
    s: test.result.steadiness,
    c: test.result.compliance,
  };
}
