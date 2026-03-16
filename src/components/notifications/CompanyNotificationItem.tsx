// PRD-033: Componente de item de notificação para empresa

import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  CheckCircle,
  XCircle,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  MessageSquare,
  ClipboardCheck,
  AlertTriangle,
  XOctagon,
  Star,
  Clock,
  User,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { CompanyNotification, CompanyNotificationType } from '@/types/companyNotifications';
import { formatTimeAgo } from '@/lib/notificationHelpers';

interface CompanyNotificationItemProps {
  notification: CompanyNotification;
  onRead: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  compact?: boolean;
}

// Ícone por tipo de notificação
function getNotificationIcon(type: CompanyNotificationType) {
  switch (type) {
    case 'new_application':
      return <UserPlus className="w-5 h-5" />;
    case 'invite_accepted':
      return <CheckCircle className="w-5 h-5" />;
    case 'invite_declined':
      return <XCircle className="w-5 h-5" />;
    case 'interview_confirmed':
      return <CalendarCheck className="w-5 h-5" />;
    case 'interview_suggested':
      return <CalendarClock className="w-5 h-5" />;
    case 'interview_cancelled':
      return <CalendarX className="w-5 h-5" />;
    case 'new_message':
      return <MessageSquare className="w-5 h-5" />;
    case 'test_completed':
      return <ClipboardCheck className="w-5 h-5" />;
    case 'job_expiring':
      return <AlertTriangle className="w-5 h-5" />;
    case 'job_expired':
      return <XOctagon className="w-5 h-5" />;
    default:
      return <UserPlus className="w-5 h-5" />;
  }
}

// Cor do fundo do ícone por tipo
function getIconBgColor(type: CompanyNotificationType): string {
  switch (type) {
    case 'new_application':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'invite_accepted':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'invite_declined':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'interview_confirmed':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'interview_suggested':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'interview_cancelled':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'new_message':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'test_completed':
      return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
    case 'job_expiring':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'job_expired':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function CompanyNotificationItem({
  notification,
  onRead,
  onMarkAsRead,
  compact = false,
}: CompanyNotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead(notification.id);
    navigate(notification.actionUrl);
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
            {/* Match percentage */}
            {metadata.matchPercentage && (
              <Badge
                variant="secondary"
                className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
              >
                <Star className="w-3 h-3 mr-1" />
                {metadata.matchPercentage}% match
              </Badge>
            )}

            {/* Behavioral Profile */}
            {metadata.behavioralProfile && (
              <Badge
                variant="secondary"
                className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
              >
                <User className="w-3 h-3 mr-1" />
                Perfil {metadata.behavioralProfile}
              </Badge>
            )}

            {/* Days remaining for job */}
            {metadata.daysRemaining !== undefined && metadata.daysRemaining > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  metadata.daysRemaining <= 3
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                )}
              >
                <Clock className="w-3 h-3 mr-1" />
                {metadata.daysRemaining <= 3 ? 'Urgente: ' : ''}
                {metadata.daysRemaining} dia{metadata.daysRemaining !== 1 ? 's' : ''}
              </Badge>
            )}

            {/* Test score */}
            {metadata.testScore && (
              <Badge
                variant="secondary"
                className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
              >
                Nota: {metadata.testScore}%
              </Badge>
            )}

            {/* Interview date/time */}
            {metadata.interviewDate && metadata.interviewTime && (
              <Badge variant="outline" className="text-xs">
                {new Date(metadata.interviewDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}{' '}
                às {metadata.interviewTime}
              </Badge>
            )}

            {/* Suggested date/time */}
            {metadata.suggestedDate && metadata.suggestedTime && (
              <Badge
                variant="secondary"
                className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              >
                Sugestão:{' '}
                {new Date(metadata.suggestedDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}{' '}
                às {metadata.suggestedTime}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
