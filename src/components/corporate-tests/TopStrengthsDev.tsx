/**
 * Top Strengths & Development Areas
 * PRD-053: Top 3 forças + Top 2 áreas de desenvolvimento
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target } from 'lucide-react';

interface TopStrengthsDevProps {
  strengths: string[];
  developmentAreas: string[];
}

export function TopStrengthsDev({ strengths, developmentAreas }: TopStrengthsDevProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Principais Forças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {strengths.slice(0, 3).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 font-bold mt-0.5">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-amber-500" />
            Áreas de Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {developmentAreas.slice(0, 2).map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 font-bold mt-0.5">{i + 1}.</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
