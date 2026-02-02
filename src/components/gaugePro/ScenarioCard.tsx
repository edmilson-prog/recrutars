import { cn } from '@/lib/utils';
import type { Scenario } from '@/types/gaugePro';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
}

const OPTION_COLORS: Record<string, string> = {
  A: 'border-blue-300 bg-blue-50 text-blue-800',
  B: 'border-purple-300 bg-purple-50 text-purple-800',
  C: 'border-amber-300 bg-amber-50 text-amber-800',
  D: 'border-green-300 bg-green-50 text-green-800',
};

const OPTION_BADGE_COLORS: Record<string, string> = {
  A: 'bg-blue-500',
  B: 'bg-purple-500',
  C: 'bg-amber-500',
  D: 'bg-green-500',
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
}: ScenarioCardProps) {
  const progress = ((currentIndex + 1) / totalScenarios) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Cenário {currentIndex + 1} de {totalScenarios}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Scenario */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              {scenario.title}
            </p>
            <p className="text-gray-800 leading-relaxed">
              {scenario.situation}
            </p>
          </div>

          <div className="space-y-2">
            {scenario.options.map(option => {
              const isSelected = selectedOption === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => onSelectOption(option.key)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all',
                    isSelected
                      ? OPTION_COLORS[option.key]
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <span className={cn(
                    'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5',
                    isSelected ? OPTION_BADGE_COLORS[option.key] : 'bg-gray-300'
                  )}>
                    {option.key}
                  </span>
                  <span className="text-sm leading-relaxed">{option.text}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
