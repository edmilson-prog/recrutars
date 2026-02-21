/**
 * Behavioral Assessment Data
 * PRD-047: Teste Geral do Candidato
 * PRD-048: Teste por Vaga (configs only — data moved to Supabase)
 *
 * Configurations, templates, and helpers for behavioral assessments.
 * Mock data for job assessments (PRD-048) has been removed — now served by Supabase.
 */

import type {
  BehavioralAssessment,
  BehavioralResponse,
  BehavioralResult,
  BehavioralTestConfig,
  JobTestConfig,
} from '@/types/assessment';

// =============================================================================
// CONFIGURAÇÕES DO TESTE GERAL (PRD-047)
// =============================================================================

export const BEHAVIORAL_TEST_CONFIG: BehavioralTestConfig = {
  minQuestions: 50,
  maxQuestions: 60,
  sessionValidDays: 7,
  cooldownDays: 90,
  xpReward: 50,
  badgeId: 'self_knowledge',

  // Balanceamento por dimensão
  personalityWeight: 0.35,
  characterWeight: 0.30,
  competencyWeight: 0.35,

  // Distribuição de níveis
  basicQuestionsRatio: 0.30,
  intermediateQuestionsRatio: 0.40,
  advancedQuestionsRatio: 0.30,
};

// =============================================================================
// CONFIGURAÇÕES DO TESTE POR VAGA (PRD-048)
// =============================================================================

export const JOB_TEST_CONFIG: JobTestConfig = {
  minQuestions: 15,
  maxQuestions: 25,
  minCompetencies: 2,
  maxCompetencies: 8,
  maxMagicLinksPerJob: 50,
  defaultExpirationDays: 7,
};

// =============================================================================
// MOCK: SESSÕES DE AVALIAÇÃO (PRD-047 — still used by candidate behavioral test)
// =============================================================================

const now = new Date().toISOString();
const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export const mockBehavioralAssessments: BehavioralAssessment[] = [
  {
    id: 'ba-completed-1',
    candidateId: 'candidate-2',
    status: 'completed',
    questionsIds: [],
    totalQuestions: 55,
    currentQuestionIndex: 54,
    answeredCount: 55,
    startedAt: '2024-12-01T10:00:00Z',
    lastActivityAt: '2024-12-01T11:30:00Z',
    completedAt: '2024-12-01T11:30:00Z',
    totalTimeSeconds: 5400,
    expiresAt: '2024-12-08T10:00:00Z',
  },
];

// =============================================================================
// MOCK: RESPOSTAS (PRD-047)
// =============================================================================

export const mockBehavioralResponses: BehavioralResponse[] = [];

// =============================================================================
// MOCK: RESULTADOS (PRD-047)
// =============================================================================

export const mockBehavioralResults: BehavioralResult[] = [
  {
    id: 'br-1',
    assessmentId: 'ba-completed-1',
    candidateId: 'candidate-2',

    overallScore: 78,
    personalityScore: 82,
    characterScore: 85,
    competencyScore: 71,

    categoryScores: {
      'cat-1': 80,
      'cat-2': 85,
      'cat-3': 75,
      'cat-4': 88,
      'cat-5': 82,
      'cat-6': 90,
      'cat-7': 85,
      'cat-8': 88,
      'cat-9': 82,
      'cat-10': 80,
      'cat-11': 72,
      'cat-12': 78,
      'cat-13': 82,
      'cat-14': 68,
      'cat-15': 75,
      'cat-16': 70,
      'cat-17': 65,
      'cat-18': 72,
      'cat-19': 68,
      'cat-20': 70,
    },

    strengths: ['Integridade', 'Amabilidade', 'Honestidade'],
    developmentAreas: ['Proatividade', 'Tomada de Decisão', 'Resolução de Problemas'],
    redFlags: [],

    summary: 'Candidato com excelente perfil de caráter e valores éticos sólidos. Demonstra forte capacidade de trabalho em equipe e relacionamento interpessoal. Áreas de desenvolvimento identificadas em competências técnicas como proatividade e tomada de decisão.',

    insights: {
      'dim-personality': 'Perfil equilibrado com destaque para amabilidade e conscienciosidade. Tendência a buscar harmonia em ambientes de trabalho.',
      'dim-character': 'Valores éticos muito bem estabelecidos. Alta confiabilidade e transparência nas ações profissionais.',
      'dim-competencies': 'Bom desempenho em trabalho colaborativo. Oportunidade de desenvolvimento em iniciativa própria e gestão autônoma.',
    },

    careerRecommendations: [
      'Atendimento ao Cliente',
      'Recursos Humanos',
      'Suporte Técnico',
      'Gestão de Projetos (Júnior)',
      'Analista de Qualidade',
    ],

    xpAwarded: 50,
    badgeAwarded: 'self_knowledge',
    generatedAt: '2024-12-01T11:35:00Z',
  },
];

// =============================================================================
// TEMPLATES DE INSIGHTS (usados para gerar insights sem IA)
// =============================================================================

export const INSIGHT_TEMPLATES = {
  personality: {
    high: 'Perfil de personalidade muito bem desenvolvido, com destaque para {categories}. Demonstra maturidade emocional e autoconhecimento.',
    medium: 'Perfil de personalidade equilibrado. Áreas de força incluem {categories}. Há espaço para desenvolvimento em {weakCategories}.',
    low: 'Perfil de personalidade com oportunidades de desenvolvimento. Recomenda-se trabalhar especialmente em {categories}.',
  },
  character: {
    high: 'Valores éticos e morais muito bem estabelecidos. {categories} são pontos de destaque que demonstram alta confiabilidade.',
    medium: 'Valores sólidos com bom nível de integridade. {categories} são áreas de força. Atenção a {weakCategories}.',
    low: 'Área que requer atenção especial. É recomendado desenvolver {categories} para melhor adequação profissional.',
  },
  competencies: {
    high: 'Competências profissionais de alto nível. Destaque para {categories}. Perfil indicado para posições de maior responsabilidade.',
    medium: 'Competências bem desenvolvidas em {categories}. Potencial para crescimento em {weakCategories}.',
    low: 'Competências em desenvolvimento. Foco recomendado em {categories} para evolução profissional.',
  },
};

// =============================================================================
// RECOMENDAÇÕES DE CARREIRA POR PERFIL
// =============================================================================

export const CAREER_RECOMMENDATIONS_MAP: Record<string, string[]> = {
  high_personality: [
    'Consultoria',
    'Gestão de Pessoas',
    'Marketing e Comunicação',
    'Vendas Consultivas',
    'Coaching e Mentoria',
  ],
  high_character: [
    'Compliance',
    'Auditoria',
    'Recursos Humanos',
    'Gestão de Qualidade',
    'Atendimento ao Cliente',
  ],
  high_competencies: [
    'Gestão de Projetos',
    'Liderança de Equipes',
    'Desenvolvimento de Negócios',
    'Análise de Dados',
    'Operações',
  ],
  balanced: [
    'Analista de Negócios',
    'Coordenação de Projetos',
    'Suporte Técnico Especializado',
    'Administração',
    'Gestão Comercial',
  ],
};

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  CURRENT_ASSESSMENT: 'gauge-pro-current-assessment',
  ASSESSMENT_RESPONSES: 'gauge-pro-responses',
  LAST_COMPLETED: 'gauge-pro-last-completed',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Verifica se o candidato pode fazer o teste (cooldown de 90 dias)
 */
export function canTakeTest(candidateId: string): { canTake: boolean; daysRemaining?: number } {
  const lastCompletedKey = `${STORAGE_KEYS.LAST_COMPLETED}-${candidateId}`;
  const lastCompleted = localStorage.getItem(lastCompletedKey);

  if (!lastCompleted) {
    return { canTake: true };
  }

  const lastDate = new Date(lastCompleted);
  const now2 = new Date();
  const diffDays = Math.floor((now2.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= BEHAVIORAL_TEST_CONFIG.cooldownDays) {
    return { canTake: true };
  }

  return {
    canTake: false,
    daysRemaining: BEHAVIORAL_TEST_CONFIG.cooldownDays - diffDays,
  };
}

/**
 * Verifica se existe uma sessão em andamento
 */
export function hasActiveSession(candidateId: string): BehavioralAssessment | null {
  const sessionKey = `${STORAGE_KEYS.CURRENT_ASSESSMENT}-${candidateId}`;
  const session = localStorage.getItem(sessionKey);

  if (!session) {
    return null;
  }

  const assessment = JSON.parse(session) as BehavioralAssessment;

  // Verificar se a sessão expirou
  if (new Date(assessment.expiresAt) < new Date()) {
    localStorage.removeItem(sessionKey);
    return null;
  }

  if (assessment.status !== 'in_progress') {
    return null;
  }

  return assessment;
}

/**
 * Gera um magic token UUID v4
 */
export function generateMagicToken(): string {
  return crypto.randomUUID();
}
