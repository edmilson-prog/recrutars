/**
 * Job Recommendation Engine
 * PRD-036: Motor de recomendação de vagas para candidatos
 *
 * Calcula recomendações personalizadas considerando:
 * - Skills técnicas (35%)
 * - Experiência (20%)
 * - Perfil DISC (20%)
 * - Localização/modalidade (15%)
 * - Histórico (views, aplicações) (10%)
 */

import type { Candidate, Job } from '@/types';
import type { MatchResult, DISCProfile } from '@/types/disc';
import { calculateMatchBreakdown } from '@/lib/matchCalculator';
import { mockJobs, mockCandidates, mockApplications, idealDISCProfiles } from '@/data/mockData';

// Tipos do motor de recomendação
export interface RecommendationReason {
  id: string;
  text: string;
  category: 'skills' | 'experience' | 'behavioral' | 'location' | 'salary' | 'type';
  icon?: string;
}

export interface JobRecommendation {
  job: Job;
  score: number;
  reasons: RecommendationReason[];
  matchBreakdown: MatchResult;
  isNew?: boolean; // Nova desde último acesso
}

export interface RecommendationSignals {
  viewedJobs: Record<string, { count: number; lastViewed: string }>;
  appliedJobs: string[];
  notInterestedJobs: string[];
  savedJobs: string[];
  searchTerms: string[];
  lastRecommendationsCheck?: string;
}

// Pesos ajustados para recomendação (PRD-036)
const RECOMMENDATION_WEIGHTS = {
  skills: 35,
  experience: 20,
  behavioral: 20,
  location: 15,
  history: 10,
};

// Score mínimo para aparecer nas recomendações
const MIN_RECOMMENDATION_SCORE = 50;

/**
 * Aplica filtros de exclusão para remover vagas irrelevantes
 */
export function applyExclusionFilters(
  jobs: Job[],
  signals: RecommendationSignals,
  candidateId: string
): Job[] {
  // IDs de vagas já candidatadas
  const appliedJobIds = new Set(
    mockApplications
      .filter(app => app.candidateId === candidateId)
      .map(app => app.jobId)
  );

  // IDs de vagas marcadas como "não tenho interesse"
  const notInterestedIds = new Set(signals.notInterestedJobs);

  return jobs.filter(job => {
    // Excluir vagas não ativas
    if (job.status !== 'active') return false;

    // Excluir vagas já candidatadas
    if (appliedJobIds.has(job.id)) return false;

    // Excluir vagas marcadas como "não tenho interesse"
    if (notInterestedIds.has(job.id)) return false;

    return true;
  });
}

/**
 * Gera motivos personalizados para a recomendação
 */
export function generateRecommendationReasons(
  candidate: Candidate,
  job: Job,
  matchResult: MatchResult
): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];

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
        text: `Suas habilidades em ${matchedSkills.join(' e ')} são muito valorizadas`,
        category: 'skills',
      });
    } else {
      reasons.push({
        id: 'reason-skills',
        text: 'Seu perfil técnico é compatível com os requisitos da vaga',
        category: 'skills',
      });
    }
  }

  // Experiência - se score alto
  const expCategory = matchResult.categories.find(c => c.id === 'experience');
  if (expCategory && expCategory.score >= 75) {
    reasons.push({
      id: 'reason-experience',
      text: `Seus ${candidate.experience} anos de experiência são ideais para posição ${job.level}`,
      category: 'experience',
    });
  }

  // Perfil DISC - se score alto
  const discCategory = matchResult.categories.find(c => c.id === 'behavioral');
  if (discCategory && discCategory.score >= 70) {
    reasons.push({
      id: 'reason-behavioral',
      text: 'Seu perfil comportamental combina com a cultura da vaga',
      category: 'behavioral',
    });
  }

  // Localização - se score alto
  const locCategory = matchResult.categories.find(c => c.id === 'location');
  if (locCategory && locCategory.score >= 80) {
    if (job.type === 'remote') {
      reasons.push({
        id: 'reason-location',
        text: 'Vaga 100% remota - trabalhe de qualquer lugar',
        category: 'location',
      });
    } else {
      reasons.push({
        id: 'reason-location',
        text: `Localização próxima de você (${job.location})`,
        category: 'location',
      });
    }
  }

  // Salário - se dentro da faixa esperada pelo candidato
  if (candidate.salary) {
    const salaryOverlap =
      job.salary.max >= candidate.salary.min &&
      job.salary.min <= candidate.salary.max;

    if (salaryOverlap && reasons.length < 3) {
      reasons.push({
        id: 'reason-salary',
        text: 'Faixa salarial compatível com suas expectativas',
        category: 'salary',
      });
    }
  }

  // Tipo de trabalho - se híbrido ou remoto
  if (job.type === 'hybrid' && reasons.length < 3) {
    reasons.push({
      id: 'reason-type',
      text: 'Modelo híbrido oferece flexibilidade',
      category: 'type',
    });
  }

  // Se não conseguiu gerar motivos suficientes, usar genéricos baseados no score
  if (reasons.length === 0 && matchResult.totalScore >= 60) {
    reasons.push({
      id: 'reason-general',
      text: `${matchResult.totalScore}% de compatibilidade com seu perfil`,
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
  jobId: string,
  signals: RecommendationSignals
): number {
  let boost = 0;

  // Vaga visualizada múltiplas vezes = interesse
  const viewData = signals.viewedJobs[jobId];
  if (viewData) {
    boost += Math.min(viewData.count * 2, 10); // Máx 10 pontos
  }

  // Vaga salva = interesse alto
  if (signals.savedJobs.includes(jobId)) {
    boost += 15;
  }

  return boost;
}

/**
 * Calcula o score final de recomendação
 * Combina o match score base com ajustes de histórico
 */
export function calculateRecommendationScore(
  matchScore: number,
  historyBoost: number
): number {
  // Score base com peso de 90%, histórico com peso de 10%
  const baseWeight = 90;
  const historyWeight = 10;

  const adjustedScore = (matchScore * baseWeight + historyBoost * historyWeight) / 100;

  // Clamp entre 0 e 100
  return Math.min(100, Math.max(0, Math.round(adjustedScore)));
}

/**
 * Obtém recomendações de vagas para um candidato
 */
export function getRecommendedJobs(
  candidateId: string,
  signals: RecommendationSignals,
  options?: {
    limit?: number;
    minScore?: number;
    lastCheckDate?: string;
  }
): JobRecommendation[] {
  const { limit = 10, minScore = MIN_RECOMMENDATION_SCORE, lastCheckDate } = options || {};

  // Encontrar candidato
  const candidate = mockCandidates.find(c => c.id === candidateId);
  if (!candidate) {
    return [];
  }

  // Filtrar vagas
  const eligibleJobs = applyExclusionFilters(mockJobs, signals, candidateId);

  // Calcular scores para cada vaga
  const recommendations: JobRecommendation[] = [];

  for (const job of eligibleJobs) {
    // Calcular match usando o motor existente
    const idealProfile = idealDISCProfiles[job.id];
    const matchResult = calculateMatchBreakdown(candidate, job, idealProfile);

    // Calcular boost de histórico
    const historyBoost = calculateHistoryBoost(job.id, signals);

    // Score final
    const finalScore = calculateRecommendationScore(matchResult.totalScore, historyBoost);

    // Ignorar se abaixo do mínimo
    if (finalScore < minScore) {
      continue;
    }

    // Gerar motivos
    const reasons = generateRecommendationReasons(candidate, job, matchResult);

    // Verificar se é nova (criada após último check)
    const isNew = lastCheckDate
      ? new Date(job.createdAt) > new Date(lastCheckDate)
      : false;

    recommendations.push({
      job,
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
 * Conta quantas vagas novas existem desde a última verificação
 */
export function countNewRecommendations(
  candidateId: string,
  signals: RecommendationSignals,
  lastCheckDate: string
): number {
  const recommendations = getRecommendedJobs(candidateId, signals, {
    lastCheckDate,
    limit: 50, // Buscar mais para contar
  });

  return recommendations.filter(r => r.isNew).length;
}

/**
 * Obtém sinais iniciais vazios
 */
export function getEmptySignals(): RecommendationSignals {
  return {
    viewedJobs: {},
    appliedJobs: [],
    notInterestedJobs: [],
    savedJobs: [],
    searchTerms: [],
  };
}

/**
 * Helper para formatar score como texto
 */
export function formatScoreLabel(score: number): string {
  if (score >= 90) return 'Excelente Match';
  if (score >= 80) return 'Ótimo Match';
  if (score >= 70) return 'Bom Match';
  if (score >= 60) return 'Match Moderado';
  return 'Match Básico';
}

/**
 * Helper para cor do score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-orange-600';
}

/**
 * Helper para cor do badge do score
 */
export function getScoreBadgeClasses(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
}
