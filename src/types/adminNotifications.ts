// Sistema de notificações do administrador

export type AdminNotificationType =
  | 'new_company'             // Nova empresa cadastrada
  | 'new_candidate'           // Novo candidato cadastrado
  | 'job_pending_moderation'  // Vaga aguardando aprovação
  | 'new_ticket'              // Novo ticket de suporte
  | 'ticket_reply'            // Resposta em ticket de suporte
  | 'payment_failed';         // Falha em pagamento (futuro)

export interface AdminNotificationMetadata {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userType?: string;
  candidateId?: string;
  companyId?: string;
  companyName?: string;
  jobId?: string;
  jobTitle?: string;
  ticketId?: string;
  ticketSubject?: string;
  ticketPriority?: string;
  ticketNumber?: number;
}

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: string; // ISO date
  actionUrl: string;
  metadata: AdminNotificationMetadata;
}

// Labels para cada tipo de notificação
export const adminNotificationTypeLabels: Record<AdminNotificationType, string> = {
  new_company: 'Empresas',
  new_candidate: 'Candidatos',
  job_pending_moderation: 'Vagas',
  new_ticket: 'Suporte',
  ticket_reply: 'Suporte',
  payment_failed: 'Pagamentos',
};

// Ícones para cada tipo (nome do ícone Lucide)
export const adminNotificationTypeIcons: Record<AdminNotificationType, string> = {
  new_company: 'Building2',
  new_candidate: 'UserPlus',
  job_pending_moderation: 'FileSearch',
  new_ticket: 'LifeBuoy',
  ticket_reply: 'MessageCircle',
  payment_failed: 'CreditCard',
};

// Cores para cada tipo
export const adminNotificationTypeColors: Record<AdminNotificationType, string> = {
  new_company: 'text-blue-500',
  new_candidate: 'text-cyan-500',
  job_pending_moderation: 'text-amber-500',
  new_ticket: 'text-purple-500',
  ticket_reply: 'text-green-500',
  payment_failed: 'text-red-500',
};

// Filtros disponíveis na página de notificações
export type AdminNotificationFilter = 'all' | 'users' | 'jobs' | 'support';

export const adminNotificationFilters: { value: AdminNotificationFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'users', label: 'Usuários' },
  { value: 'jobs', label: 'Vagas' },
  { value: 'support', label: 'Suporte' },
];

// Labels de filtro para uso rápido
export const adminFilterLabels: Record<AdminNotificationFilter, string> = {
  all: 'Todas',
  users: 'Usuários',
  jobs: 'Vagas',
  support: 'Suporte',
};

// Mapear filtros para tipos
export const adminFilterToTypes: Record<AdminNotificationFilter, AdminNotificationType[] | null> = {
  all: null,
  users: ['new_company', 'new_candidate'],
  jobs: ['job_pending_moderation'],
  support: ['new_ticket', 'ticket_reply'],
};
