/**
 * ConflictAlertsList
 * PRD-056: Pairs with compatibility score < 30% flagged as conflict alerts.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import {
  calculateCompatibilityScore,
  getCompatibilityColor,
} from '@/utils/compatibilityScore';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { TeamMember } from '@/types/teamManagement';

const CONFLICT_THRESHOLD = 30;

interface ConflictAlertsListProps {
  members: TeamMember[];
  onPairClick: (member1Id: string, member2Id: string) => void;
}

interface ConflictEntry {
  member1: TeamMember;
  member2: TeamMember;
  score: number;
  tensionDimension: string;
}

export default function ConflictAlertsList({
  members,
  onPairClick,
}: ConflictAlertsListProps) {
  const mappedMembers = useMemo(
    () => members.filter((m) => m.gaugeStatus === 'mapped' && m.gaugeScores),
    [members],
  );

  const conflicts = useMemo(() => {
    const entries: ConflictEntry[] = [];

    for (let i = 0; i < mappedMembers.length; i++) {
      for (let j = i + 1; j < mappedMembers.length; j++) {
        const m1 = mappedMembers[i];
        const m2 = mappedMembers[j];
        const result = calculateCompatibilityScore(m1.gaugeScores!, m2.gaugeScores!);

        if (result.score < CONFLICT_THRESHOLD) {
          // Find the dimension with the worst (most negative) synergy
          const dimensions = Object.entries(result.dimensionBreakdown) as [GaugeProDimension, number][];
          const worstDim = dimensions.reduce(
            (worst, [dim, val]) => (val < worst.val ? { dim, val } : worst),
            { dim: 'D1' as GaugeProDimension, val: Infinity },
          );

          entries.push({
            member1: m1,
            member2: m2,
            score: result.score,
            tensionDimension: DIMENSION_SHORT_NAMES[worstDim.dim],
          });
        }
      }
    }

    entries.sort((a, b) => a.score - b.score);
    return entries;
  }, [mappedMembers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Alertas de Conflito
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p className="text-sm font-medium text-green-700">
              Nenhum conflito detectado
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Todas as duplas possuem compatibilidade acima de {CONFLICT_THRESHOLD}%.
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {conflicts.map(({ member1, member2, score, tensionDimension }) => {
              const color = getCompatibilityColor('critical');

              return (
                <motion.div
                  key={`conflict-${member1.id}-${member2.id}`}
                  variants={staggerItem}
                  onClick={() => onPairClick(member1.id, member2.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border border-red-200 cursor-pointer',
                    'transition-all hover:shadow-sm hover:bg-red-50/50 dark:border-red-900/30 dark:hover:bg-red-950/20',
                  )}
                >
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />

                  {/* Names */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {member1.name} &amp; {member2.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Tensao principal: {tensionDimension}
                    </p>
                  </div>

                  {/* Score badge */}
                  <Badge
                    variant="outline"
                    className="font-mono text-xs shrink-0"
                    style={{
                      borderColor: color,
                      color: color,
                      backgroundColor: `${color}15`,
                    }}
                  >
                    {score}%
                  </Badge>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
