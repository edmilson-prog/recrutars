/**
 * Behavioral Profile Helpers
 * PRD-072: Extracted from mockData.ts
 * PRD-035 Fix: Dynamic ideal profile generation + Gauge-Pro 5D→4D conversion
 *
 * idealBehavioralProfiles is legacy reference data mapping old mock IDs.
 * Real jobs use generateIdealProfile() based on job characteristics.
 */

import type { BehavioralProfile, Job } from '@/types';
import type { DimensionScores } from '@/types/gaugePro';

// ---------------------------------------------------------------------------
// Legacy ideal profiles (mock IDs — kept for reference only)
// ---------------------------------------------------------------------------

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
 * @deprecated Use getOrGenerateIdealProfile(job) instead.
 * Legacy lookup by mock job ID — returns undefined for real Supabase UUIDs.
 */
export function getIdealBehavioralProfile(jobId: string): BehavioralProfile | undefined {
  return idealBehavioralProfiles[jobId];
}

// ---------------------------------------------------------------------------
// Dynamic ideal profile generation based on job characteristics
// ---------------------------------------------------------------------------

const normalize = (s: string) =>
  s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Generates an ideal behavioral profile based on job area, level, type and title.
 * Uses heuristic mapping: job characteristics → expected DISC dimensions.
 *
 * D = Dominancia/Assertividade, I = Sociabilidade/Extroversao
 * S = Ritmo/Paciencia,          C = Conformidade/Estrutura
 */
export function generateIdealProfile(job: Partial<Job>): BehavioralProfile {
  // Start with a balanced base
  let d = 50, i = 50, s = 50, c = 50;

  const title = normalize(job.title ?? '');
  const level = normalize(job.level ?? '');
  const area = normalize(job.area ?? '');

  // --- Level adjustments ---
  if (level.includes('gerente') || level.includes('diretor')) {
    d += 20; i += 15; s -= 10; c += 5;
  } else if (level.includes('senior') || level === 'especialista') {
    d += 10; c += 10;
  } else if (level.includes('junior') || level === 'estagio') {
    s += 15; c += 10; d -= 10;
  } else if (level === 'pleno') {
    d += 5; s += 5; c += 5;
  }

  // --- Area adjustments (job.area = CLT, PJ, Estagio, Freelancer) ---
  if (area === 'freelancer') {
    d += 10; i += 5; s -= 5;
  }

  // --- Title keyword adjustments ---
  // Leadership / management
  if (/\b(lider|coordenador|supervisor|head|lead|manager|cto|ceo|coo)\b/.test(title)) {
    d += 15; i += 10; s -= 5;
  }
  // Technical / development
  if (/\b(desenvolvedor|dev|developer|programador|engenheiro|engineer|arquiteto|architect|devops|sre|dba|backend|fullstack|frontend)\b/.test(title)) {
    c += 15; d += 5; s += 5;
  }
  // Sales / commercial
  if (/\b(vendedor|vendas|comercial|sales|account|closer|sdr|bdr)\b/.test(title)) {
    i += 20; d += 10; s -= 10;
  }
  // Marketing / communication
  if (/\b(marketing|comunicacao|social media|conteudo|content|growth|branding|design|ux|ui)\b/.test(title)) {
    i += 15; d += 5;
  }
  // Support / customer success
  if (/\b(suporte|support|atendimento|customer success|cs|helpdesk|sac)\b/.test(title)) {
    s += 15; i += 10; d -= 5;
  }
  // Data / analytics
  if (/\b(dados|data|analista|analyst|bi|ciencia|science|machine learning|ml|ia|ai)\b/.test(title)) {
    c += 15; s += 5; i -= 5;
  }
  // HR / people
  if (/\b(rh|recursos humanos|people|talent|recrutador|recruiter|hr)\b/.test(title)) {
    i += 15; s += 10; d -= 5;
  }
  // Finance / accounting
  if (/\b(financeiro|financ|contabil|contabilidade|fiscal|tributar|auditor|controller)\b/.test(title)) {
    c += 20; s += 10; d -= 5; i -= 10;
  }
  // QA / testing
  if (/\b(qa|qualidade|quality|tester|teste)\b/.test(title)) {
    c += 15; s += 10;
  }
  // Project management
  if (/\b(projeto|project|product|produto|scrum|agile|pm|po)\b/.test(title)) {
    d += 10; i += 10; c += 5;
  }

  // --- Work model adjustment ---
  if (job.type === 'remote') {
    d += 5; s += 5; // Self-discipline for remote
  }

  // Clamp all values to [15, 90] range (avoid extremes)
  const clamp = (v: number) => Math.min(90, Math.max(15, Math.round(v)));

  return { d: clamp(d), i: clamp(i), s: clamp(s), c: clamp(c) };
}

/**
 * Returns an ideal profile for a job: tries legacy map first, then generates dynamically.
 * This is the primary function all call sites should use.
 */
export function getOrGenerateIdealProfile(job: Partial<Job>): BehavioralProfile {
  if (job.id) {
    const legacy = idealBehavioralProfiles[job.id];
    if (legacy) return legacy;
  }
  return generateIdealProfile(job);
}

// ---------------------------------------------------------------------------
// Gauge-Pro 5D → BehavioralProfile 4D conversion
// ---------------------------------------------------------------------------

/**
 * Converts Gauge-Pro 5-dimension scores to 4D BehavioralProfile for match calculation.
 * Mapping: D1 (Dominancia) → d, D2 (Sociabilidade) → i, D3 (Ritmo) → s, D4 (Conformidade) → c
 * D5 (Relacional) is not used in distance calculation (ideal profiles are also 4D).
 */
export function gaugeProToBehavioralProfile(scores: DimensionScores): BehavioralProfile {
  return {
    d: Math.round(scores.D1),
    i: Math.round(scores.D2),
    s: Math.round(scores.D3),
    c: Math.round(scores.D4),
  };
}

// ---------------------------------------------------------------------------
// Candidate behavioral profile extraction from tests
// ---------------------------------------------------------------------------

/**
 * Extrai perfil comportamental de um candidato a partir de testes comportamentais.
 * Aceita array de testes como parametro (desacoplado de mocks).
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
