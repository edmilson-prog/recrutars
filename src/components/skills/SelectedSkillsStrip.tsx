/**
 * SelectedSkillsStrip — Sortable priority strip for selected skills
 * Displays selected skills as numbered items with drag-to-reorder.
 */

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StandardizedSkill } from '@/types/standardizedSkill';

interface SelectedSkillsStripProps {
  selectedSkillIds: string[];
  catalog: StandardizedSkill[];
  onChange: (skillIds: string[]) => void;
  disabled?: boolean;
}

interface SortableSkillItemProps {
  skillId: string;
  index: number;
  name: string;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

function SortableSkillItem({ skillId, index, name, onRemove, disabled }: SortableSkillItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skillId, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm',
        isDragging && 'opacity-50 shadow-lg',
        disabled && 'opacity-60',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        disabled={disabled}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {index + 1}
      </span>
      <span className="flex-1 truncate">{name}</span>
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(skillId)}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function SelectedSkillsStrip({ selectedSkillIds, catalog, onChange, disabled }: SelectedSkillsStripProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const skillMap = new Map(catalog.map((s) => [s.id, s]));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedSkillIds.indexOf(active.id as string);
    const newIndex = selectedSkillIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const updated = [...selectedSkillIds];
    updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, active.id as string);
    onChange(updated);
  }, [selectedSkillIds, onChange]);

  const handleRemove = useCallback((skillId: string) => {
    onChange(selectedSkillIds.filter((id) => id !== skillId));
  }, [selectedSkillIds, onChange]);

  if (selectedSkillIds.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">
        Ordenadas por prioridade (arraste para reordenar)
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={selectedSkillIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {selectedSkillIds.map((skillId, index) => (
              <SortableSkillItem
                key={skillId}
                skillId={skillId}
                index={index}
                name={skillMap.get(skillId)?.name ?? skillId}
                onRemove={handleRemove}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
