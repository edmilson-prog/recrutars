/**
 * Help and Support Types
 * PRD-028: Central de Ajuda
 */

export type UserArea = 'candidate' | 'company' | 'admin' | 'general';

export type TicketStatus = 'open' | 'answered' | 'resolved';

export type TicketCategory =
  | 'account'
  | 'applications'
  | 'resumes'
  | 'tests'
  | 'interviews'
  | 'messages'
  | 'billing'
  | 'technical'
  | 'suggestions'
  | 'other';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  area: UserArea;
  relatedArticles?: string[];
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'support';
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: number;
  userId: string;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Labels para categorias de tickets
export const ticketCategoryLabels: Record<TicketCategory, string> = {
  account: 'Conta e Acesso',
  applications: 'Candidaturas',
  resumes: 'Perfil Profissional',
  tests: 'Testes',
  interviews: 'Entrevistas',
  messages: 'Mensagens',
  billing: 'Pagamentos e Assinatura',
  technical: 'Problemas Técnicos',
  suggestions: 'Sugestões',
  other: 'Outros',
};

// Labels para status de tickets
export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  answered: 'Respondido',
  resolved: 'Resolvido',
};

// Cores para status de tickets
export const ticketStatusColors: Record<TicketStatus, string> = {
  open: 'yellow',
  answered: 'green',
  resolved: 'gray',
};
