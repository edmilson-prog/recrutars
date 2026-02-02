/**
 * TeamBuilderSlot
 * PRD-056: Draggable member card for the Team Builder.
 */

import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TeamMember } from '@/types/teamManagement';
import type { GaugeProDimension } from '@/types/gaugePro';

interface TeamBuilderSlotProps {
  member: TeamMember;
  isDragOverlay?: boolean;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

function getScoreBarColor(score: number): string {
  if (score >= 67) return 'bg-green-500';
  if (score >= 34) return 'bg-amber-500';
  return 'bg-red-500';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function TeamBuilderSlot({ member, isDragOverlay }: TeamBuilderSlotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-lg border bg-card cursor-grab active:cursor-grabbing',
        'transition-all select-none',
        isDragging && 'shadow-lg opacity-50 ring-2 ring-primary',
        isDragOverlay && 'scale-105 rotate-2 shadow-xl ring-2 ring-primary',
        !isDragging && !isDragOverlay && 'hover:shadow-sm hover:bg-accent/30',
      )}
    >
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold">{getInitials(member.name)}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.name}</p>
        {member.archetype && (
          <p className="text-xs text-muted-foreground truncate">{member.archetype}</p>
        )}
      </div>

      {/* Mini 5-bar indicator */}
      {member.gaugeScores && (
        <div className="flex items-center gap-0.5 shrink-0">
          {DIMENSIONS.map((dim) => {
            const score = member.gaugeScores![dim];
            return (
              <div key={dim} className="flex flex-col items-center gap-0.5">
                <div className="w-1.5 h-5 rounded-full bg-muted overflow-hidden flex flex-col-reverse">
                  <div
                    className={cn('w-full rounded-full', getScoreBarColor(score))}
                    style={{ height: `${Math.max(score, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
