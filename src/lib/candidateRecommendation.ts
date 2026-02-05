/**
 * Candidate Recommendation Engine
 * PRD-037: Motor de recomendação de candidatos para empresas
 *
 * Calcula recomendações personalizadas de candidatos para vagas considerando:
 * - Skills técnicas (35%)
 * - Experiência (20%)
 * - Perfil Comportamental (20%)
 * - Localização/modalidade (10%)
 * - Atividade do candidato (10%)
 * - Histórico de interações (5%)
 */

import type { Candidate, Job } from '@/types';
import type { MatchResult, BehavioralProfile } from '@/types/disc';
import { calculateMatchBreakdown } from '@/lib/matchCalculator';

// Tipos do motor de recomendação de candidatos
export interface SuggestionReason {
  id: string;
  text: string;
  category: 'skills' | 'experience' | 'behavioral' | 'location' | 'activity' | 'availability';
  icon?: string;
}

export interface CandidateRecommendation {
  candidate: Candidate;
  score: number;
  reasons: SuggestionReason[];
  matchBreakdown: MatchResult;
  isNew?: boolean; // Candidato novo desde último acesso
}

export interface CandidateSignals {
  viewedCandidates: Record<string, { count: number; lastViewed: string }>;
  invitedCandidates: string[];
  notSuitableCandidates: string[];
  savedCandidates: string[];
  lastRecommendationsCheck?: string;
}

export type NotSuitableReason =
  | 'overqualified'
  | 'underqualified'
  | 'salary_mismatch'
  | 'location'
  | 'culture_fit'
  | 'other';

export const NOT_SUITABLE_REASONS: Record<NotSuitableReason, string> = {
  overqualified: 'Superqualificado para a vaga',
  underqualified: 'Experiência insuficiente',
  salary_mismatch: 'Pretensão salarial incompatível',
  location: 'Localização não é adequada',
  culture_fit: 'Não alinhado com a cultura',
  other: 'Outro motivo',
};

// Pesos ajustados para recomendação de candidatos (PRD-037)
const RECOMMENDATION_WEIGHTS = {
  skills: 35,
  experience: 20,
  behavioral: 20,
  location: 10,
  activity: 10,
  history: 5,
};

/** Data bundle for the candidate recommendation engine. */
export interface CandidateRecommendationData {
  jobs: Job[];
  candidates: Candidate[];
  applications: Array<{ candidateId: string; jobId: string }>;
  idealProfiles: Record<string, BehavioralProfile>;
}

// Score mínimo para aparecer nas recomendações
const MIN_RECOMMENDATION_SCORE = 60;

/**
 * Aplica filtros de exclusão para remover candidatos irrelevantes
 */
export function applyExclusionFilters(
  candidates: Candidate[],
  signals: CandidateSignals,
  jobId: string,
  applications: Array<{ candidateId: string; jobId: string }> = [],
): Candidate[] {
  // IDs de candidatos que já aplicaram para a vaga
  const appliedCandidateIds = new Set(
    applications
      .filter(app => app.jobId === jobId)
      .map(app => app.candidateId)
  );

  // IDs de candidatos marcados como "não adequado"
  const notSuitableIds = new Set(signals.notSuitableCandidates);

  return candidates.filter(candidate => {
    // Excluir candidatos inativos
    if (candidate.status !== 'active') return false;

    // Excluir candidatos que já aplicaram
    if (appliedCandidateIds.has(candidate.id)) return false;

    // Excluir candidatos marcados como "não adequado"
    if (notSuitableIds.has(candidate.id)) return false;

    // Excluir candidatos com perfil muito incompleto (< 50%)
    if (candidate.profileCompletion < 50) return false;

    return true;
  });
}

/**
 * Gera motivos personalizados para a sugestão do candidato
 */
export function generateSuggestionReasons(
  candidate: Candidate,
  job: Job,
  matchResult: MatchResult
): SuggestionReason[] {
  const reasons: SuggestionReason[] = [];

  // Ordenar categorias por score
  const sortedCategories = [...matchResult.categories].sort((a, b) => b.score - a.score);

  // Skills - se score alto
  const skillsCategory = matchResult.categories.find(c => c.id === 'skills');
  if (skillsCategory && skillsCategory.score >= 70) {
    const matchedSkills = candidate.skills?.filter(skill =>
      job.requirements?.some(req =>
        req.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(req.toLowerCase().split(' ')[0])
      )
    ).slice(0, 2);

    if (matchedSkills && matchedSkills.length > 0) {
      reasons.push({
        id: 'reason-skills',
        text: `Domina ${matchedSkills.join(' e ')} - habilidades essenciais para a vaga`,
        category: 'skills',
      });
    } else {
      reasons.push({
        id: 'reason-skills',
        text: 'Perfil técnico compatível com os requisitos',
        category: 'skills',
      });
    }
  }

  // Experiência - se score alto
  const expCategory = matchResult.categories.find(c => c.id === 'experience');
  if (expCategory && expCategory.score >= 75) {
    reasons.push({
      id: 'reason-experience',
      text: `${candidate.experience} anos de experiência - ideal para ${job.level}`,
      category: 'experience',
    });
  }

  // Perfil Comportamental - se score alto
  const behavioralCategory = matchResult.categories.find(c => c.id === 'behavioral');
  if (behavioralCategory && behavioralCategory.score >= 70) {
    reasons.push({
      id: 'reason-behavioral',
      text: 'Perfil comportamental alinhado com a cultura da vaga',
      category: 'behavioral',
    });
  }

  // Localização - se score alto
  const locCategory = matchResult.categories.find(c => c.id === 'location');
  if (locCategory && locCategory.score >= 80) {
    if (job.type === 'remote') {
      reasons.push({
        id: 'reason-location',
        text: 'Disponível para trabalho remoto',
        category: 'location',
      });
    } else {
      reasons.push({
        id: 'reason-location',
        text: `Localizado em ${candidate.location} - próximo ao escritório`,
        category: 'location',
      });
    }
  }

  // Disponibilidade
  if (candidate.availability === 'Imediata' && reasons.length < 3) {
    reasons.push({
      id: 'reason-availability',
      text: 'Disponibilidade imediata para início',
      category: 'availability',
    });
  }

  // Teste comportamental realizado
  if (candidate.hasTest && reasons.length < 3) {
    reasons.push({
      id: 'reason-test',
      text: 'Teste comportamental realizado',
      category: 'behavioral',
    });
  }

  // Perfil completo
  if (candidate.profileCompletion >= 90 && reasons.length < 3) {
    reasons.push({
      id: 'reason-profile',
      text: `Perfil ${candidate.profileCompletion}% completo - candidato engajado`,
      category: 'activity',
    });
  }

  // Se não conseguiu gerar motivos suficientes, usar genéricos baseados no score
  if (reasons.length === 0 && matchResult.totalScore >= 60) {
    reasons.push({
      id: 'reason-general',
      text: `${matchResult.totalScore}% de compatibilidade com a vaga`,
      category: 'skills',
    });
  }

  // Limitar a 3 motivos
  return reasons.slice(0, 3);
}

/**
 * Calcula boost de histórico baseado em sinais de comportamento
 */
export function calculateHistoryBoost(
  candidateId: string,
  signals: CandidateSignals
): number {
  let boost = 0;

  // Candidato visualizado múltiplas vezes = interesse
  const viewData = signals.viewedCandidates[candidateId];
  if (viewData) {
    boost += Math.min(viewData.count * 2, 10); // Máx 10 pontos
  }

  // Candidato salvo = interesse alto
  if (signals.savedCandidates.includes(candidateId)) {
    boost += 15;
  }

  return boost;
}

/**
 * Calcula boost de atividade do candidato
 */
export function calculateActivityBoost(candidate: Candidate): number {
  let boost = 0;

  // Perfil completo
  if (candidate.profileCompletion >= 90) boost += 10;
  else if (candidate.profileCompletion >= 70) boost += 5;

  // Teste realizado
  if (candidate.hasTest) boost += 10;

  // Disponibilidade imediata
  if (candidate.availability === 'Imediata') boost += 5;

  return Math.min(boost, 20); // Máx 20 pontos
}

/**
 * Calcula o score final de recomendação
 * Combina o match score base com ajustes de histórico e atividade
 */
export function calculateCandidateScore(
  matchScore: number,
  historyBoost: number,
  activityBoost: number
): number {
  // Score base com peso de 85%, histórico com peso de 5%, atividade com peso de 10%
  const baseWeight = 85;
  const historyWeight = 5;
  const activityWeight = 10;

  const adjustedScore = (matchScore * baseWeight + historyBoost * historyWeight + activityBoost * activityWeight) / 100;

  // Clamp entre 0 e 100
  return Math.min(100, Math.max(0, Math.round(adjustedScore)));
}

/**
 * Obtém candidatos sugeridos para uma vaga.
 * @param data - bundle de dados (jobs, candidates, applications, idealProfiles)
 */
export function getSuggestedCandidates(
  jobId: string,
  signals: CandidateSignals,
  data: CandidateRecommendationData,
  options?: {
    limit?: number;
    minScore?: number;
    lastCheckDate?: string;
  }
): CandidateRecommendation[] {
  const { limit = 10, minScore = MIN_RECOMMENDATION_SCORE, lastCheckDate } = options || {};

  // Encontrar vaga
  const job = data.jobs.find(j => j.id === jobId);
  if (!job) {
    return [];
  }

  // Filtrar candidatos
  const eligibleCandidates = applyExclusionFilters(data.candidates, signals, jobId, data.applications);

  // Calcular scores para cada candidato
  const recommendations: CandidateRecommendation[] = [];

  for (const candidate of eligibleCandidates) {
    // Calcular match usando o motor existente
    const idealProfile = data.idealProfiles[jobId];
    const matchResult = calculateMatchBreakdown(candidate, job, idealProfile);

    // Calcular boost de histórico
    const historyBoost = calculateHistoryBoost(candidate.id, signals);

    // Calcular boost de atividade
    const activityBoost = calculateActivityBoost(candidate);

    // Score final
    const finalScore = calculateCandidateScore(matchResult.totalScore, historyBoost, activityBoost);

    // Ignorar se abaixo do mínimo
    if (finalScore < minScore) {
      continue;
    }

    // Gerar motivos
    const reasons = generateSuggestionReasons(candidate, job, matchResult);

    // Verificar se é novo (criado após último check)
    const isNew = lastCheckDate
      ? new Date(candidate.createdAt) > new Date(lastCheckDate)
      : false;

    recommendations.push({
      candidate,
      score: finalScore,
      reasons,
      matchBreakdown: matchResult,
      isNew,
    });
  }

  // Ordenar por score decrescente
  recommendations.sort((a, b) => b.score - a.score);

  // Limitar resultados
  return recommendations.slice(0, limit);
}

/**
 * Conta quantos candidatos novos existem desde a última verificação
 */
export function countNewCandidateRecommendations(
  jobId: string,
  signals: CandidateSignals,
  data: CandidateRecommendationData,
  lastCheckDate: string
): number {
  const recommendations = getSuggestedCandidates(jobId, signals, data, {
    lastCheckDate,
    limit: 50, // Buscar mais para contar
  });

  return recommendations.filter(r => r.isNew).length;
}

/**
 * Obtém sinais iniciais vazios
 */
export function getEmptyCandidateSignals(): CandidateSignals {
  return {
    viewedCandidates: {},
    invitedCandidates: [],
    notSuitableCandidates: [],
    savedCandidates: [],
  };
}

/**
 * Helper para formatar score como texto
 */
export function formatCandidateScoreLabel(score: number): string {
  if (score >= 90) return 'Candidato Ideal';
  if (score >= 80) return 'Excelente Match';
  if (score >= 70) return 'Bom Match';
  if (score >= 60) return 'Match Moderado';
  return 'Match Básico';
}

/**
 * Helper para cor do score
 */
export function getCandidateScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-orange-600';
}

/**
 * Helper para cor do badge do score
 */
export function getCandidateScoreBadgeClasses(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
}

/**
 * Obtém candidatos sugeridos consolidados para todas as vagas ativas de uma empresa.
 * @param data - bundle de dados (jobs, candidates, applications, idealProfiles)
 */
export function getSuggestedCandidatesForCompany(
  companyId: string,
  signals: CandidateSignals,
  data: CandidateRecommendationData,
  options?: {
    limit?: number;
    minScore?: number;
  }
): { jobId: string; jobTitle: string; candidates: CandidateRecommendation[] }[] {
  const { limit = 3, minScore = 60 } = options || {};

  // Encontrar vagas ativas da empresa
  const activeJobs = data.jobs.filter(j => j.companyId === companyId && j.status === 'active');

  const results: { jobId: string; jobTitle: string; candidates: CandidateRecommendation[] }[] = [];

  for (const job of activeJobs) {
    const candidates = getSuggestedCandidates(job.id, signals, data, { limit, minScore });
    if (candidates.length > 0) {
      results.push({
        jobId: job.id,
        jobTitle: job.title,
        candidates,
      });
    }
  }

  return results;
}
