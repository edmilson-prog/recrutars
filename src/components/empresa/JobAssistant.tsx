/**
 * Job Assistant Component
 * PRD-039: Main container for the job analysis assistant
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { JobAnalysis, JobSuggestion } from '@/types/jobAnalyzer';
import { PLATFORM_AVERAGE_SCORE } from '@/lib/jobAnalyzer';
import { Button } from '@/components/ui/button';
import { JobScoreRing } from './JobScoreRing';
import { SuggestionList, SuggestionSummary } from './SuggestionList';
import { SuggestionModal } from './SuggestionModal';

interface JobAssistantProps {
  analysis: JobAnalysis | null;
  isAnalyzing: boolean;
  onApplySuggestion: (field: string, value: string) => void;
  className?: string;
}

// Map suggestion category to form field
function categoryToField(category: string): string {
  const mapping: Record<string, string> = {
    salary: 'salary',
    description: 'description',
    benefits: 'benefits',
    title: 'title',
    requirements: 'requirements',
    softSkills: 'requirements',
    workType: 'type',
    location: 'location',
    bias: 'description',
  };
  return mapping[category] || 'description';
}

export function JobAssistant({
  analysis,
  isAnalyzing,
  onApplySuggestion,
  className,
}: JobAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<JobSuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const score = analysis?.score ?? 0;
  const criticalCount = analysis?.suggestions.filter(s => s.severity === 'critical').length ?? 0;
  const importantCount = analysis?.suggestions.filter(s => s.severity === 'important').length ?? 0;

  const handleSuggestionClick = (suggestion: JobSuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsModalOpen(true);
  };

  const handleApplySuggestion = (value: string, suggestion: JobSuggestion) => {
    const field = categoryToField(suggestion.category);
    onApplySuggestion(field, value);
    setIsModalOpen(false);
    setSelectedSuggestion(null);
  };

  // Score comparison with platform average
  const scoreDiff = score - PLATFORM_AVERAGE_SCORE;
  const isAboveAverage = scoreDiff > 0;

  return (
    <>
      <div className={cn(
        'border rounded-xl bg-card overflow-hidden',
        className
      )}>
        {/* Header - Always visible */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Assistente de Redação
                {isAnalyzing && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </h3>
              <SuggestionSummary
                criticalCount={criticalCount}
                importantCount={importantCount}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isAnalyzing && analysis && (
              <JobScoreRing score={score} size="sm" showLabel={false} />
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t pt-4">
                {/* Score display with comparison */}
                {analysis && !isAnalyzing && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <JobScoreRing score={score} size="md" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Pontuação da vaga
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp className={cn(
                            'w-4 h-4',
                            isAboveAverage ? 'text-green-500' : 'text-red-500'
                          )} />
                          <span className="text-xs text-muted-foreground">
                            {isAboveAverage ? '+' : ''}{scoreDiff} pts vs média da plataforma ({PLATFORM_AVERAGE_SCORE} pts)
                          </span>
                        </div>
                      </div>
                    </div>
                    {score >= 80 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs font-medium rounded-full">
                        Excelente
                      </span>
                    )}
                  </div>
                )}

                {/* Loading state */}
                {isAnalyzing && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Analisando sua vaga...
                      </p>
                    </div>
                  </div>
                )}

                {/* Suggestions list */}
                {analysis && !isAnalyzing && (
                  <SuggestionList
                    suggestions={analysis.suggestions}
                    onSuggestionClick={handleSuggestionClick}
                    maxItems={5}
                  />
                )}

                {/* No analysis yet */}
                {!analysis && !isAnalyzing && (
                  <div className="text-center py-6">
                    <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Preencha os campos para receber sugestões de melhoria.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestion Modal */}
      <SuggestionModal
        suggestion={selectedSuggestion}
        biasDetections={analysis?.biasDetections}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onApply={handleApplySuggestion}
      />
    </>
  );
}

// Compact version for sidebar or minimal display
export function JobAssistantCompact({
  analysis,
  isAnalyzing,
  onClick,
  className,
}: {
  analysis: JobAnalysis | null;
  isAnalyzing: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const score = analysis?.score ?? 0;
  const criticalCount = analysis?.suggestions.filter(s => s.severity === 'critical').length ?? 0;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn('gap-2', className)}
    >
      {isAnalyzing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      <span className="font-medium">{score} pts</span>
      {criticalCount > 0 && (
        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
          {criticalCount}
        </span>
      )}
    </Button>
  );
}
