import { cn } from '@/lib/utils';
import type { Scenario } from '@/types/gaugePro';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
  currentIndex: number;
  totalScenarios: number;
  selectedOption?: 'A' | 'B' | 'C' | 'D';
  onSelectOption: (option: 'A' | 'B' | 'C' | 'D') => void;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLast: boolean;
  allAnswered: boolean;
  overallProgress?: number;
}

const OPTION_SELECTED: Record<string, string> = {
  A: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
  B: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
  C: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
  D: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
};

const OPTION_BADGE: Record<string, string> = {
  A: 'bg-blue-500',
  B: 'bg-purple-500',
  C: 'bg-amber-500',
  D: 'bg-emerald-500',
};

export function ScenarioCard({
  scenario,
  currentIndex,
  totalScenarios,
  selectedOption,
  onSelectOption,
  onNext,
  onPrevious,
  onFinish,
  canGoPrevious,
  isLast,
  allAnswered,
  overallProgress,
}: ScenarioCardProps) {
  const progress = ((currentIndex + 1) / totalScenarios) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Scenario progress */}
      <div className="space-y-1">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Cenário {currentIndex + 1} de {totalScenarios}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Overall progress */}
      {overallProgress !== undefined && (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-primary to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progresso geral</span>
            <span>{overallProgress}%</span>
          </div>
        </div>
      )}

      {/* Scenario card */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        {/* Scenario text */}
        <div className="space-y-1.5">
          <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
            {scenario.title}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {scenario.situation}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {scenario.options.map(option => {
            const isSelected = selectedOption === option.key;
            return (
              <button
                key={option.key}
                onClick={() => onSelectOption(option.key)}
                className={cn(
                  'w-full flex items-start gap-3 p-3.5 rounded-lg border-2 text-left transition-all',
                  isSelected
                    ? OPTION_SELECTED[option.key]
                    : 'border-border hover:border-muted-foreground/30 bg-transparent'
                )}
              >
                <span className={cn(
                  'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5',
                  isSelected ? OPTION_BADGE[option.key] : 'bg-muted-foreground/30'
                )}>
                  {option.key}
                </span>
                <span className={cn(
                  'text-sm leading-relaxed',
                  isSelected ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>

        {isLast ? (
          <Button
            onClick={onFinish}
            disabled={!allAnswered}
            className="gap-1"
          >
            <CheckCircle className="w-4 h-4" /> Finalizar Avaliação
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!selectedOption}
            className="gap-1"
          >
            Próximo <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
