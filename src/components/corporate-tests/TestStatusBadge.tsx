/**
 * Test Status Badge
 * PRD-052: Badge colorido por status
 */

import { Badge } from '@/components/ui/badge';
import type { CompanyTestStatus } from '@/types/companyTest';

interface TestStatusBadgeProps {
  status: CompanyTestStatus;
}

const statusConfig: Record<CompanyTestStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; className: string }> = {
  draft: { label: 'Rascunho', variant: 'secondary', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  active: { label: 'Ativo', variant: 'default', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  closed: { label: 'Encerrado', variant: 'outline', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  archived: { label: 'Arquivado', variant: 'outline', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

export function TestStatusBadge({ status }: TestStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
