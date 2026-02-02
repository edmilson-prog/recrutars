import { Sparkles, Bot } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { AnalysisLoadingState } from './AnalysisLoadingState';
import { AnalysisErrorState } from './AnalysisErrorState';

interface PracticalAnalysisCardProps {
  candidateId: string;
  candidateName?: string;
  jobTitle?: string;
}

function renderAnalysisContent(content: string) {
  const lines = content.split('\n');

  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    // Headers (## or bold **text**)
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^#+\s*/, '');
      return (
        <h4 key={i} className="font-semibold text-sm mt-4 mb-1">
          {text}
        </h4>
      );
    }

    // Numbered sections (1. 2. etc)
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

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('✅') || trimmed.startsWith('⚠️')) {
      const text = trimmed.replace(/^[-*]\s*/, '');
      return (
        <li key={i} className="text-sm text-muted-foreground ml-4 mb-1 list-none">
          {text}
        </li>
      );
    }

    // Bold text
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return (
        <p key={i} className="text-sm font-medium mt-2">
          {trimmed.replace(/\*\*/g, '')}
        </p>
      );
    }

    // Regular paragraph
    return (
      <p key={i} className="text-sm text-muted-foreground mb-1">
        {trimmed}
      </p>
    );
  });
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
