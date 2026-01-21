/**
 * SituationalOptions Component
 * PRD-047: Teste Geral do Candidato
 *
 * Opções A, B, C, D para perguntas situacionais
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SituationalOption } from '@/types/assessment';

interface SituationalOptionsProps {
  options: SituationalOption[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const optionLetters = ['A', 'B', 'C', 'D'];

const letterColors: Record<string, string> = {
  A: 'bg-blue-500',
  B: 'bg-purple-500',
  C: 'bg-amber-500',
  D: 'bg-green-500',
};

export function SituationalOptions({
  options,
  value,
  onChange,
  disabled,
}: SituationalOptionsProps) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const letter = optionLetters[index] || option.key;
        const isSelected = value === option.key;

        return (
          <motion.button
            key={option.key}
            type="button"
            onClick={() => !disabled && onChange(option.key)}
            disabled={disabled}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            className={cn(
              'w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50 hover:bg-muted/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Letter badge */}
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all',
                isSelected
                  ? `${letterColors[option.key]} text-white`
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {letter}
            </div>

            {/* Option text */}
            <div className="flex-1 pt-1">
              <p
                className={cn(
                  'font-medium transition-colors',
                  isSelected ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {option.text}
              </p>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              >
                <svg
                  className="w-4 h-4 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Versão compacta para visualização
 */
export function SituationalOptionsCompact({
  options,
  selectedKey,
}: {
  options: SituationalOption[];
  selectedKey?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isSelected = selectedKey === option.key;

        return (
          <div
            key={option.key}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg text-sm',
              isSelected ? 'bg-primary/10 text-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center text-xs font-bold',
                isSelected ? `${letterColors[option.key]} text-white` : 'bg-background'
              )}
            >
              {option.key}
            </span>
            <span className="truncate">{option.text}</span>
          </div>
        );
      })}
    </div>
  );
}
