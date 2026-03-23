/**
 * Hook to fetch/set the configurable Gauge-Pro scenario order mode from admin settings.
 * Falls back to 'fixed' if not found.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ScenarioOrderMode } from '@/types/gaugePro';

const QUERY_KEY = ['settings', 'gaugepro-scenario-order-mode'] as const;

export function useGaugeProScenarioOrderMode() {
  const qc = useQueryClient();

  const { data: scenarioOrderMode } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<ScenarioOrderMode> => {
      // Use SECURITY DEFINER RPC to bypass RLS — allows non-admin users (collaborators) to read the setting
      const { data, error } = await supabase.rpc('get_gauge_pro_scenario_order_mode');
      if (error || !data) return 'fixed';

      const validModes: ScenarioOrderMode[] = ['random', 'fixed', 'alphabetical'];
      return validModes.includes(data as ScenarioOrderMode) ? (data as ScenarioOrderMode) : 'fixed';
    },
    staleTime: 5 * 60 * 1000,
  });

  const setScenarioOrderMode = useMutation({
    mutationFn: async (mode: ScenarioOrderMode) => {
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
          scenarioOrderMode: mode,
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
    scenarioOrderMode: scenarioOrderMode ?? 'fixed',
    setScenarioOrderMode,
  };
}
