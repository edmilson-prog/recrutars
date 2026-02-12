/**
 * Types for Jobs/Positions
 * PRD-004: Tipos e Interfaces TypeScript
 */

export type JobType = 'remote' | 'hybrid' | 'onsite';
export type JobStatus = 'active' | 'paused' | 'closed';

export interface SalaryRange {
  min: number;
  max: number;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: string;
  type: JobType;
  level: string;
  salary: SalaryRange;
  status: JobStatus;
  applicationsCount: number;
  positionsCount: number;
  createdAt: string;
  area: string;
}
