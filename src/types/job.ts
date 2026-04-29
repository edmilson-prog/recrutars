/**
 * Types for Jobs/Positions
 * PRD-004: Tipos e Interfaces TypeScript
 */

export type JobType = 'remote' | 'hybrid' | 'onsite';
export type JobStatus = 'active' | 'paused' | 'closed';
export type JobModerationStatus = 'pending' | 'approved' | 'rejected' | 'correction_requested';

export interface SalaryRange {
  min: number;
  max: number;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  isAnonymous: boolean;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: string;
  /** UF brasileira (2 letras maiúsculas, ex: "SP"). Opcional para vagas remotas e legado não-parseado. */
  state?: string;
  /** Cidade da vaga. Opcional para vagas remotas e legado não-parseado. */
  city?: string;
  type: JobType;
  level: string;
  salary: SalaryRange;
  status: JobStatus;
  moderationStatus: JobModerationStatus;
  applicationsCount: number;
  positionsCount: number;
  createdAt: string;
  area: string;
}
