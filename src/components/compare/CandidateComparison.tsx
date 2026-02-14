/**
 * Candidate Comparison Component
 * PRD-002-dgn: Visualização Comportamental e Match Score
 *
 * Layout lado a lado para comparar até 3 candidatos
 * Inclui cards com radar mini, match score e tabela de métricas
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CandidateForComparison } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DISCRadarChartMini } from "../disc/DISCRadarChart";
import { MatchScoreCircle } from "../match/MatchScoreCircle";
import { ComparisonTable } from "./ComparisonTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  GitCompare,
  CalendarPlus,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Send,
} from "lucide-react";
import { getMatchScoreColor } from "@/types/disc";
import { getCandidateInitials } from "@/lib/candidateDisplayName";

interface CandidateComparisonProps {
  candidates: CandidateForComparison[];
  onClose?: () => void;
  onInviteToInterview?: (candidateId: string) => void;
  onContactCandidate?: (candidateId: string) => void;
  className?: string;
}

export function CandidateComparison({
  candidates,
  onClose,
  onInviteToInterview,
  onContactCandidate,
  className,
}: CandidateComparisonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  if (candidates.length < 2) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Selecione pelo menos 2 candidatos para comparar
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitCompare className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">
            Comparando {candidates.length} Candidatos
          </h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Cards de candidatos lado a lado */}
      <div
        className={cn(
          "grid gap-4",
          candidates.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-3"
        )}
      >
        {candidates.map((candidate, index) => {
          const colors = getMatchScoreColor(candidate.matchScore);

          return (
            <motion.div
              key={candidate.id}
              initial={
                prefersReducedMotion
                  ? {}
                  : { opacity: 0, y: 20 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  {/* Avatar e info básica */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarImage
                        src={candidate.avatar}
                        alt={candidate.name}
                      />
                      <AvatarFallback className="text-lg">
                        {getCandidateInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    {candidate.currentRole && (
                      <p className="text-sm text-muted-foreground">{candidate.currentRole}</p>
                    )}
                    <Badge
                      className={cn(
                        "mt-2",
                        colors.bg,
                        colors.text,
                        "border-0"
                      )}
                    >
                      {candidate.matchScore}% Match
                    </Badge>
                  </div>

                  {/* PRD-031: Informações adicionais */}
                  <div className="space-y-2 mb-4 text-sm">
                    {candidate.experienceYears !== undefined && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        <span>{candidate.experienceYears} {candidate.experienceYears === 1 ? "ano" : "anos"} de experiência</span>
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{candidate.location}</span>
                      </div>
                    )}
                    {candidate.salary && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>R$ {candidate.salary.min.toLocaleString("pt-BR")} - {candidate.salary.max.toLocaleString("pt-BR")}</span>
                      </div>
                    )}
                    {candidate.availability && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{candidate.availability}</span>
                      </div>
                    )}
                  </div>

                  {/* PRD-031: Habilidades top 5 */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Habilidades</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Radar comportamental mini */}
                  <div className="flex justify-center mb-4">
                    <DISCRadarChartMini
                      profile={candidate.behavioralProfile}
                      className="w-40 h-40"
                    />
                  </div>

                  {/* Scores comportamentais */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                    <div>
                      <div className="font-semibold text-red-600">D</div>
                      <div>{candidate.behavioralProfile.d}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-yellow-600">I</div>
                      <div>{candidate.behavioralProfile.i}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">S</div>
                      <div>{candidate.behavioralProfile.s}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600">C</div>
                      <div>{candidate.behavioralProfile.c}</div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    {onInviteToInterview && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => onInviteToInterview(candidate.id)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Convidar
                      </Button>
                    )}
                    {onContactCandidate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onContactCandidate(candidate.id)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabela de comparação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparação Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonTable
            candidates={candidates}
            showOnlyDifferences={showOnlyDifferences}
            onToggleDifferences={setShowOnlyDifferences}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Modal de comparação
interface CandidateComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: CandidateForComparison[];
  onInviteToInterview?: (candidateId: string) => void;
  onContactCandidate?: (candidateId: string) => void;
}

export function CandidateComparisonModal({
  open,
  onOpenChange,
  candidates,
  onInviteToInterview,
  onContactCandidate,
}: CandidateComparisonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="sr-only">Comparação de Candidatos</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[80vh]">
          <CandidateComparison
            candidates={candidates}
            onClose={() => onOpenChange(false)}
            onInviteToInterview={onInviteToInterview}
            onContactCandidate={onContactCandidate}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Botão de ação para comparar candidatos
interface CompareButtonProps {
  selectedCount: number;
  maxCount?: number;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function CompareButton({
  selectedCount,
  maxCount = 3,
  onClick,
  disabled,
  className,
}: CompareButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || selectedCount < 2}
      className={cn("gap-2", className)}
    >
      <GitCompare className="w-4 h-4" />
      Comparar
      {selectedCount > 0 && (
        <Badge variant="secondary" className="ml-1">
          {selectedCount}
        </Badge>
      )}
    </Button>
  );
}

// Resumo de comparação para preview
export function ComparisonSummary({
  candidates,
  className,
}: {
  candidates: CandidateForComparison[];
  className?: string;
}) {
  if (candidates.length === 0) return null;

  // Encontrar candidato com maior match
  const topCandidate = candidates.reduce((prev, current) =>
    current.matchScore > prev.matchScore ? current : prev
  );

  return (
    <div className={cn("flex items-center gap-4 p-4 bg-muted/50 rounded-lg", className)}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={topCandidate.avatar} alt={topCandidate.name} />
        <AvatarFallback>
          {getCandidateInitials(topCandidate.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium">{topCandidate.name}</p>
        <p className="text-sm text-muted-foreground">
          Maior match entre os selecionados
        </p>
      </div>
      <Badge
        className={cn(
          getMatchScoreColor(topCandidate.matchScore).bg,
          getMatchScoreColor(topCandidate.matchScore).text,
          "border-0"
        )}
      >
        {topCandidate.matchScore}%
      </Badge>
    </div>
  );
}
