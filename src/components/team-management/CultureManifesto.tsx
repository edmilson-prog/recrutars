/**
 * Culture Manifesto Card
 * PRD-057: Exibicao do manifesto cultural gerado automaticamente
 */

import { Scroll } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension, type DimensionScores } from '@/types/gaugePro';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CultureManifestoProps {
  manifesto: string;
  dnaScores: DimensionScores;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const DIMENSION_COLORS: Record<GaugeProDimension, string> = {
  D1: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  D2: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  D3: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  D4: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  D5: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CultureManifesto({ manifesto, dnaScores }: CultureManifestoProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Scroll className="h-5 w-5 text-cyan-600" />
          <CardTitle className="text-base">Manifesto Cultural</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manifesto text */}
        <div className="relative bg-muted/50 rounded-lg p-5">
          <span
            className="absolute top-2 left-3 text-4xl text-muted-foreground/20 font-serif leading-none select-none"
            aria-hidden
          >
            &ldquo;
          </span>
          <p className="text-sm italic leading-relaxed text-foreground/90 pl-4 pr-2">
            {manifesto}
          </p>
          <span
            className="absolute bottom-1 right-4 text-4xl text-muted-foreground/20 font-serif leading-none select-none"
            aria-hidden
          >
            &rdquo;
          </span>
        </div>

        {/* DNA dimension badges */}
        <div className="flex flex-wrap gap-2">
          {DIMENSIONS.map((dim) => (
            <Badge
              key={dim}
              variant="secondary"
              className={cn(
                'text-xs font-medium tabular-nums border-0',
                DIMENSION_COLORS[dim],
              )}
            >
              {DIMENSION_SHORT_NAMES[dim]}: {Math.round(dnaScores[dim])}
            </Badge>
          ))}
        </div>

        {/* Auto-generated label */}
        <p className="text-xs text-muted-foreground">
          Gerado automaticamente a partir dos perfis comportamentais da equipe
        </p>
      </CardContent>
    </Card>
  );
}
