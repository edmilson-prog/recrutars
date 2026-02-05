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
  PlanCapability,
  PlanCapabilityAssignment,
  Subscription,
} from '@/types/plans';
import type {
  IPlansService,
  SubscriptionFilters,
  CreateSubscriptionData,
} from './plansService';

export class SupabasePlansService implements IPlansService {
  async getPlans(type?: 'candidate' | 'company'): Promise<Plan[]> {
    let query = supabase.from('plans').select('*').order('order', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as Plan[];
  }

  async getPlan(id: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return (data as unknown as Plan) ?? null;
  }

  async getPlanBySlug(slug: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return (data as unknown as Plan) ?? null;
  }

  async getCapabilities(): Promise<PlanCapability[]> {
    const { data, error } = await supabase
      .from('plan_capabilities')
      .select('*')
      .order('category');

    if (error) throw error;
    return (data ?? []) as unknown as PlanCapability[];
  }

  async getCapabilityAssignments(planId: string): Promise<PlanCapabilityAssignment[]> {
    const { data, error } = await supabase
      .from('plan_capability_assignments')
      .select('*')
      .eq('plan_id', planId);

    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => ({
      planId: row.plan_id as string,
      capabilityKey: row.capability_key as string,
      value: row.value as string | number | boolean,
    }));
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
}
