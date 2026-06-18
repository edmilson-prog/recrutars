/**
 * Derived effective-status helper for the Financial / Cash Flow module.
 * `overdue` is NEVER stored in the DB — it is computed at read time.
 *
 * Single canonical source: import from '@/lib/finance/status'.
 * Task 2.2 will extend this file with daysUntil / todayISO helpers.
 */

import type { EntryStatus, EffectiveStatus } from '@/types/finance';

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
