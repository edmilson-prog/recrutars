/**
 * CareerRecommendations Component
 * PRD-047: Teste Geral do Candidato
 *
 * Recomendações de tipos de cargo baseadas no perfil
 */

import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CareerRecommendationsProps {
  recommendations: string[];
  className?: string;
}

export function CareerRecommendations({
  recommendations,
  className,
}: CareerRecommendationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-card rounded-2xl p-6 shadow-soft', className)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Carreiras Recomendadas
          </h3>
          <p className="text-sm text-muted-foreground">
            Baseado no seu perfil comportamental
          </p>
        </div>
      </div>

      {/* Recommendations list */}
      <div className="space-y-2 mb-6">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-colors',
              index === 0 ? 'bg-primary/10' : 'bg-muted/50'
            )}
          >
            <span
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                index === 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground/20 text-muted-foreground'
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                'font-medium',
                index === 0 ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {rec}
            </span>
            {index === 0 && (
              <Sparkles className="w-4 h-4 text-primary ml-auto" />
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link to="/candidato/vagas">
            <Briefcase className="w-4 h-4 mr-2" />
            Buscar Vagas
          </Link>
        </Button>
        <Button asChild className="flex-1 gradient-primary">
          <Link to="/candidato/vagas-recomendadas">
            <Sparkles className="w-4 h-4 mr-2" />
            Vagas para Você
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * Versão compacta como lista
 */
export function CareerRecommendationsCompact({
  recommendations,
  limit = 3,
  className,
}: {
  recommendations: string[];
  limit?: number;
  className?: string;
}) {
  const displayRecs = recommendations.slice(0, limit);

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Briefcase className="w-4 h-4" />
        Carreiras sugeridas
      </h4>
      <div className="flex flex-wrap gap-2">
        {displayRecs.map((rec) => (
          <span
            key={rec}
            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
          >
            {rec}
          </span>
        ))}
        {recommendations.length > limit && (
          <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
            +{recommendations.length - limit}
          </span>
        )}
      </div>
    </div>
  );
}
