/**
 * Types for Admin Jobs Management
 * PRD-058: Vagas & Moderação "Sentinel"
 */

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'correction_requested';
export type ModerationMode = 'automatic' | 'new_companies' | 'all' | 'by_plan';
export type FinalizationReason = 'filled' | 'cancelled' | 'expired';

export interface AdminJob {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyPlan: string;
  location: string;
  type: string;
  salary?: string;
  area: string;
  status: string;
  moderationStatus: ModerationStatus;
  moderatedBy?: string;
  moderatedAt?: string;
  rejectionReason?: string;
  correctionFields?: string[];
  adminNotes?: string;
  isHighlighted: boolean;
  highlightedUntil?: string;
  publishedAt?: string;
  finalizedAt?: string;
  finalizationReason?: FinalizationReason;
  applicationsCount: number;
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  jobId: string;
  jobTitle: string;
  action: 'approved' | 'rejected' | 'correction_requested' | 'highlighted' | 'unpublished';
  performedBy: string;
  performedByName: string;
  performedAt: string;
  reason?: string;
  details?: string;
}

export interface ModerationConfig {
  mode: ModerationMode;
  maxPendingHours: number;
  rejectionReasons: string[];
  emailTemplates: Record<string, string>;
  autoFlagRules: AutoFlagRule[];
}

export interface AutoFlagRule {
  id: string;
  name: string;
  field: string;
  condition: string;
  value: string;
  isActive: boolean;
}

export interface AdminHire {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  hireDate: string;
  timeToFillDays: number;
  hasCV: boolean;
  hasTestResult: boolean;
  testProfile?: string;
  interviewNotes?: string;
}

export interface AdminInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  scheduledDate: string;
  mode: 'presencial' | 'online';
  status: 'scheduled' | 'completed' | 'cancelled';
  outcome?: 'approved' | 'rejected' | 'hired';
  notes?: string;
}

export type JobAlertType = 'moderation_pending' | 'stagnant' | 'zero_applications' | 'expiring';

export interface JobAlert {
  id: string;
  type: JobAlertType;
  jobId: string;
  jobTitle: string;
  companyName: string;
  message: string;
  severity: 'warning' | 'critical';
  createdAt: string;
}
