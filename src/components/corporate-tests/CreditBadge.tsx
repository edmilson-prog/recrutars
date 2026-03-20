/**
 * CreditBadge
 * PRD-089: Pill de créditos no header do Hub de Testes
 */

import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompanyCreditBalance } from '@/hooks/useTestPackagesQuery';
import { useAuth } from '@/contexts/AuthContext';

export function CreditBadge() {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const { data: balance } = useCompanyCreditBalance(currentCompany?.id);

  if (balance === undefined) return null;

  const colorClass = balance === 0
    ? 'bg-red-500/15 text-red-500 border-red-500/30 animate-pulse'
    : balance <= 4
      ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
      : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';

  return (
    <button
      onClick={() => navigate('/empresa/pacotes')}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:opacity-80',
        colorClass,
      )}
      aria-label={`${balance} créditos disponíveis. Clique para comprar mais.`}
    >
      <CreditCard className="h-3.5 w-3.5" />
      {balance} {balance === 1 ? 'crédito' : 'créditos'}
    </button>
  );
}
