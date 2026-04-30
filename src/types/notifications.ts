// PRD-025: Tipos para sistema de notificações

export type NotificationType =
  | 'job_match'              // Nova vaga compatível
  | 'application_update'     // Mudança de status na candidatura
  | 'test_request'           // Empresa solicita teste
  | 'message'                // Nova mensagem de empresa
  | 'application_approved'   // Candidatura aprovada
  | 'application_rejected'   // Candidatura reprovada
  | 'application_hired'      // Candidato contratado (PRD-077)
  | 'application_talent_pool' // Movido para banco de talentos (PRD-077)
  | 'job_weights_changed';   // Empresa alterou pesos do match (Plano C "Mirror")

export interface NotificationMetadata {
  jobId?: string;
  jobTitle?: string;
  companyId?: string;
  companyName?: string;
  applicationId?: string;
  newStage?: string;
  testDeadline?: string;
  matchPercentage?: number;
  messagePreview?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: string; // ISO date
  actionUrl: string; // onde navegar ao clicar
  metadata: NotificationMetadata;
}

// Labels para cada tipo de notificação
export const notificationTypeLabels: Record<NotificationType, string> = {
  job_match: 'Vagas',
  application_update: 'Candidaturas',
  test_request: 'Testes',
  message: 'Mensagens',
  application_approved: 'Candidaturas',
  application_rejected: 'Candidaturas',
  application_hired: 'Contratado',
  application_talent_pool: 'Banco de Talentos',
  job_weights_changed: 'Critérios da vaga',
};

// Ícones para cada tipo (nome do ícone Lucide)
export const notificationTypeIcons: Record<NotificationType, string> = {
  job_match: 'Briefcase',
  application_update: 'ClipboardList',
  test_request: 'Brain',
  message: 'MessageSquare',
  application_approved: 'CheckCircle',
  application_rejected: 'XCircle',
  application_hired: 'Trophy',
  application_talent_pool: 'Users',
  job_weights_changed: 'SlidersHorizontal',
};

// Cores para cada tipo
export const notificationTypeColors: Record<NotificationType, string> = {
  job_match: 'text-cyan-500',
  application_update: 'text-blue-500',
  test_request: 'text-purple-500',
  message: 'text-green-500',
  application_approved: 'text-emerald-500',
  application_rejected: 'text-red-500',
  application_hired: 'text-emerald-600',
  application_talent_pool: 'text-indigo-500',
  job_weights_changed: 'text-violet-500',
};

// Filtros disponíveis na página de notificações
export type NotificationFilter = 'all' | 'jobs' | 'applications' | 'messages' | 'tests';

export const notificationFilters: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'jobs', label: 'Vagas' },
  { value: 'applications', label: 'Candidaturas' },
  { value: 'messages', label: 'Mensagens' },
  { value: 'tests', label: 'Testes' },
];

// Labels de filtro para uso rápido
export const filterLabels: Record<NotificationFilter, string> = {
  all: 'Todas',
  jobs: 'Vagas compatíveis',
  applications: 'Candidaturas',
  messages: 'Mensagens',
  tests: 'Testes solicitados',
};

// Mapear filtros para tipos
export const filterToTypes: Record<NotificationFilter, NotificationType[] | null> = {
  all: null,
  jobs: ['job_match', 'job_weights_changed'],
  applications: ['application_update', 'application_approved', 'application_rejected', 'application_hired', 'application_talent_pool'],
  messages: ['message'],
  tests: ['test_request'],
};
