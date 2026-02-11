/**
 * Trial Rules — Pure business logic for trial status calculation
 * PRD-074: Reestruturacao dos Planos de Empresas
 *
 * Computes trial status, warning levels, and messages
 * based on trial start/end dates. No UI dependencies.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TrialWarningLevel = 'low' | 'medium' | 'high' | 'urgent' | 'expired';

export interface TrialStatus {
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  warningLevel: TrialWarningLevel;
  startDate: string;
  endDate: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function diffInDays(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Determines the warning level based on days remaining.
 *
 * PRD-074 RF-009:
 * - low:     16+ days remaining (subtle badge)
 * - medium:  8-15 days remaining (informational banner)
 * - high:    2-7 days remaining (non-dismissable alert)
 * - urgent:  0-1 days remaining (red alert)
 * - expired: < 0 days (full block)
 */
export function getWarningLevel(daysRemaining: number): TrialWarningLevel {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 1) return 'urgent';
  if (daysRemaining <= 7) return 'high';
  if (daysRemaining <= 15) return 'medium';
  return 'low';
}

/**
 * Whether the warning at this level can be dismissed by the user.
 *
 * PRD-074 RF-010: Non-dismissable in the last 7 days.
 */
export function isDismissable(level: TrialWarningLevel): boolean {
  return level === 'low' || level === 'medium';
}

/**
 * Computes full trial status from start and end dates.
 */
export function calculateTrialStatus(
  trialStartDate: string,
  trialEndDate: string,
): TrialStatus {
  const now = today();
  const totalDays = diffInDays(trialStartDate, trialEndDate);
  const daysElapsed = diffInDays(trialStartDate, now);
  const daysRemaining = diffInDays(now, trialEndDate);
  const warningLevel = getWarningLevel(daysRemaining);

  return {
    isTrial: true,
    isExpired: daysRemaining < 0,
    daysRemaining,
    daysElapsed,
    totalDays,
    warningLevel,
    startDate: trialStartDate,
    endDate: trialEndDate,
  };
}

/**
 * Returns a user-facing warning message for the given level and days remaining.
 */
export function getWarningMessage(
  level: TrialWarningLevel,
  daysRemaining: number,
): string {
  switch (level) {
    case 'low':
      return `Periodo de teste \u2014 ${daysRemaining} dias restantes`;

    case 'medium':
      return `Seu periodo gratuito termina em ${daysRemaining} dias. Conheca nossos planos.`;

    case 'high':
      return `Faltam apenas ${daysRemaining} dias! Assine agora para nao perder acesso.`;

    case 'urgent':
      return daysRemaining <= 0
        ? 'Ultimo dia de acesso gratuito!'
        : 'Amanha seu acesso sera encerrado!';

    case 'expired':
      return 'Seu periodo gratuito encerrou. Assine um plano para continuar.';
  }
}

/**
 * Returns null TrialStatus for non-trial subscriptions.
 */
export function getNoTrialStatus(): TrialStatus {
  return {
    isTrial: false,
    isExpired: false,
    daysRemaining: 0,
    daysElapsed: 0,
    totalDays: 0,
    warningLevel: 'low',
    startDate: '',
    endDate: '',
  };
}
