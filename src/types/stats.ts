/**
 * Types for Dashboard Statistics
 * PRD-004: Tipos e Interfaces TypeScript
 */

export interface AdminStats {
  totalCompanies: number;
  totalCandidates: number;
  activeJobs: number;
  testsCompleted: number;
  newCompaniesThisMonth: number;
  newCandidatesThisMonth: number;
  matchRate: number;
}

export interface CompanyStats {
  activeJobs: number;
  totalApplications: number;
  testsCompleted: number;
  interviewsScheduled: number;
  hiredThisMonth: number;
  avgTimeToHire: number;
}

export interface CandidateStats {
  applications: number;
  interviews: number;
  testsCompleted: number;
  profileViews: number;
  savedJobs: number;
  newMessages: number;
}
