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
  today?: string,
): EffectiveStatus {
  const ref = today ?? todayISO();
  if (status === 'pending' && dueDateISO < ref) return 'overdue';
  return status;
}

/**
 * Today's date in the viewer's LOCAL timezone, as `YYYY-MM-DD`.
 *
 * Deliberately not `new Date().toISOString().slice(0, 10)`: that yields the UTC
 * date, which in UTC-3 rolls over at 21:00 local. An entry due today would then
 * be classified as overdue for the last three hours of every day.
 */
export function todayISO(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
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
  today?: string,
): DueWindow | null {
  if (status !== 'pending') return null;
  const ref = today ?? todayISO();
  if (dueDateISO < ref) return 'overdue';
  const days = daysBetween(ref, dueDateISO);
  if (days <= 7) return 'due7';
  if (days <= 30) return 'due8_30';
  return 'future';
}

/**
 * Whole days from today to `dueDateISO`.
 * Positive = future, negative = overdue, 0 = due today.
 */
export function daysUntil(dueDateISO: string, today?: string): number {
  return daysBetween(today ?? todayISO(), dueDateISO);
}
