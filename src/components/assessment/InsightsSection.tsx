/**
 * InsightsSection Component
 * PRD-047: Teste Geral do Candidato
 *
 * Insights personalizados por dimensão
 */

import { motion } from 'framer-motion';
import { Lightbulb, Quote, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { assessmentDimensions } from '@/data/assessmentData';

interface InsightsSectionProps {
  summary: string;
  insights: Record<string, string>;
  className?: string;
}

function getDimensionById(id: string) {
  return assessmentDimensions.find((d) => d.id === id);
}

export function InsightsSection({
  summary,
  insights,
  className,
}: InsightsSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Resumo do Seu Perfil
            </h3>
            <p className="text-muted-foreground leading-relaxed">{summary}</p>
          </div>
        </div>
      </motion.div>

      {/* Insights by Dimension */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Quote className="w-5 h-5 text-primary" />
          Insights Detalhados
        </h3>

        {Object.entries(insights).map(([dimensionId, insight], index) => {
          const dimension = getDimensionById(dimensionId);
          if (!dimension) return null;

          return (
            <motion.div
              key={dimensionId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{dimension.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">
                    {dimension.name}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Versão compacta com acordeão
 */
export function InsightsSectionCompact({
  summary,
  className,
}: {
  summary: string;
  className?: string;
}) {
  return (
    <div className={cn('bg-card rounded-xl p-4', className)}>
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground line-clamp-3">{summary}</p>
      </div>
    </div>
  );
}

/**
 * Lista de pontos fortes e áreas de desenvolvimento
 */
interface StrengthsAndAreasProps {
  strengths: string[];
  developmentAreas: string[];
  className?: string;
}

export function StrengthsAndAreas({
  strengths,
  developmentAreas,
  className,
}: StrengthsAndAreasProps) {
  return (
    <div className={cn('grid md:grid-cols-2 gap-4', className)}>
      {/* Strengths */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-green-500/10 rounded-xl p-4"
      >
        <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Pontos Fortes
        </h4>
        <ul className="space-y-2">
          {strengths.map((strength, index) => (
            <motion.li
              key={strength}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <ChevronRight className="w-4 h-4 text-green-500 flex-shrink-0" />
              {strength}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Development Areas */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-amber-500/10 rounded-xl p-4"
      >
        <h4 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Áreas de Desenvolvimento
        </h4>
        <ul className="space-y-2">
          {developmentAreas.map((area, index) => (
            <motion.li
              key={area}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0" />
              {area}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
