/**
 * Finance Service — Interface & Factory
 * Lancamentos Financeiros (Fluxo de Caixa): entries, anexos, parcelas,
 * recorrencias e agregacoes do dashboard. RLS admin-only.
 *
 * Padrao de plansService: interface + factory lazy + impl `.supabase.ts`.
 * O normalizador rowToFinancialEntry vive em @/lib/finance/financeConverters.
 */

import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types';
import type {
  FinancialEntry,
  FinancialAttachment,
  FinancialRecurrence,
  EntryFilters,
  InstallmentItem,
  CashflowSummary,
  PaymentMethod,
  AttachmentKind,
} from '@/types/finance';

export interface IFinanceService {
  // --- Entries -----------------------------------------------------------
  getEntries(
    filters?: EntryFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<FinancialEntry>>;
  getEntry(id: string): Promise<FinancialEntry | null>;
  createEntry(input: Partial<FinancialEntry>): Promise<FinancialEntry>;
  createEntryWithInstallments(
    base: Partial<FinancialEntry>,
    items: InstallmentItem[],
  ): Promise<FinancialEntry[]>;
  updateEntry(id: string, updates: Partial<FinancialEntry>): Promise<FinancialEntry>;
  markPaid(id: string, paidDate: string, paymentMethod?: PaymentMethod): Promise<FinancialEntry>;
  cancelEntry(id: string): Promise<FinancialEntry>;
  bulkMarkPaid(ids: string[], paidDate: string): Promise<number>;
  deleteEntry(id: string): Promise<void>;

  // --- Attachments -------------------------------------------------------
  uploadAttachment(entryId: string, file: File, kind?: AttachmentKind): Promise<FinancialAttachment>;
  getAttachmentSignedUrl(storagePath: string): Promise<string>;
  removeAttachment(id: string): Promise<void>;

  // --- Dashboard ---------------------------------------------------------
  getCashflowSummary(params: {
    from: string;
    to: string;
    scope: 'consolidated' | 'avulsos' | 'assinaturas';
  }): Promise<CashflowSummary>;

  // --- Recurrences -------------------------------------------------------
  getRecurrences(): Promise<FinancialRecurrence[]>;
  createRecurrence(input: Partial<FinancialRecurrence>): Promise<FinancialRecurrence>;
  updateRecurrence(id: string, updates: Partial<FinancialRecurrence>): Promise<FinancialRecurrence>;
  deleteRecurrence(id: string): Promise<void>;
}

let _instance: IFinanceService | null = null;

export async function getFinanceService(): Promise<IFinanceService> {
  if (_instance) return _instance;

  const { SupabaseFinanceService } = await import('./financeService.supabase');
  _instance = new SupabaseFinanceService();
  return _instance;
}

/** Reseta o singleton (usado em testes). */
export function resetFinanceService(): void {
  _instance = null;
}
