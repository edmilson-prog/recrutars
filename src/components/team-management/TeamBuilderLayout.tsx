/**
 * TeamBuilderLayout
 * PRD-056: Main DnD layout composition for the Team Builder.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { TeamMember, TeamBuilderScenario } from '@/types/teamManagement';
import TeamBuilderSidebar from './TeamBuilderSidebar';
import TeamBuilderTeamCard from './TeamBuilderTeamCard';
import TeamBuilderMetrics from './TeamBuilderMetrics';
import TeamBuilderSlot from './TeamBuilderSlot';

interface TeamBuilderLayoutProps {
  members: TeamMember[];
  initialScenario?: TeamBuilderScenario;
  scenarios: TeamBuilderScenario[];
  onSaveScenario: (
    name: string,
    description: string | undefined,
    teams: Array<{ id: string; name: string; memberIds: string[] }>,
  ) => void;
  onLoadScenario: (scenario: TeamBuilderScenario) => void;
  onDeleteScenario: (scenarioId: string) => void;
  /** Called whenever the internal teams state changes, so the parent can track it. */
  onTeamsChange?: (teams: Array<{ id: string; name: string; memberIds: string[] }>) => void;
  /** When set to a scenario, loads it into the builder. */
  loadScenario?: TeamBuilderScenario | null;
}

type TeamState = { id: string; name: string; memberIds: string[] };

/** Find which container (team id or "sidebar") a member belongs to. */
function findContainer(
  teams: TeamState[],
  memberId: string,
  allocatedMemberIds: Set<string>,
): string | null {
  for (const team of teams) {
    if (team.memberIds.includes(memberId)) return team.id;
  }
  if (!allocatedMemberIds.has(memberId)) return 'sidebar';
  return null;
}

export default function TeamBuilderLayout({
  members,
  initialScenario,
  scenarios,
  onSaveScenario,
  onLoadScenario,
  onDeleteScenario,
  onTeamsChange,
  loadScenario,
}: TeamBuilderLayoutProps) {
  const [teams, setTeams] = useState<TeamState[]>(
    initialScenario?.teams.map((t) => ({ ...t })) || [],
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  // Notify parent whenever teams change
  useEffect(() => {
    onTeamsChange?.(teams);
  }, [teams, onTeamsChange]);

  // Load scenario from parent
  useEffect(() => {
    if (loadScenario) {
      setTeams(loadScenario.teams.map((t) => ({ ...t, memberIds: [...t.memberIds] })));
    }
  }, [loadScenario]);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Derived state
  const memberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const allocatedMemberIds = useMemo(() => {
    const set = new Set<string>();
    teams.forEach((t) => t.memberIds.forEach((id) => set.add(id)));
    return set;
  }, [teams]);

  const activeMember = activeId ? memberMap.get(activeId) : null;

  // ------ Drag handlers ------

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const memberId = active.id as string;
      const overId = over.id as string;

      // Determine source container
      const sourceContainer = findContainer(teams, memberId, allocatedMemberIds);
      if (!sourceContainer) return;

      // Determine destination container
      let destContainer: string | null = null;

      // Check if over is a team id
      if (overId === 'sidebar') {
        destContainer = 'sidebar';
      } else if (teams.some((t) => t.id === overId)) {
        destContainer = overId;
      } else {
        // Check if over is another member - find their container
        destContainer = findContainer(teams, overId, allocatedMemberIds);
      }

      if (!destContainer) return;

      // If same container, do nothing (simple reorder not needed for this use-case)
      if (sourceContainer === destContainer) return;

      setTeams((prev) => {
        const next = prev.map((t) => ({ ...t, memberIds: [...t.memberIds] }));

        // Remove from source (if source is a team)
        if (sourceContainer !== 'sidebar') {
          const srcTeam = next.find((t) => t.id === sourceContainer);
          if (srcTeam) {
            srcTeam.memberIds = srcTeam.memberIds.filter((id) => id !== memberId);
          }
        }

        // Add to destination (if destination is a team)
        if (destContainer !== 'sidebar') {
          const dstTeam = next.find((t) => t.id === destContainer);
          if (dstTeam && !dstTeam.memberIds.includes(memberId)) {
            dstTeam.memberIds.push(memberId);
          }
        }

        return next;
      });
    },
    [teams, allocatedMemberIds],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // ------ Team CRUD ------

  const addTeam = useCallback(() => {
    setTeams((prev) => [
      ...prev,
      {
        id: `team-${Date.now()}`,
        name: `Time ${prev.length + 1}`,
        memberIds: [],
      },
    ]);
  }, []);

  const removeTeam = useCallback((teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  }, []);

  const renameTeam = useCallback((teamId: string, name: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name } : t)),
    );
  }, []);

  const removeMemberFromTeam = useCallback((memberId: string) => {
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        memberIds: t.memberIds.filter((id) => id !== memberId),
      })),
    );
  }, []);

  return (
    <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Sidebar with available members */}
          <div className="lg:col-span-3">
            <TeamBuilderSidebar
              members={members}
              allocatedMemberIds={allocatedMemberIds}
            />
          </div>

          {/* Center: Teams grid */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => {
                const teamMembers = team.memberIds
                  .map((id) => memberMap.get(id))
                  .filter((m): m is TeamMember => !!m);

                return (
                  <div key={team.id} className="relative group">
                    <TeamBuilderTeamCard
                      team={team}
                      members={teamMembers}
                      allMembers={members}
                      onRemoveMember={removeMemberFromTeam}
                      onRenameTeam={renameTeam}
                    />
                    {/* Remove team button (only if empty) */}
                    {team.memberIds.length === 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeTeam(team.id)}
                        title="Remover time vazio"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add team button */}
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={addTeam}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Time
            </Button>
          </div>

          {/* Right: Metrics panel */}
          <div className="lg:col-span-3">
            <TeamBuilderMetrics teams={teams} allMembers={members} />
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeMember ? (
            <TeamBuilderSlot member={activeMember} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
  );
}
