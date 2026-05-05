/**
 * AIMatchEmptyState — Card inicial dentro da tab "Análise IA":
 * descrição do que será gerado + botão Gerar + badge de cota.
 */

import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { AIMatchQuotaBadge } from './AIMatchQuotaBadge';
import type { AIMatchQuotaStatus } from '@/types/aiMatch';

interface AIMatchEmptyStateProps {
  quota: AIMatchQuotaStatus | undefined;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function AIMatchEmptyState({ quota, isGenerating, onGenerate }: AIMatchEmptyStateProps) {
  return (
    <div className="rounded-lg border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" aria-hidden />
          <h3 className="text-lg font-semibold">Análise inteligente disponível</h3>
        </div>
        <AIMatchQuotaBadge status={quota} />
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Nossa IA lê o currículo, perfil comportamental e contexto da vaga para gerar um dossiê textual em 5 seções:
      </p>

      <ul className="mb-6 space-y-1.5 text-sm text-muted-foreground">
        <li>📖 <strong>Leitura do candidato</strong> — quem é essa pessoa profissionalmente</li>
        <li>✅ <strong>Por que combina</strong> — evidências concretas de fit</li>
        <li>⚠️ <strong>Pontos de atenção</strong> — riscos e gaps a investigar</li>
        <li>🌱 <strong>Potencial e fit cultural</strong> — onde a pessoa floresce</li>
        <li>💬 <strong>Perguntas sugeridas</strong> — para estruturar a entrevista</li>
      </ul>

      <Button
        onClick={onGenerate}
        disabled={isGenerating || (quota && !quota.unlimited && quota.remaining === 0)}
        size="lg"
        className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando análise…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Análise IA
          </>
        )}
      </Button>

      <p className="mt-3 text-xs text-muted-foreground">
        Ao gerar, 1 análise será descontada da sua cota mensal.
      </p>
    </div>
  );
}
