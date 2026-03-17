/**
 * Test Packages Service — Supabase Implementation
 * Sistema de pacotes de testes avulsos
 *
 * Queries test_packages, test_credits, and test_credit_transactions tables.
 */

import { supabase } from '@/lib/supabase';
import type {
  TestPackage,
  TestCredit,
  TestCreditTransaction,
} from '@/types/testPackages';
import type { ITestPackagesService } from './testPackagesService';

/** Maps a raw Supabase row (snake_case) to the TestPackage interface (camelCase). */
function normalizePackageRow(row: Record<string, unknown>): TestPackage {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? null,
    descriptionShort: (row.description_short as string) ?? null,
    type: (row.type as 'gauge_pro') ?? 'gauge_pro',
    credits: row.credits as number,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : null,
    features: (row.features as string[]) ?? [],
    badge: (row.badge as string) ?? null,
    stripeProductIdTest: (row.stripe_product_id_test as string) ?? null,
    stripeProductIdLive: (row.stripe_product_id_live as string) ?? null,
    stripePriceIdTest: (row.stripe_price_id_test as string) ?? null,
    stripePriceIdLive: (row.stripe_price_id_live as string) ?? null,
    stripeSyncedAtTest: (row.stripe_synced_at_test as string) ?? null,
    stripeSyncedAtLive: (row.stripe_synced_at_live as string) ?? null,
    isActive: (row.is_active as boolean) ?? true,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

/** Maps a raw Supabase row to TestCredit. */
function normalizeCreditRow(row: Record<string, unknown>): TestCredit {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    packageId: (row.package_id as string) ?? null,
    totalCredits: row.total_credits as number,
    usedCredits: row.used_credits as number,
    remainingCredits: row.remaining_credits as number,
    stripeSessionId: (row.stripe_session_id as string) ?? null,
    stripePaymentIntentId: (row.stripe_payment_intent_id as string) ?? null,
    status: row.status as TestCredit['status'],
    purchasedAt: (row.purchased_at as string) ?? '',
    createdAt: (row.created_at as string) ?? '',
    origin: (row.origin as TestCredit['origin']) ?? 'purchase',
    // Joined fields from test_packages
    packageName: (row as Record<string, unknown>).package_name as string | undefined,
    packageSlug: (row as Record<string, unknown>).package_slug as string | undefined,
  };
}

/** Maps a raw Supabase row to TestCreditTransaction. */
function normalizeTransactionRow(row: Record<string, unknown>): TestCreditTransaction {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    creditId: row.credit_id as string,
    type: row.type as TestCreditTransaction['type'],
    amount: row.amount as number,
    referenceType: (row.reference_type as string) ?? null,
    referenceId: (row.reference_id as string) ?? null,
    description: (row.description as string) ?? null,
    createdBy: (row.created_by as string) ?? null,
    createdAt: (row.created_at as string) ?? '',
  };
}

export class SupabaseTestPackagesService implements ITestPackagesService {
  // ---------------------------------------------------------------------------
  // Packages CRUD
  // ---------------------------------------------------------------------------

  async getPackages(type?: string): Promise<TestPackage[]> {
    let query = supabase
      .from('test_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(r => normalizePackageRow(r as Record<string, unknown>));
  }

  async getAllPackages(): Promise<TestPackage[]> {
    const { data, error } = await supabase
      .from('test_packages')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(r => normalizePackageRow(r as Record<string, unknown>));
  }

  async getPackage(id: string): Promise<TestPackage | null> {
    const { data, error } = await supabase
      .from('test_packages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? normalizePackageRow(data as Record<string, unknown>) : null;
  }

  async createPackage(input: Record<string, unknown>): Promise<TestPackage> {
    const { data, error } = await supabase
      .from('test_packages')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return normalizePackageRow(data as Record<string, unknown>);
  }

  async updatePackage(id: string, updates: Record<string, unknown>): Promise<TestPackage> {
    const { data, error } = await supabase
      .from('test_packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return normalizePackageRow(data as Record<string, unknown>);
  }

  async deletePackage(id: string): Promise<void> {
    // Safety: check for active credits linked to this package
    const { count, error: countError } = await supabase
      .from('test_credits')
      .select('*', { count: 'exact', head: true })
      .eq('package_id', id)
      .eq('status', 'active');

    if (countError) throw countError;

    if (count && count > 0) {
      throw new Error(
        `Nao e possivel excluir: ${count} compra(s) ativa(s) vinculada(s) a este pacote.`
      );
    }

    const { data: deleted, error } = await supabase
      .from('test_packages')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!deleted || deleted.length === 0) {
      throw new Error('Falha ao excluir pacote. Verifique permissoes de admin.');
    }
  }

  // ---------------------------------------------------------------------------
  // Credits
  // ---------------------------------------------------------------------------

  async getCompanyCreditBalance(companyId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_company_credit_balance', {
      p_company_id: companyId,
    });

    if (error) throw error;
    return (data as number) ?? 0;
  }

  async getCompanyCredits(companyId: string): Promise<TestCredit[]> {
    const { data, error } = await supabase
      .from('test_credits')
      .select('*, test_packages(name, slug)')
      .eq('company_id', companyId)
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(r => {
      const row = r as Record<string, unknown>;
      const pkg = row.test_packages as Record<string, unknown> | null;
      return normalizeCreditRow({
        ...row,
        package_name: pkg?.name,
        package_slug: pkg?.slug,
      });
    });
  }

  async getTransactions(companyId: string): Promise<TestCreditTransaction[]> {
    const { data, error } = await supabase
      .from('test_credit_transactions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(r => normalizeTransactionRow(r as Record<string, unknown>));
  }

  async hasAvailableCredits(companyId: string, amount = 1): Promise<boolean> {
    const balance = await this.getCompanyCreditBalance(companyId);
    return balance >= amount;
  }

  async consumeCredit(
    companyId: string,
    invitationId: string,
    description: string,
    createdBy: string,
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc('consume_test_credit', {
      p_company_id: companyId,
      p_invitation_id: invitationId,
      p_description: description,
      p_created_by: createdBy,
    });

    if (error) throw error;
    return (data as string) ?? null;
  }

  async refundCredit(
    companyId: string,
    invitationId: string,
    description: string,
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('refund_test_credit', {
      p_company_id: companyId,
      p_invitation_id: invitationId,
      p_description: description,
    });

    if (error) throw error;
    return (data as boolean) ?? false;
  }

  // ---------------------------------------------------------------------------
  // Admin credit management
  // ---------------------------------------------------------------------------

  async adminManualCredit(
    companyId: string,
    amount: number,
    description: string,
    createdBy: string,
  ): Promise<string> {
    const { data, error } = await supabase.rpc('admin_manual_credit', {
      p_company_id: companyId,
      p_amount: amount,
      p_description: description,
      p_created_by: createdBy,
    });

    if (error) throw error;
    return data as string;
  }

  async adminManualDebit(
    companyId: string,
    amount: number,
    description: string,
    createdBy: string,
  ): Promise<number> {
    const { data, error } = await supabase.rpc('admin_manual_debit', {
      p_company_id: companyId,
      p_amount: amount,
      p_description: description,
      p_created_by: createdBy,
    });

    if (error) throw error;
    return data as number;
  }

  async adminTransferCredits(
    sourceCompanyId: string,
    targetCompanyId: string,
    amount: number,
    description: string,
    createdBy: string,
  ): Promise<string> {
    const { data, error } = await supabase.rpc('admin_transfer_credits', {
      p_source_company_id: sourceCompanyId,
      p_target_company_id: targetCompanyId,
      p_amount: amount,
      p_description: description,
      p_created_by: createdBy,
    });

    if (error) throw error;
    return data as string;
  }

  async searchCompanies(
    query: string,
    excludeId?: string,
  ): Promise<Array<{ id: string; name: string; cnpj: string }>> {
    let q = supabase
      .from('companies')
      .select('id, name, cnpj')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (excludeId) {
      q = q.neq('id', excludeId);
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id as string,
      name: r.name as string,
      cnpj: (r.cnpj as string) ?? '',
    }));
  }
}
