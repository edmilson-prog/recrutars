/**
 * TrialBanner Component
 * PRD-074: Informational banner for medium urgency (8-15 days remaining).
 *
 * Shows a dismissable banner above page content with a CTA
 * linking to the plans page.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TrialBannerProps {
  daysRemaining: number;
  dismissable?: boolean;
  className?: string;
}

export function TrialBanner({
  daysRemaining,
  dismissable = true,
  className,
}: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 rounded-lg',
        'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800',
        'text-blue-800 dark:text-blue-200',
        className,
      )}
      role="alert"
    >
      <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />
      <p className="flex-1 text-sm">
        Seu periodo gratuito termina em{' '}
        <strong>{daysRemaining} dias</strong>.{' '}
        Conheca nossos planos.
      </p>
      <Link to="/planos">
        <Button size="sm" variant="outline" className="gap-1 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900">
          Ver planos
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
      {dismissable && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          aria-label="Fechar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
