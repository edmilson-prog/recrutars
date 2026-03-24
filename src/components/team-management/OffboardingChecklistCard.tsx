/**
 * OffboardingChecklistCard
 * PRD-090 Phase 2: Card showing offboarding checklist progress
 * for a terminated team member with interactive checkboxes.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useOffboardingChecklist,
  useToggleOffboardingItem,
} from '@/hooks/useTeamMemberEventsQuery';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OffboardingChecklistCardProps {
  teamMemberId: string;
  companyId: string;
  currentUserId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTimeBR(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OffboardingChecklistCard({
  teamMemberId,
  companyId,
  currentUserId,
}: OffboardingChecklistCardProps) {
  const { data: items = [], isLoading } = useOffboardingChecklist(teamMemberId);
  const toggleMutation = useToggleOffboardingItem();

  const totalItems = items.length;
  const completedCount = items.filter(
    (item) => item.isCompleted ?? (item as Record<string, unknown>).is_completed,
  ).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  function handleToggle(itemId: string, currentlyCompleted: boolean) {
    toggleMutation.mutate({
      id: itemId,
      isCompleted: !currentlyCompleted,
      completedBy: currentUserId,
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4" />
            Checklist de Offboarding
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (totalItems === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4" />
            Checklist de Offboarding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum item de checklist configurado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4" />
          Checklist de Offboarding
        </CardTitle>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completedCount} de {totalItems} concluido{totalItems > 1 ? 's' : ''}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {items.map((item) => {
          const isCompleted = !!(item.isCompleted ?? (item as Record<string, unknown>).is_completed);
          const completedAt = item.completedAt ?? (item as Record<string, unknown>).completed_at;
          const completedByName = item.completedBy ?? (item as Record<string, unknown>).completed_by;
          const label = item.itemLabel ?? (item as Record<string, unknown>).item_label;

          return (
            <div key={item.id} className="flex items-start gap-2 group">
              <Checkbox
                id={`offboard-${item.id}`}
                checked={isCompleted}
                onCheckedChange={() => handleToggle(item.id, isCompleted)}
                disabled={toggleMutation.isPending}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`offboard-${item.id}`}
                  className={cn(
                    'text-sm leading-snug cursor-pointer block',
                    isCompleted && 'line-through text-muted-foreground',
                  )}
                >
                  {String(label)}
                </label>
                {isCompleted && completedAt && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Concluido{completedByName ? ` por ${completedByName}` : ''} em{' '}
                    {formatDateTimeBR(String(completedAt))}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
