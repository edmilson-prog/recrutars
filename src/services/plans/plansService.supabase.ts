/**
 * Plans Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 *
 * Queries plans, plan_capabilities, plan_capability_assignments,
 * and subscriptions tables.
 */

import { supabase } from '@/lib/supabase';
import type {
  Plan,
  PlanPeriod,
  PlanCapability,
  PlanCapabilityAssignment,
  Subscription,
} from '@/types/plans';
import type {
  IPlansService,
  SubscriptionFilters,
  CreateSubscriptionData,
} from './plansService';

/** Maps a raw Supabase row (snake_case) to the Plan interface (camelCase). */
function normalizePlanRow(row: Record<string, unknown>): Plan {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    type: row.type as 'candidate' | 'company',
    description: (row.description as string) ?? '',
    descriptionShort: (row.description_short as string) ?? '',
    badge: row.badge as string | undefined,
    prices: (row.prices as Record<PlanPeriod, number>) ?? { monthly: 0, quarterly: 0, semiannual: 0, annual: 0 },
    launchPrices: row.launch_prices as Record<PlanPeriod, number> | undefined,
    launchPriceEndDate: row.launch_price_end_date as string | undefined,
    isActive: (row.is_active as boolean) ?? true,
    isFree: (row.is_free as boolean) ?? false,
    order: (row.sort_order as number) ?? 0,
    features: (row.features as string[]) ?? [],
    createdAt: (row.created_at as string) ?? '',
    trialDurationDays: row.trial_duration_days as number | undefined,
    discountPercentage: row.discount_percentage as number | undefined,
    discountMinPeriod: row.discount_min_period as PlanPeriod | undefined,
    bonusTests: row.bonus_tests as Partial<Record<PlanPeriod, number>> | undefined,
    stripeProductIdTest: row.stripe_product_id_test as string | undefined,
    stripeProductIdLive: row.stripe_product_id_live as string | undefined,
    stripePriceIdsTest: row.stripe_price_ids_test as Partial<Record<PlanPeriod, string>> | undefined,
    stripePriceIdsLive: row.stripe_price_ids_live as Partial<Record<PlanPeriod, string>> | undefined,
    stripeSyncedAtTest: row.stripe_synced_at_test as string | undefined,
    stripeSyncedAtLive: row.stripe_synced_at_live as string | undefined,
  };
}

/** Maps a raw assignment row (snake_case) to PlanCapabilityAssignment (camelCase). */
function normalizeAssignmentRow(row: Record<string, unknown>): PlanCapabilityAssignment {
  const raw = row.value as string;
  let value: string | number | boolean = raw;
  if (raw === 'true') value = true;
  else if (raw === 'false') value = false;
  else if (/^\d+$/.test(raw)) value = parseInt(raw, 10);
  return {
    planId: row.plan_id as string,
    capabilityKey: row.capability_key as string,
    value,
  };
}

export class SupabasePlansService implements IPlansService {
  async getPlans(type?: 'candidate' | 'company'): Promise<Plan[]> {
    let query = supabase.from('plans').select('*').order('sort_order', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(r => normalizePlanRow(r as Record<string, unknown>));
  }

  async getPlan(id: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? normalizePlanRow(data as Record<string, unknown>) : null;
  }

  async getPlanBySlug(slug: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data ? normalizePlanRow(data as Record<string, unknown>) : null;
  }

  async updatePlan(id: string, updates: Record<string, unknown>): Promise<Plan> {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return normalizePlanRow(data as Record<string, unknown>);
  }

  async createPlan(data: Record<string, unknown>): Promise<Plan> {
    const { data: created, error } = await supabase
      .from('plans')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return normalizePlanRow(created as Record<string, unknown>);
  }

  async deletePlan(id: string): Promise<void> {
    // Safety: check for active/trial/past_due subscriptions
    const { count, error: countError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', id)
      .in('status', ['active', 'trial', 'past_due']);

    if (countError) throw countError;

    if (count && count > 0) {
      throw new Error(
        `Nao e possivel excluir: ${count} assinatura(s) ativa(s) vinculada(s).`
      );
    }

    const { data: deleted, error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!deleted || deleted.length === 0) {
      throw new Error('Falha ao excluir plano. Verifique permissoes de admin.');
    }
  }

  async getCapabilities(): Promise<PlanCapability[]> {
    const { data, error } = await supabase
      .from('plan_capabilities')
      .select('*')
      .order('category');

    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      key: row.key as string,
      name: row.name as string,
      description: (row.description as string) ?? '',
      category: row.category as string,
      valueType: row.value_type === 'text' ? 'enum' : row.value_type as 'boolean' | 'number' | 'enum',
      possibleValues: row.possible_values as string[] | undefined,
    }));
  }

  async getCapabilityAssignments(planId: string): Promise<PlanCapabilityAssignment[]> {
    const { data, error } = await supabase
      .from('plan_capability_assignments')
      .select('*')
      .eq('plan_id', planId);

    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => normalizeAssignmentRow(row));
  }

  async getAllCapabilityAssignments(): Promise<PlanCapabilityAssignment[]> {
    const { data, error } = await supabase
      .from('plan_capability_assignments')
      .select('*');

    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => normalizeAssignmentRow(row));
  }

  async createCapability(input: Omit<PlanCapability, 'id'>): Promise<PlanCapability> {
    const { data, error } = await supabase
      .from('plan_capabilities')
      .insert({
        key: input.key,
        name: input.name,
        description: input.description,
        category: input.category,
        value_type: input.valueType === 'enum' ? 'enum' : input.valueType,
        possible_values: input.possibleValues ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    const row = data as Record<string, unknown>;
    return {
      id: row.id as string,
      key: row.key as string,
      name: row.name as string,
      description: (row.description as string) ?? '',
      category: row.category as string,
      valueType: row.value_type === 'text' ? 'enum' : row.value_type as 'boolean' | 'number' | 'enum',
      possibleValues: row.possible_values as string[] | undefined,
    };
  }

  async deleteCapability(key: string): Promise<void> {
    const { data: deleted, error } = await supabase
      .from('plan_capabilities')
      .delete()
      .eq('key', key)
      .select();

    if (error) throw error;
    if (!deleted || deleted.length === 0) {
      throw new Error('Falha ao excluir capability. Verifique permissoes de admin.');
    }
  }

  async upsertCapabilityAssignment(
    planId: string,
    capabilityKey: string,
    value: string | number | boolean,
  ): Promise<PlanCapabilityAssignment> {
    const { data, error } = await supabase
      .from('plan_capability_assignments')
      .upsert(
        { plan_id: planId, capability_key: capabilityKey, value: String(value) },
        { onConflict: 'plan_id,capability_key' },
      )
      .select()
      .single();

    if (error) throw error;
    return normalizeAssignmentRow(data as Record<string, unknown>);
  }

  async getSubscriptions(filters?: SubscriptionFilters): Promise<Subscription[]> {
    let query = supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.userType) {
      query = query.eq('user_type', filters.userType);
    }
    if (filters?.planId) {
      query = query.eq('plan_id', filters.planId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as Subscription[];
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return (data as unknown as Subscription) ?? null;
  }

  async createSubscription(input: CreateSubscriptionData): Promise<Subscription> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: input.userId,
        user_type: input.userType,
        user_name: input.userName,
        plan_id: input.planId,
        plan_slug: input.planSlug,
        plan_name: input.planName,
        period: input.period,
        price_paid: input.pricePaid,
        start_date: now.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        renewal_date: endDate.toISOString().split('T')[0],
        status: 'active',
        is_early_adopter: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Subscription;
  }

  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    const updates: Record<string, unknown> = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    };
    if (reason) updates.cancellation_reason = reason;

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Subscription;
  }

  /** PRD-074: Get the trial subscription for a company user. */
  async getTrialSubscription(companyUserId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', companyUserId)
      .eq('is_trial', true)
      .maybeSingle();

    if (error) throw error;
    return (data as unknown as Subscription) ?? null;
  }

  /** PRD-074: Create a trial subscription for a company. */
  async createTrialSubscription(
    companyUserId: string,
    userName: string,
    planId: string,
  ): Promise<Subscription> {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 90);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: companyUserId,
        user_type: 'company',
        user_name: userName,
        plan_id: planId,
        plan_slug: 'basico-empresas',
        plan_name: 'Basico Empresas',
        period: 'monthly',
        price_paid: 0,
        start_date: now.toISOString().split('T')[0],
        end_date: trialEnd.toISOString().split('T')[0],
        renewal_date: trialEnd.toISOString().split('T')[0],
        status: 'trial',
        is_trial: true,
        trial_start_date: now.toISOString().split('T')[0],
        trial_end_date: trialEnd.toISOString().split('T')[0],
        is_early_adopter: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Subscription;
  }
}
