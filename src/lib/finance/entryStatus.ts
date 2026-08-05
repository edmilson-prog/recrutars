/**
 * Entry-level adapters for effective status and due-date bucketing.
 *
 * These are ergonomics for components — they take a `FinancialEntry`-shaped
 * object and an optional `today: Date`. All real logic is delegated to the
 * canonical string-based helpers in `@/lib/finance/status` (per consistency
 * note 1 of the plan: use the canonical effectiveStatus, do not reimplement).
 *
 * The bucket vocabulary reuses DueWindow (task 1.11) and extends it with the
 * two terminal statuses, so the Flow view can render every entry into a
 * distinct section — no 'other' bucket that would hide cancelled or future
 * entries.
 */

import type { EntryStatus, EffectiveStatus } from '@/types/finance';
import {
  effectiveStatus,
  daysUntil,
  dueWindowOf,
  type DueWindow,
} from '@/lib/finance/status';

type EntryLike = { status: EntryStatus; dueDate: string };

/** Flow-view bucket: the pending due-windows plus the two terminal statuses. */
export type DueBucket = DueWindow | 'paid' | 'canceled';

/** Local date (viewer's timezone) as YYYY-MM-DD — matches todayISO(). */
function dateToISO(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function getEffectiveStatus(entry: EntryLike, today?: Date): EffectiveStatus {
  return effectiveStatus(entry.status, entry.dueDate, today ? dateToISO(today) : undefined);
}

export function isOverdue(entry: EntryLike, today?: Date): boolean {
  return getEffectiveStatus(entry, today) === 'overdue';
}

export function daysUntilDue(entry: { dueDate: string }, today?: Date): number {
  return daysUntil(entry.dueDate, today ? dateToISO(today) : undefined);
}

export function bucketForEntry(entry: EntryLike, today?: Date): DueBucket {
  if (entry.status === 'paid') return 'paid';
  if (entry.status === 'canceled') return 'canceled';
  // pending → always a DueWindow (dueWindowOf returns null only for non-pending).
  return dueWindowOf(entry.status, entry.dueDate, today ? dateToISO(today) : undefined) ?? 'future';
}
