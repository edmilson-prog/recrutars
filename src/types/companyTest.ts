/**
 * Company Test Hub Types
 * PRD-052, PRD-053, PRD-054: Hub de Testes Comportamentais
 */

import type { GaugeProDimension, DimensionScores, ArchetypeProfile } from './gaugePro';

// --- Test Status Machine ---
export type CompanyTestStatus = 'draft' | 'active' | 'closed' | 'archived';

// --- Template ---
export interface TestTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  weights: Record<GaugeProDimension, number>; // 0.5 - 2.0
  isCustom?: boolean;
}

// --- Company Test ---
export interface CompanyTest {
  id: string;
  companyId: string;
  name: string;
  description: string;
  templateId: string;
  weights: Record<GaugeProDimension, number>;
  status: CompanyTestStatus;
  jobId?: string;
  jobTitle?: string;
  deadline?: string; // ISO date
  instructions?: string;
  publicLinkSlug?: string;
  publicLinkActive?: boolean;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  closedAt?: string;
  archivedAt?: string;
}

// --- Invitation ---
export type InvitationStatus = 'sent' | 'viewed' | 'started' | 'completed' | 'expired' | 'abandoned';
export type InvitationMethod = 'email' | 'public_link' | 'internal';

export interface TestInvitation {
  id: string;
  testId: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  method: InvitationMethod;
  status: InvitationStatus;
  sentAt: string;
  viewedAt?: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt: string;
}

// --- Test Result ---
export interface CompanyTestResult {
  id: string;
  testId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string;
  invitationId: string;
  scores: DimensionScores;
  archetype: ArchetypeProfile;
  primaryDimension: GaugeProDimension;
  secondaryDimension: GaugeProDimension;
  strengths: string[];
  developmentAreas: string[];
  fitScore?: number; // 0-100, calculated
  fitClassification?: FitClassification;
  aiAnalysis?: string;
  completedAt: string;
  shortlisted?: boolean;
  shortlistNotes?: string;
}

// --- Fit Score ---
export type FitClassification = 'excellent' | 'good' | 'regular' | 'low';

export const FIT_CLASSIFICATION_CONFIG: Record<FitClassification, { label: string; color: string; min: number }> = {
  excellent: { label: 'Excelente', color: '#16a34a', min: 80 },
  good: { label: 'Bom', color: '#2563eb', min: 60 },
  regular: { label: 'Regular', color: '#ca8a04', min: 40 },
  low: { label: 'Baixo', color: '#dc2626', min: 0 },
};

// --- Audit Log ---
export type AuditAction =
  | 'test_created'
  | 'test_activated'
  | 'test_closed'
  | 'test_archived'
  | 'test_duplicated'
  | 'invite_sent'
  | 'invite_resent'
  | 'invite_cancelled'
  | 'link_generated'
  | 'link_deactivated'
  | 'result_viewed'
  | 'result_compared'
  | 'shortlist_added'
  | 'shortlist_removed'
  | 'pdf_downloaded'
  | 'excel_downloaded'
  | 'lgpd_report_generated';

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  resourceType: 'test' | 'invitation' | 'result' | 'report';
  resourceId: string;
  resourceName?: string;
  details?: string;
  timestamp: string;
}

// --- Dashboard KPIs ---
export interface HubDashboardKPIs {
  totalTests: number;
  activeTests: number;
  pendingInvites: number;
  completionRate: number; // 0-100
  avgCompletionTime: number; // days
}

// --- Funnel Data ---
export interface FunnelData {
  invited: number;
  started: number;
  completed: number;
  analyzed: number;
}

// --- Alert ---
export interface HubAlert {
  id: string;
  type: 'expired_invites' | 'abandoned_tests' | 'no_candidates' | 'deadline_approaching';
  message: string;
  testId: string;
  testName: string;
  severity: 'warning' | 'error' | 'info';
  createdAt: string;
}

// --- Activity Feed ---
export interface ActivityItem {
  id: string;
  type: 'invite_sent' | 'test_completed' | 'test_created' | 'test_activated' | 'shortlist_added' | 'report_downloaded';
  message: string;
  timestamp: string;
  testId?: string;
  candidateName?: string;
}

// --- Period Filter ---
export type PeriodFilter = '7d' | '30d' | '90d' | 'custom';

// --- Competency Radar ---
export type CompetencyName = 'lideranca' | 'comunicacao' | 'organizacao' | 'inovacao' | 'trabalhoEquipe' | 'analiseCritica';
export type CompetencyScores = Record<CompetencyName, number>;
export const COMPETENCY_LABELS: Record<CompetencyName, string> = {
  lideranca: 'Liderança',
  comunicacao: 'Comunicação',
  organizacao: 'Organização',
  inovacao: 'Inovação',
  trabalhoEquipe: 'Trabalho em Equipe',
  analiseCritica: 'Análise Crítica',
};

// --- Emotional Factors ---
export type EmotionalFactorName = 'empatia' | 'autocontrole' | 'sociabilidade' | 'resiliencia' | 'inteligenciaEmocional';
export type EmotionalFactorScores = Record<EmotionalFactorName, number>;
export const EMOTIONAL_FACTOR_LABELS: Record<EmotionalFactorName, string> = {
  empatia: 'Empatia',
  autocontrole: 'Autocontrole',
  sociabilidade: 'Sociabilidade',
  resiliencia: 'Resiliência',
  inteligenciaEmocional: 'Inteligência Emocional',
};

// --- Risk Assessment ---
export type RiskClassification = 'baixo' | 'moderado' | 'alto' | 'critico';
export interface RiskFlag {
  dimension: string;
  type: string;
  description: string;
  severity: RiskClassification;
}
export interface RiskAssessment {
  overallScore: number;
  classification: RiskClassification;
  flags: RiskFlag[];
  instabilityGap: number;
}

// --- Mock Test Responses ---
export interface MockWordSelection {
  dimension: GaugeProDimension;
  perspective: 'self' | 'others';
  selectedWords: Array<{ id: number; text: string; polarity: 'high' | 'low' }>;
}
export interface MockScenarioResponse {
  scenarioId: number;
  scenarioTitle: string;
  situation: string;
  selectedOption: string;
  selectedText: string;
  allOptions: Array<{ key: string; text: string; isSelected: boolean }>;
}
export interface MockTestResponses {
  wordSelections: MockWordSelection[];
  scenarioResponses: MockScenarioResponse[];
}
