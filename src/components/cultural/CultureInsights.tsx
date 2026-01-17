/**
 * Culture Insights Component
 * PRD-042: Fit Cultural
 *
 * Shows insights and recommendations based on cultural compatibility
 */

import { motion } from 'framer-motion';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CulturalCompatibility, CulturalInsight } from '@/types/culturalFit';
import { DIMENSION_LABELS, DIMENSION_ICONS } from '@/types/culturalFit';
import { getCompatibilityRecommendations } from '@/lib/culturalFit';

interface CultureInsightsProps {
  compatibility: CulturalCompatibility;
  candidateName?: string;
  className?: string;
}

export function CultureInsights({
  compatibility,
  candidateName = 'o candidato',
  className,
}: CultureInsightsProps) {
  const recommendations = getCompatibilityRecommendations(compatibility);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Insights e Recomendações
        </CardTitle>
        <CardDescription>
          Análise do fit cultural de {candidateName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Insights by dimension */}
        {compatibility.insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Análise por Dimensão
            </h4>
            <div className="space-y-2">
              {compatibility.insights.map((insight, index) => (
                <InsightItem key={index} insight={insight} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recomendações
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  {rec}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Interview Questions Suggestion */}
        {compatibility.watchPoints.length > 0 && (
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Sugestões para Entrevista
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {compatibility.watchPoints.map(dim => (
                <li key={dim} className="flex items-start gap-2">
                  <span className="text-base">{DIMENSION_ICONS[dim]}</span>
                  <span>
                    Explore as expectativas sobre {DIMENSION_LABELS[dim].toLowerCase()}:{' '}
                    {getInterviewQuestion(dim)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Individual Insight Item
interface InsightItemProps {
  insight: CulturalInsight;
  index: number;
}

function InsightItem({ insight, index }: InsightItemProps) {
  const isStrength = insight.type === 'strength';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg',
        isStrength ? 'bg-green-50 dark:bg-green-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20'
      )}
    >
      {isStrength ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              isStrength
                ? 'border-green-500 text-green-600'
                : 'border-yellow-500 text-yellow-600'
            )}
          >
            {DIMENSION_ICONS[insight.dimension]} {DIMENSION_LABELS[insight.dimension]}
          </Badge>
        </div>
        <p
          className={cn(
            'text-sm',
            isStrength ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
          )}
        >
          {insight.message}
        </p>
      </div>
    </motion.div>
  );
}

// Helper function for interview questions
function getInterviewQuestion(dimension: string): string {
  const questions: Record<string, string> = {
    innovation:
      '"Como você lida com mudanças e novas formas de trabalhar?"',
    collaboration:
      '"Você prefere trabalhar sozinho ou em equipe? Por quê?"',
    hierarchy:
      '"O que você espera em termos de estrutura e supervisão?"',
    pace:
      '"Como você se sente em ambientes de alta pressão e prazos curtos?"',
    direction:
      '"Você prefere receber orientações detalhadas ou ter autonomia?"',
  };

  return questions[dimension] || '"Como essa área funciona no seu trabalho ideal?"';
}
