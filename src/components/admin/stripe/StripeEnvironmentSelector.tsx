import { Check, ChevronDown, FlaskConical, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { StripeEnvironment } from '@/types/plans';

interface StripeEnvironmentSelectorProps {
  value: StripeEnvironment;
  onChange: (env: StripeEnvironment) => void;
  className?: string;
}

const OPTIONS: { value: StripeEnvironment; label: string; description: string }[] = [
  { value: 'live', label: 'Produção', description: 'Cobranças reais. É onde os clientes compram.' },
  { value: 'test', label: 'Teste (sandbox)', description: 'Valida pacotes sem cobrar de verdade.' },
];

export function StripeEnvironmentSelector({
  value,
  onChange,
  className,
}: StripeEnvironmentSelectorProps) {
  const isTest = value === 'test';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Ambiente Stripe
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Ambiente Stripe: ${isTest ? 'Teste (sandbox)' : 'Produção'}. Clique para alterar.`}
          className={cn(
            'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isTest
              ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : 'border-success/40 bg-success/10 text-success'
          )}
        >
          {isTest ? <FlaskConical className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
          {isTest ? 'Teste (sandbox)' : 'Produção'}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="flex items-start gap-2 py-2"
            >
              <Check
                className={cn(
                  'mt-0.5 h-4 w-4 flex-shrink-0',
                  value === opt.value ? 'opacity-100' : 'opacity-0'
                )}
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
