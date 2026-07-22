/**
 * Derived effective-status helper for the Financial / Cash Flow module.
 * `overdue` is NEVER stored in the DB — it is computed at read time.
 *
 * Single canonical source: import from '@/lib/finance/status'.
 * Task 2.2 will extend this file with daysUntil / todayISO helpers.
 */

import type { EntryStatus, EffectiveStatus, DueWindow } from '@/types/finance';

/**
 * Derives the effective display status for a financial entry.
 *
 * Rules:
 * - A `pending` entry whose `dueDateISO` is **strictly before** `todayISO`
 *   is considered `overdue`.
 * - Any other combination returns the stored `status` unchanged.
 *
 * Dates must be ISO `YYYY-MM-DD`. Lexicographic string comparison is correct
 * for that format and avoids timezone hazards.
 *
 * @param status    The stored EntryStatus from the DB (never 'overdue').
 * @param dueDateISO  The entry's due date in YYYY-MM-DD format.
 * @param todayISO  Today's date in YYYY-MM-DD format. Defaults to today.
 */
export function effectiveStatus(
  status: EntryStatus,
  dueDateISO: string,
  todayISO?: string,
): EffectiveStatus {
  const today = todayISO ?? new Date().toISOString().slice(0, 10);
  if (status === 'pending' && dueDateISO < today) return 'overdue';
  return status;
}

/** Parses an ISO `YYYY-MM-DD` into a UTC epoch, avoiding timezone drift. */
function toUTCDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole days from `fromISO` to `toISO`. Negative when `toISO` is earlier. */
export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((toUTCDay(toISO) - toUTCDay(fromISO)) / 86_400_000);
}

/**
 * Classifies an entry into a due-date window.
 *
 * Returns `null` for anything not `pending`: paid and canceled entries have no
 * meaningful due window, and letting them fall into one would make the totals
 * of the Flow view and the dashboard urgency band disagree with the table.
 *
 * This is the single classifier shared by the filter bar, the Flow view
 * sections and the dashboard band — so those three cannot drift apart.
 */
export function dueWindowOf(
  status: EntryStatus,
  dueDateISO: string,
  todayISO?: string,
): DueWindow | null {
  if (status !== 'pending') return null;
  const today = todayISO ?? new Date().toISOString().slice(0, 10);
  if (dueDateISO < today) return 'overdue';
  const days = daysBetween(today, dueDateISO);
  if (days <= 7) return 'due7';
  if (days <= 30) return 'due8_30';
  return 'future';
}
