/**
 * PositionHistoryCard
 * PRD-090 Phase 4: Card showing chronological position history
 * derived from lifecycle events (hired, promoted, transferred, position_changed).
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeamMemberEvents } from '@/hooks/useTeamMemberEventsQuery';
import type { TeamMemberEvent, TeamMemberEventType } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PositionHistoryCardProps {
  memberId: string;
  currentDepartmentName?: string;
  currentPositionTitle?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const POSITION_EVENT_TYPES: TeamMemberEventType[] = [
  'hired',
  'promoted',
  'department_transferred',
  'position_changed',
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  hired: 'Admissão',
  promoted: 'Promoção',
  department_transferred: 'Transferência',
  position_changed: 'Mudança de cargo',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  hired: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  promoted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  department_transferred: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  position_changed: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
};

interface HistoryEntry {
  id: string;
  eventType: TeamMemberEventType;
  date: string;
  positionTitle: string;
  departmentName: string;
}

function formatDateBR(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Extract position / department info from event metadata.
 * The metadata shape varies by event type, so we try multiple keys.
 */
function extractPositionInfo(event: TeamMemberEvent): { position: string; department: string } {
  const meta = event.metadata ?? {};

  // For promoted / position_changed / department_transferred,
  // metadata typically has new_position_title / new_department_name
  const position =
    (meta.new_position_title as string) ??
    (meta.newPositionTitle as string) ??
    (meta.position_title as string) ??
    (meta.positionTitle as string) ??
    '';
  const department =
    (meta.new_department_name as string) ??
    (meta.newDepartmentName as string) ??
    (meta.department_name as string) ??
    (meta.departmentName as string) ??
    '';

  return { position, department };
}

function buildHistoryEntries(
  events: TeamMemberEvent[],
  currentDepartmentName?: string,
  currentPositionTitle?: string,
): HistoryEntry[] {
  // Filter to position-related events only
  const relevant = events
    .filter((e) => POSITION_EVENT_TYPES.includes(e.eventType))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  return relevant.map((event) => {
    const info = extractPositionInfo(event);

    // For 'hired' events, metadata may not contain position info — fall back to current
    const positionTitle = info.position || currentPositionTitle || '—';
    const departmentName = info.department || currentDepartmentName || '—';

    return {
      id: event.id,
      eventType: event.eventType,
      date: event.eventDate,
      positionTitle,
      departmentName,
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PositionHistoryCard({
  memberId,
  currentDepartmentName,
  currentPositionTitle,
}: PositionHistoryCardProps) {
  const { data: events = [], isLoading } = useTeamMemberEvents(memberId);

  const entries = useMemo(
    () => buildHistoryEntries(events, currentDepartmentName, currentPositionTitle),
    [events, currentDepartmentName, currentPositionTitle],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-muted-foreground" />
          Histórico de Posições
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum registro de posição encontrado.
          </p>
        ) : (
          <ol className="relative border-l border-border ml-2 space-y-4">
            {entries.map((entry, idx) => {
              const isLast = idx === entries.length - 1;
              const endLabel = isLast ? 'atual' : null;

              return (
                <li key={entry.id} className="ml-4">
                  {/* Timeline dot */}
                  <span
                    className={cn(
                      'absolute -left-[5px] h-2.5 w-2.5 rounded-full border border-background',
                      isLast ? 'bg-primary' : 'bg-muted-foreground/40',
                    )}
                    aria-hidden="true"
                  />

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-sm font-medium', isLast && 'text-primary')}>
                        {entry.positionTitle}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs border-transparent',
                          EVENT_TYPE_COLORS[entry.eventType] ?? '',
                        )}
                      >
                        {EVENT_TYPE_LABELS[entry.eventType] ?? entry.eventType}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {entry.departmentName}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDateBR(entry.date)}
                      {endLabel && (
                        <span className="ml-1 font-medium text-primary">
                          — {endLabel}
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
