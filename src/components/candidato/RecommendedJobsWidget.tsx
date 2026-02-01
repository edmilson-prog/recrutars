/**
 * Widget de Vagas Recomendadas para Dashboard
 * PRD-036: Exibe as top recomendações no dashboard do candidato
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTopRecommendations } from '@/hooks/useJobRecommendations';
import { RecommendedJobCard } from './RecommendedJobCard';
import { cn } from '@/lib/utils';

interface RecommendedJobsWidgetProps {
  candidateId: string;
  className?: string;
}

export function RecommendedJobsWidget({
  candidateId,
  className,
}: RecommendedJobsWidgetProps) {
  const {
    recommendations,
    isLoading,
    newCount,
    markAsNotInterested,
    trackView,
    refresh,
  } = useTopRecommendations(candidateId, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card rounded-2xl p-6 shadow-soft", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Vagas para Você</h2>
            <p className="text-sm text-muted-foreground">Recomendações personalizadas</p>
          </div>
          {newCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {newCount} nova{newCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            title="Atualizar recomendações"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link
            to="/candidato/vagas-recomendadas"
            className="text-sm text-secondary font-medium hover:underline hidden sm:inline-flex items-center gap-1"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <RecommendedJobsWidgetSkeleton />
      ) : recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RecommendedJobCard
                recommendation={recommendation}
                onNotInterested={markAsNotInterested}
                onView={trackView}
                variant="compact"
              />
            </motion.div>
          ))}

          {/* Ver todas (mobile) */}
          <Button asChild variant="outline" className="w-full sm:hidden">
            <Link to="/candidato/vagas-recomendadas">
              Ver todas as recomendações
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      ) : (
        <RecommendedJobsWidgetEmpty />
      )}
    </motion.div>
  );
}

/**
 * Skeleton para loading state
 */
function RecommendedJobsWidgetSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-border">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state quando não há recomendações
 */
function RecommendedJobsWidgetEmpty() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Briefcase className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Nenhuma recomendação no momento
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        Complete seu perfil e faça o teste comportamental para receber recomendações mais precisas.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link to="/candidato/perfil">Completar perfil</Link>
        </Button>
        <Button asChild>
          <Link to="/candidato/vagas">Explorar vagas</Link>
        </Button>
      </div>
    </div>
  );
}
