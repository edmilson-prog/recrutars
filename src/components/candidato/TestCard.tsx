/**
 * TestCard — Card individual de teste no hub "Meus Testes"
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Building2, CheckCircle2, Clock, Loader2, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UnifiedTest } from '@/hooks/useUnifiedTests';

interface TestCardProps {
  test: UnifiedTest;
  index: number;
}

const statusConfig = {
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  in_progress: {
    label: 'Em Andamento',
    icon: Loader2,
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  expired: {
    label: 'Expirado',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
} as const;

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function TestCard({ test, index }: TestCardProps) {
  const navigate = useNavigate();
  const isVoluntary = test.origin === 'voluntary';
  const statusCfg = statusConfig[test.status];
  const StatusIcon = statusCfg.icon;

  const borderColor = isVoluntary ? 'border-l-cyan-500' : 'border-l-amber-500';
  const iconBg = isVoluntary ? 'bg-cyan-500/10' : 'bg-amber-500/10';
  const iconColor = isVoluntary ? 'text-cyan-400' : 'text-amber-400';

  const dateLabel = test.completedAt
    ? `Concluído em ${formatDate(test.completedAt)}`
    : test.sentAt
      ? `Enviado em ${formatDate(test.sentAt)}`
      : '';

  const actionLabel =
    test.status === 'completed'
      ? 'Ver Resultado'
      : test.status === 'in_progress'
        ? 'Continuar'
        : test.status === 'pending'
          ? 'Iniciar'
          : 'Expirado';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn(
        'bg-card rounded-xl shadow-soft border-l-4 p-5 flex flex-col md:flex-row md:items-center gap-4',
        borderColor
      )}
    >
      {/* Icon */}
      <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
        {isVoluntary ? (
          <Brain className={cn('w-5 h-5', iconColor)} />
        ) : (
          <Building2 className={cn('w-5 h-5', iconColor)} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-foreground">{test.testName}</h3>
          <Badge variant="outline" className={cn('text-xs', isVoluntary ? 'border-cyan-500/30 text-cyan-400' : 'border-amber-500/30 text-amber-400')}>
            {isVoluntary ? 'Voluntário' : test.companyName || 'Solicitado'}
          </Badge>
        </div>

        {dateLabel && (
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        )}

        {test.jobTitle && (
          <p className="text-sm text-muted-foreground">Vaga: {test.jobTitle}</p>
        )}

        {/* Result summary — mini dimension bars */}
        {test.status === 'completed' && test.resultSummary && (
          <div className="mt-2 space-y-1">
            {test.resultSummary.archetype && (
              <p className="text-sm font-medium text-foreground/80">
                {test.resultSummary.archetype}
              </p>
            )}
            {test.resultSummary.profile && (
              <p className="text-sm font-medium text-foreground/80">
                Perfil: {test.resultSummary.profile}
              </p>
            )}
            {test.resultSummary.dimensions && (
              <div className="flex items-center gap-3 flex-wrap">
                {test.resultSummary.dimensions.map((dim) => (
                  <div key={dim.label} className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground w-[4.5rem] truncate">
                      {dim.label}
                    </span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${dim.value}%`, backgroundColor: dim.color }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {dim.value}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status + Action */}
      <div className="flex items-center gap-3 flex-shrink-0 md:flex-col md:items-end">
        <Badge variant="outline" className={cn('gap-1', statusCfg.className)}>
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </Badge>

        <Button
          variant={test.status === 'completed' ? 'outline' : 'default'}
          size="sm"
          disabled={test.status === 'expired'}
          onClick={() => navigate(test.actionUrl)}
          className={cn(
            test.status !== 'completed' && test.status !== 'expired' && 'gradient-primary'
          )}
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
