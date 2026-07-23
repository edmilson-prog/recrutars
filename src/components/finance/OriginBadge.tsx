/**
 * OriginBadge — distingue lançamentos automáticos (assinaturas/Stripe) de
 * lançamentos manuais (avulsos). Reutilizável em tabela, cards e gráficos.
 *
 * O variant 'manual' usa tint neutro (slate), não cyan: cyan é reservado a
 * interação (spec, seção 9), não a dado.
 */

import { Zap, PenLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OriginBadgeProps {
  variant: 'auto' | 'manual';
  className?: string;
}

const META = {
  auto: {
    label: 'Assinaturas',
    icon: Zap,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  manual: {
    label: 'Avulsos',
    icon: PenLine,
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300',
  },
} as const;

export function OriginBadge({ variant, className }: OriginBadgeProps) {
  const meta = META[variant];
  const Icon = meta.icon;
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 border-0 text-xs font-medium', meta.className, className)}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}
