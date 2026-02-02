/**
 * TestNavigation Component
 * PRD-047: Teste Geral do Candidato
 *
 * Botões de navegação: Anterior, Próxima, Pausar, Finalizar
 */

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface TestNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  hasCurrentAnswer: boolean;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPause: () => void;
  onFinish: () => void;
  className?: string;
}

export function TestNavigation({
  currentIndex,
  totalQuestions,
  answeredCount,
  hasCurrentAnswer,
  isFirstQuestion,
  isLastQuestion,
  onPrevious,
  onNext,
  onPause,
  onFinish,
  className,
}: TestNavigationProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const canFinish = answeredCount >= Math.floor(totalQuestions * 0.8); // Mínimo 80%

  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {/* Botão Pausar - mobile friendly */}
      <div className="order-2 sm:order-1">
        <Button
          variant="outline"
          onClick={onPause}
          className="w-full sm:w-auto"
        >
          <Pause className="w-4 h-4 mr-2" />
          Pausar
        </Button>
      </div>

      {/* Navegação principal */}
      <div className="flex gap-2 flex-1 justify-center order-1 sm:order-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="flex-1 sm:flex-none"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Anterior
        </Button>

        {isLastQuestion ? (
          <FinishButton
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            unansweredCount={unansweredCount}
            canFinish={canFinish}
            onFinish={onFinish}
          />
        ) : (
          <Button
            onClick={onNext}
            disabled={!hasCurrentAnswer}
            className={cn(
              'flex-1 sm:flex-none',
              hasCurrentAnswer && 'gradient-primary'
            )}
          >
            Próxima
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        )}
      </div>

      {/* Contador - apenas desktop */}
      <div className="hidden sm:flex items-center text-sm text-muted-foreground order-3">
        {answeredCount}/{totalQuestions} respondidas
      </div>
    </div>
  );
}

interface FinishButtonProps {
  answeredCount: number;
  totalQuestions: number;
  unansweredCount: number;
  canFinish: boolean;
  onFinish: () => void;
}

function FinishButton({
  answeredCount,
  totalQuestions,
  unansweredCount,
  canFinish,
  onFinish,
}: FinishButtonProps) {
  // Se todas foram respondidas, finaliza direto
  if (unansweredCount === 0) {
    return (
      <Button onClick={onFinish} className="flex-1 sm:flex-none gradient-primary">
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Finalizar
      </Button>
    );
  }

  // Se tem perguntas não respondidas, mostra confirmação
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={!canFinish}
          className={cn('flex-1 sm:flex-none', canFinish && 'gradient-primary')}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Finalizar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Confirmar Finalização
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você respondeu <strong>{answeredCount}</strong> de{' '}
              <strong>{totalQuestions}</strong> perguntas.
            </p>
            {unansweredCount > 0 && (
              <p className="text-warning">
                Ainda há <strong>{unansweredCount}</strong> pergunta(s) sem
                resposta. Perguntas não respondidas serão consideradas neutras.
              </p>
            )}
            <p>Deseja finalizar mesmo assim?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onFinish}>
            Finalizar Teste
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Navegação compacta para questões (dots)
 */
interface QuestionDotsProps {
  currentIndex: number;
  totalQuestions: number;
  answeredQuestions: Set<number>;
  onGoTo: (index: number) => void;
  className?: string;
}

export function QuestionDots({
  currentIndex,
  totalQuestions,
  answeredQuestions,
  onGoTo,
  className,
}: QuestionDotsProps) {
  // Mostrar no máximo 10 dots, com indicadores de range
  const maxDots = 10;
  const showAll = totalQuestions <= maxDots;

  if (showAll) {
    return (
      <div className={cn('flex items-center justify-center gap-1', className)}>
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <button
            key={index}
            onClick={() => onGoTo(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex
                ? 'w-4 bg-primary'
                : answeredQuestions.has(index)
                ? 'bg-success'
                : 'bg-muted hover:bg-muted-foreground/50'
            )}
            aria-label={`Ir para pergunta ${index + 1}`}
          />
        ))}
      </div>
    );
  }

  // Versão condensada com range
  const rangeStart = Math.max(0, currentIndex - 4);
  const rangeEnd = Math.min(totalQuestions, rangeStart + maxDots);

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {rangeStart > 0 && (
        <span className="text-xs text-muted-foreground mr-1">...</span>
      )}
      {Array.from({ length: rangeEnd - rangeStart }).map((_, i) => {
        const index = rangeStart + i;
        return (
          <button
            key={index}
            onClick={() => onGoTo(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex
                ? 'w-4 bg-primary'
                : answeredQuestions.has(index)
                ? 'bg-success'
                : 'bg-muted hover:bg-muted-foreground/50'
            )}
            aria-label={`Ir para pergunta ${index + 1}`}
          />
        );
      })}
      {rangeEnd < totalQuestions && (
        <span className="text-xs text-muted-foreground ml-1">...</span>
      )}
    </div>
  );
}
