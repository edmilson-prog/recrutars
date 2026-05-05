import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useExternalApplicationsCount(candidateId: string) {
  return useQuery({
    queryKey: ['applications', 'external-count', candidateId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('count_candidate_external_applications', {
        p_candidate_id: candidateId,
      });
      if (error) throw error;
      return (data as number) ?? 0;
    },
    enabled: !!candidateId,
    staleTime: 2 * 60 * 1000,
  });
}
