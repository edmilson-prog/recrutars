/**
 * Financial Categories Service — Interface & Factory
 * Lancamentos Financeiros (Fluxo de Caixa) — CRUD de categorias.
 *
 * Segue o padrao de plansService: interface + factory lazy + impl `.supabase.ts`.
 * O normalizador de linha vive em `@/lib/finance/financeConverters`
 * (rowToFinancialCategory), nao aqui — nao duplicar.
 */

import type { FinancialCategory, FinancialType } from '@/types/finance';

export interface IFinancialCategoriesService {
  /** Lista categorias (admin), opcionalmente filtradas por natureza. */
  getCategories(type?: FinancialType): Promise<FinancialCategory[]>;
  /** Cria uma categoria. */
  createCategory(input: Partial<FinancialCategory>): Promise<FinancialCategory>;
  /** Atualiza campos de uma categoria. */
  updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory>;
  /** Exclui uma categoria (FK em entries usa SET NULL). */
  deleteCategory(id: string): Promise<void>;
}

let _instance: IFinancialCategoriesService | null = null;

export async function getFinancialCategoriesService(): Promise<IFinancialCategoriesService> {
  if (_instance) return _instance;

  const { SupabaseFinancialCategoriesService } = await import(
    './financialCategoriesService.supabase'
  );
  _instance = new SupabaseFinancialCategoriesService();
  return _instance;
}

/** Reseta o singleton (usado em testes). */
export function resetFinancialCategoriesService(): void {
  _instance = null;
}
