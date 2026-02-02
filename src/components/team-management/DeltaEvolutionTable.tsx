/**
 * DeltaEvolutionTable
 * PRD-057: Tabela de analise de evolucao delta entre primeiro e ultimo teste.
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, BarChart3 } from 'lucide-react';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { TestHistoryEntry } from '@/types/teamManagement';

interface DeltaEvolutionTableProps {
  history: TestHistoryEntry[];
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export default function DeltaEvolutionTable({ history }: DeltaEvolutionTableProps) {
  const sorted = useMemo(() => {
    return [...history].sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    );
  }, [history]);

  const firstTest = sorted[0];
  const lastTest = sorted[sorted.length - 1];

  if (!firstTest || !lastTest || sorted.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Análise de Evolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            São necessários pelo menos 2 testes para análise de evolução.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Análise de Evolução
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dimensão</TableHead>
              <TableHead className="text-center">Primeiro Teste</TableHead>
              <TableHead className="text-center">Último Teste</TableHead>
              <TableHead className="text-center">Delta</TableHead>
              <TableHead className="text-center">Tendência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DIMENSIONS.map((dim) => {
              const first = firstTest.scores[dim];
              const last = lastTest.scores[dim];
              const delta = last - first;

              let deltaColor: string;
              let DeltaIcon: typeof ArrowUp;
              let trend: string;
              let trendColor: string;

              if (delta > 0) {
                deltaColor = 'text-green-600';
                DeltaIcon = ArrowUp;
                trend = 'Evolução';
                trendColor = 'bg-green-100 text-green-700 border-green-200';
              } else if (delta < 0) {
                deltaColor = 'text-red-600';
                DeltaIcon = ArrowDown;
                trend = 'Regressão';
                trendColor = 'bg-red-100 text-red-700 border-red-200';
              } else {
                deltaColor = 'text-gray-500';
                DeltaIcon = Minus;
                trend = 'Estável';
                trendColor = 'bg-gray-100 text-gray-600 border-gray-200';
              }

              return (
                <TableRow key={dim}>
                  <TableCell className="font-medium">
                    {DIMENSION_SHORT_NAMES[dim]}
                  </TableCell>
                  <TableCell className="text-center">{first}</TableCell>
                  <TableCell className="text-center">{last}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 font-semibold',
                        deltaColor,
                      )}
                    >
                      <DeltaIcon className="h-3.5 w-3.5" />
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn('text-xs', trendColor)}>
                      {trend}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
