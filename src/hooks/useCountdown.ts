import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  isUrgent: boolean;
  formatted: string;
}

function calculateCountdown(expiresAt: string): CountdownResult {
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const diffMs = expires - now;

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true, isUrgent: true, formatted: 'Convite expirado' };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  let formatted: string;
  if (days >= 1) {
    formatted = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else if (hours >= 1) {
    formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else {
    formatted = `${pad(minutes)}m ${pad(seconds)}s`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
    isUrgent: totalSeconds < 7200, // < 2 hours
    formatted,
  };
}

export function useCountdown(expiresAt: string | null | undefined): CountdownResult | null {
  const [countdown, setCountdown] = useState<CountdownResult | null>(() =>
    expiresAt ? calculateCountdown(expiresAt) : null
  );

  const update = useCallback(() => {
    if (!expiresAt) return;
    setCountdown(calculateCountdown(expiresAt));
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) {
      setCountdown(null);
      return;
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, update]);

  return countdown;
}
