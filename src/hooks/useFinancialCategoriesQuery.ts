/**
 * React Query Hooks — Financial Categories
 * Lancamentos Financeiros (Fluxo de Caixa).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinancialCategoriesService } from '@/services/financialCategories/financialCategoriesService';
import type { FinancialCategory, FinancialType } from '@/types/finance';

export const categoryKeys = {
  all: ['financial-categories'] as const,
  list: (type?: FinancialType) => [...categoryKeys.all, { type }] as const,
};

export function useFinancialCategories(type?: FinancialType) {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: async () => {
      const svc = await getFinancialCategoriesService();
      return svc.getCategories(type);
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<FinancialCategory>) => {
      const svc = await getFinancialCategoriesService();
      return svc.createCategory(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err) => console.error('[Finance] createCategory failed:', err),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FinancialCategory> }) => {
      const svc = await getFinancialCategoriesService();
      return svc.updateCategory(id, updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err) => console.error('[Finance] updateCategory failed:', err),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFinancialCategoriesService();
      return svc.deleteCategory(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err) => console.error('[Finance] deleteCategory failed:', err),
  });
}
