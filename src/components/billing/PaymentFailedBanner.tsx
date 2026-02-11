/**
 * PaymentFailedBanner Component
 * PRD-076: Shows a warning banner when subscription payment has failed
 */

import { AlertTriangle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/usePlansQuery';
import type { Subscription } from '@/types';

export function PaymentFailedBanner() {
  const { user } = useAuth();
  const { data: subscription } = useSubscription(user?.id);

  const sub = subscription as (Subscription & Record<string, unknown>) | null;
  const status = (sub?.status ?? sub?.status) as string | undefined;

  if (status !== 'past_due') return null;

  const basePath = user?.type === 'company' ? '/empresa' : '/candidato';

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 px-4 py-2.5">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">
        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
        <p className="text-sm text-red-800 dark:text-red-200 flex-1">
          <strong>Problema com seu pagamento.</strong> Atualize seu metodo de pagamento para manter o acesso.
        </p>
        <Link
          to={`${basePath}/meu-plano`}
          className="flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-300 hover:underline"
        >
          <CreditCard className="w-3 h-3" />
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
