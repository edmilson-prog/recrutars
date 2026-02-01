import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalysisLoadingStateProps {
  type: 'practical' | 'technical';
}

export function AnalysisLoadingState({ type }: AnalysisLoadingStateProps) {
  const label =
    type === 'practical'
      ? 'Gerando análise prática...'
      : 'Gerando análise técnica...';

  return (
    <Card className="border-dashed border-primary/30">
      <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="relative">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <Loader2 className="w-4 h-4 text-primary/60 animate-spin absolute -bottom-1 -right-1" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/60">
          Isso pode levar alguns segundos
        </p>
      </CardContent>
    </Card>
  );
}
