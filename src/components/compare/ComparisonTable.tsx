/**
 * Comparison Table Component
 * PRD-002-dgn: Visualização DISC e Match Score
 *
 * Tabela comparativa de métricas entre candidatos
 * Destaca melhor valor em cada métrica
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CandidateForComparison } from "@/types/disc";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Minus, Trophy } from "lucide-react";

interface MetricDefinition {
  key: string;
  label: string;
  type: "number" | "boolean" | "string" | "years";
  higherIsBetter?: boolean;
}

// Métricas padrão para comparação
export const DEFAULT_COMPARISON_METRICS: MetricDefinition[] = [
  { key: "matchScore", label: "Match Score", type: "number", higherIsBetter: true },
  { key: "experienceYears", label: "Experiência", type: "years", higherIsBetter: true },
  { key: "discD", label: "DISC - Dominância", type: "number" },
  { key: "discI", label: "DISC - Influência", type: "number" },
  { key: "discS", label: "DISC - Estabilidade", type: "number" },
  { key: "discC", label: "DISC - Conformidade", type: "number" },
];

interface ComparisonTableProps {
  candidates: CandidateForComparison[];
  metrics?: MetricDefinition[];
  showOnlyDifferences?: boolean;
  onToggleDifferences?: (value: boolean) => void;
  className?: string;
}

export function ComparisonTable({
  candidates,
  metrics = DEFAULT_COMPARISON_METRICS,
  showOnlyDifferences = false,
  onToggleDifferences,
  className,
}: ComparisonTableProps) {
  const [localShowDifferences, setLocalShowDifferences] = useState(showOnlyDifferences);

  const effectiveShowDifferences = onToggleDifferences
    ? showOnlyDifferences
    : localShowDifferences;

  const handleToggle = (value: boolean) => {
    if (onToggleDifferences) {
      onToggleDifferences(value);
    } else {
      setLocalShowDifferences(value);
    }
  };

  // Função para obter valor de uma métrica
  const getMetricValue = (
    candidate: CandidateForComparison,
    metric: MetricDefinition
  ): string | number | boolean | undefined => {
    // Valores especiais mapeados
    if (metric.key === "matchScore") return candidate.matchScore;
    if (metric.key === "discD") return candidate.discProfile.d;
    if (metric.key === "discI") return candidate.discProfile.i;
    if (metric.key === "discS") return candidate.discProfile.s;
    if (metric.key === "discC") return candidate.discProfile.c;

    // Busca em metrics genérico
    return candidate.metrics?.[metric.key];
  };

  // Função para determinar melhor valor
  const getBestValue = (
    metric: MetricDefinition,
    values: (string | number | boolean | undefined)[]
  ): string | number | boolean | undefined => {
    const numericValues = values.filter(
      (v): v is number => typeof v === "number"
    );
    if (numericValues.length === 0) return undefined;

    if (metric.higherIsBetter !== false) {
      return Math.max(...numericValues);
    }
    return Math.min(...numericValues);
  };

  // Verificar se há diferença nos valores
  const hasDifference = (values: (string | number | boolean | undefined)[]): boolean => {
    const validValues = values.filter((v) => v !== undefined);
    if (validValues.length <= 1) return false;
    const first = validValues[0];
    return !validValues.every((v) => v === first);
  };

  // Filtrar métricas baseado no toggle
  const filteredMetrics = effectiveShowDifferences
    ? metrics.filter((metric) => {
        const values = candidates.map((c) => getMetricValue(c, metric));
        return hasDifference(values);
      })
    : metrics;

  // Formatar valor para exibição
  const formatValue = (
    value: string | number | boolean | undefined,
    metric: MetricDefinition
  ): React.ReactNode => {
    if (value === undefined || value === null) {
      return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
    }

    if (metric.type === "boolean") {
      return value ? (
        <Check className="w-4 h-4 text-green-500 mx-auto" />
      ) : (
        <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
      );
    }

    if (metric.type === "years" && typeof value === "number") {
      return `${value} ${value === 1 ? "ano" : "anos"}`;
    }

    if (metric.type === "number" && typeof value === "number") {
      return metric.key === "matchScore" ? `${value}%` : value;
    }

    return String(value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toggle de diferenças */}
      <div className="flex items-center justify-end gap-2">
        <Switch
          id="show-differences"
          checked={effectiveShowDifferences}
          onCheckedChange={handleToggle}
        />
        <Label htmlFor="show-differences" className="text-sm cursor-pointer">
          Mostrar apenas diferenças
        </Label>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-medium border-b">Métrica</th>
              {candidates.map((candidate) => (
                <th
                  key={candidate.id}
                  className="text-center p-3 font-medium border-b min-w-[120px]"
                >
                  {candidate.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.length === 0 ? (
              <tr>
                <td
                  colSpan={candidates.length + 1}
                  className="text-center p-8 text-muted-foreground"
                >
                  Todos os valores são iguais entre os candidatos
                </td>
              </tr>
            ) : (
              filteredMetrics.map((metric, index) => {
                const values = candidates.map((c) => getMetricValue(c, metric));
                const bestValue = getBestValue(metric, values);

                return (
                  <tr
                    key={metric.key}
                    className={cn(
                      "border-b last:border-0",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    )}
                  >
                    <td className="p-3 font-medium text-muted-foreground">
                      {metric.label}
                    </td>
                    {candidates.map((candidate, candIndex) => {
                      const value = values[candIndex];
                      const isBest =
                        bestValue !== undefined &&
                        value === bestValue &&
                        hasDifference(values);

                      return (
                        <td
                          key={candidate.id}
                          className={cn(
                            "p-3 text-center",
                            isBest && "font-semibold"
                          )}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isBest && metric.higherIsBetter !== undefined && (
                              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                            )}
                            <span
                              className={cn(
                                isBest && "text-primary"
                              )}
                            >
                              {formatValue(value, metric)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground justify-end">
        <div className="flex items-center gap-1">
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span>Melhor valor</span>
        </div>
      </div>
    </div>
  );
}

// Versão compacta para preview
export function ComparisonTableCompact({
  candidates,
  topMetrics = 3,
  className,
}: {
  candidates: CandidateForComparison[];
  topMetrics?: number;
  className?: string;
}) {
  const metrics = DEFAULT_COMPARISON_METRICS.slice(0, topMetrics);

  return (
    <div className={cn("text-sm", className)}>
      <div className="grid gap-2">
        {metrics.map((metric) => (
          <div key={metric.key} className="flex items-center gap-2">
            <span className="text-muted-foreground w-24 truncate">
              {metric.label}
            </span>
            <div className="flex-1 flex gap-4">
              {candidates.map((candidate) => {
                let value: string | number | boolean | undefined;
                if (metric.key === "matchScore") value = candidate.matchScore;
                else if (metric.key === "discD") value = candidate.discProfile.d;
                else if (metric.key === "discI") value = candidate.discProfile.i;
                else if (metric.key === "discS") value = candidate.discProfile.s;
                else if (metric.key === "discC") value = candidate.discProfile.c;
                else value = candidate.metrics?.[metric.key];

                return (
                  <span key={candidate.id} className="font-medium">
                    {typeof value === "number" && metric.key === "matchScore"
                      ? `${value}%`
                      : String(value ?? "-")}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
