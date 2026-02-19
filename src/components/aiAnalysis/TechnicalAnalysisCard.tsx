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
interface TechnicalAnalysisCardProps {
  candidateId: string;
  candidateName?: string;
}

export function TechnicalAnalysisCard({
  candidateId,
  candidateName,
}: TechnicalAnalysisCardProps) {
  const [metadataOpen, setMetadataOpen] = useState(false);
  const { technicalAnalysis, isGenerating, error, agentEnabled } =
    useAIAnalysis({
      candidateId,
      candidateName,
    });

  if (!agentEnabled) return null;

  if (isGenerating) {
    return <AnalysisLoadingState type="technical" />;
  }

  if (error && !technicalAnalysis) {
    return <AnalysisErrorState errorMessage={error} />;
  }

  if (!technicalAnalysis || technicalAnalysis.status === 'error') {
    if (technicalAnalysis?.errorMessage) {
      return <AnalysisErrorState errorMessage={technicalAnalysis.errorMessage} />;
    }
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-primary" />
            Análise Técnica IA
          </CardTitle>
          <Badge variant="outline" className="gap-1 text-xs font-normal">
            <Bot className="w-3 h-3" />
            Gerado por IA
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="prose prose-sm max-w-none">
          {renderAnalysisContent(technicalAnalysis.content)}
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
                {technicalAnalysis.modelUsed}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {technicalAnalysis.tokensInput + technicalAnalysis.tokensOutput} tokens
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(technicalAnalysis.generationTimeMs / 1000).toFixed(1)}s
              </span>
              <span>
                Gerado em{' '}
                {new Date(technicalAnalysis.createdAt).toLocaleDateString('pt-BR')}{' '}
                {new Date(technicalAnalysis.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {technicalAnalysis.regeneratedAt && (
                <span>
                  Regenerado em{' '}
                  {new Date(technicalAnalysis.regeneratedAt).toLocaleDateString('pt-BR')}{' '}
                  {new Date(technicalAnalysis.regeneratedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
