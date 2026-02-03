/**
 * Types for Reports & Analytics
 * PRD-059: Relatórios "Radar"
 */

export type TimeFilterPreset = '7d' | '30d' | 'month' | 'quarter' | 'year' | 'custom';

export interface TimeFilter {
  preset: TimeFilterPreset;
  startDate?: string;
  endDate?: string;
}

export interface PlatformMetricsDaily {
  id: string;
  metricDate: string;
  totalCandidates: number;
  totalCompanies: number;
  newCandidates: number;
  newCompanies: number;
  activeJobs: number;
  newJobs: number;
  applications: number;
  interviewsScheduled: number;
  interviewsDone: number;
  hires: number;
  testsStarted: number;
  testsCompleted: number;
  mrr: number;
  newSubscriptions: number;
  cancellations: number;
  revenue: number;
}

export type ActivityEventType =
  | 'new_candidate'
  | 'new_company'
  | 'new_job'
  | 'application'
  | 'test_completed'
  | 'subscription'
  | 'cancellation'
  | 'hire'
  | 'interview_scheduled'
  | 'moderation_action';

export interface ActivityFeedEvent {
  id: string;
  eventType: ActivityEventType;
  actorType: 'candidate' | 'company' | 'admin' | 'system';
  actorId: string;
  actorName: string;
  resourceType?: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  type: 'pdf' | 'excel';
  frequency: 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  recipients: string[];
  isActive: boolean;
  lastSentAt?: string;
  nextSendAt?: string;
}

export interface WeeklyAggregate {
  weekStart: string;
  weekEnd: string;
  newCandidates: number;
  newCompanies: number;
  newJobs: number;
  applications: number;
  hires: number;
  revenue: number;
}

export interface MonthlyAggregate {
  month: string;
  year: number;
  newCandidates: number;
  newCompanies: number;
  newJobs: number;
  applications: number;
  hires: number;
  revenue: number;
  mrr: number;
  churnRate: number;
}

export interface CohortRow {
  cohortMonth: string;
  totalUsers: number;
  retentionByMonth: number[];
}

export interface FunnelStage {
  name: string;
  value: number;
  conversionRate?: number;
}
