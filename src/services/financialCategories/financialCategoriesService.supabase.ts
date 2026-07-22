/**
 * Financial Categories Service — Supabase Implementation
 * Consulta/escreve a tabela financial_categories. RLS admin-only.
 */

import { supabase } from '@/lib/supabase';
import type { FinancialCategory, FinancialType } from '@/types/finance';
import { rowToFinancialCategory } from '@/lib/finance/financeConverters';
import type { IFinancialCategoriesService } from './financialCategoriesService';

export class SupabaseFinancialCategoriesService implements IFinancialCategoriesService {
  async getCategories(type?: FinancialType): Promise<FinancialCategory[]> {
    let query = supabase
      .from('financial_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r) => rowToFinancialCategory(r as Record<string, unknown>));
  }

  async createCategory(input: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const { data, error } = await supabase
      .from('financial_categories')
      .insert({
        name: input.name,
        type: input.type,
        color: input.color ?? null,
        is_active: input.isActive ?? true,
        sort_order: input.sortOrder ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return rowToFinancialCategory(data as Record<string, unknown>);
  }

  async updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    // .select() obrigatorio: UPDATE bloqueado por RLS retorna 0 linhas sem erro.
    const { data, error } = await supabase
      .from('financial_categories')
      .update(dbUpdates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nao foi possivel atualizar a categoria (sem permissao ou inexistente).');
    }
    return rowToFinancialCategory(data[0] as Record<string, unknown>);
  }

  async deleteCategory(id: string): Promise<void> {
    // .select() obrigatorio: DELETE bloqueado por RLS retorna 0 linhas sem erro.
    const { data, error } = await supabase
      .from('financial_categories')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Falha ao excluir categoria. Verifique permissoes de admin.');
    }
  }
}
