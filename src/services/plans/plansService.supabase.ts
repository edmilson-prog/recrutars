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
  BillingModel,
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
    billingModel: (row.billing_model as BillingModel) ?? 'recurring',
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
    let query = supabase.from('plans').select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(r => normalizePlanRow(r as Record<string, unknown>));
  }

  async getAllPlans(type?: 'candidate' | 'company'): Promise<Plan[]> {
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
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as Subscription[];
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    // Fetch all subscriptions for the user (active, cancelled, trial)
    // Priority: active > cancelled (still in period) > trial
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'cancelled', 'past_due', 'trial'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Pick the best subscription by priority
    const active = data.find((s) => s.status === 'active' && !s.is_trial);
    if (active) return active as unknown as Subscription;

    const pastDue = data.find((s) => s.status === 'past_due');
    if (pastDue) return pastDue as unknown as Subscription;

    // Return cancelled if still within the paid period (user should see their plan as "Cancelada")
    const cancelled = data.find((s) => s.status === 'cancelled' && !s.is_trial);
    if (cancelled) {
      const endDate = cancelled.end_date ? new Date(cancelled.end_date) : null;
      const now = new Date();
      if (endDate && endDate > now) {
        return cancelled as unknown as Subscription;
      }
    }

    // Fall back to trial
    const trial = data.find((s) => s.status === 'trial' || s.is_trial);
    if (trial) return trial as unknown as Subscription;

    // Last resort: most recent
    return data[0] as unknown as Subscription;
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

    // Insert audit trail in subscription_history
    const sub = data as Record<string, unknown>;
    await supabase
      .from('subscription_history')
      .insert({
        subscription_id: id,
        action: 'cancelled',
        from_plan_id: sub.plan_id,
        notes: reason
          ? `Cancelamento via painel. Motivo: ${reason}`
          : 'Cancelamento via painel.',
      });

    return data as unknown as Subscription;
  }

  async changeSubscriptionPlan(userId: string, newPlanId: string): Promise<Subscription> {
    // Load the target plan to copy its denormalized fields onto the subscription
    const targetPlan = await this.getPlan(newPlanId);
    if (!targetPlan) throw new Error('Plano de destino não encontrado.');

    // Resolve the user's current subscription (active > cancelled-in-period > trial)
    const current = await this.getSubscription(userId);
    if (!current) {
      throw new Error('Esta empresa não possui assinatura para alterar.');
    }

    const currentRaw = current as unknown as Record<string, unknown>;
    const subscriptionId = currentRaw.id as string;
    const fromPlanId = (currentRaw.plan_id ?? currentRaw.planId) as string | undefined;
    const fromPlanName = (currentRaw.plan_name ?? currentRaw.planName ?? '') as string;
    const currentStatus = currentRaw.status as string | undefined;
    const currentIsTrial = Boolean(currentRaw.is_trial ?? currentRaw.isTrial);

    // No-op when already on the target plan
    if (fromPlanId === newPlanId) {
      return current;
    }

    // Build the update. Always swap the denormalized plan fields.
    const updates: Record<string, unknown> = {
      plan_id: targetPlan.id,
      plan_slug: targetPlan.slug,
      plan_name: targetPlan.name,
    };

    // A manual admin plan assignment is meant to GRANT access. If the
    // subscription is not already an active paid one (e.g. an expired/ongoing
    // trial, cancelled, past_due), convert it to active so the TrialGuard and
    // entitlement checks unlock immediately. We only refresh the billing period
    // in that case — an already-active paid subscription keeps its dates so we
    // never shorten a period the company actually paid for.
    const isActivePaid = currentStatus === 'active' && !currentIsTrial;
    if (!isActivePaid) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      updates.status = 'active';
      updates.is_trial = false;
      updates.start_date = now.toISOString().split('T')[0];
      updates.end_date = periodEnd.toISOString().split('T')[0];
      updates.renewal_date = periodEnd.toISOString().split('T')[0];
    }

    // Persist. .select() is required: RLS-blocked updates return no error but 0 rows.
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(
        'Não foi possível atualizar a assinatura (sem permissão ou assinatura inexistente).',
      );
    }

    // Audit trail (best-effort) — classify direction by plan order
    let action: 'upgraded' | 'downgraded' = 'upgraded';
    if (fromPlanId) {
      const fromPlan = await this.getPlan(fromPlanId);
      if (fromPlan && targetPlan.order < fromPlan.order) action = 'downgraded';
    }

    await supabase.from('subscription_history').insert({
      subscription_id: subscriptionId,
      action,
      from_plan_id: fromPlanId ?? null,
      to_plan_id: targetPlan.id,
      notes: `Plano alterado manualmente pelo admin: ${fromPlanName || '—'} → ${targetPlan.name}.`,
    });

    return data[0] as unknown as Subscription;
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

  /** PRD-074/079: Create a trial subscription for a company.
   *  Reads trial_duration_days from the plan dynamically (RF-003). */
  async createTrialSubscription(
    companyUserId: string,
    userName: string,
    planId: string,
  ): Promise<Subscription> {
    // PRD-079: Read trial duration from the plan configuration
    const { data: planRow } = await supabase
      .from('plans')
      .select('trial_duration_days, slug, name')
      .eq('id', planId)
      .single();

    const trialDays = planRow?.trial_duration_days ?? 90; // fail-safe fallback
    const planSlug = planRow?.slug ?? 'basico-empresas';
    const planName = planRow?.name ?? 'Basico Empresas';

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: companyUserId,
        user_type: 'company',
        user_name: userName,
        plan_id: planId,
        plan_slug: planSlug,
        plan_name: planName,
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

  // ---------------------------------------------------------------------------
  // Trial release control (admin) — spec 2026-06-10
  // ---------------------------------------------------------------------------

  /** Formats YYYY-MM-DD as DD/MM/YYYY for user-facing messages. */
  private formatDateBRString(isoDate: string): string {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  }

  async adminSetTrialPeriod(userId: string, days: number): Promise<Subscription> {
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      throw new Error('Informe um período entre 1 e 365 dias.');
    }

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const today = new Date();

    const existing = await this.getTrialSubscription(userId);

    let updatedSub: Subscription;
    let endIso: string;
    let action: 'released' | 'extended';

    if (!existing) {
      // Defense-in-depth: never create a parallel trial next to an active paid
      // subscription (the UI hides the controls, but guard the service too).
      const current = await this.getSubscription(userId);
      const currentRaw = current as unknown as Record<string, unknown> | null;
      if (currentRaw && currentRaw.status === 'active' && !(currentRaw.is_trial ?? currentRaw.isTrial)) {
        throw new Error('Esta empresa possui assinatura paga ativa — o período de avaliação não se aplica.');
      }

      // Legacy company without a trial row: create one, already released.
      const { data: planRow, error: planErr } = await supabase
        .from('plans')
        .select('id, slug, name')
        .eq('slug', 'basico-empresas')
        .eq('type', 'company')
        .single();
      if (planErr || !planRow) {
        throw new Error(
          `Plano Básico Empresas não encontrado.${planErr ? ` (${planErr.message})` : ''}`,
        );
      }

      const { data: companyRow } = await supabase
        .from('companies')
        .select('name')
        .eq('profile_id', userId)
        .maybeSingle();

      const end = new Date(today);
      end.setDate(end.getDate() + days);
      endIso = fmt(end);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          user_type: 'company',
          user_name: companyRow?.name ?? '',
          plan_id: planRow.id,
          plan_slug: planRow.slug,
          plan_name: planRow.name,
          period: 'monthly',
          price_paid: 0,
          start_date: fmt(today),
          end_date: endIso,
          renewal_date: endIso,
          status: 'trial',
          is_trial: true,
          trial_start_date: fmt(today),
          trial_end_date: endIso,
          is_early_adopter: false,
          trial_released_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      updatedSub = data as unknown as Subscription;
      action = 'released';
    } else {
      const raw = existing as unknown as Record<string, unknown>;
      const subscriptionId = raw.id as string;
      const releasedAt = (raw.trial_released_at ?? raw.trialReleasedAt) as string | null | undefined;
      const currentEnd = (raw.trial_end_date ?? raw.trialEndDate) as string | undefined;

      // Active trial (released + end date today or later) extends from the
      // current end; awaiting/expired trials restart from today.
      const isActiveTrial =
        Boolean(releasedAt) && !!currentEnd && currentEnd.split('T')[0] >= fmt(today);
      const base = isActiveTrial ? new Date(currentEnd as string) : today;
      const end = new Date(base);
      end.setDate(end.getDate() + days);
      endIso = fmt(end);

      const updates: Record<string, unknown> = {
        status: 'trial',
        is_trial: true,
        trial_end_date: endIso,
        end_date: endIso,
        renewal_date: endIso,
      };
      if (!isActiveTrial) updates.trial_start_date = fmt(today);
      if (!releasedAt) updates.trial_released_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Não foi possível atualizar a assinatura (sem permissão ou assinatura inexistente).');
      }
      updatedSub = data[0] as unknown as Subscription;
      action = isActiveTrial ? 'extended' : 'released';
    }

    const endBR = this.formatDateBRString(endIso);
    const subRaw = updatedSub as unknown as Record<string, unknown>;

    // Best-effort audit trail — must not undo the release on failure.
    try {
      const { error: histErr } = await supabase.from('subscription_history').insert({
        subscription_id: subRaw.id as string,
        action: action === 'extended' ? 'renewed' : 'reactivated',
        to_plan_id: (subRaw.plan_id ?? null) as string | null,
        notes:
          action === 'extended'
            ? `Avaliação estendida pelo admin em ${days} dias (até ${endBR}).`
            : `Avaliação liberada pelo admin por ${days} dias (até ${endBR}).`,
      });
      if (histErr) {
        console.warn('[Plans] adminSetTrialPeriod: history insert failed (non-fatal):', histErr);
      }
    } catch (err) {
      console.warn('[Plans] adminSetTrialPeriod: history insert failed (non-fatal):', err);
    }

    // Best-effort in-app notification to the company user.
    try {
      const { error: notifErr } = await supabase.rpc('send_manual_notification', {
        p_title:
          action === 'extended'
            ? 'Período de avaliação estendido'
            : 'Período de avaliação liberado',
        p_description:
          action === 'extended'
            ? `Sua avaliação foi estendida até ${endBR}. Bom recrutamento!`
            : `Sua avaliação foi liberada até ${endBR}. Bom recrutamento!`,
        p_action_url: null,
        p_category: 'informativo',
        p_priority: 'media',
        p_target_type: 'specific_user',
        p_target_user_id: userId,
        p_scheduled_at: null,
        p_template_id: null,
      });
      if (notifErr) {
        console.warn('[Plans] adminSetTrialPeriod: notification failed (non-fatal):', notifErr);
      }
    } catch (err) {
      console.warn('[Plans] adminSetTrialPeriod: notification failed (non-fatal):', err);
    }

    return updatedSub;
  }

  async adminEndTrial(userId: string): Promise<Subscription> {
    const existing = await this.getTrialSubscription(userId);
    if (!existing) throw new Error('Esta empresa não possui assinatura de avaliação.');

    const raw = existing as unknown as Record<string, unknown>;
    const subscriptionId = raw.id as string;

    const releasedAt = (raw.trial_released_at ?? raw.trialReleasedAt) as string | null | undefined;
    if (!releasedAt) {
      throw new Error('Esta avaliação ainda não foi liberada — não há o que encerrar.');
    }

    // Yesterday: trialRules treats daysRemaining < 0 as expired, so today's
    // date would still grant access ("último dia").
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endIso = yesterday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        trial_end_date: endIso,
        end_date: endIso,
        renewal_date: endIso,
      })
      .eq('id', subscriptionId)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Não foi possível atualizar a assinatura (sem permissão ou assinatura inexistente).');
    }

    try {
      const { error: histErr } = await supabase.from('subscription_history').insert({
        subscription_id: subscriptionId,
        action: 'expired',
        from_plan_id: (raw.plan_id ?? null) as string | null,
        notes: 'Avaliação encerrada manualmente pelo admin.',
      });
      if (histErr) {
        console.warn('[Plans] adminEndTrial: history insert failed (non-fatal):', histErr);
      }
    } catch (err) {
      console.warn('[Plans] adminEndTrial: history insert failed (non-fatal):', err);
    }

    return data[0] as unknown as Subscription;
  }
}
