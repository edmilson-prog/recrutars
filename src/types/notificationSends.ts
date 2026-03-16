// Tipos para o sistema de gerenciamento de notificacoes (admin)

export type NotificationCategory = 'informativo' | 'operacional' | 'alerta';
export type NotificationPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type NotificationTargetType = 'all_users' | 'all_candidates' | 'all_companies' | 'specific_user';
export type NotificationSendStatus = 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';

export interface NotificationSend {
  id: string;
  title: string;
  description: string;
  actionUrl: string | null;
  category: NotificationCategory;
  priority: NotificationPriority;
  targetType: NotificationTargetType;
  targetUserId: string | null;
  targetUserName?: string;
  targetCount: number;
  deliveredCount: number;
  readCount: number;
  status: NotificationSendStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  sentBy: string;
  sentByName?: string;
  templateId: string | null;
  createdAt: string;
}

export interface CreateNotificationParams {
  title: string;
  description: string;
  actionUrl?: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  targetType: NotificationTargetType;
  targetUserId?: string;
  scheduledAt?: string;
  templateId?: string;
}

export interface NotificationSendsFilters {
  search?: string;
  category?: NotificationCategory | '';
  priority?: NotificationPriority | '';
  status?: NotificationSendStatus | '';
}

export interface NotificationSendsStats {
  total: number;
  scheduled: number;
  successful: number;
  manual: number;
}

// Labels
export const categoryLabels: Record<NotificationCategory, string> = {
  informativo: 'Informativo',
  operacional: 'Operacional',
  alerta: 'Alerta',
};

export const priorityLabels: Record<NotificationPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const targetTypeLabels: Record<NotificationTargetType, string> = {
  all_users: 'Todos os usuários',
  all_candidates: 'Todos os candidatos',
  all_companies: 'Todas as empresas',
  specific_user: 'Usuário específico',
};

export const statusLabels: Record<NotificationSendStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  sent: 'Enviada',
  failed: 'Falha',
  cancelled: 'Cancelada',
};

// Badge colors
export const categoryColors: Record<NotificationCategory, string> = {
  informativo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  operacional: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  alerta: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export const priorityColors: Record<NotificationPriority, string> = {
  baixa: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  media: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  urgente: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const statusColors: Record<NotificationSendStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  scheduled: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  sent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-200 text-gray-600 dark:bg-gray-800/50 dark:text-gray-500',
};
