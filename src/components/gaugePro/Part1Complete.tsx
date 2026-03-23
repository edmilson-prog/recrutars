import { CheckCircle, ArrowRight, Brain, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

interface Part1CompleteProps {
  onContinue: () => void;
}

export function Part1Complete({ onContinue }: Part1CompleteProps) {
  const totalWords = GAUGE_PRO_CONFIG.part1.selectionsPerList * GAUGE_PRO_CONFIG.part1.totalSteps;

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-8">
      {/* Progress bar — halfway done */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso geral</span>
          <span className="font-medium">50%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-test-complete-border to-test-self-icon transition-all duration-1000 ease-out"
            style={{ width: '50%' }}
          />
        </div>
        <p className="text-xs text-muted-foreground">Parte 1 de 2 concluída</p>
      </div>

      {/* Success icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-test-complete-bg to-test-complete-bg border border-test-complete-border/50">
        <CheckCircle className="w-10 h-10 text-test-complete-border" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-test-complete-text">Parte 1 Concluída!</h2>
        <p className="text-muted-foreground">
          Suas seleções de palavras foram registradas com sucesso.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <Brain className="w-5 h-5 text-test-self-icon mx-auto" />
          <p className="text-2xl font-bold text-foreground">5</p>
          <p className="text-xs text-muted-foreground">dimensões avaliadas</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <Sparkles className="w-5 h-5 text-test-self-icon mx-auto" />
          <p className="text-2xl font-bold text-foreground">{totalWords}</p>
          <p className="text-xs text-muted-foreground">palavras selecionadas</p>
        </div>
      </div>

      {/* Next up preview */}
      <div className="rounded-xl border bg-muted/30 p-4 flex items-center gap-3 text-left">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">A seguir: Cenários Situacionais</p>
          <p className="text-xs text-muted-foreground">
            {GAUGE_PRO_CONFIG.part2.totalScenarios} situações profissionais com 4 alternativas cada.
          </p>
        </div>
      </div>

      {/* CTA */}
      <Button onClick={onContinue} size="lg" className="w-full gap-2">
        Continuar para Parte 2 <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
