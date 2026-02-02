// PRD-033: Tipos para sistema de notificações da empresa

export type CompanyNotificationType =
  | 'new_application'        // Nova candidatura recebida
  | 'invite_accepted'        // Convite para vaga aceito
  | 'invite_declined'        // Convite para vaga recusado
  | 'interview_confirmed'    // Entrevista confirmada pelo candidato
  | 'interview_suggested'    // Candidato sugeriu outro horário
  | 'interview_cancelled'    // Entrevista cancelada
  | 'new_message'            // Nova mensagem de candidato
  | 'test_completed'         // Candidato completou teste
  | 'job_expiring'           // Vaga expirando em breve
  | 'job_expired';           // Vaga expirou

export interface CompanyNotificationMetadata {
  candidateId?: string;
  candidateName?: string;
  candidatePhoto?: string;
  jobId?: string;
  jobTitle?: string;
  applicationId?: string;
  matchPercentage?: number;
  behavioralProfile?: string;
  interviewDate?: string;
  interviewTime?: string;
  suggestedDate?: string;
  suggestedTime?: string;
  messagePreview?: string;
  testScore?: number;
  daysRemaining?: number;
}

export interface CompanyNotification {
  id: string;
  type: CompanyNotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: string; // ISO date
  actionUrl: string; // onde navegar ao clicar
  metadata: CompanyNotificationMetadata;
}

// Labels para cada tipo de notificação
export const companyNotificationTypeLabels: Record<CompanyNotificationType, string> = {
  new_application: 'Candidaturas',
  invite_accepted: 'Candidaturas',
  invite_declined: 'Candidaturas',
  interview_confirmed: 'Entrevistas',
  interview_suggested: 'Entrevistas',
  interview_cancelled: 'Entrevistas',
  new_message: 'Mensagens',
  test_completed: 'Testes',
  job_expiring: 'Vagas',
  job_expired: 'Vagas',
};

// Ícones para cada tipo (nome do ícone Lucide)
export const companyNotificationTypeIcons: Record<CompanyNotificationType, string> = {
  new_application: 'UserPlus',
  invite_accepted: 'CheckCircle',
  invite_declined: 'XCircle',
  interview_confirmed: 'CalendarCheck',
  interview_suggested: 'CalendarClock',
  interview_cancelled: 'CalendarX',
  new_message: 'MessageSquare',
  test_completed: 'ClipboardCheck',
  job_expiring: 'AlertTriangle',
  job_expired: 'XOctagon',
};

// Cores para cada tipo
export const companyNotificationTypeColors: Record<CompanyNotificationType, string> = {
  new_application: 'text-blue-500',
  invite_accepted: 'text-emerald-500',
  invite_declined: 'text-red-500',
  interview_confirmed: 'text-green-500',
  interview_suggested: 'text-yellow-500',
  interview_cancelled: 'text-red-500',
  new_message: 'text-purple-500',
  test_completed: 'text-cyan-500',
  job_expiring: 'text-amber-500',
  job_expired: 'text-red-500',
};

// Filtros disponíveis na página de notificações
export type CompanyNotificationFilter = 'all' | 'applications' | 'interviews' | 'messages' | 'jobs';

export const companyNotificationFilters: { value: CompanyNotificationFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'applications', label: 'Candidaturas' },
  { value: 'interviews', label: 'Entrevistas' },
  { value: 'messages', label: 'Mensagens' },
  { value: 'jobs', label: 'Vagas' },
];

// Labels de filtro para uso rápido
export const companyFilterLabels: Record<CompanyNotificationFilter, string> = {
  all: 'Todas',
  applications: 'Candidaturas',
  interviews: 'Entrevistas',
  messages: 'Mensagens',
  jobs: 'Vagas',
};

// Mapear filtros para tipos
export const companyFilterToTypes: Record<CompanyNotificationFilter, CompanyNotificationType[] | null> = {
  all: null,
  applications: ['new_application', 'invite_accepted', 'invite_declined'],
  interviews: ['interview_confirmed', 'interview_suggested', 'interview_cancelled'],
  messages: ['new_message'],
  jobs: ['job_expiring', 'job_expired', 'test_completed'],
};
