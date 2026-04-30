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
  /** Peso (0-100) das hard skills no cálculo de match. Default DB: 30. */
  weightSkillsTechnical?: number;
  /** Peso (0-100) das soft skills no cálculo de match. Default DB: 20. */
  weightSkillsBehavioral?: number;
  /** Peso (0-100) da experiência no cálculo de match. Default DB: 20. */
  weightExperience?: number;
  /** Peso (0-100) do Gauge-Pro no cálculo de match. Default DB: 20. */
  weightGaugePro?: number;
  /** Peso (0-100) da localização no cálculo de match. Default DB: 10. */
  weightLocation?: number;
}
