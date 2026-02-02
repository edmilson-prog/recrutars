/**
 * TopPairsList
 * PRD-056: Top N best compatible pairs in the team.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import {
  calculateCompatibilityScore,
  getCompatibilityColor,
  getCompatibilityLabel,
} from '@/utils/compatibilityScore';
import type { TeamMember, CompatibilityResult } from '@/types/teamManagement';

interface TopPairsListProps {
  members: TeamMember[];
  limit?: number;
  onPairClick: (member1Id: string, member2Id: string) => void;
}

interface PairEntry {
  member1: TeamMember;
  member2: TeamMember;
  result: Pick<CompatibilityResult, 'score' | 'level'>;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function TopPairsList({
  members,
  limit = 5,
  onPairClick,
}: TopPairsListProps) {
  const mappedMembers = useMemo(
    () => members.filter((m) => m.gaugeStatus === 'mapped' && m.gaugeScores),
    [members],
  );

  const topPairs = useMemo(() => {
    const pairs: PairEntry[] = [];

    for (let i = 0; i < mappedMembers.length; i++) {
      for (let j = i + 1; j < mappedMembers.length; j++) {
        const m1 = mappedMembers[i];
        const m2 = mappedMembers[j];
        const result = calculateCompatibilityScore(m1.gaugeScores!, m2.gaugeScores!);
        pairs.push({
          member1: m1,
          member2: m2,
          result: { score: result.score, level: result.level },
        });
      }
    }

    pairs.sort((a, b) => b.result.score - a.result.score);
    return pairs.slice(0, limit);
  }, [mappedMembers, limit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-green-500" />
          Melhores Duplas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topPairs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Necessario pelo menos 2 membros mapeados.
          </p>
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {topPairs.map(({ member1, member2, result }) => {
              const color = getCompatibilityColor(result.level);
              const label = getCompatibilityLabel(result.level);

              return (
                <motion.div
                  key={`${member1.id}-${member2.id}`}
                  variants={staggerItem}
                  onClick={() => onPairClick(member1.id, member2.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer',
                    'transition-all hover:shadow-sm hover:bg-accent/50',
                  )}
                >
                  {/* Member 1 avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(member1.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Connector line */}
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-px bg-muted-foreground/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <div className="w-4 h-px bg-muted-foreground/30" />
                  </div>

                  {/* Member 2 avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(member2.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Names and label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {member1.name.split(' ')[0]} &amp; {member2.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
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
                    {result.score}%
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
