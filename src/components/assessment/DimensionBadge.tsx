/**
 * DimensionBadge Component
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Badge colorido para identificar dimensões de avaliação
 */

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { assessmentDimensions } from '@/data/assessmentData';
import type { AssessmentDimension } from '@/types/assessment';

interface DimensionBadgeProps {
  dimension?: AssessmentDimension;
  dimensionId?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const DIMENSION_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'dim-personality': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/30',
  },
  'dim-character': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  'dim-competencies': {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
};

export function DimensionBadge({
  dimension,
  dimensionId,
  showIcon = true,
  size = 'md',
  className,
}: DimensionBadgeProps) {
  // Resolver dimensão: usar objeto direto ou buscar pelo ID
  const resolvedDimension = dimension || assessmentDimensions.find(d => d.id === dimensionId);

  // Retornar null se não encontrar
  if (!resolvedDimension) {
    return null;
  }

  const styles = DIMENSION_STYLES[resolvedDimension.id] || {
    bg: 'bg-muted',
    text: 'text-foreground',
    border: 'border-border',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        styles.bg,
        styles.text,
        styles.border,
        SIZE_CLASSES[size],
        className
      )}
    >
      {showIcon && <span className="mr-1">{resolvedDimension.icon}</span>}
      {resolvedDimension.name}
    </Badge>
  );
}

/**
 * Versão simplificada apenas com o ícone
 */
export function DimensionIcon({
  dimension,
  className,
}: {
  dimension: AssessmentDimension;
  className?: string;
}) {
  return (
    <span className={cn('text-lg', className)} title={dimension.name}>
      {dimension.icon}
    </span>
  );
}
