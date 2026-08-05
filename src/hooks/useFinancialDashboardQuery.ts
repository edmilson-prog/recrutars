/**
 * React Query Hooks — Financial Dashboard & Recurrences
 * Lancamentos Financeiros (Fluxo de Caixa): resumo agregado e CRUD de
 * recorrencias.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinanceService } from '@/services/finance/financeService';
import { financeKeys } from './useFinancialEntriesQuery';
import type { FinancialRecurrence } from '@/types/finance';

export const recurrenceKeys = {
  all: ['financial-recurrences'] as const,
  list: () => [...recurrenceKeys.all, 'list'] as const,
};

export function useCashflowSummary(params: {
  from: string;
  to: string;
  scope: 'consolidated' | 'avulsos' | 'assinaturas';
}) {
  return useQuery({
    queryKey: financeKeys.summary(params),
    queryFn: async () => {
      const svc = await getFinanceService();
      return svc.getCashflowSummary(params);
    },
  });
}

export function useRecurrences() {
  return useQuery({
    queryKey: recurrenceKeys.list(),
    queryFn: async () => {
      const svc = await getFinanceService();
      return svc.getRecurrences();
    },
  });
}

export function useCreateRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<FinancialRecurrence>) => {
      const svc = await getFinanceService();
      return svc.createRecurrence(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: recurrenceKeys.all }),
    onError: (err) => console.error('[Finance] createRecurrence failed:', err),
  });
}

export function useUpdateRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FinancialRecurrence> }) => {
      const svc = await getFinanceService();
      return svc.updateRecurrence(id, updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: recurrenceKeys.all }),
    onError: (err) => console.error('[Finance] updateRecurrence failed:', err),
  });
}

export function useDeleteRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFinanceService();
      return svc.deleteRecurrence(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: recurrenceKeys.all }),
    onError: (err) => console.error('[Finance] deleteRecurrence failed:', err),
  });
}
