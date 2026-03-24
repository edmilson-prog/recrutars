/**
 * ActivityEventItem component
 * PRD-059: Relatorios "Radar"
 *
 * Single activity event card with icon, actor name, description,
 * and relative time.
 */

import {
  UserPlus,
  Building2,
  Briefcase,
  FileText,
  Brain,
  CreditCard,
  XCircle,
  Handshake,
  Calendar,
  Shield,
} from 'lucide-react';
import type { ActivityFeedEvent, ActivityEventType } from '@/types';
import { formatRelativeDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ActivityEventItemProps {
  event: ActivityFeedEvent;
  onClick?: () => void;
}

const EVENT_ICONS: Record<ActivityEventType, React.ComponentType<{ className?: string }>> = {
  new_candidate: UserPlus,
  new_company: Building2,
  new_job: Briefcase,
  application: FileText,
  test_completed: Brain,
  subscription: CreditCard,
  cancellation: XCircle,
  hire: Handshake,
  interview_scheduled: Calendar,
  moderation_action: Shield,
};

const EVENT_COLORS: Record<ActivityEventType, string> = {
  new_candidate: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  new_company: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  new_job: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  application: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  test_completed: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  subscription: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancellation: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  hire: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  interview_scheduled: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  moderation_action: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const EVENT_LABELS: Record<ActivityEventType, string> = {
  new_candidate: 'Novo Candidato',
  new_company: 'Nova Empresa',
  new_job: 'Nova Vaga',
  application: 'Candidatura',
  test_completed: 'Teste Completado',
  subscription: 'Assinatura',
  cancellation: 'Cancelamento',
  hire: 'Contratação',
  interview_scheduled: 'Entrevista',
  moderation_action: 'Moderação',
};

export function ActivityEventItem({ event, onClick }: ActivityEventItemProps) {
  const Icon = EVENT_ICONS[event.eventType] || FileText;
  const colorClass = EVENT_COLORS[event.eventType] || 'bg-muted text-muted-foreground';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
        onClick ? 'hover:bg-muted/60 cursor-pointer' : 'cursor-default'
      )}
    >
      {/* Icon */}
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
        <Icon className="w-4.5 h-4.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-foreground truncate">
            {event.actorName}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
            {EVENT_LABELS[event.eventType]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {event.description}
        </p>
      </div>

      {/* Time */}
      <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
        {formatRelativeDate(event.createdAt)}
      </div>
    </button>
  );
}

export { EVENT_LABELS, EVENT_ICONS };
