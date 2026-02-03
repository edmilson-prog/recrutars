/**
 * Types for Feature Flags
 * PRD-062: Feature Flags "Switch"
 */

export type FlagStatus = 'active' | 'inactive' | 'killed';
export type ConditionType = 'plan_is' | 'role_is' | 'has_capability' | 'user_type_is' | 'rollout_percent';
export type ConditionOperator = 'IN' | 'NOT_IN' | 'EQUALS' | 'GTE' | 'LTE';

export interface FlagCondition {
  type: ConditionType;
  operator: ConditionOperator;
  value: string | string[] | number;
}

export interface ConditionGroup {
  conditions: FlagCondition[];
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  scope: 'candidate' | 'company' | 'all';
  status: FlagStatus;
  defaultValue: boolean;
  conditionGroups: ConditionGroup[];
  rolloutPercentage?: number;
  isKillSwitched: boolean;
  killSwitchReason?: string;
  killSwitchedAt?: string;
  killSwitchedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagOverride {
  id: string;
  flagKey: string;
  targetType: 'user' | 'company';
  targetId: string;
  targetName: string;
  enabled: boolean;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export type FlagAuditAction = 'created' | 'updated' | 'toggled' | 'killed' | 'unkilled' | 'override_added' | 'override_removed';

export interface FeatureFlagAudit {
  id: string;
  flagKey: string;
  flagName: string;
  action: FlagAuditAction;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  details?: string;
}

export interface EvaluationContext {
  userId: string;
  userType: 'admin' | 'company' | 'candidate';
  planSlug: string;
  roleSlug?: string;
  capabilities: string[];
  companyId?: string;
}

export interface EvaluationStep {
  step: string;
  checked: string;
  result: boolean;
  detail: string;
}

export interface EvaluationResult {
  enabled: boolean;
  reason: string;
  chain: EvaluationStep[];
}
