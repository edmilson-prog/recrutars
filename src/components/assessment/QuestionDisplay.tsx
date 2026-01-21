/**
 * QuestionDisplay Component
 * PRD-047: Teste Geral do Candidato
 *
 * Exibe a pergunta atual com escala Likert ou opções situacionais
 */

import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LikertScale, LikertScaleVertical } from './LikertScale';
import { SituationalOptions } from './SituationalOptions';
import { DimensionBadge } from './DimensionBadge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AssessmentQuestion } from '@/types/assessment';
import { QUESTION_TYPE_LABELS, QUESTION_LEVEL_STARS } from '@/types/assessment';

interface QuestionDisplayProps {
  question: AssessmentQuestion;
  questionIndex: number;
  value: string | null;
  onChange: (value: string) => void;
  dimensionId?: string;
  className?: string;
}

export function QuestionDisplay({
  question,
  questionIndex,
  value,
  onChange,
  dimensionId,
  className,
}: QuestionDisplayProps) {
  const isMobile = useIsMobile();
  const isSituational = question.type === 'situational' && question.options;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={cn('bg-card rounded-2xl p-6 sm:p-8 shadow-soft', className)}
      >
        {/* Header com badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {dimensionId && <DimensionBadge dimensionId={dimensionId} size="sm" />}
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              {QUESTION_TYPE_LABELS[question.type]}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {QUESTION_LEVEL_STARS[question.level]}
          </span>
        </div>

        {/* Texto da pergunta */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
            {question.text}
          </h2>

          {/* Help text */}
          {question.helpText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-4 h-4" />
                    <span>Dica</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{question.helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Área de resposta */}
        <div className="mt-6">
          {isSituational && question.options ? (
            <SituationalOptions
              options={question.options}
              value={value}
              onChange={onChange}
            />
          ) : isMobile ? (
            <LikertScaleVertical value={value} onChange={onChange} />
          ) : (
            <LikertScale value={value} onChange={onChange} />
          )}
        </div>

        {/* Indicador de seleção */}
        {value && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <span className="text-sm text-success font-medium">
              Resposta selecionada
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
