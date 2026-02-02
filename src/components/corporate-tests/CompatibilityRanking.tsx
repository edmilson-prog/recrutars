/**
 * Compatibility Ranking
 * PRD-053: Ranking por Score de Fit
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal } from 'lucide-react';
import { GaugeProRadarChart } from './GaugeProRadarChart';
import { FitScoreDisplay } from './FitScoreDisplay';
import type { CompanyTestResult } from '@/types/companyTest';

interface CompatibilityRankingProps {
  results: CompanyTestResult[];
}

export function CompatibilityRanking({ results }: CompatibilityRankingProps) {
  const ranked = [...results]
    .filter(r => r.fitScore !== undefined)
    .sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));

  if (ranked.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="h-4 w-4 text-amber-500" />
          Ranking de Compatibilidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ranked.map((r, i) => {
            const initials = r.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2);
            return (
              <div
                key={r.id}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  i === 0 ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                  {i === 0 ? (
                    <Medal className="h-5 w-5 text-amber-500" />
                  ) : (
                    <span className="text-muted-foreground">#{i + 1}</span>
                  )}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{r.candidateName}</p>
                    {i === 0 && (
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{r.archetype.name}</p>
                </div>

                {r.fitScore !== undefined && r.fitClassification && (
                  <FitScoreDisplay score={r.fitScore} classification={r.fitClassification} compact />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
