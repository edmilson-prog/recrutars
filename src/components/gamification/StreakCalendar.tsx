/**
 * StreakCalendar Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  format,
  subDays,
  isSameDay,
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame, Check, X, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreakState } from "@/types/gamification";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakCalendarProps {
  streak: StreakState;
  days?: number;
  className?: string;
}

type DayStatus = "active" | "missed" | "frozen" | "future" | "today";

interface CalendarDay {
  date: Date;
  status: DayStatus;
  isToday: boolean;
}

export function StreakCalendar({
  streak,
  days = 7,
  className,
}: StreakCalendarProps) {
  const prefersReducedMotion = useReducedMotion();
  const today = startOfDay(new Date());

  const calendarDays = useMemo((): CalendarDay[] => {
    const result: CalendarDay[] = [];
    const lastLogin = streak.lastLoginDate
      ? startOfDay(parseISO(streak.lastLoginDate))
      : null;

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const isToday = isSameDay(date, today);

      let status: DayStatus = "missed";

      if (isAfter(date, today)) {
        status = "future";
      } else if (isToday) {
        status = lastLogin && isSameDay(lastLogin, today) ? "active" : "today";
      } else if (lastLogin) {
        // Check if this day was within the streak
        const daysFromLastLogin = Math.floor(
          (lastLogin.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysFromLastLogin >= 0 && daysFromLastLogin < streak.current) {
          status = "active";
        } else if (streak.freezeUsedThisWeek && daysFromLastLogin === streak.current) {
          status = "frozen";
        }
      }

      result.push({ date, status, isToday });
    }

    return result;
  }, [streak, days, today]);

  const getStatusIcon = (status: DayStatus) => {
    switch (status) {
      case "active":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "frozen":
        return <Snowflake className="h-4 w-4 text-blue-400" />;
      case "today":
        return <Check className="h-4 w-4 text-muted-foreground" />;
      case "missed":
        return <X className="h-4 w-4 text-muted-foreground/50" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: DayStatus) => {
    switch (status) {
      case "active":
        return "bg-orange-500/20 border-orange-500/50";
      case "frozen":
        return "bg-blue-500/20 border-blue-500/50";
      case "today":
        return "bg-primary/10 border-primary/50";
      case "missed":
        return "bg-muted/50 border-muted";
      default:
        return "bg-muted/20 border-muted/50";
    }
  };

  return (
    <div className={cn("", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Últimos {days} dias</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/50" />
            Ativo
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50" />
            Freeze
          </span>
        </div>
      </div>

      <div className="flex gap-1">
        {calendarDays.map((day, index) => (
          <TooltipProvider key={day.date.toISOString()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={
                    prefersReducedMotion
                      ? {}
                      : { scale: 0.8, opacity: 0 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex-1 aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 min-w-[40px]",
                    getStatusColor(day.status),
                    day.isToday && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <span className="text-[10px] text-muted-foreground">
                    {format(day.date, "EEE", { locale: ptBR })}
                  </span>
                  {getStatusIcon(day.status)}
                  <span className="text-xs font-medium">
                    {format(day.date, "d")}
                  </span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{format(day.date, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
                <p className="text-xs text-muted-foreground">
                  {day.status === "active" && "Você acessou neste dia!"}
                  {day.status === "frozen" && "Streak protegido pelo freeze"}
                  {day.status === "today" && "Acesse hoje para manter o streak!"}
                  {day.status === "missed" && "Dia sem acesso"}
                  {day.status === "future" && "Dia futuro"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}

interface StreakCalendarCompactProps {
  streak: StreakState;
  days?: number;
  className?: string;
}

export function StreakCalendarCompact({
  streak,
  days = 7,
  className,
}: StreakCalendarCompactProps) {
  const today = startOfDay(new Date());
  const lastLogin = streak.lastLoginDate
    ? startOfDay(parseISO(streak.lastLoginDate))
    : null;

  const dots = useMemo(() => {
    const result: boolean[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const isToday = isSameDay(date, today);

      if (lastLogin) {
        const daysFromLastLogin = Math.floor(
          (lastLogin.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (isToday && isSameDay(lastLogin, today)) {
          result.push(true);
        } else if (daysFromLastLogin >= 0 && daysFromLastLogin < streak.current) {
          result.push(true);
        } else {
          result.push(false);
        }
      } else {
        result.push(false);
      }
    }
    return result;
  }, [streak, days, today, lastLogin]);

  return (
    <div className={cn("flex gap-1", className)}>
      {dots.map((active, index) => (
        <div
          key={index}
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            active ? "bg-orange-500" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

export default StreakCalendar;
