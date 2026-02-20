import { useState } from 'react';
import { Sparkles, Bot, ChevronDown, ChevronUp, Clock, Cpu, Hash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { AnalysisLoadingState } from './AnalysisLoadingState';
import { AnalysisErrorState } from './AnalysisErrorState';
import { renderAnalysisContent } from '@/lib/renderAnalysisContent';
import type { GaugeProResult } from '@/types/gaugePro';

function getProviderLabel(modelUsed: string): string {
  if (modelUsed.startsWith('claude-')) return 'Anthropic';
  if (modelUsed.startsWith('gpt-') || modelUsed.startsWith('o1') || modelUsed.startsWith('o3')) return 'OpenAI';
  return 'OpenRouter';
}

interface PracticalAnalysisCardProps {
  candidateId: string;
  candidateName?: string;
  jobTitle?: string;
  gaugeProResult?: GaugeProResult | null;
}

export function PracticalAnalysisCard({
  candidateId,
  candidateName,
  jobTitle,
  gaugeProResult,
}: PracticalAnalysisCardProps) {
  const [metadataOpen, setMetadataOpen] = useState(false);
  const { practicalAnalysis, isGenerating, isRegenerating, error, canGenerate, generateAnalyses, regenerateAnalysis } =
    useAIAnalysis({
      candidateId,
      candidateName,
      jobTitle,
    });

  if (isGenerating) {
    return <AnalysisLoadingState type="practical" />;
  }

  if (error && !practicalAnalysis) {
    return <AnalysisErrorState errorMessage={error} />;
  }

  // Has data — render card
  if (practicalAnalysis && practicalAnalysis.status !== 'error') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-primary" />
              Análise Inteligente
            </CardTitle>
            <div className="flex items-center gap-2">
              {canGenerate && gaugeProResult && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-6"
                  onClick={() => regenerateAnalysis('practical', gaugeProResult)}
                  disabled={isRegenerating}
                >
                  <Sparkles className="w-3 h-3" />
                  {isRegenerating ? 'Regerando...' : 'Regerar'}
                </Button>
              )}
              <Badge variant="outline" className="gap-1 text-xs font-normal">
                <Bot className="w-3 h-3" />
                Gerado por IA
              </Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="prose prose-sm max-w-none max-h-[400px] overflow-y-auto pr-2">
            {renderAnalysisContent(practicalAnalysis.content)}
          </div>
          <Separator className="my-3" />

          <Collapsible open={metadataOpen} onOpenChange={setMetadataOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-6 text-[11px] text-muted-foreground/50 px-1">
                {metadataOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Metadados da geração
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/50">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {getProviderLabel(practicalAnalysis.modelUsed)} / {practicalAnalysis.modelUsed}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {practicalAnalysis.tokensInput + practicalAnalysis.tokensOutput} tokens
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {(practicalAnalysis.generationTimeMs / 1000).toFixed(1)}s
                </span>
                <span>
                  Gerado em{' '}
                  {new Date(practicalAnalysis.createdAt).toLocaleDateString('pt-BR')}{' '}
                  {new Date(practicalAnalysis.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {practicalAnalysis.regeneratedAt && (
                  <span>
                    Regenerado em{' '}
                    {new Date(practicalAnalysis.regeneratedAt).toLocaleDateString('pt-BR')}{' '}
                    {new Date(practicalAnalysis.regeneratedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  }

  // Error record from DB — show retry if admin can generate, hide for viewers
  if (practicalAnalysis?.status === 'error') {
    if (canGenerate && gaugeProResult) {
      return (
        <AnalysisErrorState
          errorMessage={practicalAnalysis.errorMessage}
          onRetry={() => generateAnalyses(gaugeProResult)}
        />
      );
    }
    return null;
  }

  // No data — show generate button if possible
  if (canGenerate && gaugeProResult) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="w-8 h-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium mb-1">Análise Inteligente</p>
          <p className="text-xs text-muted-foreground mb-4">
            Nenhuma análise gerada para este candidato
          </p>
          <Button
            size="sm"
            onClick={() => generateAnalyses(gaugeProResult)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Análise
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
