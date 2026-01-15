/**
 * MiniCalendar Component
 * PRD-027: Agendamento de Entrevistas (Candidato)
 */

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Interview } from '@/types/interview';

interface MiniCalendarProps {
  interviews: Interview[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export function MiniCalendar({
  interviews,
  selectedDate,
  onSelectDate,
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get dates that have interviews
  const interviewDates = useMemo(() => {
    const dates = new Map<string, Interview[]>();
    interviews.forEach((interview) => {
      // For confirmed interviews
      if (interview.confirmedDatetime) {
        const dateKey = interview.confirmedDatetime.split('T')[0];
        const existing = dates.get(dateKey) || [];
        dates.set(dateKey, [...existing, interview]);
      }
      // For pending interviews with proposed slots
      if (interview.status === 'pending_candidate' && interview.proposedSlots) {
        interview.proposedSlots.forEach((slot) => {
          const dateKey = slot.datetime.split('T')[0];
          const existing = dates.get(dateKey) || [];
          if (!existing.some((i) => i.id === interview.id)) {
            dates.set(dateKey, [...existing, interview]);
          }
        });
      }
    });
    return dates;
  }, [interviews]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Get interviews for a specific date
  const getInterviewsForDate = (date: Date): Interview[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return interviewDates.get(dateKey) || [];
  };

  // Check if date has interviews
  const hasInterviews = (date: Date): boolean => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return interviewDates.has(dateKey);
  };

  // Navigation
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Day names
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Get interviews for selected date
  const selectedDateInterviews = selectedDate ? getInterviewsForDate(selectedDate) : [];

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((name) => (
            <div key={name} className="text-center text-xs font-medium text-muted-foreground py-1">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const hasInterview = hasInterviews(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => onSelectDate?.(day)}
                className={cn(
                  'relative aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  !isCurrentMonth && 'text-muted-foreground/50',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                  isTodayDate && !isSelected && 'border border-primary',
                  hasInterview && !isSelected && 'font-medium'
                )}
              >
                <span>{format(day, 'd')}</span>
                {hasInterview && (
                  <span
                    className={cn(
                      'absolute bottom-1 w-1.5 h-1.5 rounded-full',
                      isSelected ? 'bg-primary-foreground' : 'bg-primary'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Entrevista agendada</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={goToToday}>
            Hoje
          </Button>
        </div>

        {/* Selected date interviews */}
        {selectedDate && selectedDateInterviews.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}:
            </p>
            <div className="space-y-2">
              {selectedDateInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-2 rounded-md bg-muted/50 text-sm"
                >
                  <p className="font-medium">{interview.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {interview.companyName}
                    {interview.confirmedDatetime && (
                      <span> • {format(new Date(interview.confirmedDatetime), 'HH:mm')}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
