/**
 * Card de Candidato Sugerido
 * PRD-037: Exibe candidato sugerido com motivos personalizados
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Briefcase,
  Heart,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Mail,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFavoriteCandidates } from '@/hooks/useFavoriteCandidates';
import { NotSuitableReason } from '@/lib/candidateRecommendation';
import { NotSuitableModal } from './NotSuitableModal';
import { CandidateRecommendation, getCandidateScoreBadgeClasses } from '@/lib/candidateRecommendation';

interface SuggestedCandidateCardProps {
  recommendation: CandidateRecommendation;
  jobId: string;
  onNotSuitable: (candidateId: string, reason?: NotSuitableReason) => void;
  onInvite?: (candidateId: string) => void;
  onView?: (candidateId: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function SuggestedCandidateCard({
  recommendation,
  jobId,
  onNotSuitable,
  onInvite,
  onView,
  variant = 'default',
  className,
}: SuggestedCandidateCardProps) {
  const { candidate, score, reasons, isNew } = recommendation;
  const [showReasons, setShowReasons] = useState(variant === 'default');
  const [showNotSuitableModal, setShowNotSuitableModal] = useState(false);

  const { isFavorite, toggleFavorite } = useFavoriteCandidates();
  const isSaved = isFavorite(candidate.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(candidate.id, candidate.name);
  };

  const handleNotSuitable = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotSuitableModal(true);
  };

  const handleConfirmNotSuitable = (reason?: NotSuitableReason) => {
    onNotSuitable(candidate.id, reason);
  };

  const handleSkipNotSuitable = () => {
    onNotSuitable(candidate.id);
  };

  const handleCardClick = () => {
    onView?.(candidate.id);
  };

  const handleInvite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onInvite?.(candidate.id);
  };

  // Obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

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
              Novo
            </Badge>
          )}

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {candidate.avatar ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-primary">
                  {getInitials(candidate.name)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-foreground truncate">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.title}</p>
                </div>
                <Badge className={cn("flex-shrink-0", getCandidateScoreBadgeClasses(score))}>
                  {score}%
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />
                  {candidate.location}
                </span>
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {candidate.experience} anos
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
                  <Link to={`/empresa/candidatos/${candidate.id}`}>Ver perfil</Link>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8",
                    isSaved && "text-red-500 hover:text-red-600"
                  )}
                  onClick={handleToggleFavorite}
                  title={isSaved ? "Remover dos salvos" : "Salvar candidato"}
                >
                  <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleNotSuitable}
                  title="Não adequado"
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <NotSuitableModal
          open={showNotSuitableModal}
          onOpenChange={setShowNotSuitableModal}
          candidateName={candidate.name}
          candidateTitle={candidate.title}
          onConfirm={handleConfirmNotSuitable}
          onSkip={handleSkipNotSuitable}
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
            Novo
          </Badge>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {candidate.avatar ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {getInitials(candidate.name)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{candidate.name}</h3>
              <p className="text-muted-foreground">{candidate.title}</p>
            </div>
          </div>

          <Badge className={cn("text-sm px-3 py-1", getCandidateScoreBadgeClasses(score))}>
            {score}% match
          </Badge>
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1.5" />
            {candidate.location}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4 mr-1.5" />
            {candidate.experience} anos de exp.
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4 mr-1.5" />
            {candidate.education}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1.5" />
            {candidate.availability}
          </span>
        </div>

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {candidate.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 5 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{candidate.skills.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* Por que sugerimos */}
        {reasons.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setShowReasons(!showReasons)}
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              Por que sugerimos
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
            <Link to={`/empresa/candidatos/${candidate.id}`}>Ver perfil completo</Link>
          </Button>

          {onInvite && (
            <Button variant="outline" onClick={handleInvite}>
              <Mail className="w-4 h-4 mr-2" />
              Convidar
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className={cn(
              isSaved && "border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            )}
            onClick={handleToggleFavorite}
            title={isSaved ? "Remover dos salvos" : "Salvar candidato"}
          >
            <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleNotSuitable}
            title="Não adequado"
          >
            <ThumbsDown className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      <NotSuitableModal
        open={showNotSuitableModal}
        onOpenChange={setShowNotSuitableModal}
        candidateName={candidate.name}
        candidateTitle={candidate.title}
        onConfirm={handleConfirmNotSuitable}
        onSkip={handleSkipNotSuitable}
      />
    </>
  );
}
