/**
 * Hook to fetch/set the configurable Gauge-Pro word order mode from admin settings.
 * Falls back to 'random' if not found.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { WordOrderMode } from '@/types/gaugePro';

const QUERY_KEY = ['settings', 'gaugepro-word-order-mode'] as const;

export function useGaugeProWordOrderMode() {
  const qc = useQueryClient();

  const { data: wordOrderMode } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<WordOrderMode> => {
      // Use SECURITY DEFINER RPC to bypass RLS — allows non-admin users (collaborators) to read the setting
      const { data, error } = await supabase.rpc('get_gauge_pro_word_order_mode');
      if (error || !data) return 'random';

      const validModes: WordOrderMode[] = ['random', 'fixed', 'alternating', 'grouped', 'alphabetical'];
      return validModes.includes(data as WordOrderMode) ? (data as WordOrderMode) : 'random';
    },
    staleTime: 5 * 60 * 1000,
  });

  const setWordOrderMode = useMutation({
    mutationFn: async (mode: WordOrderMode) => {
      // First get existing values
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id, values')
        .eq('panel', 'admin')
        .eq('category', 'ai')
        .is('entity_id', null)
        .maybeSingle();

      const currentValues = (existing?.values as Record<string, Record<string, unknown>>) ?? {};
      const updatedValues = {
        ...currentValues,
        gaugepro: {
          ...(currentValues.gaugepro ?? {}),
          wordOrderMode: mode,
        },
      };

      if (existing?.id) {
        const { error } = await supabase
          .from('system_settings')
          .update({ values: updatedValues })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_settings')
          .insert({
            panel: 'admin',
            category: 'ai',
            entity_id: null,
            values: updatedValues,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    wordOrderMode: wordOrderMode ?? 'random',
    setWordOrderMode,
  };
}
