/**
 * QuestionCard Component
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Card de pergunta com ações de gerenciamento
 */

import { motion } from 'framer-motion';
import {
  MoreVertical,
  Edit2,
  Copy,
  Power,
  PowerOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DimensionBadge } from './DimensionBadge';
import type {
  AssessmentQuestion,
  AssessmentCategory,
  AssessmentDimension,
} from '@/types/assessment';
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_ICONS,
  QUESTION_LEVEL_LABELS,
  QUESTION_LEVEL_STARS,
} from '@/types/assessment';

interface QuestionCardProps {
  question: AssessmentQuestion;
  category?: AssessmentCategory;
  dimension?: AssessmentDimension;
  index?: number;
  onEdit?: (question: AssessmentQuestion) => void;
  onDuplicate?: (question: AssessmentQuestion) => void;
  onToggleStatus?: (question: AssessmentQuestion) => void;
}

export function QuestionCard({
  question,
  category,
  dimension,
  index = 0,
  onEdit,
  onDuplicate,
  onToggleStatus,
}: QuestionCardProps) {
  const typeIcon = QUESTION_TYPE_ICONS[question.type];
  const typeLabel = QUESTION_TYPE_LABELS[question.type];
  const levelStars = QUESTION_LEVEL_STARS[question.level];
  const levelLabel = QUESTION_LEVEL_LABELS[question.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={cn(
        'bg-card border rounded-lg p-4 hover:shadow-md transition-shadow',
        !question.isActive && 'opacity-60 bg-muted/30'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header with code and badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-sm font-semibold text-primary">
              {question.code}
            </span>

            {dimension && <DimensionBadge dimension={dimension} size="sm" />}

            <Badge variant="outline" className="text-xs">
              {typeIcon} {typeLabel}
            </Badge>

            <Badge
              variant="secondary"
              className="text-xs"
              title={levelLabel}
            >
              {levelStars}
            </Badge>

            {!question.isActive && (
              <Badge variant="destructive" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>

          {/* Category */}
          {category && (
            <p className="text-xs text-muted-foreground mb-2">
              {category.name}
            </p>
          )}

          {/* Question text */}
          <p className="text-sm leading-relaxed">{question.text}</p>

          {/* Footer info */}
          {question.usageCount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Usado {question.usageCount} vez(es)
            </p>
          )}
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(question)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(question)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onToggleStatus?.(question)}
              className={question.isActive ? 'text-destructive' : 'text-success'}
            >
              {question.isActive ? (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Desativar
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Ativar
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

/**
 * Versão compacta para listas densas
 */
export function QuestionCardCompact({
  question,
  category,
  onEdit,
  onToggleStatus,
}: Omit<QuestionCardProps, 'dimension' | 'index' | 'onDuplicate'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors',
        !question.isActive && 'opacity-60'
      )}
      onClick={() => onEdit?.(question)}
    >
      <span className="font-mono text-xs font-semibold text-primary w-12">
        {question.code}
      </span>

      <span className="text-sm">{QUESTION_TYPE_ICONS[question.type]}</span>

      <p className="text-sm flex-1 truncate">{question.text}</p>

      {category && (
        <span className="text-xs text-muted-foreground hidden md:block">
          {category.name}
        </span>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus?.(question);
        }}
      >
        {question.isActive ? (
          <Power className="h-3 w-3 text-success" />
        ) : (
          <PowerOff className="h-3 w-3 text-destructive" />
        )}
      </Button>
    </div>
  );
}
