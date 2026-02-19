/**
 * Feature Flags Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 */

import { supabase } from '@/lib/supabase';
import type {
  FeatureFlag,
  FeatureFlagOverride,
  FeatureFlagAudit,
  FlagAuditAction,
  EvaluationContext,
} from '@/types/featureFlags';
import type { IFeatureFlagsService, AddOverrideData } from './featureFlagsService';

/** Maps a raw audit row (snake_case) to FeatureFlagAudit (camelCase). */
function normalizeAuditRow(row: Record<string, unknown>): FeatureFlagAudit {
  return {
    id: row.id as string,
    flagKey: row.flag_key as string,
    flagName: row.flag_name as string,
    action: row.action as FlagAuditAction,
    oldValue: row.old_value as string | undefined,
    newValue: row.new_value as string | undefined,
    performedBy: row.performed_by as string,
    performedByName: row.performed_by_name as string,
    performedAt: row.performed_at as string,
    details: row.details as string | undefined,
  };
}

/** Gets current user ID and name for audit entries. */
async function getCurrentUser(): Promise<{ id: string; name: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? 'system';

  if (userId === 'system') return { id: 'system', name: 'Sistema' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', userId)
    .maybeSingle();

  return {
    id: userId,
    name: profile?.name || profile?.email || user?.email || 'Admin',
  };
}

export class SupabaseFeatureFlagsService implements IFeatureFlagsService {
  /** Insert an audit log entry. Non-blocking — errors are logged but don't break the operation. */
  private async logAudit(params: {
    flagKey: string;
    flagName: string;
    action: FlagAuditAction;
    oldValue?: string;
    newValue?: string;
    details?: string;
  }): Promise<void> {
    try {
      const currentUser = await getCurrentUser();

      await supabase.from('feature_flag_audit').insert({
        flag_key: params.flagKey,
        flag_name: params.flagName,
        action: params.action,
        old_value: params.oldValue ?? null,
        new_value: params.newValue ?? null,
        performed_by: currentUser.id,
        performed_by_name: currentUser.name,
        details: params.details ?? null,
        performed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[FeatureFlags] Failed to log audit entry:', err);
    }
  }

  async getFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('category')
      .order('key');

    if (error) throw error;
    return (data ?? []) as unknown as FeatureFlag[];
  }

  async getFlag(key: string): Promise<FeatureFlag | null> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return (data as unknown as FeatureFlag) ?? null;
  }

  async updateFlag(key: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const flag = await this.getFlag(key);

    const { data, error } = await supabase
      .from('feature_flags')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    const changedFields = Object.keys(updates).filter(k => k !== 'updated_at').join(', ');
    await this.logAudit({
      flagKey: key,
      flagName: flag?.name ?? key,
      action: 'updated',
      details: `Campos alterados: ${changedFields}`,
    });

    return data as unknown as FeatureFlag;
  }

  async toggleFlag(key: string): Promise<FeatureFlag> {
    const flag = await this.getFlag(key);
    if (!flag) throw new Error(`Flag "${key}" not found`);

    const oldStatus = flag.status;
    const newStatus = oldStatus === 'active' ? 'inactive' : 'active';

    const { data, error } = await supabase
      .from('feature_flags')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    await this.logAudit({
      flagKey: key,
      flagName: flag.name,
      action: 'toggled',
      oldValue: oldStatus,
      newValue: newStatus,
    });

    return data as unknown as FeatureFlag;
  }

  async killSwitch(key: string, reason: string): Promise<FeatureFlag> {
    const flag = await this.getFlag(key);
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data.user?.id ?? 'system';

    const { data, error } = await supabase
      .from('feature_flags')
      .update({
        status: 'killed',
        is_kill_switched: true,
        kill_switch_reason: reason,
        kill_switched_at: now,
        kill_switched_by: userId,
        updated_at: now,
      })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    await this.logAudit({
      flagKey: key,
      flagName: flag?.name ?? key,
      action: 'killed',
      oldValue: flag?.status,
      newValue: 'killed',
      details: reason,
    });

    return data as unknown as FeatureFlag;
  }

  async unkillSwitch(key: string): Promise<FeatureFlag> {
    const flag = await this.getFlag(key);

    const { data, error } = await supabase
      .from('feature_flags')
      .update({
        status: 'active',
        is_kill_switched: false,
        kill_switch_reason: null,
        kill_switched_at: null,
        kill_switched_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    await this.logAudit({
      flagKey: key,
      flagName: flag?.name ?? key,
      action: 'unkilled',
      oldValue: 'killed',
      newValue: 'active',
    });

    return data as unknown as FeatureFlag;
  }

  async getOverrides(flagKey?: string): Promise<FeatureFlagOverride[]> {
    let query = supabase
      .from('feature_flag_overrides')
      .select('*')
      .order('created_at', { ascending: false });

    if (flagKey) {
      query = query.eq('flag_key', flagKey);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as FeatureFlagOverride[];
  }

  async addOverride(input: AddOverrideData): Promise<FeatureFlagOverride> {
    const userId = (await supabase.auth.getUser()).data.user?.id ?? 'system';

    const { data, error } = await supabase
      .from('feature_flag_overrides')
      .insert({
        flag_key: input.flagKey,
        target_type: input.targetType,
        target_id: input.targetId,
        target_name: input.targetName,
        enabled: input.enabled,
        reason: input.reason,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Get flag name for audit
    const flag = await this.getFlag(input.flagKey);
    await this.logAudit({
      flagKey: input.flagKey,
      flagName: flag?.name ?? input.flagKey,
      action: 'override_added',
      newValue: `${input.targetType}:${input.targetName} → ${input.enabled ? 'ON' : 'OFF'}`,
      details: input.reason,
    });

    return data as unknown as FeatureFlagOverride;
  }

  async removeOverride(id: string): Promise<void> {
    // Fetch override before deleting to get flag_key for audit
    const { data: override } = await supabase
      .from('feature_flag_overrides')
      .select('flag_key, target_type, target_name')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('feature_flag_overrides')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (override) {
      const flag = await this.getFlag(override.flag_key);
      await this.logAudit({
        flagKey: override.flag_key,
        flagName: flag?.name ?? override.flag_key,
        action: 'override_removed',
        oldValue: `${override.target_type}:${override.target_name}`,
      });
    }
  }

  async evaluateFlag(key: string, context: EvaluationContext): Promise<boolean> {
    // Delegates to a Supabase RPC function that evaluates the flag server-side
    const { data, error } = await supabase.rpc('evaluate_feature_flag', {
      p_flag_key: key,
      p_user_id: context.userId,
      p_user_type: context.userType,
      p_plan_slug: context.planSlug,
      p_company_id: context.companyId ?? null,
    });

    if (error) throw error;
    return !!data;
  }

  async getAudit(flagKey?: string): Promise<FeatureFlagAudit[]> {
    let query = supabase
      .from('feature_flag_audit')
      .select('*')
      .order('performed_at', { ascending: false });

    if (flagKey) {
      query = query.eq('flag_key', flagKey);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => normalizeAuditRow(row));
  }
}
