/**
 * ObjectiveCard
 * PRD-057: Card de um objetivo individual do Plano de Desenvolvimento.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { DevelopmentObjective, ObjectiveStatus } from '@/types/teamManagement';

interface ObjectiveCardProps {
  objective: DevelopmentObjective;
  onStatusChange: (id: string, status: ObjectiveStatus) => void;
  onEdit: (objective: DevelopmentObjective) => void;
}

const DIMENSION_DOT_COLORS: Record<GaugeProDimension, string> = {
  D1: 'bg-cyan-600',
  D2: 'bg-violet-600',
  D3: 'bg-emerald-600',
  D4: 'bg-amber-600',
  D5: 'bg-pink-600',
};

const STATUS_LABELS: Record<ObjectiveStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const PRIORITY_CONFIG = {
  high: { label: 'Alta', className: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Média', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Baixa', className: 'bg-green-100 text-green-700 border-green-200' },
} as const;

export default function ObjectiveCard({
  objective,
  onStatusChange,
  onEdit,
}: ObjectiveCardProps) {
  const [notesExpanded, setNotesExpanded] = useState(false);

  const priorityCfg = PRIORITY_CONFIG[objective.priority];

  return (
    <Card
      className={cn(
        'transition-all',
        objective.status === 'completed' && 'opacity-75',
        objective.status === 'cancelled' && 'opacity-50',
      )}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Colored dot by dimension */}
          <div
            className={cn(
              'mt-1 h-3 w-3 rounded-full shrink-0',
              DIMENSION_DOT_COLORS[objective.dimension],
            )}
          />

          <div className="flex-1 min-w-0">
            {/* Title */}
            <p
              className={cn(
                'font-semibold text-sm',
                objective.status === 'completed' && 'line-through',
              )}
            >
              {objective.title}
            </p>

            {/* Description */}
            {objective.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {objective.description}
              </p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {DIMENSION_SHORT_NAMES[objective.dimension]}
              </Badge>
              <Badge
                variant="outline"
                className={cn('text-xs', priorityCfg.className)}
              >
                {priorityCfg.label}
              </Badge>
              {objective.dueDate && (
                <span className="text-xs text-muted-foreground">
                  Prazo: {format(new Date(objective.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={objective.status}
              onValueChange={(value) =>
                onStatusChange(objective.id, value as ObjectiveStatus)
              }
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{STATUS_LABELS.pending}</SelectItem>
                <SelectItem value="in_progress">{STATUS_LABELS.in_progress}</SelectItem>
                <SelectItem value="completed">{STATUS_LABELS.completed}</SelectItem>
                <SelectItem value="cancelled">{STATUS_LABELS.cancelled}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(objective)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notes expandable section */}
        {objective.notes && (
          <div>
            <button
              onClick={() => setNotesExpanded(!notesExpanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {notesExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Notas
            </button>
            {notesExpanded && (
              <p className="text-xs text-muted-foreground mt-1 pl-4 border-l-2 border-muted">
                {objective.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
