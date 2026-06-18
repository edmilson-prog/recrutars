/**
 * Finance row converters: DB row (snake_case) → TypeScript entity (camelCase).
 *
 * Pure functions — no Supabase imports, no side effects, no status derivation.
 * Effective-status computation lives in '@/lib/finance/status'.
 */

import type {
  FinancialCategory,
  FinancialAttachment,
  FinancialEntry,
  FinancialRecurrence,
} from '@/types/finance';

// Utility: treat null as undefined so optional fields stay clean.
function orUndef<T>(value: T | null | undefined): T | undefined {
  return value == null ? undefined : value;
}

// ---------------------------------------------------------------------------
// rowToFinancialCategory
// ---------------------------------------------------------------------------

export function rowToFinancialCategory(row: Record<string, unknown>): FinancialCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as FinancialCategory['type'],
    color: orUndef(row.color as string | null),
    isActive: row.is_active as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ---------------------------------------------------------------------------
// rowToFinancialAttachment
// ---------------------------------------------------------------------------

export function rowToFinancialAttachment(row: Record<string, unknown>): FinancialAttachment {
  return {
    id: row.id as string,
    entryId: row.entry_id as string,
    storagePath: row.storage_path as string,
    fileName: row.file_name as string,
    fileType: row.file_type as string,
    fileSize: orUndef(row.file_size as number | null),
    kind: orUndef(row.kind as FinancialAttachment['kind'] | null),
    uploadedBy: orUndef(row.uploaded_by as string | null),
    createdAt: row.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// rowToFinancialEntry
// ---------------------------------------------------------------------------

export function rowToFinancialEntry(row: Record<string, unknown>): FinancialEntry {
  return {
    id: row.id as string,
    type: row.type as FinancialEntry['type'],
    // status is stored — never derived here; use effectiveStatus() for display
    status: row.status as FinancialEntry['status'],
    categoryId: orUndef(row.category_id as string | null),
    categoryName: orUndef(row.category_name as string | null),
    description: row.description as string,
    counterpartyName: orUndef(row.counterparty_name as string | null),
    counterpartyCompanyId: orUndef(row.counterparty_company_id as string | null),
    amount: row.amount as number,
    currency: row.currency as string,
    paymentMethod: orUndef(row.payment_method as FinancialEntry['paymentMethod'] | null),
    competenceDate: row.competence_date as string,
    dueDate: row.due_date as string,
    paidDate: orUndef(row.paid_date as string | null),
    notes: orUndef(row.notes as string | null),
    installmentGroupId: orUndef(row.installment_group_id as string | null),
    installmentNumber: orUndef(row.installment_number as number | null),
    installmentTotal: orUndef(row.installment_total as number | null),
    recurrenceId: orUndef(row.recurrence_id as string | null),
    createdBy: orUndef(row.created_by as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ---------------------------------------------------------------------------
// rowToFinancialRecurrence
// ---------------------------------------------------------------------------

export function rowToFinancialRecurrence(row: Record<string, unknown>): FinancialRecurrence {
  return {
    id: row.id as string,
    type: row.type as FinancialRecurrence['type'],
    description: row.description as string,
    categoryId: orUndef(row.category_id as string | null),
    counterpartyName: orUndef(row.counterparty_name as string | null),
    counterpartyCompanyId: orUndef(row.counterparty_company_id as string | null),
    amount: row.amount as number,
    paymentMethod: orUndef(row.payment_method as FinancialRecurrence['paymentMethod'] | null),
    frequency: row.frequency as FinancialRecurrence['frequency'],
    interval: row.interval as number,
    dayOfMonth: orUndef(row.day_of_month as number | null),
    startDate: row.start_date as string,
    endDate: orUndef(row.end_date as string | null),
    nextRunDate: orUndef(row.next_run_date as string | null),
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
