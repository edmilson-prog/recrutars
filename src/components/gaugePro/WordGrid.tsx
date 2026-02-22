import { cn } from '@/lib/utils';
import { Check, Eye, Users } from 'lucide-react';
import type { AdjectiveWord, Perspective } from '@/types/gaugePro';

interface WordGridProps {
  words: AdjectiveWord[];
  shuffledOrder: number[];
  selectedIds: number[];
  maxSelections: number;
  dimensionName: string;
  perspectiveLabel: string;
  perspective: Perspective;
  stepNumber: number;
  totalSteps: number;
  onToggle: (wordId: number) => void;
  overallProgress?: number;
}

export function WordGrid({
  words,
  shuffledOrder,
  selectedIds,
  maxSelections,
  dimensionName,
  perspectiveLabel,
  perspective,
  stepNumber,
  totalSteps,
  onToggle,
  overallProgress,
}: WordGridProps) {
  const isMaxReached = selectedIds.length >= maxSelections;
  const isComplete = selectedIds.length === maxSelections;
  const isSelf = perspective === 'self';

  const wordMap = new Map(words.map(w => [w.id, w]));
  const orderedWords = shuffledOrder.map(id => wordMap.get(id)).filter(Boolean) as AdjectiveWord[];

  const progressPercent = ((stepNumber - 1) / totalSteps) * 100;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{dimensionName}</span>
          <span>{Math.round(progressPercent)}%</span>
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
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Progresso geral</span>
            <span>{overallProgress}%</span>
          </div>
        </div>
      )}

      {/* Perspective card */}
      <div className={cn(
        'rounded-xl border px-5 py-4 flex items-start gap-4 transition-colors',
        isSelf
          ? 'bg-cyan-500/10 border-cyan-500/30'
          : 'bg-indigo-500/10 border-indigo-500/30'
      )}>
        <div className={cn(
          'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          isSelf ? 'bg-cyan-500/20' : 'bg-indigo-500/20'
        )}>
          {isSelf
            ? <Eye className="w-5 h-5 text-cyan-400" />
            : <Users className="w-5 h-5 text-indigo-400" />
          }
        </div>
        <div className="space-y-1 min-w-0">
          <p className={cn(
            'text-base font-bold tracking-tight',
            isSelf ? 'text-cyan-400' : 'text-indigo-400'
          )}>
            {perspectiveLabel}
          </p>
          <p className="text-sm text-muted-foreground">
            {isSelf
              ? <>Escolha <strong>EXATAMENTE {maxSelections}</strong> palavras que melhor descrevem o seu jeito de ser naturalmente.</>
              : <>Escolha <strong>EXATAMENTE {maxSelections}</strong> palavras que outras pessoas usariam para descrever você.</>
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {orderedWords.map(word => {
          const isSelected = selectedIds.includes(word.id);
          const isDisabled = !isSelected && isMaxReached;

          return (
            <button
              key={word.id}
              onClick={() => !isDisabled && onToggle(word.id)}
              disabled={isDisabled}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? isSelf
                    ? 'bg-cyan-50 border-cyan-400'
                    : 'bg-indigo-50 border-indigo-400'
                  : isDisabled
                    ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'
              )}
            >
              {/* Checkbox */}
              <span className={cn(
                'shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected
                  ? isSelf
                    ? 'bg-cyan-500 border-cyan-500'
                    : 'bg-indigo-500 border-indigo-500'
                  : 'border-gray-300 bg-white'
              )}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </span>

              {/* Word */}
              <span className={cn(
                'text-sm font-medium',
                isSelected
                  ? isSelf ? 'text-cyan-800' : 'text-indigo-800'
                  : 'text-gray-700'
              )}>
                {word.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Counter badge */}
      <div className="flex justify-center">
        <div className={cn(
          'inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all',
          isComplete
            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        )}>
          Selecionados: {selectedIds.length}/{maxSelections}
          {isComplete && <Check className="w-4 h-4" strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
}
