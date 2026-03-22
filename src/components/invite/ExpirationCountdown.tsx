import { useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

interface ExpirationCountdownProps {
  expiresAt: string | null | undefined;
  className?: string;
  onExpire?: () => void;
}

function TimeSegment({ value, label, colorClass }: { value: number; label: string; colorClass: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={cn('min-w-[2.5rem] px-2 py-1 rounded-md text-center', colorClass)}>
        <span className="text-lg font-semibold font-mono tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

function Separator({ colorClass }: { colorClass: string }) {
  return (
    <span className={cn('text-lg font-bold -mt-2.5', colorClass)} aria-hidden="true">:</span>
  );
}

export function ExpirationCountdown({ expiresAt, className, onExpire }: ExpirationCountdownProps) {
  const countdown = useCountdown(expiresAt);

  useEffect(() => {
    if (countdown?.isExpired && onExpire) {
      onExpire();
    }
  }, [countdown?.isExpired, onExpire]);

  if (!countdown) return null;

  // Color tiers
  const isUrgent = countdown.isUrgent && !countdown.isExpired;
  const isNormal = !countdown.isUrgent && !countdown.isExpired;

  const pillClass = countdown.isExpired
    ? 'border-destructive/30 bg-destructive/5'
    : isUrgent
      ? 'border-amber-500/30 bg-amber-500/5'
      : 'border-secondary/30 bg-secondary/5';

  const boxClass = countdown.isExpired
    ? ''
    : isUrgent
      ? 'bg-amber-500/10'
      : 'bg-secondary/10';

  const numClass = countdown.isExpired
    ? 'text-destructive'
    : isUrgent
      ? 'text-amber-500'
      : 'text-secondary';

  // Expired: simplified pill
  if (countdown.isExpired) {
    return (
      <div
        role="timer"
        aria-live="polite"
        aria-label="Convite expirado"
        className={cn(
          'flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border',
          pillClass,
          className,
        )}
      >
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">Convite expirado</span>
      </div>
    );
  }

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Tempo restante: ${countdown.formatted}`}
      className={cn(
        'flex items-center justify-center gap-3 px-4 py-2.5 rounded-full border',
        pillClass,
        className,
      )}
    >
      <div className={cn('flex items-center gap-1.5 text-xs', numClass)}>
        <Clock className="h-3.5 w-3.5" />
        <span className="font-medium">Expira em</span>
      </div>

      <div className="flex items-center gap-1">
        {countdown.days >= 1 && (
          <>
            <TimeSegment value={countdown.days} label="dias" colorClass={cn(boxClass, numClass)} />
            <Separator colorClass={numClass} />
          </>
        )}
        <TimeSegment value={countdown.hours} label="hrs" colorClass={cn(boxClass, numClass)} />
        <Separator colorClass={numClass} />
        <TimeSegment value={countdown.minutes} label="min" colorClass={cn(boxClass, numClass)} />
        <Separator colorClass={numClass} />
        <TimeSegment value={countdown.seconds} label="seg" colorClass={cn(boxClass, numClass)} />
      </div>
    </div>
  );
}
