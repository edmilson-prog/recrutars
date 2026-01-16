/**
 * WeeklyCalendar Component
 * PRD-034: Agendamento de Entrevistas (Empresa)
 * Visualizacao semanal de entrevistas confirmadas
 */

import { useMemo } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Video, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Interview } from '@/types/interview';

interface WeeklyCalendarProps {
  interviews: Interview[];
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  onInterviewClick?: (interview: Interview) => void;
}

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9); // 9h - 18h
const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const typeIcons = {
  video: Video,
  phone: Phone,
  in_person: MapPin,
};

const typeColors = {
  video: 'bg-blue-500',
  phone: 'bg-green-500',
  in_person: 'bg-orange-500',
};

export function WeeklyCalendar({
  interviews,
  currentWeek,
  onWeekChange,
  onInterviewClick,
}: WeeklyCalendarProps) {
  // Calcular inicio da semana (domingo)
  const weekStart = useMemo(() =>
    startOfWeek(currentWeek, { weekStartsOn: 0 }),
    [currentWeek]
  );

  // Dias da semana
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Organizar entrevistas por dia e hora
  const interviewsByDayHour = useMemo(() => {
    const map: Record<string, Interview[]> = {};

    interviews.forEach((interview) => {
      if (interview.confirmedDatetime && interview.status === 'confirmed') {
        const date = new Date(interview.confirmedDatetime);
        const dayKey = format(date, 'yyyy-MM-dd');
        const hourKey = date.getHours();
        const key = `${dayKey}-${hourKey}`;

        if (!map[key]) {
          map[key] = [];
        }
        map[key].push(interview);
      }
    });

    return map;
  }, [interviews]);

  const handlePreviousWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    onWeekChange(new Date());
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Calendario Semanal</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(weekStart, "dd 'de' MMM", { locale: ptBR })} -{' '}
              {format(addDays(weekStart, 6), "dd 'de' MMM", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header - Dias da semana */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 text-xs text-muted-foreground text-center border-r">
                Hora
              </div>
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-2 text-center border-r last:border-r-0',
                    isToday(day) && 'bg-primary/5'
                  )}
                >
                  <p className="text-xs text-muted-foreground">
                    {DAYS_OF_WEEK[idx]}
                  </p>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isToday(day) && 'text-primary'
                    )}
                  >
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Grid de horarios */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="p-2 text-xs text-muted-foreground text-center border-r">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {weekDays.map((day, dayIdx) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const key = `${dayKey}-${hour}`;
                  const dayInterviews = interviewsByDayHour[key] || [];

                  return (
                    <div
                      key={dayIdx}
                      className={cn(
                        'min-h-[50px] p-1 border-r last:border-r-0 relative',
                        isToday(day) && 'bg-primary/5'
                      )}
                    >
                      {dayInterviews.map((interview, idx) => {
                        const TypeIcon = typeIcons[interview.type];
                        return (
                          <TooltipProvider key={interview.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => onInterviewClick?.(interview)}
                                  className={cn(
                                    'w-full p-1 rounded text-xs text-white flex items-center gap-1 mb-1 truncate',
                                    typeColors[interview.type],
                                    'hover:opacity-80 transition-opacity cursor-pointer'
                                  )}
                                >
                                  <TypeIcon className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{interview.title}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[200px]">
                                <p className="font-medium">{interview.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {interview.jobTitle}
                                </p>
                                <p className="text-xs">
                                  {format(
                                    new Date(interview.confirmedDatetime!),
                                    'HH:mm',
                                    { locale: ptBR }
                                  )}{' '}
                                  - {interview.duration}min
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="p-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Video</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Telefone</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span>Presencial</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
