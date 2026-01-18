/**
 * Suggestion List Component
 * PRD-039: Displays job improvement suggestions sorted by impact
 */

import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobSuggestion, SuggestionSeverity } from '@/types/jobAnalyzer';
import { Button } from '@/components/ui/button';

interface SuggestionListProps {
  suggestions: JobSuggestion[];
  onSuggestionClick?: (suggestion: JobSuggestion) => void;
  maxItems?: number;
  className?: string;
}

const SEVERITY_CONFIG: Record<SuggestionSeverity, {
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}> = {
  critical: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
    label: 'Crítico',
  },
  important: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    label: 'Importante',
  },
  ok: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    label: 'OK',
  },
};

export function SuggestionList({
  suggestions,
  onSuggestionClick,
  maxItems,
  className,
}: SuggestionListProps) {
  const displaySuggestions = maxItems ? suggestions.slice(0, maxItems) : suggestions;
  const hasMore = maxItems && suggestions.length > maxItems;

  if (suggestions.length === 0) {
    return (
      <div className={cn('text-center py-6', className)}>
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
        <p className="text-sm text-muted-foreground">
          Excelente! Sua vaga está bem otimizada.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {displaySuggestions.map((suggestion) => (
        <SuggestionItem
          key={suggestion.id}
          suggestion={suggestion}
          onClick={onSuggestionClick ? () => onSuggestionClick(suggestion) : undefined}
        />
      ))}
      {hasMore && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          +{suggestions.length - maxItems} outras sugestões
        </p>
      )}
    </div>
  );
}

interface SuggestionItemProps {
  suggestion: JobSuggestion;
  onClick?: () => void;
}

export function SuggestionItem({ suggestion, onClick }: SuggestionItemProps) {
  const config = SEVERITY_CONFIG[suggestion.severity];
  const Icon = config.icon;
  const hasAction = suggestion.suggestedValue || suggestion.action;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'w-full text-left rounded-lg border p-3 transition-all',
        config.bgColor,
        config.borderColor,
        onClick && 'hover:shadow-sm cursor-pointer',
        !onClick && 'cursor-default'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.textColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm text-foreground">
              {suggestion.title}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                suggestion.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                suggestion.severity === 'important' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
              )}>
                +{suggestion.impact} pts
              </span>
              {hasAction && onClick && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {suggestion.description}
          </p>
        </div>
      </div>
    </button>
  );
}

// Compact summary of critical suggestions
export function SuggestionSummary({
  criticalCount,
  importantCount,
  className,
}: {
  criticalCount: number;
  importantCount: number;
  className?: string;
}) {
  if (criticalCount === 0 && importantCount === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 text-xs', className)}>
      {criticalCount > 0 && (
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
        </span>
      )}
      {importantCount > 0 && (
        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          {importantCount} importante{importantCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

// Quick action buttons for suggestions
export function SuggestionQuickActions({
  suggestion,
  onApply,
  onViewDetails,
  className,
}: {
  suggestion: JobSuggestion;
  onApply?: () => void;
  onViewDetails?: () => void;
  className?: string;
}) {
  const hasSuggestedValue = Boolean(suggestion.suggestedValue);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {hasSuggestedValue && onApply && (
        <Button
          size="sm"
          variant="outline"
          onClick={onApply}
          className="h-7 text-xs gap-1"
        >
          <Sparkles className="w-3 h-3" />
          Aplicar sugestão
        </Button>
      )}
      {onViewDetails && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onViewDetails}
          className="h-7 text-xs"
        >
          Ver detalhes
        </Button>
      )}
    </div>
  );
}
