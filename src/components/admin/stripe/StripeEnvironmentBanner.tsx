import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StripeEnvironment } from '@/types/plans';

interface StripeEnvironmentBannerProps {
  environment: StripeEnvironment;
  onSwitchToProduction?: () => void;
  className?: string;
}

export function StripeEnvironmentBanner({
  environment,
  onSwitchToProduction,
  className,
}: StripeEnvironmentBannerProps) {
  if (environment !== 'test') return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-lg border border-l-4 border-amber-500/45 border-l-amber-500',
        'bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="flex-1">
        <strong className="font-semibold">Ambiente de teste (sandbox) do Stripe.</strong>{' '}
        As ações aqui não afetam cobranças reais — use para validar antes de publicar.
      </p>
      {onSwitchToProduction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSwitchToProduction}
          className="flex-shrink-0 border-amber-500/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
        >
          Voltar para Produção
        </Button>
      )}
    </div>
  );
}
