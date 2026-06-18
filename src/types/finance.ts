/**
 * Types for the Financial / Cash Flow module (manual entries).
 * Design spec: docs/superpowers/specs/2026-06-17-lancamentos-financeiros-design.md
 */

// ---------------------------------------------------------------------------
// Enums (literal unions)
// ---------------------------------------------------------------------------

export type FinancialType = 'income' | 'expense';

/** Stored status. `overdue` is NEVER stored — it is derived from status+dueDate. */
export type EntryStatus = 'pending' | 'paid' | 'canceled';

/** Derived status used by KPIs, filters and bands. */
export type EffectiveStatus = EntryStatus | 'overdue';

export type PaymentMethod =
  | 'card_credit'
  | 'card_debit'
  | 'pix'
  | 'boleto'
  | 'transfer'
  | 'cash'
  | 'other';

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type AttachmentKind = 'invoice' | 'receipt' | 'other';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface FinancialCategory {
  id: string;
  name: string;
  type: FinancialType;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAttachment {
  id: string;
  entryId: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  kind?: AttachmentKind;
  uploadedBy?: string;
  createdAt: string;
}

export interface FinancialEntry {
  id: string;
  type: FinancialType;
  status: EntryStatus;
  categoryId?: string;
  /** Denormalized for table/list display; resolved on read when joined. */
  categoryName?: string;
  description: string;
  counterpartyName?: string;
  counterpartyCompanyId?: string;
  /** Always positive; the sign/colour comes from `type`. */
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  competenceDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  recurrenceId?: string;
  attachments?: FinancialAttachment[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecurrence {
  id: string;
  type: FinancialType;
  description: string;
  categoryId?: string;
  counterpartyName?: string;
  counterpartyCompanyId?: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  frequency: RecurrenceFrequency;
  interval: number;
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
  nextRunDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Query / aggregation shapes
// ---------------------------------------------------------------------------

export interface EntryFilters {
  search?: string;
  type?: FinancialType;
  /** May be `overdue` (derived) — the service translates it to status+date. */
  status?: EffectiveStatus;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  dateField?: 'due' | 'competence';
  dateFrom?: string;
  dateTo?: string;
}

export interface InstallmentItem {
  number: number;
  dueDate: string;
  amount: number;
}

export interface CashflowSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  cashBalance: number;
  overdueAmount: number;
  overdueCount: number;
  dueSoon7Amount: number;
  dueSoon7Count: number;
  byCategory: { categoryId: string; name: string; total: number; color?: string }[];
  monthly: {
    month: string;
    assinaturas: number;
    avulsos: number;
    income: number;
    expense: number;
    projected?: number;
  }[];
  mrr: number;
}
