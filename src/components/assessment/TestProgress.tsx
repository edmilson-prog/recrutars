/**
 * TestProgress Component
 * PRD-047: Teste Geral do Candidato
 *
 * Barra de progresso com indicadores visuais
 */

import { Clock, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TestProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  elapsedSeconds: number;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TestProgress({
  currentQuestion,
  totalQuestions,
  answeredCount,
  elapsedSeconds,
  className,
}: TestProgressProps) {
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className={cn('bg-card rounded-2xl p-4 shadow-soft', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Pergunta {currentQuestion + 1} de {totalQuestions}
          </span>
          <span className="text-xs text-muted-foreground">
            ({answeredCount} respondidas)
          </span>
        </div>

        {/* Timer informativo (não limitador) */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-sm font-medium text-foreground">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-2" />

      {/* Mini indicators */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle2 className="w-3 h-3" />
          {Math.round(progress)}% concluído
        </div>
        <div className="text-xs text-muted-foreground">
          {totalQuestions - answeredCount} restantes
        </div>
      </div>
    </div>
  );
}

/**
 * Versão compacta para mobile
 */
export function TestProgressCompact({
  currentQuestion,
  totalQuestions,
  answeredCount,
  className,
}: Omit<TestProgressProps, 'elapsedSeconds'>) {
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {currentQuestion + 1}/{totalQuestions}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
