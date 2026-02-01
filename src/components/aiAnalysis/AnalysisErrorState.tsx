import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AnalysisErrorStateProps {
  errorMessage?: string;
  onRetry?: () => void;
}

export function AnalysisErrorState({
  errorMessage,
  onRetry,
}: AnalysisErrorStateProps) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
        <AlertTriangle className="w-8 h-8 text-destructive/60" />
        <p className="text-sm text-muted-foreground text-center">
          {errorMessage || 'Não foi possível gerar a análise por IA.'}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
