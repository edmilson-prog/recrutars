/**
 * Match Calculator
 * PRD-035: Motor de cálculo dinâmico de match
 *
 * Calcula o score de compatibilidade entre candidato e vaga
 * com base em skills, experiência, perfil comportamental e localização.
 */

import type {
  BehavioralProfile,
  MatchResult,
  MatchCategory,
  MatchStrength,
  MatchOpportunity
} from '@/types/disc';
import type { Candidate, Job } from '@/types';
import { DEFAULT_MATCH_CATEGORIES } from '@/components/match/MatchBreakdown';

// Pesos padrão das categorias
const CATEGORY_WEIGHTS = {
  skills: 40,
  experience: 30,
  behavioral: 20,
  location: 10,
};

// Mapeamento de níveis de experiência para anos
const EXPERIENCE_LEVELS: Record<string, { min: number; max: number }> = {
  'Junior': { min: 0, max: 2 },
  'Júnior': { min: 0, max: 2 },
  'Pleno': { min: 3, max: 5 },
  'Senior': { min: 5, max: 15 },
  'Sênior': { min: 5, max: 15 },
  'Especialista': { min: 8, max: 20 },
  'Gerente': { min: 5, max: 15 },
  'Diretor': { min: 10, max: 25 },
};

/**
 * Calcula o score de skills comparando as habilidades do candidato
 * com os requisitos da vaga
 */
export function calculateSkillsScore(
  candidateSkills: string[],
  jobRequirements: string[]
): number {
  if (!candidateSkills?.length || !jobRequirements?.length) {
    return 50; // Score neutro se não houver dados
  }

  // Normaliza as strings para comparação
  const normalizeString = (s: string) =>
    s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normalizedCandidateSkills = candidateSkills.map(normalizeString);
  const normalizedRequirements = jobRequirements.map(normalizeString);

  // Conta quantos requisitos são atendidos
  let matchedRequirements = 0;
  let partialMatches = 0;

  for (const req of normalizedRequirements) {
    // Match exato
    if (normalizedCandidateSkills.some(skill =>
      skill === req || skill.includes(req) || req.includes(skill)
    )) {
      matchedRequirements++;
    }
    // Match parcial (palavras em comum)
    else {
      const reqWords = req.split(/\s+/);
      const hasPartialMatch = normalizedCandidateSkills.some(skill =>
        reqWords.some(word => word.length > 3 && skill.includes(word))
      );
      if (hasPartialMatch) {
        partialMatches++;
      }
    }
  }

  // Score = (matches completos * 1.0 + matches parciais * 0.5) / total
  const score = ((matchedRequirements + partialMatches * 0.5) / normalizedRequirements.length) * 100;

  // Clamp entre 0 e 100
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calcula o score de experiência comparando anos de experiência
 * com o nível da vaga
 */
export function calculateExperienceScore(
  candidateExperience: number,
  jobLevel: string
): number {
  const levelRange = EXPERIENCE_LEVELS[jobLevel];

  if (!levelRange) {
    return 70; // Score padrão se nível não reconhecido
  }

  const { min, max } = levelRange;
  const idealExperience = (min + max) / 2;

  // Se candidato está no range ideal
  if (candidateExperience >= min && candidateExperience <= max) {
    // Quanto mais próximo do ideal, maior o score
    const distanceFromIdeal = Math.abs(candidateExperience - idealExperience);
    const maxDistance = (max - min) / 2;
    const score = 100 - (distanceFromIdeal / maxDistance) * 15;
    return Math.round(score);
  }

  // Se candidato tem menos experiência que o mínimo
  if (candidateExperience < min) {
    const deficit = min - candidateExperience;
    const penalty = deficit * 15; // 15% de penalidade por ano faltando
    return Math.max(30, Math.round(85 - penalty));
  }

  // Se candidato tem mais experiência que o máximo (overqualified)
  const excess = candidateExperience - max;
  const penalty = excess * 5; // 5% de penalidade por ano excedente
  return Math.max(60, Math.round(90 - penalty));
}

/**
 * Calcula o score comportamental usando distância euclidiana normalizada
 * entre o perfil do candidato e o perfil ideal da vaga
 */
export function calculateBehavioralScore(
  candidateProfile: BehavioralProfile,
  idealProfile: BehavioralProfile
): number {
  if (!candidateProfile || !idealProfile) {
    return 50; // Score neutro se não houver dados
  }

  // Calcula a distância euclidiana normalizada
  const dDiff = (candidateProfile.d - idealProfile.d) ** 2;
  const iDiff = (candidateProfile.i - idealProfile.i) ** 2;
  const sDiff = (candidateProfile.s - idealProfile.s) ** 2;
  const cDiff = (candidateProfile.c - idealProfile.c) ** 2;

  // Distância máxima possível (cada dimensão pode variar de 0 a 100)
  const maxDistance = Math.sqrt(4 * (100 ** 2)); // ~200

  const actualDistance = Math.sqrt(dDiff + iDiff + sDiff + cDiff);

  // Score inversamente proporcional à distância
  const score = ((maxDistance - actualDistance) / maxDistance) * 100;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calcula o score de localização baseado na compatibilidade
 * entre localização do candidato e da vaga
 */
export function calculateLocationScore(
  candidateLocation: string,
  jobLocation: string,
  jobType: 'remote' | 'hybrid' | 'onsite'
): number {
  if (!candidateLocation || !jobLocation) {
    return 50;
  }

  // Trabalho remoto = sempre 100%
  if (jobType === 'remote') {
    return 100;
  }

  const normalizeLocation = (loc: string) =>
    loc.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const candidateLoc = normalizeLocation(candidateLocation);
  const jobLoc = normalizeLocation(jobLocation);

  // Extrai cidade e estado
  const [candidateCity, candidateState] = candidateLoc.split(',').map(s => s?.trim());
  const [jobCity, jobState] = jobLoc.split(',').map(s => s?.trim());

  // Mesma cidade = 100%
  if (candidateCity === jobCity && candidateState === jobState) {
    return 100;
  }

  // Mesmo estado = 70% (ou 85% se híbrido)
  if (candidateState === jobState) {
    return jobType === 'hybrid' ? 85 : 70;
  }

  // Estado diferente
  // Híbrido com estado diferente = 50%
  // Presencial com estado diferente = 30%
  return jobType === 'hybrid' ? 50 : 30;
}

/**
 * Gera os pontos fortes (strengths) baseado no breakdown
 */
export function generateStrengths(
  categories: MatchCategory[],
  candidate: Partial<Candidate>,
  job: Partial<Job>
): MatchStrength[] {
  const strengths: MatchStrength[] = [];

  // Ordena categorias por score
  const sortedCategories = [...categories].sort((a, b) => b.score - a.score);

  // Skills - pontos fortes
  const skillsCategory = categories.find(c => c.id === 'skills');
  if (skillsCategory && skillsCategory.score >= 70) {
    const matchedSkills = candidate.skills?.slice(0, 3).join(', ');
    strengths.push({
      id: 'str-skills-1',
      text: `Suas habilidades em ${matchedSkills || 'tecnologia'} são altamente relevantes para esta posição`,
      category: 'skills',
      impact: skillsCategory.score >= 85 ? 'high' : 'medium',
    });
  }

  // Experience - pontos fortes
  const expCategory = categories.find(c => c.id === 'experience');
  if (expCategory && expCategory.score >= 75) {
    strengths.push({
      id: 'str-exp-1',
      text: `Seus ${candidate.experience || 'anos de'} anos de experiência atendem perfeitamente ao nível ${job.level}`,
      category: 'experience',
      impact: expCategory.score >= 90 ? 'high' : 'medium',
    });
  }

  // Behavioral - pontos fortes
  const behavioralCategory = categories.find(c => c.id === 'behavioral');
  if (behavioralCategory && behavioralCategory.score >= 70) {
    strengths.push({
      id: 'str-behavioral-1',
      text: 'Seu perfil comportamental demonstra alinhamento com a cultura e as demandas da posição',
      category: 'behavioral',
      impact: behavioralCategory.score >= 85 ? 'high' : 'medium',
    });
  }

  // Location - pontos fortes
  const locCategory = categories.find(c => c.id === 'location');
  if (locCategory && locCategory.score >= 80) {
    const locText = job.type === 'remote'
      ? 'A vaga é remota, permitindo trabalho de qualquer lugar'
      : `Sua localização em ${candidate.location} é ideal para esta posição`;
    strengths.push({
      id: 'str-loc-1',
      text: locText,
      category: 'location',
      impact: locCategory.score === 100 ? 'high' : 'medium',
    });
  }

  // Adiciona ponto forte extra se score geral for alto
  if (sortedCategories[0]?.score >= 90) {
    strengths.push({
      id: 'str-top-1',
      text: `Excelente compatibilidade em ${sortedCategories[0].name}`,
      category: sortedCategories[0].id,
      impact: 'high',
    });
  }

  return strengths.slice(0, 5); // Máximo 5 pontos fortes
}

/**
 * Gera as oportunidades de melhoria baseado no breakdown
 */
export function generateOpportunities(
  categories: MatchCategory[],
  candidate: Partial<Candidate>,
  job: Partial<Job>
): MatchOpportunity[] {
  const opportunities: MatchOpportunity[] = [];

  // Ordena por score (menor primeiro - mais oportunidade)
  const sortedCategories = [...categories].sort((a, b) => a.score - b.score);

  // Skills - oportunidades
  const skillsCategory = categories.find(c => c.id === 'skills');
  if (skillsCategory && skillsCategory.score < 70) {
    const missingSkillsText = skillsCategory.score < 50
      ? 'Desenvolver as habilidades técnicas listadas nos requisitos da vaga'
      : 'Adicionar certificações ou projetos nas tecnologias requisitadas';

    opportunities.push({
      id: 'opp-skills-1',
      text: missingSkillsText,
      category: 'skills',
      potentialIncrease: Math.min(15, Math.round((70 - skillsCategory.score) * 0.4)),
      actionable: true,
    });
  }

  // Experience - oportunidades
  const expCategory = categories.find(c => c.id === 'experience');
  if (expCategory && expCategory.score < 70) {
    const expText = (candidate.experience || 0) < 3
      ? 'Ganhar mais experiência prática na área através de projetos ou freelas'
      : 'Destacar projetos relevantes e liderança técnica no seu perfil';

    opportunities.push({
      id: 'opp-exp-1',
      text: expText,
      category: 'experience',
      potentialIncrease: Math.min(10, Math.round((70 - expCategory.score) * 0.3)),
      actionable: true,
    });
  }

  // Behavioral - oportunidades
  const behavioralCategory = categories.find(c => c.id === 'behavioral');
  if (behavioralCategory && behavioralCategory.score < 65) {
    opportunities.push({
      id: 'opp-behavioral-1',
      text: 'Refazer o teste comportamental para um perfil mais atualizado e preciso',
      category: 'behavioral',
      potentialIncrease: Math.min(12, Math.round((65 - behavioralCategory.score) * 0.4)),
      actionable: true,
    });
  }

  // Location - oportunidades
  const locCategory = categories.find(c => c.id === 'location');
  if (locCategory && locCategory.score < 60 && job.type !== 'remote') {
    opportunities.push({
      id: 'opp-loc-1',
      text: job.type === 'hybrid'
        ? 'Considere a possibilidade de mudança ou trabalho remoto parcial'
        : 'Esta vaga é presencial - verifique se a relocação é viável para você',
      category: 'location',
      potentialIncrease: Math.min(8, Math.round((60 - locCategory.score) * 0.2)),
      actionable: false,
    });
  }

  // Ponto genérico de melhoria de perfil
  const avgScore = categories.reduce((sum, c) => sum + c.score, 0) / categories.length;
  if (avgScore < 75) {
    opportunities.push({
      id: 'opp-profile-1',
      text: 'Complete seu perfil adicionando mais detalhes sobre suas experiências e conquistas',
      category: 'skills',
      potentialIncrease: 5,
      actionable: true,
    });
  }

  return opportunities.slice(0, 4); // Máximo 4 oportunidades
}

/**
 * Calcula o breakdown completo de match entre candidato e vaga
 */
export function calculateMatchBreakdown(
  candidate: Partial<Candidate>,
  job: Partial<Job>,
  idealProfile?: BehavioralProfile
): MatchResult {
  // Extrai perfil comportamental do candidato
  const candidateProfile: BehavioralProfile | undefined = candidate.testResult?.result
    ? {
        d: candidate.testResult.result.dominance,
        i: candidate.testResult.result.influence,
        s: candidate.testResult.result.steadiness,
        c: candidate.testResult.result.compliance,
      }
    : undefined;

  // Calcula scores individuais
  const skillsScore = calculateSkillsScore(
    candidate.skills || [],
    job.requirements || []
  );

  const experienceScore = calculateExperienceScore(
    candidate.experience || 0,
    job.level || 'Pleno'
  );

  const behavioralScore = candidateProfile && idealProfile
    ? calculateBehavioralScore(candidateProfile, idealProfile)
    : 50; // Score neutro se não houver perfil comportamental

  const locationScore = calculateLocationScore(
    candidate.location || '',
    job.location || '',
    (job.type as 'remote' | 'hybrid' | 'onsite') || 'hybrid'
  );

  // Monta as categorias
  const categories: MatchCategory[] = [
    {
      id: 'skills',
      name: 'Skills Técnicas',
      weight: CATEGORY_WEIGHTS.skills,
      score: skillsScore,
      description: DEFAULT_MATCH_CATEGORIES[0].description,
    },
    {
      id: 'experience',
      name: 'Experiência',
      weight: CATEGORY_WEIGHTS.experience,
      score: experienceScore,
      description: DEFAULT_MATCH_CATEGORIES[1].description,
    },
    {
      id: 'behavioral',
      name: 'Perfil Comportamental',
      weight: CATEGORY_WEIGHTS.behavioral,
      score: behavioralScore,
      description: DEFAULT_MATCH_CATEGORIES[2].description,
    },
    {
      id: 'location',
      name: 'Localização',
      weight: CATEGORY_WEIGHTS.location,
      score: locationScore,
      description: DEFAULT_MATCH_CATEGORIES[3].description,
    },
  ];

  // Calcula score total ponderado
  const totalScore = Math.round(
    categories.reduce((sum, cat) => sum + (cat.score * cat.weight) / 100, 0)
  );

  // Gera strengths e opportunities
  const strengths = generateStrengths(categories, candidate, job);
  const opportunities = generateOpportunities(categories, candidate, job);

  return {
    totalScore,
    categories,
    strengths,
    opportunities,
    candidateProfile: candidateProfile || { d: 50, i: 50, s: 50, c: 50 },
    idealProfile,
  };
}

/**
 * Calcula estatísticas agregadas de match para o dashboard admin
 */
export interface MatchStatistics {
  averageByCategory: Record<string, number>;
  distribution: {
    high: number;    // >= 80%
    medium: number;  // 60-79%
    low: number;     // < 60%
  };
  totalMatches: number;
  averageTotal: number;
}

export function calculateMatchStatistics(
  matches: MatchResult[]
): MatchStatistics {
  if (!matches.length) {
    return {
      averageByCategory: {},
      distribution: { high: 0, medium: 0, low: 0 },
      totalMatches: 0,
      averageTotal: 0,
    };
  }

  // Calcula médias por categoria
  const categoryTotals: Record<string, { sum: number; count: number }> = {};

  for (const match of matches) {
    for (const cat of match.categories) {
      if (!categoryTotals[cat.id]) {
        categoryTotals[cat.id] = { sum: 0, count: 0 };
      }
      categoryTotals[cat.id].sum += cat.score;
      categoryTotals[cat.id].count++;
    }
  }

  const averageByCategory: Record<string, number> = {};
  for (const [catId, data] of Object.entries(categoryTotals)) {
    averageByCategory[catId] = Math.round(data.sum / data.count);
  }

  // Calcula distribuição
  const distribution = {
    high: matches.filter(m => m.totalScore >= 80).length,
    medium: matches.filter(m => m.totalScore >= 60 && m.totalScore < 80).length,
    low: matches.filter(m => m.totalScore < 60).length,
  };

  // Média total
  const averageTotal = Math.round(
    matches.reduce((sum, m) => sum + m.totalScore, 0) / matches.length
  );

  return {
    averageByCategory,
    distribution,
    totalMatches: matches.length,
    averageTotal,
  };
}
