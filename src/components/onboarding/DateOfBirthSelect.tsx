/**
 * DateOfBirthSelect
 * Three independent Select dropdowns (Day / Month / Year) for date of birth input.
 * Replaces native <input type="date"> to avoid month-by-month navigation on mobile.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDaysInMonth } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DateOfBirthSelectProps {
  value?: string;
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  minAge?: number;
  maxAge?: number;
  hasError?: boolean;
  disabled?: boolean;
}

const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

function generateYears(minAge: number, maxAge: number): string[] {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - minAge;
  const endYear = currentYear - maxAge;
  const years: string[] = [];
  for (let y = startYear; y >= endYear; y--) {
    years.push(String(y));
  }
  return years;
}

function generateDays(month: string, year: string): string[] {
  const days: string[] = [];
  let maxDays = 31;
  if (month && year) {
    maxDays = getDaysInMonth(new Date(Number(year), Number(month) - 1));
  } else if (month) {
    maxDays = getDaysInMonth(new Date(2000, Number(month) - 1));
  }
  for (let d = 1; d <= maxDays; d++) {
    days.push(String(d).padStart(2, '0'));
  }
  return days;
}

export default function DateOfBirthSelect({
  value = '',
  onChange,
  onBlur,
  minAge = 16,
  maxAge = 100,
  hasError = false,
  disabled = false,
}: DateOfBirthSelectProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Parse incoming value (ISO "YYYY-MM-DD") into day/month/year
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-');
      setYear(y);
      setMonth(m);
      setDay(d);
    } else if (!value) {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);

  const years = generateYears(minAge, maxAge);
  const days = generateDays(month, year);

  // Emit ISO date when all three fields are set
  const emitChange = useCallback(
    (d: string, m: string, y: string) => {
      if (d && m && y) {
        isInternalUpdate.current = true;
        onChange(`${y}-${m}-${d}`);
      } else if (value) {
        // If user clears a field, emit empty to reset parent
        isInternalUpdate.current = true;
        onChange('');
      }
    },
    [onChange, value]
  );

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    emitChange(newDay, month, year);
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    // Reset day if it exceeds the new month's max
    const maxDays = getDaysInMonth(
      new Date(year ? Number(year) : 2000, Number(newMonth) - 1)
    );
    if (day && Number(day) > maxDays) {
      setDay('');
      emitChange('', newMonth, year);
    } else {
      emitChange(day, newMonth, year);
    }
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    // Reset day if it exceeds the new month/year combo (e.g., Feb 29 on non-leap year)
    if (month && day) {
      const maxDays = getDaysInMonth(new Date(Number(newYear), Number(month) - 1));
      if (Number(day) > maxDays) {
        setDay('');
        emitChange('', month, newYear);
        return;
      }
    }
    emitChange(day, month, newYear);
  };

  // Handle blur on the container — only fire onBlur when focus leaves all 3 selects
  const handleContainerBlur = useCallback(() => {
    if (!onBlur) return;
    // Use setTimeout to check if focus moved to another child within the container
    setTimeout(() => {
      if (
        containerRef.current &&
        !containerRef.current.contains(document.activeElement)
      ) {
        onBlur();
      }
    }, 0);
  }, [onBlur]);

  const errorClass = hasError ? 'border-destructive' : '';

  return (
    <div
      ref={containerRef}
      className="flex gap-2"
      onBlur={handleContainerBlur}
      role="group"
      aria-label="Data de nascimento"
    >
      {/* Day */}
      <Select value={day} onValueChange={handleDayChange} disabled={disabled}>
        <SelectTrigger
          className={cn('w-[72px] flex-shrink-0', errorClass)}
          aria-label="Dia do nascimento"
        >
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month */}
      <Select value={month} onValueChange={handleMonthChange} disabled={disabled}>
        <SelectTrigger
          className={cn('flex-1 min-w-0', errorClass)}
          aria-label="Mês do nascimento"
        >
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select value={year} onValueChange={handleYearChange} disabled={disabled}>
        <SelectTrigger
          className={cn('w-[90px] flex-shrink-0', errorClass)}
          aria-label="Ano do nascimento"
        >
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
