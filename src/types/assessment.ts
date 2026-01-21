/**
 * Assessment Types
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Tipos para dimensões, categorias e perguntas do sistema Gauge-Pro 2.0
 */

/**
 * Dimensão de avaliação (nível mais alto da hierarquia)
 * Ex: Personalidade, Caráter, Competências
 */
export interface AssessmentDimension {
  id: string;
  name: string;           // "Personalidade", "Caráter", "Competências"
  slug: string;           // "personality", "character", "competencies"
  description: string;
  icon: string;           // Emoji: "🎭", "💎", "💼"
  color: string;          // Cor CSS para badges
  order: number;          // Ordem de exibição (1, 2, 3)
  isActive: boolean;
  questionCount?: number; // Calculado: total de perguntas
}

/**
 * Categoria de avaliação (subordinada à dimensão)
 * Ex: Abertura à Experiência, Integridade, Liderança
 */
export interface AssessmentCategory {
  id: string;
  dimensionId: string;
  name: string;           // "Abertura à Experiência", "Integridade", etc.
  slug: string;
  description: string;    // "O que avalia: ..."
  order: number;          // 1-20 (ordem global)
  isActive: boolean;
  questionCount?: number; // Calculado: total de perguntas na categoria
  createdAt: string;
  updatedAt: string;
}

/**
 * Tipo de pergunta
 */
export type QuestionType = 'behavioral' | 'situational' | 'self_assessment';

/**
 * Labels traduzidos para tipo de pergunta
 */
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  behavioral: 'Comportamental',
  situational: 'Situacional',
  self_assessment: 'Autoavaliação',
};

/**
 * Ícones para tipo de pergunta
 */
export const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  behavioral: '🔄',
  situational: '🎯',
  self_assessment: '🪞',
};

/**
 * Nível de complexidade da pergunta
 */
export type QuestionLevel = 'basic' | 'intermediate' | 'advanced';

/**
 * Labels traduzidos para nível
 */
export const QUESTION_LEVEL_LABELS: Record<QuestionLevel, string> = {
  basic: 'Básico',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

/**
 * Estrelas para nível
 */
export const QUESTION_LEVEL_STARS: Record<QuestionLevel, string> = {
  basic: '⭐',
  intermediate: '⭐⭐',
  advanced: '⭐⭐⭐',
};

/**
 * Opção de resposta para perguntas situacionais
 */
export interface SituationalOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  weight: number; // 0-100, usado para scoring
}

/**
 * Pergunta de avaliação
 */
export interface AssessmentQuestion {
  id: string;
  categoryId: string;
  code: string;           // "1.1", "6.7", "20.11" - código único
  type: QuestionType;
  level: QuestionLevel;
  text: string;           // Texto da pergunta
  helpText?: string;      // Texto auxiliar/dica
  options?: SituationalOption[];  // Para perguntas situacionais com opções
  correctWeight?: Record<string, number>; // Pesos para cada opção
  redFlagThreshold?: number; // Limite para red flag
  isActive: boolean;
  usageCount: number;     // Quantidade de vezes que foi usada
  createdAt: string;
  updatedAt: string;
}

/**
 * Filtros para busca de perguntas
 */
export interface QuestionFilters {
  search?: string;
  dimensionId?: string;
  categoryId?: string;
  type?: QuestionType | 'all';
  level?: QuestionLevel | 'all';
  status?: 'active' | 'inactive' | 'all';
}

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Resultado paginado genérico
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Estatísticas do banco de perguntas
 */
export interface QuestionBankStats {
  totalQuestions: number;
  activeQuestions: number;
  inactiveQuestions: number;
  byDimension: Record<string, number>;
  byType: Record<QuestionType, number>;
  byLevel: Record<QuestionLevel, number>;
}

/**
 * Dados para criar/editar pergunta
 */
export interface QuestionFormData {
  categoryId: string;
  code: string;
  type: QuestionType;
  level: QuestionLevel;
  text: string;
  helpText?: string;
  options?: SituationalOption[];
  isActive: boolean;
}

/**
 * Dados para criar/editar categoria
 */
export interface CategoryFormData {
  dimensionId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
}

/**
 * Ação de admin no banco de perguntas
 */
export type QuestionAdminAction =
  | 'created'
  | 'updated'
  | 'activated'
  | 'deactivated'
  | 'duplicated';

/**
 * Log de ação administrativa
 */
export interface QuestionActionLog {
  id: string;
  questionId: string;
  action: QuestionAdminAction;
  performedBy: string;
  performedAt: string;
  details?: string;
}

// =============================================================================
// PRD-047: TESTE GERAL DO CANDIDATO
// =============================================================================

/**
 * Status da sessão de avaliação
 */
export type BehavioralAssessmentStatus = 'in_progress' | 'completed' | 'expired';

/**
 * Sessão de Avaliação Comportamental
 * PRD-047: Teste Geral do Candidato
 */
export interface BehavioralAssessment {
  id: string;
  candidateId: string;
  status: BehavioralAssessmentStatus;
  questionsIds: string[];        // IDs das perguntas selecionadas
  totalQuestions: number;        // 50-60
  currentQuestionIndex: number;
  answeredCount: number;
  startedAt: string;             // ISO date
  lastActivityAt: string;        // ISO date
  completedAt?: string;          // ISO date
  totalTimeSeconds?: number;
  expiresAt: string;             // Sessão válida por 7 dias
}

/**
 * Resposta individual do candidato
 */
export interface BehavioralResponse {
  id: string;
  assessmentId: string;
  questionId: string;
  response: string;              // "1"-"5" (Likert) ou "A"-"D" (Situacional)
  score: number;                 // Score normalizado 0-100
  answeredAt: string;            // ISO date
  timeSpentSeconds: number;
}

/**
 * Red Flag detectado na avaliação
 */
export interface BehavioralRedFlag {
  categoryId: string;
  categoryName: string;
  score: number;
  threshold: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Resultado completo da avaliação comportamental
 */
export interface BehavioralResult {
  id: string;
  assessmentId: string;
  candidateId: string;

  // Scores gerais (0-100)
  overallScore: number;
  personalityScore: number;      // Dimensão Personalidade
  characterScore: number;        // Dimensão Caráter
  competencyScore: number;       // Dimensão Competências

  // Scores por categoria
  categoryScores: Record<string, number>;

  // Insights
  strengths: string[];           // Top 3 categorias fortes
  developmentAreas: string[];    // Top 3 áreas de desenvolvimento
  redFlags: BehavioralRedFlag[];

  // Textos gerados
  summary: string;               // Resumo geral
  insights: Record<string, string>; // Insights por dimensão
  careerRecommendations: string[]; // Tipos de cargo recomendados

  // Gamificação
  xpAwarded: number;             // 50 XP
  badgeAwarded: string;          // "Perfil Completo"

  generatedAt: string;           // ISO date
}

/**
 * Configurações do teste geral
 */
export interface BehavioralTestConfig {
  minQuestions: number;          // 50
  maxQuestions: number;          // 60
  sessionValidDays: number;      // 7
  cooldownDays: number;          // 90
  xpReward: number;              // 50
  badgeId: string;               // "perfil_completo"

  // Balanceamento
  personalityWeight: number;     // 0.35
  characterWeight: number;       // 0.30
  competencyWeight: number;      // 0.35

  // Distribuição de níveis
  basicQuestionsRatio: number;   // 0.30
  intermediateQuestionsRatio: number; // 0.40
  advancedQuestionsRatio: number; // 0.30
}

/**
 * Labels para escala Likert
 */
export const LIKERT_LABELS: Record<string, string> = {
  '1': 'Discordo totalmente',
  '2': 'Discordo parcialmente',
  '3': 'Neutro',
  '4': 'Concordo parcialmente',
  '5': 'Concordo totalmente',
};

/**
 * Thresholds padrão para red flags por categoria
 */
export const RED_FLAG_THRESHOLDS: Record<string, number> = {
  // Caráter - mais sensíveis
  'cat-6': 40,  // Integridade
  'cat-7': 40,  // Responsabilidade
  'cat-8': 40,  // Honestidade
  'cat-9': 40,  // Ética Profissional
  'cat-10': 40, // Confiabilidade
  // Outras categorias
  default: 30,
};

// =============================================================================
// PRD-048: TESTE POR VAGA (EMPRESA)
// =============================================================================

/**
 * Status do teste por vaga
 */
export type JobAssessmentStatus = 'draft' | 'published' | 'archived';

/**
 * Competências selecionadas para o teste
 */
export interface SelectedCompetencies {
  critical: string[];            // IDs das competências críticas (peso maior)
  important: string[];           // IDs das competências importantes
  weights: Record<string, number>; // Peso de 1-5 por competência
}

/**
 * Teste comportamental associado a uma vaga
 * PRD-048: Teste por Vaga
 */
export interface JobAssessment {
  id: string;
  jobId: string;
  companyId: string;
  title: string;
  status: JobAssessmentStatus;
  competencies: SelectedCompetencies;
  questionsIds: string[];        // Perguntas selecionadas
  totalQuestions: number;        // 15-25
  estimatedMinutes: number;
  expirationDays: number;        // Dias para expirar convite
  createdBy: string;             // userId do recrutador
  createdAt: string;
  updatedAt: string;
}

/**
 * Status do convite para teste
 */
export type JobAssessmentInviteStatus = 'pending' | 'started' | 'completed' | 'expired';

/**
 * Tipo de convite
 */
export type JobAssessmentInviteType = 'internal' | 'magic_link';

/**
 * Convite para teste por vaga
 */
export interface JobAssessmentInvite {
  id: string;
  jobAssessmentId: string;
  type: JobAssessmentInviteType;

  // Para candidatos internos
  candidateId?: string;

  // Para candidatos externos (magic link)
  externalName?: string;
  externalEmail?: string;
  magicToken?: string;           // UUID v4

  status: JobAssessmentInviteStatus;
  sentAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt: string;
}

/**
 * Análise por IA do resultado
 */
export interface AIAnalysis {
  overallFit: number;            // 0-100, adequação geral
  competencyFit: Record<string, number>; // Fit por competência
  strengthsForRole: string[];
  concernsForRole: string[];
  interviewSuggestions: string[]; // Perguntas sugeridas para entrevista
  summary: string;
}

/**
 * Ajustes feitos pelo recrutador
 */
export interface RecruiterAdjustments {
  adjustedScores: {
    questionId: string;
    originalScore: number;
    adjustedScore: number;
    note?: string;
  }[];
  overallAdjustment?: number;    // Ajuste no score geral
  adjustmentReason?: string;
}

/**
 * Decisão do recrutador
 */
export type RecruiterDecision = 'approved' | 'pending' | 'rejected';

/**
 * Recomendação da IA
 */
export type AIRecommendation = 'approve' | 'evaluate' | 'reject';

/**
 * Resultado do teste por vaga
 */
export interface JobAssessmentResult {
  id: string;
  inviteId: string;
  jobAssessmentId: string;
  candidateId: string;
  candidateName?: string;        // Para externos via magic link
  candidateEmail?: string;

  // Scores
  overallScore: number;
  competencyScores: Record<string, number>;

  // Análise IA
  aiAnalysis: AIAnalysis;
  aiRecommendation: AIRecommendation;

  // Ajustes do recrutador
  recruiterAdjustments?: RecruiterAdjustments;
  recruiterDecision?: RecruiterDecision;
  recruiterNotes?: string;

  // Alertas
  redFlags: BehavioralRedFlag[];

  // Respostas individuais
  responses: BehavioralResponse[];

  createdAt: string;
  updatedAt: string;
}

/**
 * Configurações do teste por vaga
 */
export interface JobTestConfig {
  minQuestions: number;          // 15
  maxQuestions: number;          // 25
  minCompetencies: number;       // 2
  maxCompetencies: number;       // 8
  maxMagicLinksPerJob: number;   // 50
  defaultExpirationDays: number; // 7
}

/**
 * Dados para comparação lado a lado
 */
export interface CandidateComparisonData {
  candidateId: string;
  candidateName: string;
  overallScore: number;
  competencyScores: Record<string, number>;
  strengths: string[];
  concerns: string[];
  aiRecommendation: AIRecommendation;
  recruiterDecision?: RecruiterDecision;
}
