/**
 * AIMatchTab — Orquestrador da experiência:
 *  - loading inicial (busca cache + cota em paralelo)
 *  - empty state (sem análise + cota disponível)
 *  - exhausted state (sem análise + cota=0)
 *  - content (análise existe → header + content)
 *  - regenerar abre RegenerateConfirmDialog
 *  - impersonation: cota não é consultada, geração/regeneração ficam ocultas
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAIMatchAnalysis, useAIMatchQuotaStatus, useGenerateAIMatch } from '@/hooks/useAIMatchQuery';
import type { Candidate } from '@/types/candidate';
import type { Job } from '@/types/job';
import type { MatchResult } from '@/types/disc';
import type { GaugeProResult } from '@/types/gaugePro';
import { AIMatchEmptyState } from './AIMatchEmptyState';
import { AIMatchExhaustedState } from './AIMatchExhaustedState';
import { AIMatchHeader } from './AIMatchHeader';
import { AIMatchContent } from './AIMatchContent';
import { AIMatchImpersonationNotice } from './AIMatchImpersonationNotice';
import { RegenerateConfirmDialog } from './RegenerateConfirmDialog';
import { Loader2, Sparkles } from 'lucide-react';

interface AIMatchTabProps {
  candidate: Candidate;
  job: Job;
  matchResult: MatchResult;
  gaugeProResult?: GaugeProResult | null;
  behavioralAnalysisExisting?: string | null;
}

export function AIMatchTab({ candidate, job, matchResult, gaugeProResult, behavioralAnalysisExisting }: AIMatchTabProps) {
  const { isImpersonationActive } = useAuth();
  const analysisQ = useAIMatchAnalysis(candidate.id, job.id);
  const quotaQ = useAIMatchQuotaStatus({ enabled: !isImpersonationActive });
  const generate = useGenerateAIMatch();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const runGeneration = async () => {
    try {
      await generate.mutateAsync({ candidate, job, matchResult, gaugeProResult, behavioralAnalysisExisting });
      toast.success('Análise IA gerada com sucesso');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar análise';
      if (msg === 'quota_exhausted') {
        toast.error('Cota de análises IA esgotada este mês');
      } else {
        toast.error(`Erro ao gerar análise: ${msg}`);
      }
    }
  };

  if (analysisQ.isLoading || (!isImpersonationActive && quotaQ.isLoading)) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando…
      </div>
    );
  }

  const analysis = analysisQ.data;
  const quota = quotaQ.data;

  if (isImpersonationActive) {
    return (
      <>
        <AIMatchImpersonationNotice />
        {analysis ? (
          <>
            <AIMatchHeader
              analysis={analysis}
              quota={undefined}
              isRegenerating={false}
              onRegenerate={() => undefined}
              viewOnly
            />
            <AIMatchContent analysis={analysis} />
          </>
        ) : (
          <div className="rounded-lg border border-muted-foreground/20 bg-muted/20 p-6 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5" aria-hidden />
              <h3 className="text-base font-semibold text-foreground">Sem análise IA gerada</h3>
            </div>
            <p>Esta empresa ainda não gerou uma análise de IA para este candidato nesta vaga.</p>
          </div>
        )}
      </>
    );
  }

  if (analysis) {
    return (
      <>
        <AIMatchHeader
          analysis={analysis}
          quota={quota}
          isRegenerating={generate.isPending}
          onRegenerate={() => setConfirmOpen(true)}
        />
        <AIMatchContent analysis={analysis} />
        <RegenerateConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          quota={quota}
          onConfirm={runGeneration}
        />
      </>
    );
  }

  if (quota && !quota.unlimited && quota.remaining === 0) {
    return <AIMatchExhaustedState quota={quota} />;
  }

  return (
    <AIMatchEmptyState
      quota={quota}
      isGenerating={generate.isPending}
      onGenerate={runGeneration}
    />
  );
}
