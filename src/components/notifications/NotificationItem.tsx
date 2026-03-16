// PRD-025: Componente de item de notificação

import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ClipboardList,
  Brain,
  MessageSquare,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Notification, NotificationType } from '@/types/notifications';
import { formatTimeAgo } from '@/lib/notificationHelpers';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  compact?: boolean;
}

// Ícone por tipo de notificação
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'job_match':
      return <Briefcase className="w-5 h-5" />;
    case 'application_update':
      return <ClipboardList className="w-5 h-5" />;
    case 'test_request':
      return <Brain className="w-5 h-5" />;
    case 'message':
      return <MessageSquare className="w-5 h-5" />;
    case 'application_approved':
      return <CheckCircle className="w-5 h-5" />;
    case 'application_rejected':
      return <XCircle className="w-5 h-5" />;
    default:
      return <Briefcase className="w-5 h-5" />;
  }
}

// Cor do fundo do ícone por tipo
function getIconBgColor(type: NotificationType): string {
  switch (type) {
    case 'job_match':
      return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
    case 'application_update':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'test_request':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'message':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'application_approved':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'application_rejected':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function NotificationItem({
  notification,
  onRead,
  onMarkAsRead,
  compact = false,
}: NotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead(notification.id);
    navigate(notification.actionUrl);
  };

  // Calcular dias restantes para teste
  const testDaysRemaining = notification.metadata.testDeadline
    ? Math.ceil(
        (new Date(notification.metadata.testDeadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

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
            {notification.metadata.matchPercentage && (
              <Badge
                variant="secondary"
                className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
              >
                <Star className="w-3 h-3 mr-1" />
                {notification.metadata.matchPercentage}% match
              </Badge>
            )}

            {testDaysRemaining !== null && testDaysRemaining > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  testDaysRemaining <= 3
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                )}
              >
                <Clock className="w-3 h-3 mr-1" />
                {testDaysRemaining <= 3 ? 'Urgente: ' : ''}
                {testDaysRemaining} dia{testDaysRemaining !== 1 ? 's' : ''} restante
                {testDaysRemaining !== 1 ? 's' : ''}
              </Badge>
            )}

            {notification.metadata.newStage && (
              <Badge variant="outline" className="text-xs">
                Etapa: {notification.metadata.newStage}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
