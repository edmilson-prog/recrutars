import type { JobStatus } from '@/types/job';

export type PipelineStageKey = 'pending' | 'reviewing' | 'interview' | 'offer';

export const PIPELINE_STAGES: {
  key: PipelineStageKey;
  label: string;
  barClass: string;
  textClass: string;
}[] = [
  { key: 'pending', label: 'Novos', barClass: 'bg-blue-500', textClass: 'text-blue-600' },
  { key: 'reviewing', label: 'Em Análise', barClass: 'bg-yellow-500', textClass: 'text-yellow-600' },
  { key: 'interview', label: 'Entrevista', barClass: 'bg-purple-500', textClass: 'text-purple-600' },
  { key: 'offer', label: 'Aprovados', barClass: 'bg-green-500', textClass: 'text-green-600' },
];

export const JOB_STATUS_META: Record<JobStatus, { label: string; dotClass: string; textClass: string }> = {
  active: { label: 'Ativa', dotClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
  paused: { label: 'Pausada', dotClass: 'bg-amber-500', textClass: 'text-amber-600' },
  closed: { label: 'Fechada', dotClass: 'bg-slate-400', textClass: 'text-slate-500' },
};
