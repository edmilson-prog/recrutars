/**
 * AIMatchHeader — Cabeçalho do dossiê preenchido:
 * metadata (modelo, tokens, gerado em) + botão Regenerar.
 */

import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AIMatchQuotaBadge } from './AIMatchQuotaBadge';
import type { AIMatchAnalysis, AIMatchQuotaStatus } from '@/types/aiMatch';

interface AIMatchHeaderProps {
  analysis: AIMatchAnalysis;
  quota: AIMatchQuotaStatus | undefined;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

export function AIMatchHeader({ analysis, quota, isRegenerating, onRegenerate }: AIMatchHeaderProps) {
  const canRegenerate = quota?.unlimited || (quota && quota.remaining > 0);
  const generatedAt = format(new Date(analysis.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-muted/30 p-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" aria-hidden />
          <span className="text-sm font-medium">Análise gerada por IA</span>
          <AIMatchQuotaBadge status={quota} />
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Modelo: <code className="font-mono">{analysis.modelUsed ?? 'desconhecido'}</code></span>
          <span>Tokens: {analysis.tokensInput ?? 0}↓ / {analysis.tokensOutput ?? 0}↑</span>
          <span>Tempo: {analysis.generationTimeMs ? `${(analysis.generationTimeMs / 1000).toFixed(1)}s` : '?'}</span>
          <span>Gerada em {generatedAt}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        disabled={!canRegenerate || isRegenerating}
        title={canRegenerate ? 'Regenerar consumirá 1 cota' : 'Cota esgotada'}
      >
        <RefreshCw className={isRegenerating ? 'mr-2 h-3.5 w-3.5 animate-spin' : 'mr-2 h-3.5 w-3.5'} />
        Regenerar
      </Button>
    </div>
  );
}
