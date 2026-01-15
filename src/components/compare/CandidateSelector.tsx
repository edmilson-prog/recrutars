/**
 * Candidate Selector Component
 * PRD-002-dgn: Visualização DISC e Match Score
 *
 * Permite selecionar até 3 candidatos para comparação
 * Usado na lista de candidatos da empresa
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { CandidateForComparison } from "@/types/disc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getMatchScoreColor } from "@/types/disc";
import { Users, X, GitCompare } from "lucide-react";

const MAX_CANDIDATES = 3;

interface CandidateSelectorProps {
  candidates: CandidateForComparison[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCompare?: () => void;
  className?: string;
}

export function CandidateSelector({
  candidates,
  selectedIds,
  onSelectionChange,
  onCompare,
  className,
}: CandidateSelectorProps) {
  const prefersReducedMotion = useReducedMotion();

  const toggleCandidate = (candidateId: string) => {
    if (selectedIds.includes(candidateId)) {
      onSelectionChange(selectedIds.filter((id) => id !== candidateId));
    } else if (selectedIds.length < MAX_CANDIDATES) {
      onSelectionChange([...selectedIds, candidateId]);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const selectedCandidates = candidates.filter((c) =>
    selectedIds.includes(c.id)
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Lista de candidatos com checkboxes */}
      <div className="space-y-2">
        {candidates.map((candidate) => {
          const isSelected = selectedIds.includes(candidate.id);
          const isDisabled =
            !isSelected && selectedIds.length >= MAX_CANDIDATES;
          const colors = getMatchScoreColor(candidate.matchScore);

          return (
            <div
              key={candidate.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                isSelected
                  ? "bg-primary/5 border-primary"
                  : "hover:bg-muted/50",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && toggleCandidate(candidate.id)}
            >
              <Checkbox
                checked={isSelected}
                disabled={isDisabled}
                onCheckedChange={() => toggleCandidate(candidate.id)}
              />
              <Avatar className="h-10 w-10">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback>
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{candidate.name}</p>
              </div>
              <Badge className={cn(colors.bg, colors.text, "border-0")}>
                {candidate.matchScore}%
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Mensagem de limite */}
      {selectedIds.length >= MAX_CANDIDATES && (
        <p className="text-xs text-muted-foreground text-center">
          Máximo de {MAX_CANDIDATES} candidatos para comparação
        </p>
      )}
    </div>
  );
}

// Barra fixa de seleção (para uso em listas)
interface SelectionBarProps {
  selectedCandidates: CandidateForComparison[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  className?: string;
}

export function SelectionBar({
  selectedCandidates,
  onRemove,
  onClear,
  onCompare,
  className,
}: SelectionBarProps) {
  const prefersReducedMotion = useReducedMotion();

  if (selectedCandidates.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
          "bg-background/95 backdrop-blur-sm border shadow-lg rounded-full",
          "px-4 py-2 flex items-center gap-3",
          className
        )}
        initial={prefersReducedMotion ? {} : { y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {selectedCandidates.length} selecionado
          {selectedCandidates.length > 1 ? "s" : ""}
        </span>

        {/* Avatars dos selecionados */}
        <div className="flex -space-x-2">
          {selectedCandidates.map((candidate) => (
            <div key={candidate.id} className="relative group">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="text-xs">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full hidden group-hover:flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(candidate.id);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground"
        >
          Limpar
        </Button>

        <Button
          size="sm"
          onClick={onCompare}
          disabled={selectedCandidates.length < 2}
          className="gap-2"
        >
          <GitCompare className="w-4 h-4" />
          Comparar
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook para gerenciar seleção de candidatos
export function useCandidateSelection(maxCandidates = MAX_CANDIDATES) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleCandidate = (candidateId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      }
      if (prev.length >= maxCandidates) {
        return prev;
      }
      return [...prev, candidateId];
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (candidateId: string) => selectedIds.includes(candidateId);

  const canSelect = selectedIds.length < maxCandidates;

  return {
    selectedIds,
    setSelectedIds,
    toggleCandidate,
    clearSelection,
    isSelected,
    canSelect,
    selectedCount: selectedIds.length,
  };
}
