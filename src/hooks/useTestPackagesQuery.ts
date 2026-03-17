/**
 * Test Packages Query Hooks
 * React Query integration for Test Packages module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTestPackagesService } from '@/services/testPackages/testPackagesService';
import type { TestPackage } from '@/types/testPackages';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const testPackageKeys = {
  all: ['test-packages'] as const,
  lists: () => [...testPackageKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...testPackageKeys.lists(), filters] as const,
  details: () => [...testPackageKeys.all, 'detail'] as const,
  detail: (id: string) => [...testPackageKeys.details(), id] as const,
  credits: (companyId: string) => [...testPackageKeys.all, 'credits', companyId] as const,
  balance: (companyId: string) => [...testPackageKeys.all, 'balance', companyId] as const,
  transactions: (companyId: string) => [...testPackageKeys.all, 'transactions', companyId] as const,
};

// ---------------------------------------------------------------------------
// Packages (read)
// ---------------------------------------------------------------------------

/** Active packages only (public/company view). */
export function useTestPackages(type?: string) {
  return useQuery({
    queryKey: testPackageKeys.list({ type }),
    queryFn: async () => {
      const svc = await getTestPackagesService();
      return svc.getPackages(type);
    },
  });
}

/** All packages including inactive (admin). */
export function useAllTestPackages() {
  return useQuery({
    queryKey: testPackageKeys.list({ all: true }),
    queryFn: async () => {
      const svc = await getTestPackagesService();
      return svc.getAllPackages();
    },
  });
}

/** Single package by ID. */
export function useTestPackage(id: string | undefined) {
  return useQuery({
    queryKey: testPackageKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const svc = await getTestPackagesService();
      return svc.getPackage(id);
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Packages (mutations)
// ---------------------------------------------------------------------------

export function useCreateTestPackage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const svc = await getTestPackagesService();
      return svc.createPackage(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: testPackageKeys.all });
    },
  });
}

export function useUpdateTestPackage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const svc = await getTestPackagesService();
      return svc.updatePackage(id, updates);
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: testPackageKeys.all });
      qc.invalidateQueries({ queryKey: testPackageKeys.detail(id) });
    },
  });
}

export function useDeleteTestPackage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getTestPackagesService();
      return svc.deletePackage(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: testPackageKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Credits (company)
// ---------------------------------------------------------------------------

/** Total remaining credits for a company. */
export function useCompanyCreditBalance(companyId: string | undefined) {
  return useQuery({
    queryKey: testPackageKeys.balance(companyId ?? ''),
    queryFn: async () => {
      if (!companyId) return 0;
      const svc = await getTestPackagesService();
      return svc.getCompanyCreditBalance(companyId);
    },
    enabled: !!companyId,
  });
}

/** List of credit purchases for a company. */
export function useCompanyCredits(companyId: string | undefined) {
  return useQuery({
    queryKey: testPackageKeys.credits(companyId ?? ''),
    queryFn: async () => {
      if (!companyId) return [];
      const svc = await getTestPackagesService();
      return svc.getCompanyCredits(companyId);
    },
    enabled: !!companyId,
  });
}

/** Transaction history for a company. */
export function useCreditTransactions(companyId: string | undefined) {
  return useQuery({
    queryKey: testPackageKeys.transactions(companyId ?? ''),
    queryFn: async () => {
      if (!companyId) return [];
      const svc = await getTestPackagesService();
      return svc.getTransactions(companyId);
    },
    enabled: !!companyId,
  });
}

/** Boolean check: does the company have credits? */
export function useHasAvailableCredits(companyId: string | undefined, amount = 1) {
  const { data: balance } = useCompanyCreditBalance(companyId);
  return (balance ?? 0) >= amount;
}

// ---------------------------------------------------------------------------
// Credit mutations
// ---------------------------------------------------------------------------

export function useConsumeCredit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      invitationId,
      description,
      createdBy,
    }: {
      companyId: string;
      invitationId: string;
      description: string;
      createdBy: string;
    }) => {
      const svc = await getTestPackagesService();
      return svc.consumeCredit(companyId, invitationId, description, createdBy);
    },
    onSuccess: (_data, { companyId }) => {
      qc.invalidateQueries({ queryKey: testPackageKeys.balance(companyId) });
      qc.invalidateQueries({ queryKey: testPackageKeys.credits(companyId) });
      qc.invalidateQueries({ queryKey: testPackageKeys.transactions(companyId) });
    },
  });
}

export function useRefundCredit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      invitationId,
      description,
    }: {
      companyId: string;
      invitationId: string;
      description: string;
    }) => {
      const svc = await getTestPackagesService();
      return svc.refundCredit(companyId, invitationId, description);
    },
    onSuccess: (_data, { companyId }) => {
      qc.invalidateQueries({ queryKey: testPackageKeys.balance(companyId) });
      qc.invalidateQueries({ queryKey: testPackageKeys.credits(companyId) });
      qc.invalidateQueries({ queryKey: testPackageKeys.transactions(companyId) });
    },
  });
}
