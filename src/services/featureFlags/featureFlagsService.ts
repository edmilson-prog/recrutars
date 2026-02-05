/**
 * Feature Flags Service — Interface
 * PRD-066: Service Layer Pattern
 *
 * Manages feature flags, overrides, evaluation, and audit trail.
 */

import type {
  FeatureFlag,
  FeatureFlagOverride,
  FeatureFlagAudit,
  EvaluationContext,
} from '@/types/featureFlags';

export interface AddOverrideData {
  flagKey: string;
  targetType: 'user' | 'company';
  targetId: string;
  targetName: string;
  enabled: boolean;
  reason?: string;
}

export interface IFeatureFlagsService {
  /** List all feature flags. */
  getFlags(): Promise<FeatureFlag[]>;

  /** Get a single flag by key. */
  getFlag(key: string): Promise<FeatureFlag | null>;

  /** Update flag properties. */
  updateFlag(key: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag>;

  /** Toggle flag status between active and inactive. */
  toggleFlag(key: string): Promise<FeatureFlag>;

  /** Activate kill switch on a flag. */
  killSwitch(key: string, reason: string): Promise<FeatureFlag>;

  /** Deactivate kill switch on a flag. */
  unkillSwitch(key: string): Promise<FeatureFlag>;

  /** List overrides, optionally filtered by flag key. */
  getOverrides(flagKey?: string): Promise<FeatureFlagOverride[]>;

  /** Add a new override. */
  addOverride(data: AddOverrideData): Promise<FeatureFlagOverride>;

  /** Remove an override by ID. */
  removeOverride(id: string): Promise<void>;

  /** Evaluate whether a flag is enabled for a given context. */
  evaluateFlag(key: string, context: EvaluationContext): Promise<boolean>;

  /** Get audit trail, optionally filtered by flag key. */
  getAudit(flagKey?: string): Promise<FeatureFlagAudit[]>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IFeatureFlagsService | null = null;

export async function getFeatureFlagsService(): Promise<IFeatureFlagsService> {
  if (_instance) return _instance;

  const { SupabaseFeatureFlagsService } = await import(
    './featureFlagsService.supabase'
  );
  _instance = new SupabaseFeatureFlagsService();
  return _instance;
}
