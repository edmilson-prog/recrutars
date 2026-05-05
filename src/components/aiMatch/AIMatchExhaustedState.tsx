/**
 * AIMatchExhaustedState — Estado quando cota mensal está em 0.
 * Botão disabled + tooltip explicativo + CTA pra upgrade.
 */

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AIMatchQuotaBadge } from './AIMatchQuotaBadge';
import type { AIMatchQuotaStatus } from '@/types/aiMatch';

interface AIMatchExhaustedStateProps {
  quota: AIMatchQuotaStatus;
}

export function AIMatchExhaustedState({ quota }: AIMatchExhaustedStateProps) {
  return (
    <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
          <h3 className="text-lg font-semibold">Cota de análises IA esgotada</h3>
        </div>
        <AIMatchQuotaBadge status={quota} />
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Você utilizou todas as {quota.total} análises IA disponíveis este mês.
        Análises já geradas continuam disponíveis para consulta. A cota é renovada no dia 1º de cada mês.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button disabled size="lg" variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Análise IA
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Cota mensal esgotada. Faça upgrade para mais análises.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button asChild>
          <Link to="/empresa/meu-plano">Fazer upgrade do plano</Link>
        </Button>
      </div>
    </div>
  );
}
