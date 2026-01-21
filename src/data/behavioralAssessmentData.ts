/**
 * Behavioral Assessment Data - Mock
 * PRD-047: Teste Geral do Candidato
 *
 * Dados de sessões, respostas e resultados de avaliação comportamental
 */

import type {
  BehavioralAssessment,
  BehavioralResponse,
  BehavioralResult,
  BehavioralTestConfig,
  JobAssessment,
  JobAssessmentInvite,
  JobAssessmentResult,
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
// MOCK: SESSÕES DE AVALIAÇÃO
// =============================================================================

const now = new Date().toISOString();
const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export const mockBehavioralAssessments: BehavioralAssessment[] = [
  {
    id: 'ba-completed-1',
    candidateId: 'candidate-2', // Outro candidato com teste completo
    status: 'completed',
    questionsIds: [], // Seria populado com 55 IDs
    totalQuestions: 55,
    currentQuestionIndex: 54,
    answeredCount: 55,
    startedAt: '2024-12-01T10:00:00Z',
    lastActivityAt: '2024-12-01T11:30:00Z',
    completedAt: '2024-12-01T11:30:00Z',
    totalTimeSeconds: 5400, // 90 minutos
    expiresAt: '2024-12-08T10:00:00Z',
  },
];

// =============================================================================
// MOCK: RESPOSTAS
// =============================================================================

export const mockBehavioralResponses: BehavioralResponse[] = [];

// =============================================================================
// MOCK: RESULTADOS
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
      'cat-1': 80,  // Abertura à Experiência
      'cat-2': 85,  // Conscienciosidade
      'cat-3': 75,  // Extroversão
      'cat-4': 88,  // Amabilidade
      'cat-5': 82,  // Estabilidade Emocional
      'cat-6': 90,  // Integridade
      'cat-7': 85,  // Responsabilidade
      'cat-8': 88,  // Honestidade
      'cat-9': 82,  // Ética Profissional
      'cat-10': 80, // Confiabilidade
      'cat-11': 72, // Liderança
      'cat-12': 78, // Comunicação
      'cat-13': 82, // Trabalho em Equipe
      'cat-14': 68, // Resolução de Problemas
      'cat-15': 75, // Adaptabilidade
      'cat-16': 70, // Organização
      'cat-17': 65, // Proatividade
      'cat-18': 72, // Foco em Resultados
      'cat-19': 68, // Tomada de Decisão
      'cat-20': 70, // Gestão do Tempo
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
// MOCK: TESTES POR VAGA (PRD-048)
// =============================================================================

export const mockJobAssessments: JobAssessment[] = [
  {
    id: 'ja-1',
    jobId: 'job-1',
    companyId: 'company-1',
    title: 'Avaliação para Desenvolvedor Frontend',
    status: 'published',
    competencies: {
      critical: ['cat-14', 'cat-15'], // Resolução de Problemas, Adaptabilidade
      important: ['cat-12', 'cat-13', 'cat-17'], // Comunicação, Trabalho em Equipe, Proatividade
      weights: {
        'cat-14': 5,
        'cat-15': 5,
        'cat-12': 4,
        'cat-13': 4,
        'cat-17': 3,
      },
    },
    questionsIds: [], // Seria populado com 20 IDs
    totalQuestions: 20,
    estimatedMinutes: 25,
    expirationDays: 7,
    createdBy: 'user-company-1',
    createdAt: '2024-12-10T09:00:00Z',
    updatedAt: '2024-12-10T09:00:00Z',
  },
  {
    id: 'ja-2',
    jobId: 'job-2',
    companyId: 'company-1',
    title: 'Avaliação para Líder de Equipe',
    status: 'draft',
    competencies: {
      critical: ['cat-11', 'cat-19'], // Liderança, Tomada de Decisão
      important: ['cat-12', 'cat-18', 'cat-5'], // Comunicação, Foco em Resultados, Estabilidade Emocional
      weights: {
        'cat-11': 5,
        'cat-19': 5,
        'cat-12': 4,
        'cat-18': 4,
        'cat-5': 3,
      },
    },
    questionsIds: [],
    totalQuestions: 22,
    estimatedMinutes: 28,
    expirationDays: 10,
    createdBy: 'user-company-1',
    createdAt: '2024-12-15T14:00:00Z',
    updatedAt: '2024-12-15T14:00:00Z',
  },
];

// =============================================================================
// MOCK: CONVITES PARA TESTE
// =============================================================================

export const mockJobAssessmentInvites: JobAssessmentInvite[] = [
  {
    id: 'jai-1',
    jobAssessmentId: 'ja-1',
    type: 'internal',
    candidateId: 'candidate-1',
    status: 'pending',
    sentAt: '2024-12-11T10:00:00Z',
    expiresAt: '2024-12-18T10:00:00Z',
  },
  {
    id: 'jai-2',
    jobAssessmentId: 'ja-1',
    type: 'magic_link',
    externalName: 'Carlos Silva',
    externalEmail: 'carlos.silva@email.com',
    magicToken: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    status: 'started',
    sentAt: '2024-12-11T11:00:00Z',
    startedAt: '2024-12-12T09:00:00Z',
    expiresAt: '2024-12-18T11:00:00Z',
  },
  {
    id: 'jai-3',
    jobAssessmentId: 'ja-1',
    type: 'magic_link',
    externalName: 'Ana Rodrigues',
    externalEmail: 'ana.rodrigues@email.com',
    magicToken: 'b2c3d4e5-f6a7-8901-bcde-f2345678901a',
    status: 'completed',
    sentAt: '2024-12-10T14:00:00Z',
    startedAt: '2024-12-11T08:00:00Z',
    completedAt: '2024-12-11T08:45:00Z',
    expiresAt: '2024-12-17T14:00:00Z',
  },
];

// =============================================================================
// MOCK: RESULTADOS DE TESTE POR VAGA
// =============================================================================

export const mockJobAssessmentResults: JobAssessmentResult[] = [
  {
    id: 'jar-1',
    inviteId: 'jai-3',
    jobAssessmentId: 'ja-1',
    candidateId: 'external-ana',
    candidateName: 'Ana Rodrigues',
    candidateEmail: 'ana.rodrigues@email.com',

    overallScore: 85,
    competencyScores: {
      'cat-14': 88, // Resolução de Problemas
      'cat-15': 92, // Adaptabilidade
      'cat-12': 82, // Comunicação
      'cat-13': 85, // Trabalho em Equipe
      'cat-17': 78, // Proatividade
    },

    aiAnalysis: {
      overallFit: 87,
      competencyFit: {
        'cat-14': 92,
        'cat-15': 95,
        'cat-12': 85,
        'cat-13': 88,
        'cat-17': 80,
      },
      strengthsForRole: [
        'Excelente capacidade de adaptação a mudanças',
        'Forte habilidade analítica para resolução de problemas',
        'Boa comunicação em equipe',
      ],
      concernsForRole: [
        'Proatividade levemente abaixo do esperado para o cargo',
      ],
      interviewSuggestions: [
        'Peça exemplos de situações onde precisou tomar iniciativa sem supervisão',
        'Explore casos de adaptação a tecnologias novas',
        'Discuta como lida com prazos apertados e múltiplas prioridades',
      ],
      summary: 'Candidata com excelente fit para a vaga. Pontos fortes em adaptabilidade e resolução de problemas compensam área de desenvolvimento em proatividade.',
    },

    aiRecommendation: 'approve',
    recruiterDecision: undefined,
    recruiterNotes: undefined,

    redFlags: [],
    responses: [],

    createdAt: '2024-12-11T08:50:00Z',
    updatedAt: '2024-12-11T08:50:00Z',
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
  // Perfis com alta personalidade
  high_personality: [
    'Consultoria',
    'Gestão de Pessoas',
    'Marketing e Comunicação',
    'Vendas Consultivas',
    'Coaching e Mentoria',
  ],
  // Perfis com alto caráter
  high_character: [
    'Compliance',
    'Auditoria',
    'Recursos Humanos',
    'Gestão de Qualidade',
    'Atendimento ao Cliente',
  ],
  // Perfis com altas competências
  high_competencies: [
    'Gestão de Projetos',
    'Liderança de Equipes',
    'Desenvolvimento de Negócios',
    'Análise de Dados',
    'Operações',
  ],
  // Perfis equilibrados
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
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Valida um magic token
 */
export function validateMagicToken(token: string): JobAssessmentInvite | null {
  const invite = mockJobAssessmentInvites.find(
    (inv) => inv.magicToken === token && inv.status !== 'expired'
  );

  if (!invite) {
    return null;
  }

  // Verificar expiração
  if (new Date(invite.expiresAt) < new Date()) {
    return null;
  }

  return invite;
}
