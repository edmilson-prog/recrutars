/**
 * Widget de Candidatos Sugeridos para Dashboard
 * PRD-037: Exibe os top candidatos sugeridos no dashboard da empresa
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTopCandidateRecommendations } from '@/hooks/useCandidateRecommendations';
import { SuggestedCandidateCard } from './SuggestedCandidateCard';
import { cn } from '@/lib/utils';

interface SuggestedCandidatesWidgetProps {
  jobId: string;
  jobTitle: string;
  className?: string;
}

export function SuggestedCandidatesWidget({
  jobId,
  jobTitle,
  className,
}: SuggestedCandidatesWidgetProps) {
  const {
    recommendations,
    isLoading,
    newCount,
    markAsNotSuitable,
    trackView,
    refresh,
  } = useTopCandidateRecommendations(jobId, 3);

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
            <h2 className="text-lg font-semibold text-foreground">Candidatos Sugeridos</h2>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{jobTitle}</p>
          </div>
          {newCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {newCount} novo{newCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            title="Atualizar sugestões"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link
            to={`/empresa/vagas/${jobId}/candidatos-sugeridos`}
            className="text-sm text-secondary font-medium hover:underline hidden sm:inline-flex items-center gap-1"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <SuggestedCandidatesWidgetSkeleton />
      ) : recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SuggestedCandidateCard
                recommendation={recommendation}
                jobId={jobId}
                onNotSuitable={markAsNotSuitable}
                onView={trackView}
                variant="compact"
              />
            </motion.div>
          ))}

          {/* Ver todos (mobile) */}
          <Button asChild variant="outline" className="w-full sm:hidden">
            <Link to={`/empresa/vagas/${jobId}/candidatos-sugeridos`}>
              Ver todos os candidatos sugeridos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      ) : (
        <SuggestedCandidatesWidgetEmpty jobId={jobId} />
      )}
    </motion.div>
  );
}

/**
 * Skeleton para loading state
 */
function SuggestedCandidatesWidgetSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-border">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
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
 * Empty state quando não há sugestões
 */
function SuggestedCandidatesWidgetEmpty({ jobId }: { jobId: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Nenhuma sugestão no momento
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        Não encontramos candidatos compatíveis com esta vaga no momento. Verifique novamente mais tarde.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link to="/empresa/candidatos">Banco de Talentos</Link>
        </Button>
        <Button asChild>
          <Link to={`/empresa/vagas/${jobId}/candidatos-sugeridos`}>Ver critérios</Link>
        </Button>
      </div>
    </div>
  );
}
