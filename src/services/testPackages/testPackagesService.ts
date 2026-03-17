/**
 * Test Packages Service — Interface
 * Sistema de pacotes de testes avulsos
 *
 * Manages test packages catalog, credits, and transactions.
 */

import type {
  TestPackage,
  TestCredit,
  TestCreditTransaction,
} from '@/types/testPackages';

export interface ITestPackagesService {
  // Packages CRUD (admin)
  /** List active packages, optionally filtered by type. */
  getPackages(type?: string): Promise<TestPackage[]>;

  /** List ALL packages including inactive (admin only). */
  getAllPackages(): Promise<TestPackage[]>;

  /** Get a single package by ID. */
  getPackage(id: string): Promise<TestPackage | null>;

  /** Create a new package. */
  createPackage(data: Record<string, unknown>): Promise<TestPackage>;

  /** Update a package's fields (snake_case keys). */
  updatePackage(id: string, data: Record<string, unknown>): Promise<TestPackage>;

  /** Delete a package by ID. */
  deletePackage(id: string): Promise<void>;

  // Credits (company)
  /** Get total remaining credits for a company. */
  getCompanyCreditBalance(companyId: string): Promise<number>;

  /** List all credit purchases for a company. */
  getCompanyCredits(companyId: string): Promise<TestCredit[]>;

  /** List all credit transactions for a company. */
  getTransactions(companyId: string): Promise<TestCreditTransaction[]>;

  /** Check if company has at least `amount` credits available. */
  hasAvailableCredits(companyId: string, amount?: number): Promise<boolean>;

  /** Consume 1 credit for an invitation. Returns credit_id or null. */
  consumeCredit(
    companyId: string,
    invitationId: string,
    description: string,
    createdBy: string,
  ): Promise<string | null>;

  /** Refund 1 credit for an expired/cancelled invitation. */
  refundCredit(
    companyId: string,
    invitationId: string,
    description: string,
  ): Promise<boolean>;

  // Admin credit management
  /** Admin: Add N credits manually to a company. Returns credit_id. */
  adminManualCredit(
    companyId: string,
    amount: number,
    description: string,
    createdBy: string,
  ): Promise<string>;

  /** Admin: Remove N credits from a company (FIFO). Returns total debited. */
  adminManualDebit(
    companyId: string,
    amount: number,
    description: string,
    createdBy: string,
  ): Promise<number>;

  /** Admin: Transfer N credits between companies. Returns transfer_id. */
  adminTransferCredits(
    sourceCompanyId: string,
    targetCompanyId: string,
    amount: number,
    description: string,
    createdBy: string,
  ): Promise<string>;

  /** Search companies by name for admin transfer autocomplete. */
  searchCompanies(
    query: string,
    excludeId?: string,
  ): Promise<Array<{ id: string; name: string; cnpj: string }>>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: ITestPackagesService | null = null;

export async function getTestPackagesService(): Promise<ITestPackagesService> {
  if (_instance) return _instance;

  const { SupabaseTestPackagesService } = await import('./testPackagesService.supabase');
  _instance = new SupabaseTestPackagesService();
  return _instance;
}
