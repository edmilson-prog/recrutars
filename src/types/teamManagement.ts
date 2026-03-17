/**
 * Team Management Module Types
 *
 * PRD-055: Gestao de Equipes - Core & Mapa Comportamental
 *   Departments, positions, team members, Gauge-Pro mapping, talent profiles,
 *   company culture DNA, gap analysis, and alerts.
 *
 * PRD-056: Gestao de Equipes - Compatibilidade & Team Builder
 *   Pairwise compatibility scoring and drag-and-drop team-building scenarios.
 *
 * PRD-057: Gestao de Equipes - Desenvolvimento & Evolucao
 *   Development plans, objectives, retest scheduling, evolution annotations.
 */

import type { GaugeProDimension, DimensionScores } from './gaugePro';

// ---------------------------------------------------------------------------
// PRD-055 — Core & Mapa Comportamental
// ---------------------------------------------------------------------------

/** Hierarchy level for a position within the organization. */
export type HierarchyLevel = 'operational' | 'tactical' | 'strategic';

/** Current Gauge-Pro assessment status of a team member. */
export type GaugeStatus = 'unmapped' | 'invited' | 'in_progress' | 'mapped' | 'retest_pending';

/** A department within the company. */
export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
}

/** A position (role) belonging to a department. */
export interface Position {
  id: string;
  departmentId: string;
  title: string;
  level: HierarchyLevel;
  isActive: boolean;
}

/** A team member with optional Gauge-Pro behavioural data. */
export interface TeamMember {
  id: string;
  companyId?: string;
  name: string;
  cpf?: string;
  email: string;
  phone?: string;
  avatar?: string;
  departmentId: string;
  positionId: string;
  hireDate: string;
  gaugeStatus: GaugeStatus;
  gaugeScores?: DimensionScores;
  archetype?: string;
  isActive: boolean;
  /** When the member was originally imported from the candidate pipeline. */
  importedFromCandidateId?: string;
  lastTestDate?: string;
  testHistory?: TestHistoryEntry[];
}

/** A single historical Gauge-Pro test result for a member. */
export interface TestHistoryEntry {
  id: string;
  memberId: string;
  scores: DimensionScores;
  archetype: string;
  completedAt: string;
}

// ---------------------------------------------------------------------------
// PRD-056 — Compatibilidade & Team Builder
// ---------------------------------------------------------------------------

/** Qualitative compatibility classification between two members. */
export type CompatibilityLevel = 'excellent' | 'good' | 'moderate' | 'low' | 'critical';

/** Pairwise compatibility result between two team members. */
export interface CompatibilityResult {
  memberId1: string;
  memberId2: string;
  /** Overall compatibility score (0-100). */
  score: number;
  level: CompatibilityLevel;
  /** Per-dimension compatibility breakdown. */
  dimensionBreakdown: Record<GaugeProDimension, number>;
  strengths: string[];
  tensions: string[];
}

/** A saved Team Builder scenario containing one or more proposed teams. */
export interface TeamBuilderScenario {
  id: string;
  name: string;
  description?: string;
  teams: TeamBuilderTeam[];
  createdAt: string;
  updatedAt: string;
}

/** A single team within a Team Builder scenario. */
export interface TeamBuilderTeam {
  id: string;
  name: string;
  memberIds: string[];
}

// ---------------------------------------------------------------------------
// PRD-057 — Desenvolvimento & Evolucao
// ---------------------------------------------------------------------------

/** Lifecycle status of a development objective. */
export type ObjectiveStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/** Priority level for a development objective. */
export type ObjectivePriority = 'high' | 'medium' | 'low';

/** Frequency at which a member should retake the Gauge-Pro assessment. */
export type RetestFrequency = '3months' | '6months' | '9months' | '12months';

/** A development plan associated with a single team member. */
export interface DevelopmentPlan {
  id: string;
  memberId: string;
  objectives: DevelopmentObjective[];
  createdAt: string;
  updatedAt: string;
}

/** An individual objective within a development plan. */
export interface DevelopmentObjective {
  id: string;
  planId: string;
  dimension: GaugeProDimension;
  title: string;
  description?: string;
  status: ObjectiveStatus;
  priority: ObjectivePriority;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

/** Retest scheduling configuration for a team member. */
export interface RetestSchedule {
  id: string;
  memberId: string;
  frequency: RetestFrequency;
  nextDate: string;
  autoSend: boolean;
  lastSentAt?: string;
  createdAt: string;
}

/** A timestamped annotation about a member's professional evolution. */
export interface EvolutionAnnotation {
  id: string;
  memberId: string;
  text: string;
  type: 'training' | 'coaching' | 'feedback' | 'promotion' | 'other';
  date: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Talent Profiles
// ---------------------------------------------------------------------------

/** Predefined talent profile type derived from Gauge-Pro dimensions. */
export type TalentProfileType =
  | 'natural_leader'
  | 'specialist'
  | 'mediator'
  | 'innovator'
  | 'motor'
  | 'mentor';

/** Metadata describing a talent profile category. */
export interface TalentProfile {
  type: TalentProfileType;
  label: string;
  description: string;
  criteria: string;
  icon: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Culture
// ---------------------------------------------------------------------------

/** A point-in-time snapshot of the company's behavioural culture DNA. */
export interface CompanyCultureSnapshot {
  id: string;
  date: string;
  /** Averaged dimension scores across all mapped members. */
  dnaScores: DimensionScores;
  totalMembers: number;
  mappedMembers: number;
  manifesto?: string;
}

/** Cultural fit result comparing a candidate against the company DNA. */
export interface CulturalFitResult {
  candidateScores: DimensionScores;
  companyDNA: DimensionScores;
  /** Overall fit score (0-100). */
  fitScore: number;
  fitLevel: 'excellent' | 'good' | 'moderate' | 'low';
  /** Per-dimension gap (candidate minus company DNA). */
  dimensionGaps: Record<GaugeProDimension, number>;
}

// ---------------------------------------------------------------------------
// Gap Analysis
// ---------------------------------------------------------------------------

/** Result of a gap analysis for a department or the whole organization. */
export interface GapAnalysisResult {
  departmentId?: string;
  teamAverage: DimensionScores;
  gaps: GapItem[];
  excesses: GapItem[];
  idealProfile: DimensionScores;
  recommendedArchetype: string;
}

/** A single dimension gap or excess identified in the analysis. */
export interface GapItem {
  dimension: GaugeProDimension;
  currentAverage: number;
  idealRange: { min: number; max: number };
  /** Signed distance from the ideal range (negative = deficit, positive = excess). */
  gap: number;
  severity: 'critical' | 'moderate' | 'minor';
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

/** Classification of team-related alerts. */
export type TeamAlertType = 'no_test' | 'old_test' | 'dept_unmapped' | 'retest_due';

/** An actionable alert surfaced by the team management module. */
export interface TeamAlert {
  id: string;
  type: TeamAlertType;
  message: string;
  severity: 'warning' | 'info' | 'critical';
  /** ID of the related entity (member, department, schedule, etc.). */
  relatedId?: string;
  createdAt: string;
}
