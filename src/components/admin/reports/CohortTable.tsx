/**
 * CohortTable component
 * PRD-059: Relatorios "Radar"
 *
 * Cohort retention table with heat map coloring.
 * Rows = cohort months, columns = retention months (M0, M1, M2, ...).
 */

import type { CohortRow } from '@/types';
import { cn } from '@/lib/utils';

interface CohortTableProps {
  data: CohortRow[];
}

function getHeatmapColor(value: number): string {
  if (value >= 80) return 'bg-emerald-600 text-white';
  if (value >= 60) return 'bg-emerald-500 text-white';
  if (value >= 50) return 'bg-yellow-400 text-yellow-900';
  if (value >= 40) return 'bg-orange-400 text-white';
  if (value >= 30) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
}

function formatMonth(monthStr: string): string {
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthIndex = parseInt(parts[1], 10) - 1;
  return `${monthNames[monthIndex]} ${parts[0].slice(2)}`;
}

export function CohortTable({ data }: CohortTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Sem dados de cohort para o periodo selecionado
      </div>
    );
  }

  // Find maximum retention months across all rows
  const maxCols = Math.min(
    Math.max(...data.map((row) => row.retentionByMonth.length)),
    12
  );

  // Take only the most recent 8 cohorts to keep the table readable
  const displayData = data.slice(-8);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium text-muted-foreground border-b bg-muted/50 sticky left-0 z-10">
              Cohort
            </th>
            <th className="p-2 text-center font-medium text-muted-foreground border-b bg-muted/50">
              Usuarios
            </th>
            {Array.from({ length: maxCols }, (_, i) => (
              <th
                key={i}
                className="p-2 text-center font-medium text-muted-foreground border-b bg-muted/50 min-w-[52px]"
              >
                M{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row) => (
            <tr key={row.cohortMonth} className="border-b border-border/50">
              <td className="p-2 font-medium text-foreground whitespace-nowrap sticky left-0 bg-card z-10">
                {formatMonth(row.cohortMonth)}
              </td>
              <td className="p-2 text-center font-medium text-foreground">
                {row.totalUsers}
              </td>
              {Array.from({ length: maxCols }, (_, colIdx) => {
                const value = row.retentionByMonth[colIdx];
                if (value === undefined) {
                  return (
                    <td key={colIdx} className="p-2 text-center text-muted-foreground">
                      --
                    </td>
                  );
                }
                return (
                  <td
                    key={colIdx}
                    className={cn(
                      'p-2 text-center font-semibold rounded-sm',
                      getHeatmapColor(value)
                    )}
                  >
                    {value}%
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
