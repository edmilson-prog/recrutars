/**
 * GaugeProResponsesCard
 * v1.13.3: Exibe as respostas REAIS do teste comportamental Gauge-Pro
 * v1.13.4: Estatisticas e metadados (duracao, data, contagens)
 *
 * Part 1: Palavras selecionadas por dimensao (self + others)
 * Part 2: Cenarios situacionais com opcao escolhida
 */

import { useState } from 'react';
import { Calendar, Check, ChevronDown, ChevronUp, Clock, Eye, ListChecks, Timer, Type, User2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { GAUGE_PRO_ADJECTIVES } from '@/data/gaugeProWords';
import { GAUGE_PRO_SCENARIOS } from '@/data/gaugeProScenarios';
import { DIMENSION_NAMES, DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type {
  GaugeProAssessment,
  GaugeProResult,
  GaugeProDimension,
  AdjectiveWord,
} from '@/types/gaugePro';

interface GaugeProResponsesCardProps {
  assessment: GaugeProAssessment;
  result: GaugeProResult;
}

// Build lookup map once
const wordsById = new Map<number, AdjectiveWord>(
  GAUGE_PRO_ADJECTIVES.map((w) => [w.id, w])
);

const DIMENSION_ORDER: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const dimensionBarColors: Record<GaugeProDimension, string> = {
  D1: 'bg-red-500',
  D2: 'bg-amber-500',
  D3: 'bg-green-500',
  D4: 'bg-blue-500',
  D5: 'bg-violet-500',
};

const dimensionBadgeColors: Record<GaugeProDimension, { high: string; low: string }> = {
  D1: { high: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', low: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-500' },
  D2: { high: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', low: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500' },
  D3: { high: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400', low: 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-500' },
  D4: { high: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', low: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-500' },
  D5: { high: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400', low: 'bg-violet-50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-500' },
};

// --- Helpers ---

function formatDuration(startISO?: string, endISO?: string): string {
  if (!startISO || !endISO) return '—';
  const diffMs = new Date(endISO).getTime() - new Date(startISO).getTime();
  if (diffMs <= 0) return '—';
  const totalSec = Math.floor(diffMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} seg`;
  return `${min} min ${sec} seg`;
}

function formatDateTime(isoString?: string): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} às ${time}`;
}

export function GaugeProResponsesCard({ assessment, result }: GaugeProResponsesCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group word responses by dimension
  const wordsByDimension = new Map<GaugeProDimension, { self: number[]; others: number[] }>();
  for (const dim of DIMENSION_ORDER) {
    wordsByDimension.set(dim, { self: [], others: [] });
  }
  for (const step of assessment.wordStepResponses) {
    const entry = wordsByDimension.get(step.dimension);
    if (entry) {
      entry[step.perspective] = step.selectedWordIds;
    }
  }

  // Stats
  const totalWordsSelected = assessment.wordStepResponses.reduce(
    (sum, step) => sum + step.selectedWordIds.length, 0
  );
  const totalScenariosAnswered = assessment.scenarioResponses.length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Respostas do Teste
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                {isOpen ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Ocultar respostas
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Ver respostas detalhadas
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Stats Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Realizado em
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDateTime(assessment.completedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Duração total
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDuration(assessment.startedAt, assessment.completedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    Parte 1 (Palavras)
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDuration(assessment.part1StartedAt, assessment.part1CompletedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    Parte 2 (Cenários)
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDuration(assessment.part2StartedAt, assessment.part2CompletedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Type className="w-3.5 h-3.5" />
                    Palavras selecionadas
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {totalWordsSelected} <span className="text-xs font-normal text-muted-foreground">de 100</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5" />
                    Cenários respondidos
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {totalScenariosAnswered} <span className="text-xs font-normal text-muted-foreground">de 15</span>
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Part 1: Word Selections */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</span>
                Seleção de Palavras
                <span className="text-xs font-normal text-muted-foreground">
                  ({formatDuration(assessment.part1StartedAt, assessment.part1CompletedAt)})
                </span>
              </h3>

              <div className="space-y-4">
                {DIMENSION_ORDER.map((dim) => {
                  const entry = wordsByDimension.get(dim)!;
                  const score = result.finalScores[dim];
                  const classification = result.classifications[dim];

                  return (
                    <div key={dim} className="border rounded-lg p-3 space-y-3">
                      {/* Dimension header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-5 rounded-full', dimensionBarColors[dim])} />
                          <span className="text-sm font-medium">{DIMENSION_SHORT_NAMES[dim]}</span>
                          <span className="text-xs text-muted-foreground">{DIMENSION_NAMES[dim]}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold">{score}%</span>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {classification === 'low' ? 'Baixo' : classification === 'medium' ? 'Médio' : 'Alto'}
                          </Badge>
                        </div>
                      </div>

                      {/* Self + Others */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Self */}
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User2 className="w-3 h-3" />
                            Auto-percepção
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.self.length > 0 ? entry.self.map((wordId) => {
                              const word = wordsById.get(wordId);
                              if (!word) return null;
                              const colors = dimensionBadgeColors[dim][word.polarity];
                              return (
                                <span
                                  key={wordId}
                                  className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colors)}
                                >
                                  {word.text}
                                </span>
                              );
                            }) : (
                              <span className="text-xs text-muted-foreground italic">Nenhuma palavra selecionada</span>
                            )}
                          </div>
                        </div>

                        {/* Others */}
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Percepção de terceiros
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.others.length > 0 ? entry.others.map((wordId) => {
                              const word = wordsById.get(wordId);
                              if (!word) return null;
                              const colors = dimensionBadgeColors[dim][word.polarity];
                              return (
                                <span
                                  key={wordId}
                                  className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colors)}
                                >
                                  {word.text}
                                </span>
                              );
                            }) : (
                              <span className="text-xs text-muted-foreground italic">Nenhuma palavra selecionada</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Part 2: Scenario Responses */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</span>
                Cenários Situacionais
                <span className="text-xs font-normal text-muted-foreground">
                  ({formatDuration(assessment.part2StartedAt, assessment.part2CompletedAt)})
                </span>
              </h3>

              <div className="space-y-3">
                {GAUGE_PRO_SCENARIOS.map((scenario) => {
                  const response = assessment.scenarioResponses.find(
                    (r) => r.scenarioId === scenario.id
                  );
                  const selectedKey = response?.selectedOption;

                  return (
                    <div key={scenario.id} className="border rounded-lg p-3 space-y-2">
                      {/* Scenario header */}
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                          {scenario.order}
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{scenario.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{scenario.situation}</p>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 ml-8">
                        {scenario.options.map((option) => {
                          const isSelected = option.key === selectedKey;
                          return (
                            <div
                              key={option.key}
                              className={cn(
                                'flex items-start gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                                isSelected
                                  ? 'bg-primary/5 border border-primary/20'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                              ) : (
                                <span className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-center font-medium opacity-50">
                                  {option.key}
                                </span>
                              )}
                              <span className={cn(isSelected && 'text-foreground font-medium')}>
                                {option.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
