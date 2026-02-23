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
  'Estágio': { min: 0, max: 1 },
  'Estagio': { min: 0, max: 1 },
  'Especialista': { min: 8, max: 20 },
  'Gerente': { min: 5, max: 15 },
  'Diretor': { min: 10, max: 25 },
};

// Stop words em portugues para filtrar de requisitos (nao sao skills)
const STOP_WORDS = new Set([
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'com', 'para', 'por', 'pelo', 'pela', 'ao', 'aos',
  'um', 'uma', 'uns', 'umas', 'ou', 'se',
  'que', 'como', 'mais', 'muito', 'bem', 'ser', 'ter', 'estar',
  'anos', 'ano', 'experiencia', 'minima', 'minimo', 'conhecimento',
  'conhecimentos', 'habilidade', 'habilidades', 'capacidade',
  'desejavel', 'obrigatorio', 'necessario', 'preferencia',
  'area', 'nivel', 'superior', 'completo', 'cursando',
]);

// Aliases de abreviacoes/variacoes comuns em tech
const SKILL_ALIASES: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'node': 'nodejs',
  'node.js': 'nodejs',
  'react.js': 'react',
  'reactjs': 'react',
  'vue.js': 'vue',
  'vuejs': 'vue',
  'angular.js': 'angular',
  'angularjs': 'angular',
  'next.js': 'nextjs',
  'nuxt.js': 'nuxtjs',
  'c#': 'csharp',
  'c++': 'cplusplus',
  '.net': 'dotnet',
  'pg': 'postgresql',
  'postgres': 'postgresql',
  'mongo': 'mongodb',
  'aws': 'amazon web services',
  'gcp': 'google cloud',
  'k8s': 'kubernetes',
};

/**
 * Normaliza uma string para comparacao (lowercase, sem acentos, trim)
 */
const normalizeString = (s: string) =>
  s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Resolve um skill para sua forma canonica via aliases
 */
function resolveAlias(token: string): string {
  return SKILL_ALIASES[token] ?? token;
}

/**
 * Extrai tokens tecnicos de uma frase de requisito, removendo stop words
 */
function extractTokens(text: string): string[] {
  const normalized = normalizeString(text);
  // Split por espacos, virgulas, pontos, parenteses, barras
  const raw = normalized.split(/[\s,;.()\/]+/).filter(Boolean);
  return raw
    .filter(w => !STOP_WORDS.has(w) && w.length >= 2)
    .map(resolveAlias);
}

/**
 * Calcula o score de skills comparando as habilidades do candidato
 * com os requisitos da vaga.
 *
 * Estrategia: tokeniza cada requisito em keywords tecnicas, compara com
 * skills do candidato usando match exato por token (evita falsos positivos).
 */
export function calculateSkillsScore(
  candidateSkills: string[],
  jobRequirements: string[]
): number {
  if (!candidateSkills?.length) {
    return 20; // Candidato sem skills = score baixo
  }
  if (!jobRequirements?.length) {
    return 50; // Vaga sem requisitos = neutro (nao penaliza candidato)
  }

  // Normaliza e resolve aliases das skills do candidato
  const normalizedSkills = candidateSkills.map(s => resolveAlias(normalizeString(s)));

  // Extrai todos os tokens tecnicos unicos dos requisitos
  const requirementTokens = new Set<string>();
  for (const req of jobRequirements) {
    for (const token of extractTokens(req)) {
      requirementTokens.add(token);
    }
  }

  // Se nao sobrou nenhum token tecnico, usa score neutro
  if (requirementTokens.size === 0) return 50;

  let matched = 0;
  let partial = 0;

  for (const token of requirementTokens) {
    // Match exato (token == skill ou skill == token)
    if (normalizedSkills.some(skill => skill === token || token === skill)) {
      matched++;
    }
    // Match por contencao (skill contem o token ou vice-versa)
    // Mas somente se ambos tem >= 4 chars para evitar falsos positivos
    else if (
      token.length >= 4 &&
      normalizedSkills.some(skill =>
        skill.length >= 4 && (skill.includes(token) || token.includes(skill))
      )
    ) {
      partial++;
    }
  }

  const score = ((matched + partial * 0.5) / requirementTokens.size) * 100;
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
    const score = 100 - (distanceFromIdeal / maxDistance) * 40;
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
  if (!candidateProfile) {
    return 20; // Candidato sem teste comportamental = score baixo
  }
  if (!idealProfile) {
    return 50; // Vaga sem perfil ideal = neutro
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

  // Se um dos lados nao tem estado, compara apenas cidade
  if (!jobState || !candidateState) {
    if (candidateCity === jobCity) return 100;
    return jobType === 'hybrid' ? 50 : 30;
  }

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
 * Retorna skills do candidato que correspondem aos requisitos da vaga
 */
function getMatchedSkills(candidateSkills: string[], jobRequirements: string[], max: number): string[] {
  if (!candidateSkills?.length || !jobRequirements?.length) return [];

  const requirementTokens = new Set<string>();
  for (const req of jobRequirements) {
    for (const token of extractTokens(req)) {
      requirementTokens.add(token);
    }
  }

  const normalizedSkills = candidateSkills.map(s => ({
    original: s,
    normalized: resolveAlias(normalizeString(s)),
  }));

  const matched: string[] = [];
  for (const { original, normalized } of normalizedSkills) {
    const isMatch = requirementTokens.has(normalized)
      || (normalized.length >= 4 && [...requirementTokens].some(
        t => t.length >= 4 && (t.includes(normalized) || normalized.includes(t))
      ));
    if (isMatch) matched.push(original);
    if (matched.length >= max) break;
  }

  return matched;
}

/**
 * Retorna requisitos da vaga que NAO correspondem as skills do candidato
 */
function getMissingSkills(candidateSkills: string[], jobRequirements: string[], max: number): string[] {
  if (!jobRequirements?.length) return [];

  const normalizedSkills = new Set(
    (candidateSkills || []).map(s => resolveAlias(normalizeString(s)))
  );

  const missing: string[] = [];
  const seen = new Set<string>();

  for (const req of jobRequirements) {
    const tokens = extractTokens(req);
    for (const token of tokens) {
      if (seen.has(token)) continue;
      seen.add(token);

      const isMatched = normalizedSkills.has(token)
        || (token.length >= 4 && [...normalizedSkills].some(
          s => s.length >= 4 && (s.includes(token) || token.includes(s))
        ));

      if (!isMatched && token.length >= 3) {
        missing.push(token);
        if (missing.length >= max) return missing;
      }
    }
  }

  return missing;
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
    const matched = getMatchedSkills(candidate.skills || [], job.requirements || [], 4);
    const skillsText = matched.length > 0
      ? `Suas habilidades em ${matched.join(', ')} atendem aos requisitos da vaga`
      : 'Suas habilidades técnicas são altamente relevantes para esta posição';
    strengths.push({
      id: 'str-skills-1',
      text: skillsText,
      category: 'skills',
      impact: skillsCategory.score >= 85 ? 'high' : 'medium',
    });
  }

  // Experience - pontos fortes
  const expCategory = categories.find(c => c.id === 'experience');
  if (expCategory && expCategory.score >= 80 && (candidate.experience || 0) > 0) {
    strengths.push({
      id: 'str-exp-1',
      text: `Seus ${candidate.experience} anos de experiência atendem ao nível ${job.level || 'exigido'}`,
      category: 'experience',
      impact: expCategory.score >= 90 ? 'high' : 'medium',
    });
  }

  // Behavioral - pontos fortes
  const behavioralCategory = categories.find(c => c.id === 'behavioral');
  if (behavioralCategory && behavioralCategory.score >= 70) {
    const jobRef = job.title ? `para ${job.title}` : 'para esta posição';
    strengths.push({
      id: 'str-behavioral-1',
      text: `Perfil comportamental com ${behavioralCategory.score}% de compatibilidade com o perfil ideal ${jobRef}`,
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
    const missing = getMissingSkills(candidate.skills || [], job.requirements || [], 4);
    let missingSkillsText: string;
    if (missing.length > 0) {
      const skillsList = missing.join(', ');
      missingSkillsText = skillsCategory.score < 50
        ? `Desenvolver habilidades em ${skillsList} para atender aos requisitos da vaga`
        : `Fortalecer conhecimento em ${skillsList} com certificações ou projetos`;
    } else {
      missingSkillsText = skillsCategory.score < 50
        ? 'Desenvolver as habilidades técnicas exigidas pela vaga'
        : 'Adicionar certificações ou projetos nas tecnologias requisitadas';
    }

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
    const level = job.level || 'exigido';
    const expText = (candidate.experience || 0) < 3
      ? `A vaga exige nível ${level} — ganhar mais experiência prática na área`
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
      text: `Perfil comportamental com ${behavioralCategory.score}% de aderência — considere complementar a avaliação`,
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
  idealProfile?: BehavioralProfile,
  candidateBehavioralProfile?: BehavioralProfile
): MatchResult {
  // Usa perfil fornecido externamente, ou extrai de candidate.testResult (legacy)
  const candidateProfile: BehavioralProfile | undefined = candidateBehavioralProfile
    ?? (candidate.testResult?.result
      ? {
          d: candidate.testResult.result.dominance,
          i: candidate.testResult.result.influence,
          s: candidate.testResult.result.steadiness,
          c: candidate.testResult.result.compliance,
        }
      : undefined);

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
    : (!candidateProfile ? 20 : 50); // Sem teste = baixo; sem perfil ideal = neutro

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
