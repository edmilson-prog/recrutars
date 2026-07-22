/**
 * Finance Service — Supabase Implementation
 * Tabelas: financial_entries, financial_attachments, financial_recurrences.
 * RPCs: create_financial_entry_with_installments, mark_financial_entry_paid.
 * Storage: bucket privado financial-documents (signed URLs).
 *
 * Os normalizadores de linha (rowToFinancialEntry etc.) sao os canonicos de
 * @/lib/finance/financeConverters — nao duplicar. Este arquivo apenas adapta o
 * shape do join Supabase (`financial_categories(name)`, `financial_attachments(*)`)
 * para as chaves flat que aqueles converters esperam (`category_name`,
 * `attachments`), via shapeEntryRow().
 */

import { supabase } from '@/lib/supabase';
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
import {
  rowToFinancialEntry,
  rowToFinancialAttachment,
  rowToFinancialRecurrence,
} from '@/lib/finance/financeConverters';
import { todayISO } from '@/lib/finance/status';
import { aggregateCashflow } from '@/lib/finance/cashflow';
import type { IFinanceService } from './financeService';

const BUCKET = 'financial-documents';
const ENTRY_SELECT = '*, financial_categories(name), financial_attachments(*)';

// Map camelCase sort fields -> snake_case DB columns.
const ENTRY_SORT_MAP: Record<string, string> = {
  dueDate: 'due_date',
  competenceDate: 'competence_date',
  amount: 'amount',
  createdAt: 'created_at',
  status: 'status',
  description: 'description',
};

/**
 * Adapts a Supabase join row to the flat shape the canonical converter expects:
 * the embedded `financial_categories: {name}` becomes `category_name`, and the
 * embedded `financial_attachments: [...]` becomes `attachments`.
 */
function shapeEntryRow(row: Record<string, unknown>): Record<string, unknown> {
  const category = row.financial_categories as { name?: string } | null | undefined;
  return {
    ...row,
    category_name: category?.name ?? null,
    attachments: row.financial_attachments ?? undefined,
  };
}

function toEntry(row: Record<string, unknown>): FinancialEntry {
  return rowToFinancialEntry(shapeEntryRow(row));
}

/** Adds `n` whole days to an ISO `YYYY-MM-DD` date (UTC, timezone-safe). */
function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + n);
  return [
    base.getUTCFullYear(),
    String(base.getUTCMonth() + 1).padStart(2, '0'),
    String(base.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

/** Converte um Partial<FinancialEntry> (camelCase) em colunas snake_case. */
function entryToRow(input: Partial<FinancialEntry>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.type !== undefined) row.type = input.type;
  if (input.status !== undefined) row.status = input.status;
  if (input.categoryId !== undefined) row.category_id = input.categoryId ?? null;
  if (input.description !== undefined) row.description = input.description;
  if (input.counterpartyName !== undefined) row.counterparty_name = input.counterpartyName ?? null;
  if (input.counterpartyCompanyId !== undefined) row.counterparty_company_id = input.counterpartyCompanyId ?? null;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.paymentMethod !== undefined) row.payment_method = input.paymentMethod ?? null;
  if (input.competenceDate !== undefined) row.competence_date = input.competenceDate;
  if (input.dueDate !== undefined) row.due_date = input.dueDate;
  if (input.paidDate !== undefined) row.paid_date = input.paidDate ?? null;
  if (input.notes !== undefined) row.notes = input.notes ?? null;
  if (input.installmentGroupId !== undefined) row.installment_group_id = input.installmentGroupId ?? null;
  if (input.installmentNumber !== undefined) row.installment_number = input.installmentNumber ?? null;
  if (input.installmentTotal !== undefined) row.installment_total = input.installmentTotal ?? null;
  if (input.recurrenceId !== undefined) row.recurrence_id = input.recurrenceId ?? null;
  return row;
}

/** Converte um Partial<FinancialRecurrence> (camelCase) em colunas snake_case. */
function recurrenceToRow(input: Partial<FinancialRecurrence>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.type !== undefined) row.type = input.type;
  if (input.description !== undefined) row.description = input.description;
  if (input.categoryId !== undefined) row.category_id = input.categoryId ?? null;
  if (input.counterpartyName !== undefined) row.counterparty_name = input.counterpartyName ?? null;
  if (input.counterpartyCompanyId !== undefined) row.counterparty_company_id = input.counterpartyCompanyId ?? null;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.paymentMethod !== undefined) row.payment_method = input.paymentMethod ?? null;
  if (input.frequency !== undefined) row.frequency = input.frequency;
  if (input.interval !== undefined) row.interval = input.interval;
  if (input.dayOfMonth !== undefined) row.day_of_month = input.dayOfMonth ?? null;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.endDate !== undefined) row.end_date = input.endDate ?? null;
  if (input.nextRunDate !== undefined) row.next_run_date = input.nextRunDate ?? null;
  if (input.isActive !== undefined) row.is_active = input.isActive;
  return row;
}

export class SupabaseFinanceService implements IFinanceService {
  // -----------------------------------------------------------------------
  // Entries — list with filters / pagination / sort
  // -----------------------------------------------------------------------
  async getEntries(
    filters?: EntryFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<FinancialEntry>> {
    const dateField = filters?.dateField === 'competence' ? 'competence_date' : 'due_date';
    let query = supabase.from('financial_entries').select(ENTRY_SELECT, { count: 'exact' });

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
    if (filters?.paymentMethod) query = query.eq('payment_method', filters.paymentMethod);

    if (filters?.search) {
      const term = `%${filters.search}%`;
      query = query.or(`description.ilike.${term},counterparty_name.ilike.${term}`);
    }

    if (filters?.dateFrom) query = query.gte(dateField, filters.dateFrom);
    if (filters?.dateTo) query = query.lte(dateField, filters.dateTo);

    // Status e vencimento sao dois eixos ortogonais (ver EntryFilters e
    // dueWindowOf). status filtra o valor armazenado; dueWindow e derivado
    // (sempre implica pending) e traduz-se em faixas de due_date.
    if (filters?.status) query = query.eq('status', filters.status);

    if (filters?.dueWindow) {
      const today = todayISO();
      query = query.eq('status', 'pending');
      if (filters.dueWindow === 'overdue') {
        query = query.lt('due_date', today);
      } else if (filters.dueWindow === 'due7') {
        query = query.gte('due_date', today).lte('due_date', addDaysISO(today, 7));
      } else if (filters.dueWindow === 'due8_30') {
        query = query.gte('due_date', addDaysISO(today, 8)).lte('due_date', addDaysISO(today, 30));
      } else if (filters.dueWindow === 'future') {
        query = query.gt('due_date', addDaysISO(today, 30));
      }
    }

    if (sort) {
      const column = ENTRY_SORT_MAP[sort.field] ?? 'due_date';
      query = query.order(column, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('due_date', { ascending: true });
    }

    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(`Failed to fetch entries: ${error.message}`);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((r) => toEntry(r as Record<string, unknown>)),
      total,
      page,
      pageSize,
      hasMore: from + pageSize < total,
    };
  }

  async getEntry(id: string): Promise<FinancialEntry | null> {
    const { data, error } = await supabase
      .from('financial_entries')
      .select(ENTRY_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toEntry(data as Record<string, unknown>) : null;
  }

  async createEntry(input: Partial<FinancialEntry>): Promise<FinancialEntry> {
    const { data, error } = await supabase
      .from('financial_entries')
      .insert(entryToRow(input))
      .select(ENTRY_SELECT)
      .single();

    if (error) throw error;
    return toEntry(data as Record<string, unknown>);
  }

  async createEntryWithInstallments(
    base: Partial<FinancialEntry>,
    items: InstallmentItem[],
  ): Promise<FinancialEntry[]> {
    // RPC atomica: cria N parcelas com installment_group_id compartilhado.
    // A funcao SQL le item->>'dueDate' (camelCase), entao enviamos assim.
    const { data, error } = await supabase.rpc('create_financial_entry_with_installments', {
      p_base: entryToRow(base),
      p_items: items.map((i) => ({
        number: i.number,
        dueDate: i.dueDate,
        amount: i.amount,
      })),
    });

    if (error) throw error;

    const rows = (data ?? []) as Record<string, unknown>[];
    const ids = rows.map((r) => r.id as string);
    if (ids.length === 0) return [];

    // Re-busca com o join para preencher categoria/anexos.
    const { data: full, error: fetchError } = await supabase
      .from('financial_entries')
      .select(ENTRY_SELECT)
      .in('id', ids)
      .order('installment_number', { ascending: true });

    if (fetchError) throw fetchError;
    return (full ?? []).map((r) => toEntry(r as Record<string, unknown>));
  }

  async updateEntry(id: string, updates: Partial<FinancialEntry>): Promise<FinancialEntry> {
    // .select() obrigatorio: UPDATE bloqueado por RLS retorna 0 linhas sem erro.
    const { data, error } = await supabase
      .from('financial_entries')
      .update(entryToRow(updates))
      .eq('id', id)
      .select(ENTRY_SELECT);

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nao foi possivel atualizar o lancamento (sem permissao ou inexistente).');
    }
    return toEntry(data[0] as Record<string, unknown>);
  }

  async markPaid(
    id: string,
    paidDate: string,
    paymentMethod?: PaymentMethod,
  ): Promise<FinancialEntry> {
    const { error } = await supabase.rpc('mark_financial_entry_paid', {
      p_entry_id: id,
      p_paid_date: paidDate,
      p_payment_method: paymentMethod ?? null,
    });
    if (error) throw error;

    const entry = await this.getEntry(id);
    if (!entry) {
      throw new Error('Lancamento nao encontrado apos a baixa.');
    }
    return entry;
  }

  async cancelEntry(id: string): Promise<FinancialEntry> {
    return this.updateEntry(id, { status: 'canceled' });
  }

  async bulkMarkPaid(ids: string[], paidDate: string): Promise<number> {
    let count = 0;
    for (const id of ids) {
      const { error } = await supabase.rpc('mark_financial_entry_paid', {
        p_entry_id: id,
        p_paid_date: paidDate,
        p_payment_method: null,
      });
      if (!error) count += 1;
      else console.warn('[Finance] bulkMarkPaid: falha em', id, error.message);
    }
    return count;
  }

  async deleteEntry(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('financial_entries')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Falha ao excluir lancamento. Verifique permissoes de admin.');
    }
  }

  // -----------------------------------------------------------------------
  // Attachments — bucket privado, signed URLs
  // -----------------------------------------------------------------------
  async uploadAttachment(
    entryId: string,
    file: File,
    kind?: AttachmentKind,
  ): Promise<FinancialAttachment> {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      throw new Error('Formato invalido. Aceitos: PDF, PNG, JPEG.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('O arquivo excede o limite de 10 MB.');
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `financial/${entryId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('financial_attachments')
      .insert({
        entry_id: entryId,
        storage_path: path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        kind: kind ?? null,
        uploaded_by: user?.id ?? null,
      })
      .select()
      .single();

    if (error) {
      // Best-effort cleanup: remove o objeto se o insert falhar (orfao).
      await supabase.storage.from(BUCKET).remove([path]);
      throw error;
    }
    return rowToFinancialAttachment(data as Record<string, unknown>);
  }

  async getAttachmentSignedUrl(storagePath: string): Promise<string> {
    // URL temporaria (1h) — bucket e privado, nunca getPublicUrl.
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  }

  async removeAttachment(id: string): Promise<void> {
    // Busca o path antes para limpar o objeto no Storage.
    const { data: row, error: fetchError } = await supabase
      .from('financial_attachments')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw fetchError;

    const { data: deleted, error } = await supabase
      .from('financial_attachments')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!deleted || deleted.length === 0) {
      throw new Error('Falha ao remover anexo. Verifique permissoes de admin.');
    }

    const path = (row?.storage_path as string | undefined) ?? undefined;
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }

  // -----------------------------------------------------------------------
  // Dashboard — agregacao via funcao pura + MRR das assinaturas (Stripe)
  // -----------------------------------------------------------------------
  async getCashflowSummary(params: {
    from: string;
    to: string;
    scope: 'consolidated' | 'avulsos' | 'assinaturas';
  }): Promise<CashflowSummary> {
    // Lancamentos avulsos do periodo (por competencia). Lote unico amplo:
    // o dashboard opera sobre meses, nao sobre milhares de linhas.
    const { data, error } = await supabase
      .from('financial_entries')
      .select(ENTRY_SELECT)
      .gte('competence_date', params.from)
      .lte('competence_date', params.to)
      .range(0, 4999);
    if (error) throw error;

    const entries = (data ?? []).map((r) => toEntry(r as Record<string, unknown>));

    // MRR: soma price_paid das assinaturas ativas pagas (nao trial).
    let mrr = 0;
    if (params.scope !== 'avulsos') {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('price_paid, status, is_trial')
        .eq('status', 'active')
        .eq('is_trial', false);
      mrr = (subs ?? []).reduce(
        (s, r) => s + Number((r as Record<string, unknown>).price_paid ?? 0),
        0,
      );
    }

    // Em escopo 'assinaturas' ignoramos lancamentos avulsos.
    const scopedEntries = params.scope === 'assinaturas' ? [] : entries;

    return aggregateCashflow(
      scopedEntries,
      { from: params.from, to: params.to, today: todayISO() },
      mrr,
    );
  }

  // -----------------------------------------------------------------------
  // Recurrences — CRUD da regra
  // -----------------------------------------------------------------------
  async getRecurrences(): Promise<FinancialRecurrence[]> {
    const { data, error } = await supabase
      .from('financial_recurrences')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => rowToFinancialRecurrence(r as Record<string, unknown>));
  }

  async createRecurrence(input: Partial<FinancialRecurrence>): Promise<FinancialRecurrence> {
    const { data, error } = await supabase
      .from('financial_recurrences')
      .insert(recurrenceToRow(input))
      .select()
      .single();
    if (error) throw error;
    return rowToFinancialRecurrence(data as Record<string, unknown>);
  }

  async updateRecurrence(
    id: string,
    updates: Partial<FinancialRecurrence>,
  ): Promise<FinancialRecurrence> {
    const { data, error } = await supabase
      .from('financial_recurrences')
      .update(recurrenceToRow(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nao foi possivel atualizar a recorrencia (sem permissao ou inexistente).');
    }
    return rowToFinancialRecurrence(data[0] as Record<string, unknown>);
  }

  async deleteRecurrence(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('financial_recurrences')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Falha ao excluir recorrencia. Verifique permissoes de admin.');
    }
  }
}
