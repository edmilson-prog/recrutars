/**
 * Comparison Table
 * PRD-053: Tabela comparativa com barras visuais
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DIMENSION_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { CompanyTestResult } from '@/types/companyTest';

interface ComparisonTableProps {
  results: CompanyTestResult[];
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

function getBarColor(score: number): string {
  if (score >= 67) return '#22c55e';
  if (score >= 34) return '#f59e0b';
  return '#ef4444';
}

export function ComparisonTable({ results }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Dimensão</TableHead>
            {results.map(r => (
              <TableHead key={r.id} className="text-center min-w-[140px]">
                {r.candidateName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {DIMENSIONS.map(dim => {
            const scores = results.map(r => r.scores[dim]);
            const max = Math.max(...scores);
            const min = Math.min(...scores);
            const diff = max - min;

            return (
              <TableRow key={dim}>
                <TableCell className="font-medium text-sm">
                  {dim} - {DIMENSION_NAMES[dim].split('/')[0]}
                </TableCell>
                {results.map(r => {
                  const score = r.scores[dim];
                  const isMax = score === max && results.length > 1;
                  const isMin = score === min && results.length > 1 && diff > 0;
                  return (
                    <TableCell key={r.id} className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${score}%`, backgroundColor: getBarColor(score) }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${isMax ? 'text-green-600' : isMin ? 'text-red-500' : ''}`}>
                          {score}
                        </span>
                      </div>
                      {diff > 20 && isMax && (
                        <Badge variant="outline" className="text-[9px] mt-1 text-green-600 border-green-200">
                          +{diff}pts
                        </Badge>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
          {/* Fit Score Row */}
          <TableRow className="border-t-2">
            <TableCell className="font-bold text-sm">Fit Score</TableCell>
            {results.map(r => (
              <TableCell key={r.id} className="text-center">
                <span className="text-lg font-bold" style={{ color: getBarColor(r.fitScore || 0) }}>
                  {r.fitScore?.toFixed(1) || '—'}%
                </span>
              </TableCell>
            ))}
          </TableRow>
          {/* Archetype Row */}
          <TableRow>
            <TableCell className="font-medium text-sm">Arquétipo</TableCell>
            {results.map(r => (
              <TableCell key={r.id} className="text-center">
                <Badge variant="outline" className="text-xs">{r.archetype.name}</Badge>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
