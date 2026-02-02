import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { AdjectiveWord } from '@/types/gaugePro';

interface WordGridProps {
  words: AdjectiveWord[];
  shuffledOrder: number[];
  selectedIds: number[];
  maxSelections: number;
  dimensionName: string;
  perspectiveLabel: string;
  stepNumber: number;
  totalSteps: number;
  onToggle: (wordId: number) => void;
}

export function WordGrid({
  words,
  shuffledOrder,
  selectedIds,
  maxSelections,
  dimensionName,
  perspectiveLabel,
  stepNumber,
  totalSteps,
  onToggle,
}: WordGridProps) {
  const isMaxReached = selectedIds.length >= maxSelections;
  const isComplete = selectedIds.length === maxSelections;

  const wordMap = new Map(words.map(w => [w.id, w]));
  const orderedWords = shuffledOrder.map(id => wordMap.get(id)).filter(Boolean) as AdjectiveWord[];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {dimensionName}
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Etapa {stepNumber} de {totalSteps}
          </span>
        </div>
        <p className="text-sm text-gray-500">{perspectiveLabel}</p>
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
                  ? 'bg-cyan-50 border-cyan-400'
                  : isDisabled
                    ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'
              )}
            >
              {/* Checkbox */}
              <span className={cn(
                'shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected
                  ? 'bg-cyan-500 border-cyan-500'
                  : 'border-gray-300 bg-white'
              )}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </span>

              {/* Word */}
              <span className={cn(
                'text-sm font-medium',
                isSelected ? 'text-cyan-800' : 'text-gray-700'
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
