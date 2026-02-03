/**
 * EvaluationChain Component
 * PRD-062: Feature Flags "Switch"
 *
 * Visual vertical chain showing each evaluation step.
 */

import { CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EvaluationResult } from '@/types';

interface EvaluationChainProps {
  result: EvaluationResult;
}

export function EvaluationChain({ result }: EvaluationChainProps) {
  const { enabled, reason, chain } = result;

  return (
    <div className="space-y-1">
      {/* Chain steps */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />

        {chain.map((step, index) => {
          const isLast = index === chain.length - 1;
          return (
            <div key={index} className="relative flex items-start gap-3 py-2">
              {/* Step icon */}
              <div className="absolute left-[-24px] mt-0.5">
                {step.result ? (
                  <CheckCircle className="w-5 h-5 text-green-500 bg-background rounded-full" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 bg-background rounded-full" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{step.step}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0',
                      step.result
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    )}
                  >
                    {step.result ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 break-words">{step.detail}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  Verificado: {step.checked}
                </p>
              </div>

              {/* Connector arrow */}
              {!isLast && (
                <ChevronDown className="absolute left-[-19px] bottom-[-6px] w-3 h-3 text-muted-foreground/50" />
              )}
            </div>
          );
        })}
      </div>

      {/* Final result */}
      <div className={cn(
        'mt-3 p-3 rounded-lg border-2',
        enabled
          ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
          : 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
      )}>
        <div className="flex items-center gap-2">
          {enabled ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-semibold text-sm">
            Resultado: {enabled ? 'Habilitada' : 'Desabilitada'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{reason}</p>
      </div>
    </div>
  );
}
