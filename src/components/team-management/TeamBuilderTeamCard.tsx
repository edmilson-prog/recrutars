/**
 * TeamBuilderTeamCard
 * PRD-056: Droppable zone for a team in the Team Builder.
 */

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, GripVertical } from 'lucide-react';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { GaugeProDimension } from '@/types/gaugePro';
import type { TeamMember } from '@/types/teamManagement';
import { calculateTeamMetrics, getBalanceColor, getBalanceLabel } from '@/utils/teamBalance';
import TeamBuilderSlot from './TeamBuilderSlot';

interface TeamBuilderTeamCardProps {
  team: { id: string; name: string; memberIds: string[] };
  members: TeamMember[];
  allMembers: TeamMember[];
  onRemoveMember?: (memberId: string) => void;
  onRenameTeam?: (teamId: string, name: string) => void;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export default function TeamBuilderTeamCard({
  team,
  members,
  allMembers,
  onRemoveMember,
  onRenameTeam,
}: TeamBuilderTeamCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);

  const { setNodeRef, isOver } = useDroppable({ id: team.id });

  // Calculate team metrics if there are mapped members with scores
  const teamMembers = useMemo(
    () => members.filter((m) => m.gaugeScores),
    [members],
  );

  const metrics = useMemo(() => {
    if (teamMembers.length === 0) return null;
    return calculateTeamMetrics(teamMembers.map((m) => m.gaugeScores!));
  }, [teamMembers]);

  // Radar data for mini chart
  const radarData = useMemo(() => {
    if (!metrics) return [];
    return DIMENSIONS.map((dim) => ({
      dimension: DIMENSION_SHORT_NAMES[dim],
      value: Math.round(metrics.averages[dim]),
    }));
  }, [metrics]);

  const handleSaveName = () => {
    if (editName.trim() && onRenameTeam) {
      onRenameTeam(team.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setEditName(team.name);
      setIsEditing(false);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'transition-all',
        isOver && 'ring-2 ring-primary/50 bg-primary/5',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <h3
              className="text-sm font-semibold cursor-pointer hover:text-primary transition-colors"
              onDoubleClick={() => {
                setEditName(team.name);
                setIsEditing(true);
              }}
              title="Clique duplo para editar"
            >
              {team.name}
            </h3>
          )}
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {members.length} {members.length === 1 ? 'membro' : 'membros'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Sortable member list */}
        <SortableContext
          items={members.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5 min-h-[150px]">
            {members.length === 0 ? (
              <div className="flex items-center justify-center min-h-[150px] border-2 border-dashed rounded-lg text-sm text-muted-foreground">
                Arraste membros aqui
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="relative group">
                  <TeamBuilderSlot member={member} />
                  {onRemoveMember && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveMember(member.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </SortableContext>

        {/* Mini radar chart */}
        {metrics && radarData.length > 0 && (
          <div className="pt-2 border-t">
            <ResponsiveContainer width="100%" height={150}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Media"
                  dataKey="value"
                  stroke="#0891b2"
                  fill="#0891b2"
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Balance score badge */}
        {metrics && (
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className="font-mono text-xs"
              style={{
                borderColor: getBalanceColor(metrics.balanceScore),
                color: getBalanceColor(metrics.balanceScore),
                backgroundColor: `${getBalanceColor(metrics.balanceScore)}15`,
              }}
            >
              {Math.round(metrics.balanceScore)}% - {getBalanceLabel(metrics.balanceScore)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
