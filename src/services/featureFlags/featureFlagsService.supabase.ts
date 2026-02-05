/**
 * Feature Flags Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 */

import { supabase } from '@/lib/supabase';
import type {
  FeatureFlag,
  FeatureFlagOverride,
  FeatureFlagAudit,
  EvaluationContext,
} from '@/types/featureFlags';
import type { IFeatureFlagsService, AddOverrideData } from './featureFlagsService';

export class SupabaseFeatureFlagsService implements IFeatureFlagsService {
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
    const { data, error } = await supabase
      .from('feature_flags')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as FeatureFlag;
  }

  async toggleFlag(key: string): Promise<FeatureFlag> {
    const flag = await this.getFlag(key);
    if (!flag) throw new Error(`Flag "${key}" not found`);

    const newStatus = flag.status === 'active' ? 'inactive' : 'active';

    const { data, error } = await supabase
      .from('feature_flags')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as FeatureFlag;
  }

  async killSwitch(key: string, reason: string): Promise<FeatureFlag> {
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
    return data as unknown as FeatureFlag;
  }

  async unkillSwitch(key: string): Promise<FeatureFlag> {
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
    return data as unknown as FeatureFlagOverride;
  }

  async removeOverride(id: string): Promise<void> {
    const { error } = await supabase
      .from('feature_flag_overrides')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
    return (data ?? []) as unknown as FeatureFlagAudit[];
  }
}
