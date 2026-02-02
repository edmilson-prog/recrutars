/**
 * Differential Highlights
 * PRD-053: Destaques automáticos de diferenciais
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { CompanyTestResult } from '@/types/companyTest';

interface DifferentialHighlightsProps {
  results: CompanyTestResult[];
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export function DifferentialHighlights({ results }: DifferentialHighlightsProps) {
  if (results.length < 2) return null;

  const highlights: string[] = [];

  // Find highest and lowest per dimension
  DIMENSIONS.forEach(dim => {
    const sorted = [...results].sort((a, b) => b.scores[dim] - a.scores[dim]);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const diff = top.scores[dim] - bottom.scores[dim];

    if (diff > 20) {
      highlights.push(
        `Em ${DIMENSION_SHORT_NAMES[dim]}, ${top.candidateName} (${top.scores[dim]}) supera ${bottom.candidateName} (${bottom.scores[dim]}) por ${diff} pontos.`
      );
    }
  });

  // Find best fit
  const byFit = [...results].filter(r => r.fitScore !== undefined).sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));
  if (byFit.length >= 2 && byFit[0].fitScore && byFit[1].fitScore) {
    const diff = byFit[0].fitScore - byFit[1].fitScore;
    if (diff > 5) {
      highlights.push(
        `${byFit[0].candidateName} tem o melhor Fit Score (${byFit[0].fitScore.toFixed(1)}%), ${diff.toFixed(1)} pontos acima de ${byFit[1].candidateName}.`
      );
    }
  }

  // Find complementary profiles
  if (results.length >= 2) {
    const archetypes = results.map(r => r.archetype.name);
    if (new Set(archetypes).size === archetypes.length) {
      highlights.push('Todos os candidatos apresentam perfis arquetipais distintos, oferecendo diversidade comportamental.');
    }
  }

  if (highlights.length === 0) {
    highlights.push('Os candidatos apresentam perfis relativamente similares nas dimensões avaliadas.');
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Destaques do Comparativo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {highlights.map((h, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-amber-500 font-bold shrink-0">•</span>
              {h}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
