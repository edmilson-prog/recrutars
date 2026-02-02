/**
 * TeamBuilderSidebar
 * PRD-056: Sidebar with unallocated members for the Team Builder.
 */

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import type { TeamMember } from '@/types/teamManagement';
import TeamBuilderSlot from './TeamBuilderSlot';

interface TeamBuilderSidebarProps {
  members: TeamMember[];
  allocatedMemberIds: Set<string>;
}

export default function TeamBuilderSidebar({
  members,
  allocatedMemberIds,
}: TeamBuilderSidebarProps) {
  const [search, setSearch] = useState('');

  const { setNodeRef, isOver } = useDroppable({ id: 'sidebar' });

  // Only show mapped members that are not allocated to any team
  const availableMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m.gaugeStatus === 'mapped' &&
        m.gaugeScores &&
        !allocatedMemberIds.has(m.id),
    );
  }, [members, allocatedMemberIds]);

  // Filter by search
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return availableMembers;
    const query = search.toLowerCase();
    return availableMembers.filter(
      (m) => m.name.toLowerCase().includes(query),
    );
  }, [availableMembers, search]);

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
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Colaboradores Disponiveis
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {availableMembers.length} disponiveis
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Scrollable member list */}
        <SortableContext
          items={filteredMembers.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {filteredMembers.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                {search.trim()
                  ? 'Nenhum colaborador encontrado'
                  : 'Todos os colaboradores ja foram alocados'}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <TeamBuilderSlot key={member.id} member={member} />
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}
