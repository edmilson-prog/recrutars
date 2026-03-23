/**
 * Invitation Status Badge
 * Badge colorido com ícone para cada status do ciclo de vida do convite
 */

import { Badge } from '@/components/ui/badge';
import { Send, Eye, Play, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import type { InvitationStatus } from '@/types/companyTest';

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
  showIcon?: boolean;
}

const statusConfig: Record<InvitationStatus, {
  label: string;
  icon: typeof Send;
  className: string;
}> = {
  sent: {
    label: 'Enviado',
    icon: Send,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  viewed: {
    label: 'Acessado',
    icon: Eye,
    className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  started: {
    label: 'Em andamento',
    icon: Play,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  expired: {
    label: 'Expirado',
    icon: Clock,
    className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  abandoned: {
    label: 'Abandonado',
    icon: AlertTriangle,
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

export function InvitationStatusBadge({ status, showIcon = true }: InvitationStatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={config.className}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

export { statusConfig as invitationStatusConfig };
