/**
 * ScoreAdjuster Component
 * PRD-048: Teste por Vaga
 *
 * Dropdown para ajustar score individual de uma resposta
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, AlertTriangle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ScoreAdjusterProps {
  questionId: string;
  aiScore: number;
  currentScore: number;
  note?: string;
  onAdjust: (newScore: number, note?: string) => void;
  disabled?: boolean;
  className?: string;
}

const scoreOptions = [
  { value: 1, label: 'Muito Baixo', color: 'bg-red-500' },
  { value: 2, label: 'Baixo', color: 'bg-orange-500' },
  { value: 3, label: 'Médio', color: 'bg-amber-500' },
  { value: 4, label: 'Alto', color: 'bg-lime-500' },
  { value: 5, label: 'Muito Alto', color: 'bg-green-500' },
];

function getScoreColor(score: number): string {
  if (score <= 1) return 'bg-red-500';
  if (score <= 2) return 'bg-orange-500';
  if (score <= 3) return 'bg-amber-500';
  if (score <= 4) return 'bg-lime-500';
  return 'bg-green-500';
}

export function ScoreAdjuster({
  questionId,
  aiScore,
  currentScore,
  note,
  onAdjust,
  disabled,
  className,
}: ScoreAdjusterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState(currentScore);
  const [adjustmentNote, setAdjustmentNote] = useState(note || '');
  const [showNoteInput, setShowNoteInput] = useState(!!note);

  const isAdjusted = currentScore !== aiScore;

  const handleConfirm = () => {
    onAdjust(selectedScore, adjustmentNote || undefined);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedScore(aiScore);
    setAdjustmentNote('');
    onAdjust(aiScore, undefined);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            'h-8 gap-2',
            isAdjusted && 'border-amber-500 text-amber-600',
            className
          )}
        >
          <div className={cn('w-3 h-3 rounded-full', getScoreColor(currentScore))} />
          <span className="font-bold">{currentScore}</span>
          {isAdjusted && (
            <span className="text-xs text-muted-foreground">
              (IA: {aiScore})
            </span>
          )}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground text-sm">Ajustar Score</h4>
            {isAdjusted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 text-xs text-muted-foreground"
              >
                Resetar
              </Button>
            )}
          </div>

          {/* AI Score info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>Score da IA: {aiScore}</span>
          </div>

          {/* Score options */}
          <div className="space-y-1">
            {scoreOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedScore(option.value)}
                className={cn(
                  'w-full flex items-center gap-2 p-2 rounded transition-colors',
                  selectedScore === option.value
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                )}
              >
                <div className={cn('w-3 h-3 rounded-full', option.color)} />
                <span className="text-sm">{option.label}</span>
                <span className="ml-auto font-bold">{option.value}</span>
                {selectedScore === option.value && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Note toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="w-full justify-start text-muted-foreground"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showNoteInput ? 'Ocultar nota' : 'Adicionar nota'}
          </Button>

          {/* Note input */}
          <AnimatePresence>
            {showNoteInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <Textarea
                  placeholder="Motivo do ajuste..."
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="flex-1 gradient-primary"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
