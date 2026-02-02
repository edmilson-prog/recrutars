/**
 * Comparison View
 * PRD-053: Visão comparativa completa
 */

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ComparisonRadarOverlay } from './ComparisonRadarOverlay';
import { ComparisonTable } from './ComparisonTable';
import { DifferentialHighlights } from './DifferentialHighlights';
import { CompatibilityRanking } from './CompatibilityRanking';
import { ShortlistPanel } from './ShortlistPanel';
import type { CompanyTest, CompanyTestResult } from '@/types/companyTest';

interface ComparisonViewProps {
  test: CompanyTest;
  results: CompanyTestResult[];
}

export function ComparisonView({ test, results }: ComparisonViewProps) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    results.slice(0, Math.min(4, results.length)).forEach(r => initial.add(r.id));
    return initial;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 2) next.delete(id);
      } else {
        if (next.size < 4) next.add(id);
      }
      return next;
    });
  };

  const selectedResults = results.filter(r => selected.has(r.id));

  return (
    <div className="space-y-6">
      {/* Selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Selecione 2-4 candidatos para comparar ({selected.size} selecionados)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {results.map(r => {
              const isSelected = selected.has(r.id);
              const initials = r.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2);
              return (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(r.id)}
                    disabled={!isSelected && selected.size >= 4}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{r.archetype.name}</p>
                  </div>
                  {r.fitScore !== undefined && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {r.fitScore.toFixed(0)}%
                    </Badge>
                  )}
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedResults.length >= 2 && (
        <>
          {/* Radar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Radar Sobreposto</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonRadarOverlay results={selectedResults} />
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comparativo por Dimensão</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonTable results={selectedResults} />
            </CardContent>
          </Card>

          {/* Highlights */}
          <DifferentialHighlights results={selectedResults} />

          {/* Ranking */}
          <CompatibilityRanking results={selectedResults} />

          {/* Shortlist */}
          <ShortlistPanel results={results} />
        </>
      )}
    </div>
  );
}
