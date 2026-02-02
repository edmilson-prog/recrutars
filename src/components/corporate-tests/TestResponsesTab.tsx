/**
 * Test Responses Tab
 * Reconstructed mock responses: word selections + scenario answers
 */

import { Info, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateMockResponses } from '@/utils/mockResponseGenerator';
import { DIMENSION_SHORT_NAMES, type DimensionScores, type GaugeProDimension } from '@/types/gaugePro';

interface TestResponsesTabProps {
  candidateId: string;
  scores: DimensionScores;
}

const PERSPECTIVES = { self: 'Auto-percepção', others: 'Percepção de terceiros' } as const;

const DIMENSION_COLORS: Record<GaugeProDimension, string> = {
  D1: '#ef4444',
  D2: '#f59e0b',
  D3: '#22c55e',
  D4: '#3b82f6',
  D5: '#a855f7',
};

export function TestResponsesTab({ candidateId, scores }: TestResponsesTabProps) {
  const responses = generateMockResponses(candidateId, scores);

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-dashed">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Reconstrução baseada nos scores finais. As respostas exibidas representam a seleção mais provável
          dado o perfil comportamental resultante do candidato.
        </p>
      </div>

      {/* Part 1: Word Selections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Parte 1 — Seleção de Palavras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {(['D1', 'D2', 'D3', 'D4', 'D5'] as GaugeProDimension[]).map(dim => {
            const dimSelections = responses.wordSelections.filter(ws => ws.dimension === dim);
            const color = DIMENSION_COLORS[dim];

            return (
              <div key={dim} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium">
                    {dim} — {DIMENSION_SHORT_NAMES[dim]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (Score: {scores[dim]})
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 pl-4">
                  {dimSelections.map(ws => (
                    <div key={`${ws.dimension}-${ws.perspective}`}>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {PERSPECTIVES[ws.perspective]}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ws.selectedWords.map(word => (
                          <Badge
                            key={word.id}
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: word.polarity === 'high' ? '#22c55e' : '#f59e0b',
                              color: word.polarity === 'high' ? '#16a34a' : '#ca8a04',
                              backgroundColor: word.polarity === 'high' ? '#f0fdf4' : '#fefce8',
                            }}
                          >
                            {word.text}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Part 2: Scenarios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Parte 2 — Cenários Situacionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {responses.scenarioResponses.map((scenario, idx) => (
            <div key={scenario.scenarioId} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium">{scenario.scenarioTitle}</span>
              </div>
              <p className="text-xs text-muted-foreground pl-7">{scenario.situation}</p>
              <div className="space-y-1.5 pl-7">
                {scenario.allOptions.map(opt => (
                  <div
                    key={opt.key}
                    className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                      opt.isSelected
                        ? 'bg-primary/5 border border-primary/20'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {opt.isSelected ? (
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 shrink-0 text-center text-xs text-muted-foreground/50 mt-0.5">
                        {opt.key}
                      </span>
                    )}
                    <span className={opt.isSelected ? 'font-medium text-foreground' : ''}>
                      {opt.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
