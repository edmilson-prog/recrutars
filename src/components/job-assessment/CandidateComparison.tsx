/**
 * CandidateComparison Component
 * PRD-048: Teste por Vaga
 *
 * Comparação lado a lado de candidatos
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  X,
  Trophy,
  TrendingUp,
  TrendingDown,
  Equal,
  BarChart3,
  Radar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ComparisonRadar } from './ComparisonRadar';
import { assessmentCategories } from '@/data/assessmentData';

interface CandidateForComparison {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  overallScore: number;
  competencyScores: Record<string, number>;
  completedAt: string;
}

interface CandidateComparisonProps {
  candidates: CandidateForComparison[];
  competencyIds: string[];
  onRemoveCandidate: (candidateId: string) => void;
  className?: string;
}

const COMPARISON_COLORS = [
  { bg: 'bg-blue-500', text: 'text-blue-500', hex: '#3b82f6' },
  { bg: 'bg-green-500', text: 'text-green-500', hex: '#10b981' },
  { bg: 'bg-amber-500', text: 'text-amber-500', hex: '#f59e0b' },
  { bg: 'bg-purple-500', text: 'text-purple-500', hex: '#8b5cf6' },
];

function getCategoryName(categoryId: string): string {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function CandidateComparison({
  candidates,
  competencyIds,
  onRemoveCandidate,
  className,
}: CandidateComparisonProps) {
  const [activeTab, setActiveTab] = useState('table');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(competencyIds);

  // Candidatos com cores
  const candidatesWithColors = useMemo(() => {
    return candidates.map((c, index) => ({
      ...c,
      color: COMPARISON_COLORS[index % COMPARISON_COLORS.length],
    }));
  }, [candidates]);

  // Ranking por competência
  const competencyRankings = useMemo(() => {
    const rankings: Record<string, { candidateId: string; score: number }[]> = {};

    competencyIds.forEach((compId) => {
      rankings[compId] = candidates
        .map((c) => ({
          candidateId: c.id,
          score: c.competencyScores[compId] || 0,
        }))
        .sort((a, b) => b.score - a.score);
    });

    return rankings;
  }, [candidates, competencyIds]);

  // Ranking geral
  const overallRanking = useMemo(() => {
    return [...candidates].sort((a, b) => b.overallScore - a.overallScore);
  }, [candidates]);

  // Toggle competency
  const toggleCompetency = (compId: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(compId)
        ? prev.filter((id) => id !== compId)
        : [...prev, compId]
    );
  };

  if (candidates.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <Users className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum candidato selecionado
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecione candidatos na lista para comparar
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Selected candidates header */}
      <div className="flex flex-wrap gap-3">
        {candidatesWithColors.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border',
              `border-${candidate.color.text.replace('text-', '')}/30`
            )}
            style={{
              borderColor: `${candidate.color.hex}30`,
              backgroundColor: `${candidate.color.hex}10`,
            }}
          >
            <div
              className={cn('w-3 h-3 rounded-full', candidate.color.bg)}
            />
            <Avatar className="w-6 h-6">
              <AvatarImage src={candidate.avatar} />
              <AvatarFallback className="text-xs">
                {candidate.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">
              {candidate.name}
            </span>
            <Badge variant="outline" className={candidate.color.text}>
              {candidate.overallScore}%
            </Badge>
            <button
              onClick={() => onRemoveCandidate(candidate.id)}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Winner highlight */}
      {candidates.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-500" />
            <div>
              <h4 className="font-semibold text-foreground">
                Melhor candidato geral
              </h4>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {overallRanking[0].name}
                </span>{' '}
                com score de{' '}
                <span className="font-bold text-amber-500">
                  {overallRanking[0].overallScore}%
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Tabela
          </TabsTrigger>
          <TabsTrigger value="radar" className="flex items-center gap-2">
            <Radar className="w-4 h-4" />
            Radar
          </TabsTrigger>
        </TabsList>

        {/* Table view */}
        <TabsContent value="table" className="space-y-4">
          {/* Competency filter */}
          <div className="flex flex-wrap gap-2">
            {competencyIds.map((compId) => (
              <label
                key={compId}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selectedCompetencies.includes(compId)}
                  onCheckedChange={() => toggleCompetency(compId)}
                />
                <span className="text-muted-foreground">
                  {getCategoryName(compId)}
                </span>
              </label>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-card rounded-xl border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_repeat(var(--cols),minmax(100px,1fr))] gap-2 p-3 bg-muted/50 border-b"
              style={{ '--cols': candidates.length } as React.CSSProperties}
            >
              <div className="font-medium text-muted-foreground">
                Competência
              </div>
              {candidatesWithColors.map((c) => (
                <div
                  key={c.id}
                  className="font-medium text-center truncate"
                  style={{ color: c.color.hex }}
                >
                  {c.name.split(' ')[0]}
                </div>
              ))}
            </div>

            {/* Overall score row */}
            <div
              className="grid grid-cols-[1fr_repeat(var(--cols),minmax(100px,1fr))] gap-2 p-3 border-b bg-primary/5"
              style={{ '--cols': candidates.length } as React.CSSProperties}
            >
              <div className="font-semibold text-foreground">Score Geral</div>
              {candidatesWithColors.map((c) => {
                const rank = overallRanking.findIndex((r) => r.id === c.id) + 1;
                return (
                  <div
                    key={c.id}
                    className="text-center font-bold"
                    style={{ color: c.color.hex }}
                  >
                    {c.overallScore}%
                    {rank === 1 && candidates.length > 1 && (
                      <Trophy className="w-4 h-4 inline ml-1 text-amber-500" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Competency rows */}
            {selectedCompetencies.map((compId) => {
              const ranking = competencyRankings[compId];
              const maxScore = ranking[0]?.score || 0;
              const minScore = ranking[ranking.length - 1]?.score || 0;

              return (
                <div
                  key={compId}
                  className="grid grid-cols-[1fr_repeat(var(--cols),minmax(100px,1fr))] gap-2 p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  style={{ '--cols': candidates.length } as React.CSSProperties}
                >
                  <div className="text-sm text-foreground">
                    {getCategoryName(compId)}
                  </div>
                  {candidatesWithColors.map((c) => {
                    const score = c.competencyScores[compId] || 0;
                    const isMax = score === maxScore && candidates.length > 1;
                    const isMin = score === minScore && candidates.length > 1 && maxScore !== minScore;

                    return (
                      <div key={c.id} className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isMax && 'text-success',
                              isMin && 'text-destructive',
                              !isMax && !isMin && 'text-foreground'
                            )}
                          >
                            {score}%
                          </span>
                          {isMax && (
                            <TrendingUp className="w-3 h-3 text-success" />
                          )}
                          {isMin && (
                            <TrendingDown className="w-3 h-3 text-destructive" />
                          )}
                        </div>
                        <Progress
                          value={score}
                          className="h-1 mt-1"
                          style={{
                            '--progress-color': c.color.hex,
                          } as React.CSSProperties}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Radar view */}
        <TabsContent value="radar">
          <div className="bg-card rounded-xl border p-4">
            <ComparisonRadar
              candidates={candidatesWithColors.map((c) => ({
                id: c.id,
                name: c.name,
                color: c.color.hex,
                scores: c.competencyScores,
              }))}
              competencyIds={selectedCompetencies}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
