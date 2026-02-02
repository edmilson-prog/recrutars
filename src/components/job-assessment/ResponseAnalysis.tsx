/**
 * ResponseAnalysis Component
 * PRD-048: Teste por Vaga
 *
 * Análise detalhada de cada resposta do candidato com ajuste de score
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScoreAdjuster } from './ScoreAdjuster';
import { DimensionBadge } from '@/components/assessment';
import { assessmentCategories } from '@/data/assessmentData';
import type { AssessmentQuestion } from '@/types/assessment';
import { QUESTION_TYPE_LABELS, QUESTION_LEVEL_STARS } from '@/types/assessment';

interface ResponseData {
  questionId: string;
  response: string;
  aiScore: number;
  recruiterScore?: number;
  recruiterNote?: string;
}

interface ResponseAnalysisProps {
  questions: AssessmentQuestion[];
  responses: ResponseData[];
  onAdjustScore: (
    questionId: string,
    newScore: number,
    note?: string
  ) => void;
  readOnly?: boolean;
  className?: string;
}

function getCategoryName(categoryId: string): string {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

function getCategoryDimensionId(categoryId: string): string | undefined {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.dimensionId;
}

function formatResponse(
  question: AssessmentQuestion,
  response: string
): string {
  if (question.type === 'situational' && question.options) {
    const option = question.options.find((o) => o.key === response);
    return option ? `${option.key}: ${option.text}` : response;
  }

  const likertLabels: Record<string, string> = {
    '1': 'Discordo totalmente',
    '2': 'Discordo',
    '3': 'Neutro',
    '4': 'Concordo',
    '5': 'Concordo totalmente',
  };

  return likertLabels[response] || response;
}

export function ResponseAnalysis({
  questions,
  responses,
  onAdjustScore,
  readOnly,
  className,
}: ResponseAnalysisProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Agrupar por categoria
  const responsesByCategory = questions.reduce((acc, question) => {
    const response = responses.find((r) => r.questionId === question.id);
    if (!response) return acc;

    if (!acc[question.categoryId]) {
      acc[question.categoryId] = [];
    }
    acc[question.categoryId].push({ question, response });
    return acc;
  }, {} as Record<string, { question: AssessmentQuestion; response: ResponseData }[]>);

  const toggleExpand = (categoryId: string) => {
    setExpandedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const expandAll = () => {
    setExpandedIds(Object.keys(responsesByCategory));
  };

  const collapseAll = () => {
    setExpandedIds([]);
  };

  // Contagem de ajustes
  const adjustedCount = responses.filter(
    (r) => r.recruiterScore !== undefined && r.recruiterScore !== r.aiScore
  ).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            Análise das Respostas
          </h3>
          <p className="text-sm text-muted-foreground">
            {responses.length} respostas • {adjustedCount} ajuste(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expandir tudo
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Recolher tudo
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(responsesByCategory).map(
          ([categoryId, items], catIndex) => {
            const isExpanded = expandedIds.includes(categoryId);
            const categoryAdjusted = items.filter(
              (item) =>
                item.response.recruiterScore !== undefined &&
                item.response.recruiterScore !== item.response.aiScore
            ).length;

            // Calcular score médio da categoria
            const avgScore =
              items.reduce(
                (sum, item) =>
                  sum +
                  (item.response.recruiterScore ?? item.response.aiScore),
                0
              ) / items.length;

            return (
              <Collapsible
                key={categoryId}
                open={isExpanded}
                onOpenChange={() => toggleExpand(categoryId)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.05 }}
                  className="bg-card rounded-xl border overflow-hidden"
                >
                  {/* Category header */}
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <DimensionBadge
                          dimensionId={getCategoryDimensionId(categoryId) || ''}
                          size="sm"
                        />
                        <div className="text-left">
                          <h4 className="font-medium text-foreground">
                            {getCategoryName(categoryId)}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {items.length} pergunta(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {categoryAdjusted > 0 && (
                          <Badge variant="outline" className="text-amber-500">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {categoryAdjusted} ajuste(s)
                          </Badge>
                        )}

                        {/* Average score */}
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">
                            Média:
                          </span>
                          <Badge
                            variant={avgScore >= 3.5 ? 'default' : 'secondary'}
                            className={avgScore >= 3.5 ? 'bg-success' : ''}
                          >
                            {avgScore.toFixed(1)}
                          </Badge>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                  </CollapsibleTrigger>

                  {/* Responses list */}
                  <CollapsibleContent>
                    <div className="border-t divide-y">
                      {items.map(({ question, response }, index) => {
                        const currentScore =
                          response.recruiterScore ?? response.aiScore;
                        const isAdjusted =
                          response.recruiterScore !== undefined &&
                          response.recruiterScore !== response.aiScore;

                        return (
                          <div
                            key={question.id}
                            className={cn(
                              'p-4 space-y-2',
                              isAdjusted && 'bg-amber-500/5'
                            )}
                          >
                            {/* Question */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm text-foreground">
                                  {question.text}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {QUESTION_TYPE_LABELS[question.type]}
                                  </span>
                                  <span className="text-xs">
                                    {QUESTION_LEVEL_STARS[question.level]}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    #{question.code}
                                  </span>
                                </div>
                              </div>

                              {/* Score adjuster */}
                              <ScoreAdjuster
                                questionId={question.id}
                                aiScore={response.aiScore}
                                currentScore={currentScore}
                                note={response.recruiterNote}
                                onAdjust={(score, note) =>
                                  onAdjustScore(question.id, score, note)
                                }
                                disabled={readOnly}
                              />
                            </div>

                            {/* Response */}
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  Resposta:{' '}
                                </span>
                                {formatResponse(question, response.response)}
                              </p>
                            </div>

                            {/* Recruiter note */}
                            {response.recruiterNote && (
                              <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-500/10 rounded-lg p-2">
                                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{response.recruiterNote}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </motion.div>
              </Collapsible>
            );
          }
        )}
      </div>
    </div>
  );
}
