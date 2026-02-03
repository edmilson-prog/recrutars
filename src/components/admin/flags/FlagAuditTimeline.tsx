/**
 * FlagAuditTimeline Component
 * PRD-062: Feature Flags "Switch"
 *
 * Vertical timeline of audit entries for a single flag.
 */

import {
  PlusCircle,
  ToggleLeft,
  Skull,
  ShieldOff,
  Edit2,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FeatureFlagAudit, FlagAuditAction } from '@/types';

interface FlagAuditTimelineProps {
  audits: FeatureFlagAudit[];
}

const actionConfig: Record<FlagAuditAction, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  created: {
    label: 'Criada',
    icon: PlusCircle,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  updated: {
    label: 'Atualizada',
    icon: Edit2,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  toggled: {
    label: 'Alternada',
    icon: ToggleLeft,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  killed: {
    label: 'Kill Switch',
    icon: Skull,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  unkilled: {
    label: 'Reativada',
    icon: ShieldOff,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  override_added: {
    label: 'Override +',
    icon: UserPlus,
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  override_removed: {
    label: 'Override -',
    icon: UserMinus,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FlagAuditTimeline({ audits }: FlagAuditTimelineProps) {
  if (audits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Nenhum registro de auditoria encontrado.
      </p>
    );
  }

  const sorted = [...audits].sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  );

  return (
    <div className="relative pl-8 space-y-0">
      {/* Vertical timeline line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

      {sorted.map((audit, index) => {
        const config = actionConfig[audit.action];
        const Icon = config.icon;

        return (
          <div key={audit.id} className="relative pb-6 last:pb-0">
            {/* Timeline dot */}
            <div className="absolute left-[-22px] mt-1 w-5 h-5 rounded-full bg-background border-2 border-border flex items-center justify-center">
              <Icon className="w-3 h-3 text-muted-foreground" />
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn('text-[10px] px-2 py-0 font-medium', config.className)}
                >
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(audit.performedAt)}
                </span>
              </div>

              <p className="text-sm text-foreground">{audit.details}</p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Por: <span className="font-medium">{audit.performedByName}</span></span>
                {audit.oldValue && audit.newValue && (
                  <span className="text-muted-foreground/60">
                    {audit.oldValue} &rarr; {audit.newValue}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
