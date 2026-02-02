/**
 * LikertScale Component
 * PRD-047: Teste Geral do Candidato
 *
 * Escala de concordância 1-5 para perguntas comportamentais
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LIKERT_LABELS } from '@/types/assessment';

interface LikertScaleProps {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const scaleOptions = [
  { value: '1', label: LIKERT_LABELS['1'], color: 'bg-red-500' },
  { value: '2', label: LIKERT_LABELS['2'], color: 'bg-orange-500' },
  { value: '3', label: LIKERT_LABELS['3'], color: 'bg-yellow-500' },
  { value: '4', label: LIKERT_LABELS['4'], color: 'bg-lime-500' },
  { value: '5', label: LIKERT_LABELS['5'], color: 'bg-green-500' },
];

export function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="space-y-4">
      {/* Visual scale */}
      <div className="flex justify-center gap-2 sm:gap-4">
        {scaleOptions.map((option, index) => {
          const isSelected = value === option.value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center',
                'text-lg font-bold transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? `${option.color} text-white shadow-lg ring-2 ring-offset-2 ring-current`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={option.label}
              aria-pressed={isSelected}
            >
              {option.value}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                >
                  <div className="w-2 h-2 rounded-full bg-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground px-2">
        <span>Discordo totalmente</span>
        <span className="hidden sm:inline">Neutro</span>
        <span>Concordo totalmente</span>
      </div>

      {/* Selected label */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm font-medium text-foreground"
        >
          {LIKERT_LABELS[value]}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Versão vertical para mobile
 */
export function LikertScaleVertical({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="space-y-2">
      {scaleOptions.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
                isSelected ? `${option.color} text-white` : 'bg-muted text-muted-foreground'
              )}
            >
              {option.value}
            </div>
            <span className={cn('font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
