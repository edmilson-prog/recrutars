/**
 * Card de Vaga Recomendada
 * PRD-036: Exibe vaga recomendada com motivos personalizados
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Briefcase,
  Heart,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDisplayCompanyName } from '@/lib/anonymousJob';
import { useFavoriteJobs } from '@/hooks/useFavoriteJobs';
import { NotInterestedReason } from '@/hooks/useJobFeedback';
import { NotInterestedModal } from './NotInterestedModal';
import { JobRecommendation, getScoreBadgeClasses } from '@/lib/jobRecommendation';

interface RecommendedJobCardProps {
  recommendation: JobRecommendation;
  onNotInterested: (jobId: string, reason?: NotInterestedReason) => void;
  onView?: (jobId: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function RecommendedJobCard({
  recommendation,
  onNotInterested,
  onView,
  variant = 'default',
  className,
}: RecommendedJobCardProps) {
  const { job, score, reasons, isNew } = recommendation;
  const [showReasons, setShowReasons] = useState(variant === 'default');
  const [showNotInterestedModal, setShowNotInterestedModal] = useState(false);

  const { isFavorite, toggleFavorite } = useFavoriteJobs();
  const isSaved = isFavorite(job.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(job.id);
  };

  const handleNotInterested = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotInterestedModal(true);
  };

  const handleConfirmNotInterested = (reason?: NotInterestedReason) => {
    onNotInterested(job.id, reason);
  };

  const handleSkipNotInterested = () => {
    onNotInterested(job.id);
  };

  const handleCardClick = () => {
    onView?.(job.id);
  };

  const jobTypeLabel = {
    remote: 'Remoto',
    hybrid: 'Híbrido',
    onsite: 'Presencial',
  }[job.type];

  if (variant === 'compact') {
    return (
      <>
        <div
          className={cn(
            "group relative p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-soft transition-all",
            className
          )}
        >
          {isNew && (
            <Badge className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs">
              Nova
            </Badge>
          )}

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-foreground truncate">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{getDisplayCompanyName(job)}</p>
                </div>
                <Badge className={cn("flex-shrink-0", getScoreBadgeClasses(score))}>
                  {score}%
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />
                  {job.location}
                </span>
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {jobTypeLabel}
                </span>
              </div>

              {/* Motivo principal */}
              {reasons.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
                  <Sparkles className="w-3 h-3" />
                  <span className="truncate">{reasons[0].text}</span>
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center gap-2 mt-3">
                <Button asChild size="sm" variant="default" className="flex-1" onClick={handleCardClick}>
                  <Link to={`/candidato/vagas/${job.id}`}>Ver vaga</Link>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8",
                    isSaved && "text-red-500 hover:text-red-600"
                  )}
                  onClick={handleToggleFavorite}
                  title={isSaved ? "Remover dos salvos" : "Salvar vaga"}
                >
                  <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleNotInterested}
                  title="Não tenho interesse"
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <NotInterestedModal
          open={showNotInterestedModal}
          onOpenChange={setShowNotInterestedModal}
          jobTitle={job.title}
          companyName={getDisplayCompanyName(job)}
          onConfirm={handleConfirmNotInterested}
          onSkip={handleSkipNotInterested}
        />
      </>
    );
  }

  // Variant: default (expandido)
  return (
    <>
      <motion.div
        layout
        className={cn(
          "relative p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-soft transition-all",
          className
        )}
      >
        {isNew && (
          <Badge className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs px-2">
            Nova
          </Badge>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
              <p className="text-muted-foreground">{getDisplayCompanyName(job)}</p>
            </div>
          </div>

          <Badge className={cn("text-sm px-3 py-1", getScoreBadgeClasses(score))}>
            {score}% match
          </Badge>
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1.5" />
            {job.location}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4 mr-1.5" />
            {jobTypeLabel}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1.5" />
            {job.level}
          </span>
        </div>

        {/* Salário */}
        <div className="flex items-center gap-2 mb-4">
          <Banknote className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-secondary">
            R$ {job.salary.min.toLocaleString('pt-BR')} - R$ {job.salary.max.toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Por que recomendamos */}
        {reasons.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setShowReasons(!showReasons)}
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              Por que recomendamos
              {showReasons ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {showReasons && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-3 space-y-2 pl-6">
                    {reasons.map((reason) => (
                      <li
                        key={reason.id}
                        className="relative text-sm text-muted-foreground before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-secondary"
                      >
                        {reason.text}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button asChild className="flex-1" onClick={handleCardClick}>
            <Link to={`/candidato/vagas/${job.id}`}>Ver vaga completa</Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              isSaved && "border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            )}
            onClick={handleToggleFavorite}
            title={isSaved ? "Remover dos salvos" : "Salvar vaga"}
          >
            <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleNotInterested}
            title="Não tenho interesse"
          >
            <ThumbsDown className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      <NotInterestedModal
        open={showNotInterestedModal}
        onOpenChange={setShowNotInterestedModal}
        jobTitle={job.title}
        companyName={getDisplayCompanyName(job)}
        onConfirm={handleConfirmNotInterested}
        onSkip={handleSkipNotInterested}
      />
    </>
  );
}
