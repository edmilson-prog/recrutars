/**
 * React Query Hooks — Financial Entries
 * Lancamentos Financeiros (Fluxo de Caixa): list paginada/filtrada,
 * detalhe, mutations (criar, atualizar, baixa, cancelar, bulk, excluir,
 * upload de anexo) com invalidacao de cache.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { getFinanceService } from '@/services/finance/financeService';
import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types';
import type {
  FinancialEntry,
  EntryFilters,
  PaymentMethod,
  AttachmentKind,
} from '@/types/finance';

export const financeKeys = {
  all: ['financial-entries'] as const,
  lists: () => [...financeKeys.all, 'list'] as const,
  list: (filters?: EntryFilters, pagination?: PaginationConfig, sort?: SortConfig) =>
    [...financeKeys.lists(), { filters, pagination, sort }] as const,
  details: () => [...financeKeys.all, 'detail'] as const,
  detail: (id: string) => [...financeKeys.details(), id] as const,
  summary: (params: { from: string; to: string; scope: string }) =>
    [...financeKeys.all, 'summary', params] as const,
};

export function useFinancialEntries(
  filters?: EntryFilters,
  pagination?: PaginationConfig,
  sort?: SortConfig,
  options?: Omit<UseQueryOptions<PaginatedResult<FinancialEntry>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PaginatedResult<FinancialEntry>>({
    queryKey: financeKeys.list(filters, pagination, sort),
    queryFn: async () => {
      const svc = await getFinanceService();
      return svc.getEntries(filters, pagination, sort);
    },
    ...options,
  });
}

export function useFinancialEntry(id: string | undefined) {
  return useQuery({
    queryKey: financeKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const svc = await getFinanceService();
      return svc.getEntry(id);
    },
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      input,
      installments,
    }: {
      input: Partial<FinancialEntry>;
      installments?: import('@/types/finance').InstallmentItem[];
    }) => {
      const svc = await getFinanceService();
      if (installments && installments.length > 1) {
        return svc.createEntryWithInstallments(input, installments);
      }
      return svc.createEntry(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] createEntry failed:', err),
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FinancialEntry> }) => {
      const svc = await getFinanceService();
      return svc.updateEntry(id, updates);
    },
    onSuccess: (updated) => {
      qc.setQueryData(financeKeys.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: financeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...financeKeys.all, 'summary'] });
    },
    onError: (err) => console.error('[Finance] updateEntry failed:', err),
  });
}

export function useMarkEntryPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paidDate,
      paymentMethod,
    }: {
      id: string;
      paidDate: string;
      paymentMethod?: PaymentMethod;
    }) => {
      const svc = await getFinanceService();
      return svc.markPaid(id, paidDate, paymentMethod);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] markPaid failed:', err),
  });
}

export function useCancelEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFinanceService();
      return svc.cancelEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] cancelEntry failed:', err),
  });
}

export function useBulkMarkPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, paidDate }: { ids: string[]; paidDate: string }) => {
      const svc = await getFinanceService();
      return svc.bulkMarkPaid(ids, paidDate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] bulkMarkPaid failed:', err),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFinanceService();
      return svc.deleteEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] deleteEntry failed:', err),
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entryId,
      file,
      kind,
    }: {
      entryId: string;
      file: File;
      kind?: AttachmentKind;
    }) => {
      const svc = await getFinanceService();
      return svc.uploadAttachment(entryId, file, kind);
    },
    onSuccess: (attachment) => {
      qc.invalidateQueries({ queryKey: financeKeys.detail(attachment.entryId) });
      qc.invalidateQueries({ queryKey: financeKeys.lists() });
    },
    onError: (err) => console.error('[Finance] uploadAttachment failed:', err),
  });
}
