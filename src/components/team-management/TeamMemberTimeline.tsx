/**
 * TeamMemberTimeline
 * PRD-090 Phase 5: Timeline consolidada do ciclo de vida do colaborador.
 *
 * Vertical timeline with color-coded icons per event type, expandable details,
 * filters by event type and period, and manual note addition.
 * Pattern based on FlagAuditTimeline but extended for 14+ event types.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  UserMinus,
  Unlink,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  ArrowRightLeft,
  Briefcase,
  StickyNote,
  ClipboardCheck,
  Send,
  ShieldOff,
  CheckSquare,
  CalendarX,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Plus,
  Filter,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTeamMemberEvents } from '@/hooks/useTeamMemberEventsQuery';
import { useAddTimelineNote } from '@/hooks/useTeamLifecycleMutation';
import type { TeamMemberEvent, TeamMemberEventType, EventVisibility } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Event type configuration (icon, label, color)
// ---------------------------------------------------------------------------

const eventConfig: Record<TeamMemberEventType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  dotColor: string;
}> = {
  hired: {
    label: 'Admissão',
    icon: UserPlus,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    dotColor: 'bg-green-500',
  },
  terminated: {
    label: 'Desligamento',
    icon: UserMinus,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    dotColor: 'bg-red-500',
  },
  unlinked: {
    label: 'Desvinculação',
    icon: Unlink,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    dotColor: 'bg-gray-500',
  },
  reactivated: {
    label: 'Recontratação',
    icon: RotateCcw,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    dotColor: 'bg-blue-500',
  },
  leave_started: {
    label: 'Afastamento',
    icon: PauseCircle,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    dotColor: 'bg-amber-500',
  },
  leave_returned: {
    label: 'Retorno',
    icon: PlayCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    dotColor: 'bg-green-500',
  },
  promoted: {
    label: 'Promoção',
    icon: TrendingUp,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    dotColor: 'bg-purple-500',
  },
  department_transferred: {
    label: 'Transferência',
    icon: ArrowRightLeft,
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    dotColor: 'bg-cyan-500',
  },
  position_changed: {
    label: 'Mudança de Cargo',
    icon: Briefcase,
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    dotColor: 'bg-indigo-500',
  },
  note_added: {
    label: 'Nota',
    icon: StickyNote,
    className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
    dotColor: 'bg-slate-500',
  },
  test_completed: {
    label: 'Teste Concluído',
    icon: ClipboardCheck,
    className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    dotColor: 'bg-teal-500',
  },
  test_invited: {
    label: 'Convite de Teste',
    icon: Send,
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    dotColor: 'bg-sky-500',
  },
  anonymized: {
    label: 'Anonimizado',
    icon: ShieldOff,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    dotColor: 'bg-red-500',
  },
  offboarding_item_completed: {
    label: 'Offboarding',
    icon: CheckSquare,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    dotColor: 'bg-gray-400',
  },
  scheduled_termination_set: {
    label: 'Desligamento Agendado',
    icon: CalendarClock,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    dotColor: 'bg-amber-500',
  },
  scheduled_termination_cancelled: {
    label: 'Agendamento Cancelado',
    icon: CalendarX,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    dotColor: 'bg-green-500',
  },
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Metadata renderer
// ---------------------------------------------------------------------------

function renderMetadata(event: TeamMemberEvent): React.ReactNode {
  const meta = event.metadata;
  if (!meta || Object.keys(meta).length === 0) return null;

  const items: string[] = [];

  if (meta.previousPositionTitle && meta.newPositionTitle) {
    items.push(`${meta.previousPositionTitle} → ${meta.newPositionTitle}`);
  }
  if (meta.previousDepartmentName && meta.newDepartmentName) {
    items.push(`${meta.previousDepartmentName} → ${meta.newDepartmentName}`);
  }
  if (meta.leaveType) {
    const labels: Record<string, string> = {
      medical_leave: 'Licença médica',
      maternity: 'Maternidade/Paternidade',
      vacation_extended: 'Férias prolongadas',
      unpaid_leave: 'Licença sem remuneração',
      sabbatical: 'Sabático',
      other: 'Outro',
    };
    items.push(labels[meta.leaveType as string] ?? String(meta.leaveType));
  }
  if (meta.expectedReturn) {
    items.push(`Retorno previsto: ${formatDate(meta.expectedReturn as string)}`);
  }
  if (meta.justification) {
    items.push(String(meta.justification));
  }
  if (meta.reason) {
    items.push(String(meta.reason));
  }
  if (meta.notes) {
    items.push(String(meta.notes));
  }
  if (meta.text) {
    items.push(String(meta.text));
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-1.5 space-y-0.5">
      {items.map((item, i) => (
        <p key={i} className="text-xs text-muted-foreground/80">{item}</p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline component
// ---------------------------------------------------------------------------

interface TeamMemberTimelineProps {
  memberId: string;
  companyId?: string;
  performedBy?: string;
}

const PAGE_SIZE = 50;

const EVENT_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os eventos' },
  { value: 'hired', label: 'Admissão' },
  { value: 'terminated', label: 'Desligamento' },
  { value: 'reactivated', label: 'Recontratação' },
  { value: 'leave_started', label: 'Afastamento' },
  { value: 'leave_returned', label: 'Retorno' },
  { value: 'promoted', label: 'Promoção' },
  { value: 'department_transferred', label: 'Transferência' },
  { value: 'position_changed', label: 'Mudança de Cargo' },
  { value: 'note_added', label: 'Notas' },
  { value: 'test_completed', label: 'Testes' },
];

export function TeamMemberTimeline({
  memberId,
  companyId,
  performedBy,
}: TeamMemberTimelineProps) {
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<EventVisibility>('all_managers');

  const { data: events = [], isLoading } = useTeamMemberEvents(memberId, {
    limit: PAGE_SIZE,
  });
  const addNote = useAddTimelineNote();

  const filteredEvents = useMemo(() => {
    if (eventTypeFilter === 'all') return events;
    return events.filter((e) => e.eventType === eventTypeFilter);
  }, [events, eventTypeFilter]);

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !performedBy) return;
    addNote.mutate(
      {
        teamMemberId: memberId,
        text: noteText.trim(),
        visibility: noteVisibility,
        performedBy,
      },
      {
        onSuccess: () => {
          setNoteText('');
          setShowNoteForm(false);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Timeline do Colaborador
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredEvents.length} eventos)
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {performedBy && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNoteForm(!showNoteForm)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Nota
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Note form */}
        <AnimatePresence>
          {showNoteForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-2 overflow-hidden"
            >
              <Textarea
                placeholder="Adicionar nota à timeline..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex items-center gap-2 justify-between">
                <Select
                  value={noteVisibility}
                  onValueChange={(v) => setNoteVisibility(v as EventVisibility)}
                >
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_managers">Visível para gestores</SelectItem>
                    <SelectItem value="managers_and_admin">Gestores e admin</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNoteForm(false);
                      setNoteText('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || addNote.isPending}
                  >
                    {addNote.isPending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredEvents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum evento registrado.
          </p>
        )}

        {/* Timeline */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="relative pl-8 space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

            <AnimatePresence initial={false}>
              {filteredEvents.map((event) => {
                const config = eventConfig[event.eventType] ?? eventConfig.note_added;
                const Icon = config.icon;
                const isExpanded = expandedEvents.has(event.id);
                const hasMetadata =
                  event.metadata && Object.keys(event.metadata).length > 0;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative pb-5 last:pb-0"
                  >
                    {/* Dot */}
                    <div
                      className={cn(
                        'absolute left-[-22px] mt-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background',
                        config.dotColor,
                      )}
                    >
                      <Icon className="w-2.5 h-2.5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-2 py-0 font-medium',
                            config.className,
                          )}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.eventDate)}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-sm text-foreground">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {event.performedByName && (
                          <span>
                            Por:{' '}
                            <span className="font-medium">
                              {event.performedByName}
                            </span>
                          </span>
                        )}
                        <span className="text-muted-foreground/50">
                          {formatDateTime(event.createdAt)}
                        </span>
                        {hasMetadata && (
                          <button
                            onClick={() => toggleExpand(event.id)}
                            className="inline-flex items-center gap-0.5 hover:text-foreground transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            Detalhes
                          </button>
                        )}
                      </div>

                      {/* Expandable metadata */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            {renderMetadata(event)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
