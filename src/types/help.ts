/**
 * Help and Support Types
 * PRD-028: Central de Ajuda
 * PRD-082: Admin Helpdesk Intelligence
 */

export type UserArea = 'candidate' | 'company' | 'admin' | 'general';

// Status values matching DB constraint (migration 035)
export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategory =
  | 'general'
  | 'technical'
  | 'billing'
  | 'account'
  | 'feedback'
  | 'bug'
  | 'access'
  | 'plan'
  | 'financial'
  | 'other'
  | 'applications'
  | 'resumes'
  | 'tests'
  | 'interviews'
  | 'messages'
  | 'suggestions';

export type RequesterType = 'candidate' | 'company' | 'admin';

export type SLAStatus = 'on_track' | 'warning' | 'breached';

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
  senderId: string;
  senderType: 'user' | 'admin' | 'system';
  content: string;
  isInternalNote: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: number;
  userId: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  status: TicketStatus;
  requesterType?: RequesterType;
  assignedTo?: string;
  slaDeadline?: string;
  resolvedAt?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Admin Helpdesk Types (PRD-082)
// ---------------------------------------------------------------------------

export interface AdminTicket extends Ticket {
  requesterName?: string;
  requesterEmail?: string;
  requesterAvatar?: string;
  assignedToName?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  messageCount: number;
  aiSuggestedCategory?: string;
  aiSuggestedPriority?: string;
  aiSummary?: string;
  aiTriageStatus?: string;
}

export interface AdminTicketDetail extends AdminTicket {
  messages: TicketMessage[];
  auditLog: TicketAuditEntry[];
}

export interface AdminTicketFilters {
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  requesterType?: RequesterType | 'all';
  slaStatus?: SLAStatus | 'all';
  assignedTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface RequesterContext {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  userType: RequesterType;
  planName?: string;
  planStatus?: string;
  isTrial?: boolean;
  trialDaysRemaining?: number;
  companyName?: string;
  companyId?: string;
  createdAt: string;
  lastLoginAt?: string;
  totalTickets: number;
  openTickets: number;
  avgResolutionTime?: number;
  // Engagement metrics
  totalJobs?: number;
  totalApplications?: number;
  totalTests?: number;
  totalLogins?: number;
}

export interface HelpdeskMetrics {
  totalOpen: number;
  totalInProgress: number;
  totalWaitingUser: number;
  totalResolved: number;
  totalClosed: number;
  avgResolutionTimeHours: number;
  slaBreachedCount: number;
  avgCsatRating: number;
  ticketsToday: number;
  ticketsThisWeek: number;
}

export interface TicketAuditEntry {
  id: string;
  ticketId: string;
  action: string;
  performedBy: string;
  performedByName?: string;
  oldValue?: string;
  newValue?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface TicketCSAT {
  id: string;
  ticketId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Labels and colors
// ---------------------------------------------------------------------------

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  general: 'Geral',
  technical: 'Problemas Técnicos',
  billing: 'Pagamentos e Assinatura',
  account: 'Conta e Acesso',
  feedback: 'Feedback',
  bug: 'Bug',
  access: 'Acesso',
  plan: 'Plano',
  financial: 'Financeiro',
  other: 'Outros',
  applications: 'Candidaturas',
  resumes: 'Perfil Profissional',
  tests: 'Testes',
  interviews: 'Entrevistas',
  messages: 'Mensagens',
  suggestions: 'Sugestões',
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  waiting_user: 'Aguardando Usuário',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

export const ticketStatusColors: Record<TicketStatus, string> = {
  open: 'yellow',
  in_progress: 'blue',
  waiting_user: 'orange',
  resolved: 'green',
  closed: 'gray',
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const ticketPriorityColors: Record<TicketPriority, string> = {
  low: 'slate',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

export const requesterTypeLabels: Record<RequesterType, string> = {
  candidate: 'Candidato',
  company: 'Empresa',
  admin: 'Admin',
};

// SLA durations in hours (for display)
export const slaDurations: Record<TicketPriority, number> = {
  urgent: 1,
  high: 2,
  medium: 8,
  low: 24,
};
