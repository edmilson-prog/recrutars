/**
 * Hook to fetch the configurable Gauge-Pro cooldown days from admin settings.
 * Falls back to GAUGE_PRO_CONFIG.cooldownDays (90) if setting is not found.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

export function useGaugeProCooldownDays(): number {
  const { data } = useQuery({
    queryKey: ['settings', 'gaugepro-cooldown-days'],
    queryFn: async () => {
      const { data: row } = await supabase
        .from('system_settings')
        .select('values')
        .eq('panel', 'admin')
        .eq('category', 'ai')
        .is('entity_id', null)
        .single();

      if (!row?.values) return GAUGE_PRO_CONFIG.cooldownDays;

      const values = row.values as Record<string, Record<string, unknown>>;
      const cooldown = values?.gaugepro?.cooldownDays;

      return typeof cooldown === 'number' && cooldown > 0
        ? cooldown
        : GAUGE_PRO_CONFIG.cooldownDays;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  return data ?? GAUGE_PRO_CONFIG.cooldownDays;
}
