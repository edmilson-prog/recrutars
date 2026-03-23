/**
 * Invitation Timeline
 * Timeline vertical cronológica do ciclo de vida do convite
 */

import { cn } from '@/lib/utils';
import { Send, Eye, Play, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { TestInvitation, InvitationStatus } from '@/types/companyTest';

interface InvitationTimelineProps {
  invitation: TestInvitation;
}

interface TimelineStep {
  key: string;
  label: string;
  icon: typeof Send;
  color: string;
  bgColor: string;
  timestamp?: string;
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return formatFullDate(dateStr);
}

function getTimeBetween(start: string, end: string): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h ${diffMins % 60}min`;
  return `${diffDays}d ${diffHours % 24}h`;
}

export function InvitationTimeline({ invitation }: InvitationTimelineProps) {
  const steps: TimelineStep[] = [
    {
      key: 'sent',
      label: 'Convite enviado',
      icon: Send,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      timestamp: invitation.sentAt,
    },
    {
      key: 'viewed',
      label: 'Link acessado',
      icon: Eye,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500',
      timestamp: invitation.viewedAt,
    },
    {
      key: 'started',
      label: 'Teste iniciado',
      icon: Play,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500',
      timestamp: invitation.startedAt,
    },
    {
      key: 'completed',
      label: 'Teste concluído',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500',
      timestamp: invitation.completedAt,
    },
  ];

  // Terminal status event (if applicable)
  const terminalEvent = (() => {
    if (invitation.status === 'expired') {
      return { key: 'expired', label: 'Convite expirado', icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-400' };
    }
    if (invitation.status === 'cancelled') {
      return { key: 'cancelled', label: 'Convite cancelado', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500' };
    }
    if (invitation.status === 'abandoned') {
      return { key: 'abandoned', label: 'Teste abandonado', icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-500' };
    }
    return null;
  })();

  return (
    <TooltipProvider>
      <ol className="space-y-0" aria-label="Timeline do convite">
        {steps.map((step, index) => {
          const isCompleted = !!step.timestamp;
          const isLast = index === steps.length - 1 && !terminalEvent;
          const nextStep = steps[index + 1];
          const Icon = step.icon;

          // Calculate time between this step and the previous
          const prevTimestamp = index > 0 ? steps[index - 1]?.timestamp : undefined;
          const timeBetween = step.timestamp && prevTimestamp
            ? getTimeBetween(prevTimestamp, step.timestamp)
            : null;

          return (
            <li key={step.key} className="relative flex gap-3">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[11px] top-[24px] w-0.5 h-[calc(100%-8px)]',
                    isCompleted && (nextStep?.timestamp || terminalEvent)
                      ? step.bgColor + '/40'
                      : 'bg-muted-foreground/15 border-l border-dashed border-muted-foreground/20 w-0',
                  )}
                  style={!isCompleted || (!nextStep?.timestamp && !terminalEvent) ? { borderLeftWidth: '1px', marginLeft: '0.5px' } : {}}
                />
              )}

              {/* Dot */}
              <div className={cn(
                'relative z-10 flex items-center justify-center h-6 w-6 rounded-full shrink-0 mt-0.5',
                isCompleted ? step.bgColor : 'bg-muted',
              )}>
                <Icon className={cn('h-3 w-3', isCompleted ? 'text-white' : 'text-muted-foreground/40')} />
              </div>

              {/* Content */}
              <div className="pb-5 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground/40',
                )}>
                  {step.label}
                </p>
                {isCompleted && step.timestamp && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-muted-foreground cursor-default">
                        {formatRelative(step.timestamp)}
                        {timeBetween && (
                          <span className="text-muted-foreground/60 ml-2">
                            (+{timeBetween})
                          </span>
                        )}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{formatFullDate(step.timestamp)}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </li>
          );
        })}

        {/* Terminal event */}
        {terminalEvent && (
          <li className="relative flex gap-3">
            <div className={cn(
              'relative z-10 flex items-center justify-center h-6 w-6 rounded-full shrink-0 mt-0.5',
              terminalEvent.bgColor,
            )}>
              <terminalEvent.icon className="h-3 w-3 text-white" />
            </div>
            <div className="pb-1 min-w-0">
              <p className={cn('text-sm font-medium', terminalEvent.color)}>
                {terminalEvent.label}
              </p>
            </div>
          </li>
        )}
      </ol>
    </TooltipProvider>
  );
}
