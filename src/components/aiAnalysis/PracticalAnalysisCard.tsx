import { Sparkles, Bot } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { AnalysisLoadingState } from './AnalysisLoadingState';
import { AnalysisErrorState } from './AnalysisErrorState';
import { renderAnalysisContent } from '@/lib/renderAnalysisContent';

interface PracticalAnalysisCardProps {
  candidateId: string;
  candidateName?: string;
  jobTitle?: string;
}

export function PracticalAnalysisCard({
  candidateId,
  candidateName,
  jobTitle,
}: PracticalAnalysisCardProps) {
  const { practicalAnalysis, isGenerating, error, agentEnabled } =
    useAIAnalysis({
      candidateId,
      candidateName,
      jobTitle,
    });

  if (!agentEnabled) return null;

  if (isGenerating) {
    return <AnalysisLoadingState type="practical" />;
  }

  if (error && !practicalAnalysis) {
    return <AnalysisErrorState errorMessage={error} />;
  }

  if (!practicalAnalysis || practicalAnalysis.status === 'error') {
    if (practicalAnalysis?.errorMessage) {
      return <AnalysisErrorState errorMessage={practicalAnalysis.errorMessage} />;
    }
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-primary" />
            Análise Inteligente
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
          {renderAnalysisContent(practicalAnalysis.content)}
        </div>
        <Separator className="my-3" />
        <p className="text-[11px] text-muted-foreground/50">
          Modelo: {practicalAnalysis.modelUsed} | Gerado em{' '}
          {new Date(practicalAnalysis.createdAt).toLocaleDateString('pt-BR')}{' '}
          {new Date(practicalAnalysis.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </CardContent>
    </Card>
  );
}
