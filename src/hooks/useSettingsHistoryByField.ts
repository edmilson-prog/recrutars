/**
 * useSettingsHistoryByField — busca o histórico de alterações de um campo
 * específico em settings_history (panel + category + subcategory + field_key).
 *
 * Usado pelo PromptHistorySheet para listar revisões de prompts de IA.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SettingsHistoryEntry {
  id: string;
  createdAt: string;
  changedById: string | null;
  changedByName: string;
  previousValue: unknown;
  newValue: unknown;
  fieldName: string;
}

interface UseSettingsHistoryByFieldParams {
  panel: string;
  categoryKey: string;
  subcategoryKey: string;
  fieldKey: string;
  enabled?: boolean;
  limit?: number;
}

export function useSettingsHistoryByField({
  panel,
  categoryKey,
  subcategoryKey,
  fieldKey,
  enabled = true,
  limit = 50,
}: UseSettingsHistoryByFieldParams) {
  return useQuery<SettingsHistoryEntry[]>({
    queryKey: ['settings-history', panel, categoryKey, subcategoryKey, fieldKey],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings_history')
        .select('id, created_at, changed_by, changed_by_name, previous_value, new_value, field_name')
        .eq('panel', panel)
        .eq('category_key', categoryKey)
        .eq('subcategory_key', subcategoryKey)
        .eq('field_key', fieldKey)
        .is('entity_id', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(`Falha ao carregar histórico: ${error.message}`);

      return (data ?? []).map((row) => ({
        id: row.id as string,
        createdAt: row.created_at as string,
        changedById: (row.changed_by as string | null) ?? null,
        changedByName: (row.changed_by_name as string) ?? 'Sistema',
        previousValue: row.previous_value,
        newValue: row.new_value,
        fieldName: (row.field_name as string) ?? '',
      }));
    },
  });
}
