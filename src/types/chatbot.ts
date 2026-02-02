/**
 * Types for Chatbot
 * PRD-040: Chatbot de Suporte
 */

// Status do chatbot
export type ChatbotStatus = 'idle' | 'typing' | 'error';

// Tipo de mensagem
export type ChatbotMessageType = 'user' | 'bot' | 'system';

// Tipo de sugestão
export type SuggestionType = 'quick_reply' | 'action' | 'link';

// Feedback do usuário
export type FeedbackType = 'helpful' | 'not_helpful' | null;

// Contexto do usuário
export type UserContext = 'guest' | 'candidate' | 'company' | 'admin';

// Mensagem do chatbot
export interface ChatbotMessage {
  id: string;
  type: ChatbotMessageType;
  content: string;
  timestamp: string;
  feedback?: FeedbackType;
  relatedQuestionId?: string; // ID da pergunta da base de conhecimento
  suggestions?: ChatbotSuggestion[];
}

// Sugestão/Quick reply
export interface ChatbotSuggestion {
  id: string;
  type: SuggestionType;
  label: string;
  value: string;
  icon?: string;
}

// Item da base de conhecimento
export interface KnowledgeBaseItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  category: string;
  contexts: UserContext[]; // Em quais contextos essa resposta é relevante
  relatedQuestions?: string[]; // IDs de perguntas relacionadas
  priority: number; // Para ordenação quando múltiplos matches
}

// Histórico de conversa
export interface ChatHistory {
  id: string;
  userId?: string;
  userContext: UserContext;
  messages: ChatbotMessage[];
  startedAt: string;
  endedAt?: string;
  escalated: boolean;
  ticketId?: string;
}

// Resultado do fuzzy matching
export interface FuzzyMatchResult {
  item: KnowledgeBaseItem;
  score: number; // 0-1, quanto maior melhor
  matchedKeywords: string[];
}

// Ticket de escalonamento
export interface EscalationTicket {
  id: string;
  chatHistoryId: string;
  userId?: string;
  userEmail?: string;
  subject: string;
  description: string;
  chatTranscript: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

// Estado do chatbot
export interface ChatbotState {
  isOpen: boolean;
  isMinimized: boolean;
  status: ChatbotStatus;
  messages: ChatbotMessage[];
  userContext: UserContext;
}

// Categorias de perguntas
export const CHATBOT_CATEGORIES = {
  general: 'Geral',
  candidate: 'Para Candidatos',
  company: 'Para Empresas',
  tests: 'Testes Comportamentais',
  account: 'Conta e Perfil',
  jobs: 'Vagas',
  technical: 'Problemas Técnicos',
} as const;

export type ChatbotCategory = keyof typeof CHATBOT_CATEGORIES;
