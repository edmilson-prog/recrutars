/**
 * GaugeStatusBadge
 * PRD-055: Badge visual para status do mapeamento Gauge-Pro de um colaborador.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GaugeStatus } from "@/types/teamManagement";

interface GaugeStatusBadgeProps {
  status: GaugeStatus;
  className?: string;
}

const statusConfig: Record<
  GaugeStatus,
  { label: string; dotColor: string; badgeClassName: string; variant?: "destructive" }
> = {
  unmapped: {
    label: "Sem Teste",
    dotColor: "bg-red-500",
    badgeClassName: "",
    variant: "destructive",
  },
  invited: {
    label: "Convite Enviado",
    dotColor: "bg-blue-500",
    badgeClassName:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  in_progress: {
    label: "Em Andamento",
    dotColor: "bg-amber-500",
    badgeClassName:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  mapped: {
    label: "Mapeado",
    dotColor: "bg-green-500",
    badgeClassName:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  retest_pending: {
    label: "Reteste Pendente",
    dotColor: "bg-purple-500",
    badgeClassName:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

export default function GaugeStatusBadge({
  status,
  className,
}: GaugeStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant ?? "secondary"}
      className={cn(
        "inline-flex items-center gap-1.5 border-transparent",
        config.badgeClassName,
        className,
      )}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", config.dotColor)}
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  );
}
