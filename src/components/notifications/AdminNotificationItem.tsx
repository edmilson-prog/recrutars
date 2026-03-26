// Componente de item de notificação para admin

import { useNavigate } from 'react-router-dom';
import {
  Building2,
  UserPlus,
  FileSearch,
  LifeBuoy,
  MessageCircle,
  CreditCard,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { AdminNotification, AdminNotificationType } from '@/types/adminNotifications';
import { formatTimeAgo, resolveAdminNotificationUrl } from '@/lib/notificationHelpers';

interface AdminNotificationItemProps {
  notification: AdminNotification;
  onRead: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  compact?: boolean;
}

function getNotificationIcon(type: AdminNotificationType) {
  switch (type) {
    case 'new_company':
      return <Building2 className="w-5 h-5" />;
    case 'new_candidate':
      return <UserPlus className="w-5 h-5" />;
    case 'job_pending_moderation':
      return <FileSearch className="w-5 h-5" />;
    case 'new_ticket':
      return <LifeBuoy className="w-5 h-5" />;
    case 'ticket_reply':
      return <MessageCircle className="w-5 h-5" />;
    case 'payment_failed':
      return <CreditCard className="w-5 h-5" />;
    default:
      return <LifeBuoy className="w-5 h-5" />;
  }
}

function getIconBgColor(type: AdminNotificationType): string {
  switch (type) {
    case 'new_company':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'new_candidate':
      return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
    case 'job_pending_moderation':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'new_ticket':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'ticket_reply':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'payment_failed':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

const userTypeLabels: Record<string, string> = {
  company: 'Empresa',
  candidate: 'Candidato',
};

export function AdminNotificationItem({
  notification,
  onRead,
  onMarkAsRead,
  compact = false,
}: AdminNotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead(notification.id);
    navigate(resolveAdminNotificationUrl(notification));
  };

  const { metadata } = notification;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left transition-colors rounded-lg',
        compact ? 'p-3' : 'p-4',
        !notification.read
          ? 'bg-cyan-50/50 dark:bg-cyan-900/10 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
          : 'hover:bg-muted/50'
      )}
    >
      <div className="flex gap-3">
        {/* Indicador de não lida */}
        <div className="flex-shrink-0 w-2 pt-2">
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
          )}
        </div>

        {/* Ícone */}
        <div
          className={cn(
            'flex-shrink-0 rounded-lg flex items-center justify-center',
            compact ? 'w-9 h-9' : 'w-10 h-10',
            getIconBgColor(notification.type)
          )}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'font-medium text-foreground',
                compact ? 'text-sm' : 'text-base'
              )}
            >
              {notification.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(notification.createdAt)}
              </span>
              {!notification.read && onMarkAsRead && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="p-0.5 rounded hover:bg-muted transition-colors"
                  title="Marcar como lida"
                  aria-label="Marcar como lida"
                >
                  <Check className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          <p
            className={cn(
              'text-muted-foreground mt-0.5 line-clamp-2',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            {notification.description}
          </p>

          {/* Metadados extras */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Tipo de usuário */}
            {metadata.userType && userTypeLabels[metadata.userType] && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  metadata.userType === 'company'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                )}
              >
                {userTypeLabels[metadata.userType]}
              </Badge>
            )}

            {/* Prioridade do ticket */}
            {metadata.ticketPriority && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  priorityColors[metadata.ticketPriority] ?? priorityColors.medium
                )}
              >
                {priorityLabels[metadata.ticketPriority] ?? metadata.ticketPriority}
              </Badge>
            )}

            {/* Número do ticket */}
            {metadata.ticketNumber && (
              <Badge variant="outline" className="text-xs">
                #{metadata.ticketNumber}
              </Badge>
            )}

            {/* Título da vaga */}
            {metadata.jobTitle && (
              <Badge variant="outline" className="text-xs">
                {metadata.jobTitle}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
