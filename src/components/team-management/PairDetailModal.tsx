/**
 * PairDetailModal
 * PRD-056: Dialog showing detailed compatibility between two team members.
 */

import { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import {
  calculateCompatibilityScore,
  getCompatibilityColor,
  getCompatibilityLabel,
  calculateDimensionSynergy,
} from '@/utils/compatibilityScore';
import {
  DIMENSION_SHORT_NAMES,
  type GaugeProDimension,
} from '@/types/gaugePro';
import type { TeamMember } from '@/types/teamManagement';

interface PairDetailModalProps {
  member1: TeamMember | null;
  member2: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const TENSION_SUGGESTIONS: Record<GaugeProDimension, string> = {
  D1: 'Definir papeis claros para evitar disputa de lideranca. Alternar a tomada de decisao em projetos.',
  D2: 'Combinar momentos de interacao social com trabalho focado. Respeitar os estilos diferentes de comunicacao.',
  D3: 'Alinhar expectativas sobre prazos e ritmo de trabalho. Criar checkpoints regulares.',
  D4: 'Estabelecer processos minimos que ambos aceitem. Equilibrar flexibilidade com estrutura.',
  D5: 'Definir canais claros de feedback. Construir confianca gradualmente atraves de pequenas colaboracoes.',
};

export default function PairDetailModal({
  member1,
  member2,
  open,
  onOpenChange,
}: PairDetailModalProps) {
  const compatibility = useMemo(() => {
    if (!member1?.gaugeScores || !member2?.gaugeScores) return null;
    return calculateCompatibilityScore(member1.gaugeScores, member2.gaugeScores);
  }, [member1, member2]);

  const radarData = useMemo(() => {
    if (!member1?.gaugeScores || !member2?.gaugeScores) return [];
    return DIMENSIONS.map((dim) => ({
      dimension: DIMENSION_SHORT_NAMES[dim],
      [member1.name.split(' ')[0]]: member1.gaugeScores![dim],
      [member2.name.split(' ')[0]]: member2.gaugeScores![dim],
    }));
  }, [member1, member2]);

  const dimensionRows = useMemo(() => {
    if (!member1?.gaugeScores || !member2?.gaugeScores) return [];
    return DIMENSIONS.map((dim) => {
      const s1 = member1.gaugeScores![dim];
      const s2 = member2.gaugeScores![dim];
      const synergy = calculateDimensionSynergy(dim, s1, s2);
      return {
        dim,
        label: DIMENSION_SHORT_NAMES[dim],
        score1: s1,
        score2: s2,
        synergy,
      };
    });
  }, [member1, member2]);

  const tensions = useMemo(() => {
    if (!dimensionRows.length) return [];
    return dimensionRows
      .filter((row) => row.synergy < 0)
      .sort((a, b) => a.synergy - b.synergy);
  }, [dimensionRows]);

  const strengths = useMemo(() => {
    if (!dimensionRows.length) return [];
    return dimensionRows
      .filter((row) => row.synergy > 0)
      .sort((a, b) => b.synergy - a.synergy);
  }, [dimensionRows]);

  if (!member1 || !member2 || !compatibility) return null;

  const color = getCompatibilityColor(compatibility.level);
  const label = getCompatibilityLabel(compatibility.level);
  const firstName1 = member1.name.split(' ')[0];
  const firstName2 = member2.name.split(' ')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader>
              <DialogTitle className="text-lg">
                {member1.name} &times; {member2.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 pt-1">
                Analise detalhada de compatibilidade
              </DialogDescription>
            </DialogHeader>

            {/* Overall score */}
            <div className="flex items-center justify-center gap-3 py-2">
              <Badge
                className="text-lg font-mono px-4 py-1.5"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  borderColor: color,
                }}
                variant="outline"
              >
                {compatibility.score}%
              </Badge>
              <span className="text-sm font-medium" style={{ color }}>
                {label}
              </span>
            </div>

            {/* Radar chart overlay */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Perfis Sobrepostos</h4>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`${Math.round(value)}`, '']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Radar
                    name={firstName1}
                    dataKey={firstName1}
                    stroke="#0891b2"
                    fill="#0891b2"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name={firstName2}
                    dataKey={firstName2}
                    stroke="#7c3aed"
                    fill="#7c3aed"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Dimension breakdown table */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Detalhamento por Dimensao</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-3 py-2 font-medium">Dimensao</th>
                      <th className="text-center px-3 py-2 font-medium">{firstName1}</th>
                      <th className="text-center px-3 py-2 font-medium">{firstName2}</th>
                      <th className="text-center px-3 py-2 font-medium">Sinergia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dimensionRows.map((row) => (
                      <tr key={row.dim} className="border-t">
                        <td className="px-3 py-2 font-medium">{row.label}</td>
                        <td className="text-center px-3 py-2 font-mono">{row.score1}</td>
                        <td className="text-center px-3 py-2 font-mono">{row.score2}</td>
                        <td className="text-center px-3 py-2">
                          <span
                            className="font-mono font-semibold"
                            style={{
                              color: row.synergy > 0 ? '#22c55e' : row.synergy < 0 ? '#ef4444' : '#9ca3af',
                            }}
                          >
                            {row.synergy > 0 ? '+' : ''}{row.synergy}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strengths */}
            {strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Pontos Fortes
                </h4>
                <ul className="space-y-1.5">
                  {strengths.map((s) => (
                    <li key={s.dim} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-foreground">{s.label}:</strong>{' '}
                        Sinergia positiva (+{s.synergy}) entre os perfis
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tensions */}
            {tensions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Tensoes
                </h4>
                <ul className="space-y-1.5">
                  {tensions.map((t) => (
                    <li key={t.dim} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-foreground">{t.label}:</strong>{' '}
                        Sinergia negativa ({t.synergy}) — potencial de atrito
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {tensions.length > 0 && (
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Sugestoes
                </h4>
                <ul className="space-y-2">
                  {tensions.map((t) => (
                    <li key={`sug-${t.dim}`} className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{t.label}:</strong>{' '}
                      {TENSION_SUGGESTIONS[t.dim]}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
