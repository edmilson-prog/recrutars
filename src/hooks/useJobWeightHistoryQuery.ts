import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface JobWeightHistoryEntry {
  id: string;
  jobId: string;
  oldWeights: {
    skillsTechnical: number;
    skillsBehavioral: number;
    experience: number;
    gaugePro: number;
    location: number;
  };
  newWeights: {
    skillsTechnical: number;
    skillsBehavioral: number;
    experience: number;
    gaugePro: number;
    location: number;
  };
  changedBy: string | null;
  changedAt: string;
  activeApplicationsCount: number;
  reason: string | null;
}

export const jobWeightHistoryKeys = {
  all: ['job-weight-history'] as const,
  byJob: (jobId: string) => [...jobWeightHistoryKeys.all, jobId] as const,
};

export function useJobWeightHistory(jobId: string | undefined) {
  return useQuery({
    queryKey: jobWeightHistoryKeys.byJob(jobId ?? ''),
    queryFn: async (): Promise<JobWeightHistoryEntry[]> => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('jobs_weight_history')
        .select('*')
        .eq('job_id', jobId)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        jobId: row.job_id,
        oldWeights: row.old_weights,
        newWeights: row.new_weights,
        changedBy: row.changed_by,
        changedAt: row.changed_at,
        activeApplicationsCount: row.active_applications_count,
        reason: row.reason,
      }));
    },
    enabled: !!jobId,
  });
}
