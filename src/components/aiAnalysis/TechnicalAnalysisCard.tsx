import { useState } from 'react';
import { Sparkles, Bot, RefreshCw, ChevronDown, ChevronUp, Clock, Cpu, Hash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { AnalysisLoadingState } from './AnalysisLoadingState';
import { AnalysisErrorState } from './AnalysisErrorState';
import type { GaugeProResult } from '@/types/gaugePro';

interface TechnicalAnalysisCardProps {
  candidateId: string;
  candidateName?: string;
  gaugeProResult?: GaugeProResult | null;
  showRegenerate?: boolean;
}

function renderAnalysisContent(content: string) {
  const lines = content.split('\n');

  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^#+\s*/, '');
      return (
        <h4 key={i} className="font-semibold text-sm mt-4 mb-1">
          {text}
        </h4>
      );
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s*\*\*(.*?)\*\*(.*)/);
    if (numberedMatch) {
      return (
        <h4 key={i} className="font-semibold text-sm mt-4 mb-1">
          {numberedMatch[1]}. {numberedMatch[2]}
          {numberedMatch[3] && (
            <span className="font-normal text-muted-foreground">
              {numberedMatch[3]}
            </span>
          )}
        </h4>
      );
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('✅') || trimmed.startsWith('⚠️') || trimmed.startsWith('🔴')) {
      const text = trimmed.replace(/^[-*]\s*/, '');
      return (
        <li key={i} className="text-sm text-muted-foreground ml-4 mb-1 list-none">
          {text}
        </li>
      );
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) return null;
      return (
        <div key={i} className="flex gap-4 text-xs text-muted-foreground py-0.5">
          {cells.map((cell, j) => (
            <span key={j} className="flex-1">
              {cell}
            </span>
          ))}
        </div>
      );
    }

    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return (
        <p key={i} className="text-sm font-medium mt-2">
          {trimmed.replace(/\*\*/g, '')}
        </p>
      );
    }

    return (
      <p key={i} className="text-sm text-muted-foreground mb-1">
        {trimmed}
      </p>
    );
  });
}

export function TechnicalAnalysisCard({
  candidateId,
  candidateName,
  gaugeProResult,
  showRegenerate = false,
}: TechnicalAnalysisCardProps) {
  const [metadataOpen, setMetadataOpen] = useState(false);
  const { technicalAnalysis, isGenerating, isRegenerating, error, agentEnabled, regenerateAnalysis } =
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

  const handleRegenerate = () => {
    if (gaugeProResult) {
      regenerateAnalysis('technical', gaugeProResult);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-primary" />
            Análise Técnica IA
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <Bot className="w-3 h-3" />
              Gerado por IA
            </Badge>
            {showRegenerate && gaugeProResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="gap-1 h-7 text-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Regenerando...' : 'Regenerar'}
              </Button>
            )}
          </div>
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
