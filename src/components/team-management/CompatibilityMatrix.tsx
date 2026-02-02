/**
 * CompatibilityMatrix
 * PRD-056: NxN grid matrix of pairwise compatibility scores.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { calculateCompatibilityScore } from '@/utils/compatibilityScore';
import type { TeamMember } from '@/types/teamManagement';
import CompatibilityCell from './CompatibilityCell';

interface CompatibilityMatrixProps {
  members: TeamMember[];
  onPairClick: (member1Id: string, member2Id: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function CompatibilityMatrix({
  members,
  onPairClick,
}: CompatibilityMatrixProps) {
  const mappedMembers = useMemo(
    () => members.filter((m) => m.gaugeStatus === 'mapped' && m.gaugeScores),
    [members],
  );

  const matrix = useMemo(() => {
    const results: Record<string, Record<string, ReturnType<typeof calculateCompatibilityScore>>> = {};

    for (let i = 0; i < mappedMembers.length; i++) {
      for (let j = i + 1; j < mappedMembers.length; j++) {
        const m1 = mappedMembers[i];
        const m2 = mappedMembers[j];
        const result = calculateCompatibilityScore(m1.gaugeScores!, m2.gaugeScores!);

        if (!results[m1.id]) results[m1.id] = {};
        if (!results[m2.id]) results[m2.id] = {};
        results[m1.id][m2.id] = result;
        results[m2.id][m1.id] = result;
      }
    }

    return results;
  }, [mappedMembers]);

  if (mappedMembers.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matriz de Compatibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Necessario pelo menos 2 membros mapeados para exibir a matriz.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Matriz de Compatibilidade</CardTitle>
          <span className="text-xs text-muted-foreground">
            {mappedMembers.length} membros
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="inline-block">
            {/* Header row */}
            <div className="flex">
              {/* Top-left empty corner */}
              <div className="w-20 h-14 shrink-0" />
              {mappedMembers.map((member) => (
                <div
                  key={`header-${member.id}`}
                  className="w-14 h-14 flex items-center justify-center shrink-0"
                >
                  <span
                    className="text-[10px] font-medium text-muted-foreground text-center leading-tight truncate max-w-[52px]"
                    title={member.name}
                  >
                    {getInitials(member.name)}
                  </span>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {mappedMembers.map((rowMember) => (
              <div key={`row-${rowMember.id}`} className="flex">
                {/* Side label */}
                <div className="w-20 h-14 flex items-center shrink-0 pr-2">
                  <span
                    className="text-[10px] font-medium text-muted-foreground truncate"
                    title={rowMember.name}
                  >
                    {getInitials(rowMember.name)}
                  </span>
                </div>

                {/* Cells */}
                {mappedMembers.map((colMember) => {
                  if (rowMember.id === colMember.id) {
                    return (
                      <div
                        key={`cell-${rowMember.id}-${colMember.id}`}
                        className={cn(
                          'w-14 h-14 flex items-center justify-center shrink-0',
                          'rounded-md bg-muted/50',
                        )}
                      >
                        <span className="text-xs text-muted-foreground">--</span>
                      </div>
                    );
                  }

                  const result = matrix[rowMember.id]?.[colMember.id];
                  if (!result) return null;

                  return (
                    <div
                      key={`cell-${rowMember.id}-${colMember.id}`}
                      className="shrink-0"
                    >
                      <CompatibilityCell
                        score={result.score}
                        level={result.level}
                        onClick={() => onPairClick(rowMember.id, colMember.id)}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
