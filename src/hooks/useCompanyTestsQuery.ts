/**
 * React Query Hooks — Company Tests Hub
 * Queries and mutations for company tests, invitations, results, audit logs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanyTestsService, type CompanyTestFilters, type AuditLogFilters } from '@/services/companyTests/companyTestsService';
import { supabase } from '@/lib/supabase';
import type {
  CompanyTest,
  TestInvitation,
  CompanyTestResult,
  AuditLog,
  CreateInvitationInput,
  EnhancedAuditLogFilters,
  TestMetrics,
  PeriodFilter,
} from '@/types/companyTest';
import { useToast } from '@/hooks/use-toast';

interface DepartmentOption {
  id: string;
  name: string;
}

// ============================================================
// Query Keys
// ============================================================

export const companyTestKeys = {
  all: ['companyTests'] as const,
  lists: () => [...companyTestKeys.all, 'list'] as const,
  list: (companyId: string, filters?: CompanyTestFilters) =>
    [...companyTestKeys.lists(), companyId, filters ?? {}] as const,
  detail: (id: string) => [...companyTestKeys.all, 'detail', id] as const,
  invitations: (testId: string) => [...companyTestKeys.all, 'invitations', testId] as const,
  results: (testId: string) => [...companyTestKeys.all, 'results', testId] as const,
  result: (id: string) => [...companyTestKeys.all, 'result', id] as const,
  candidates: (companyId: string, search?: string) =>
    [...companyTestKeys.all, 'candidates', companyId, search ?? ''] as const,
  stats: (companyId: string) => [...companyTestKeys.all, 'stats', companyId] as const,
  auditLogs: (companyId: string, filters?: AuditLogFilters) =>
    [...companyTestKeys.all, 'auditLogs', companyId, filters ?? {}] as const,
  bySlug: (slug: string) => [...companyTestKeys.all, 'bySlug', slug] as const,
  testMetrics: (companyId: string, period?: PeriodFilter) =>
    [...companyTestKeys.all, 'testMetrics', companyId, period ?? 'all'] as const,
  auditLogsPaginated: (companyId: string, filters?: EnhancedAuditLogFilters) =>
    [...companyTestKeys.all, 'auditLogsPaginated', companyId, filters ?? {}] as const,
};

// ============================================================
// Queries
// ============================================================

export function useCompanyTests(companyId: string | undefined, filters?: CompanyTestFilters) {
  return useQuery({
    queryKey: companyTestKeys.list(companyId ?? '', filters),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getTests(companyId!, filters);
    },
    enabled: !!companyId,
  });
}

export function useCompanyTest(id: string | undefined) {
  return useQuery({
    queryKey: companyTestKeys.detail(id ?? ''),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getTest(id!);
    },
    enabled: !!id,
  });
}

export function useTestInvitations(testId: string | undefined) {
  return useQuery({
    queryKey: companyTestKeys.invitations(testId ?? ''),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getInvitations(testId!);
    },
    enabled: !!testId,
  });
}

export function useTestResults(testId: string | undefined) {
  return useQuery({
    queryKey: companyTestKeys.results(testId ?? ''),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getResults(testId!);
    },
    enabled: !!testId,
  });
}

export function useTestResult(id: string | undefined) {
  return useQuery({
    queryKey: companyTestKeys.result(id ?? ''),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getResult(id!);
    },
    enabled: !!id,
  });
}

export function useCompanyCandidates(companyId: string | undefined, search?: string) {
  return useQuery({
    queryKey: companyTestKeys.candidates(companyId ?? '', search),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getCompanyCandidates(companyId!, search);
    },
    enabled: !!companyId,
  });
}

export function useCompanyTeamMembersForInvite(companyId: string | undefined, search?: string) {
  return useQuery({
    queryKey: [...companyTestKeys.all, 'teamMembers', companyId ?? '', search ?? ''],
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getCompanyTeamMembers(companyId!, search);
    },
    enabled: !!companyId,
  });
}

export function useCompanyTestStats(companyId: string | undefined) {
  return useQuery({
    queryKey: companyTestKeys.stats(companyId ?? ''),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getStats(companyId!);
    },
    enabled: !!companyId,
  });
}

export function useTestAuditLogs(companyId: string | undefined, filters?: AuditLogFilters) {
  return useQuery({
    queryKey: companyTestKeys.auditLogs(companyId ?? '', filters),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getAuditLogs(companyId!, filters);
    },
    enabled: !!companyId,
  });
}

export function useTestBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: companyTestKeys.bySlug(slug ?? ''),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getTestBySlug(slug!);
    },
    enabled: !!slug,
  });
}

/**
 * PRD-081: Fetch departments for a test by slug
 * Resolves slug → test → company_id → departments
 */
export function useDepartmentsByTestSlug(slug: string | undefined) {
  const { data: test } = useTestBySlug(slug);
  const companyId = test?.companyId ?? (test as Record<string, unknown>)?.company_id as string | undefined;

  return useQuery<DepartmentOption[]>({
    queryKey: [...companyTestKeys.all, 'departments', companyId ?? ''],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', companyId!)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as DepartmentOption[];
    },
    enabled: !!companyId,
  });
}

// ============================================================
// Mutations
// ============================================================

export function useCreateCompanyTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<CompanyTest> & { companyId: string; name: string; templateId: string }) => {
      const service = await getCompanyTestsService();
      return service.createTest(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: companyTestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyTestKeys.stats(variables.companyId) });
      toast({ title: 'Teste criado', description: 'O teste foi criado com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar teste', variant: 'destructive' });
    },
  });
}

export function useUpdateCompanyTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CompanyTest> }) => {
      const service = await getCompanyTestsService();
      return service.updateTest(id, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyTestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyTestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyTestKeys.stats(data.companyId) });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar teste', variant: 'destructive' });
    },
  });
}

/** Custom error for insufficient credits — callers can check `error.insufficientCredits` */
export class InsufficientCreditsError extends Error {
  insufficientCredits = true;
  available: number;
  required: number;
  constructor(available: number, required: number) {
    super(`Creditos insuficientes. Disponivel: ${available}, Necessario: ${required}`);
    this.available = available;
    this.required = required;
  }
}

export function useSendTestInvitations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ testId, invitations }: { testId: string; invitations: CreateInvitationInput[] }) => {
      const { data, error } = await supabase.functions.invoke('send-test-invitation', {
        body: { action: 'send_invitations', test_id: testId, invitations },
      });
      // On 400, extract the JSON body — may be in data, error.context, or error.message
      if (error) {
        // Try multiple ways to get the error body
        let body: Record<string, unknown> | null = data as Record<string, unknown> | null;
        if (!body) {
          try {
            const ctx = (error as Record<string, unknown>).context;
            if (ctx && typeof ctx === 'object' && 'json' in ctx && typeof (ctx as Response).json === 'function') {
              body = await (ctx as Response).json();
            } else if (ctx && typeof ctx === 'object') {
              body = ctx as Record<string, unknown>;
            }
          } catch { /* ignore */ }
        }
        if (!body) {
          try { body = JSON.parse(error.message); } catch { /* not JSON */ }
        }
        if (body?.insufficientCredits) {
          throw new InsufficientCreditsError(
            (body.available as number) ?? 0,
            (body.required as number) ?? invitations.length,
          );
        }
        throw new Error((body?.error as string) || error.message);
      }
      if (data?.error) throw new Error(data.error);
      return data.invitations as TestInvitation[];
    },
    onSuccess: (invitations, { testId }) => {
      queryClient.invalidateQueries({ queryKey: companyTestKeys.invitations(testId) });
      toast({
        title: 'Convites enviados',
        description: `${invitations.length} convite${invitations.length > 1 ? 's' : ''} enviado${invitations.length > 1 ? 's' : ''} com sucesso.`,
      });
    },
    onError: (error) => {
      // Don't show generic toast for insufficient credits — caller handles with modal
      if (error instanceof InsufficientCreditsError) return;
      toast({ title: 'Erro ao enviar convites', variant: 'destructive' });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ invitationId, testId }: { invitationId: string; testId: string }) => {
      const { data, error } = await supabase.functions.invoke('send-test-invitation', {
        body: { action: 'resend', invitation_id: invitationId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { invitation: data.invitation as TestInvitation, testId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: companyTestKeys.invitations(result.testId) });
      toast({ title: 'Convite reenviado', description: 'O convite foi reenviado com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro ao reenviar convite', variant: 'destructive' });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ invitationId, testId }: { invitationId: string; testId: string }) => {
      const { data, error } = await supabase.functions.invoke('send-test-invitation', {
        body: { action: 'cancel', invitation_id: invitationId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return testId;
    },
    onSuccess: (testId) => {
      queryClient.invalidateQueries({ queryKey: companyTestKeys.invitations(testId) });
      toast({ title: 'Convite cancelado' });
    },
    onError: () => {
      toast({ title: 'Erro ao cancelar convite', variant: 'destructive' });
    },
  });
}

export function useUpdatePublicLink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ testId, slug, active }: { testId: string; slug: string; active: boolean }) => {
      const service = await getCompanyTestsService();
      return service.updatePublicLink(testId, slug, active);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyTestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: companyTestKeys.lists() });
      const msg = data.publicLinkActive ? 'Link público ativado' : 'Link público desativado';
      toast({ title: msg });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar link público', variant: 'destructive' });
    },
  });
}

export function useUpdateShortlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resultId, shortlisted, notes, testId }: {
      resultId: string; shortlisted: boolean; notes?: string; testId: string;
    }) => {
      const service = await getCompanyTestsService();
      await service.updateShortlist(resultId, shortlisted, notes);
      return { testId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: companyTestKeys.results(result.testId) });
    },
  });
}

export function useAddTestAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
      const service = await getCompanyTestsService();
      await service.addAuditLog(log);
      return log.companyId;
    },
    onSuccess: (companyId) => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyTestKeys.auditLogs(companyId) });
      }
    },
  });
}

// ============================================================
// PRD-089: Enhanced Metrics, Abandonment Detection, Paginated Audit
// ============================================================

function getPeriodDates(period?: PeriodFilter): { from?: string; to?: string } {
  if (!period || period === 'all' || period === 'custom') return {};
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return { from };
}

export function useTestMetrics(companyId: string | undefined, period?: PeriodFilter) {
  return useQuery<TestMetrics>({
    queryKey: companyTestKeys.testMetrics(companyId ?? '', period),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      const { from, to } = getPeriodDates(period);
      return service.getTestMetrics(companyId!, from, to);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useDetectAbandonment(companyId: string | undefined) {
  return useQuery<number>({
    queryKey: [...companyTestKeys.all, 'detectAbandonment', companyId ?? ''],
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.detectAbandonment(companyId!);
    },
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes — only runs once per Hub visit
    refetchOnWindowFocus: false,
  });
}

export function useAuditLogsPaginated(companyId: string | undefined, filters?: EnhancedAuditLogFilters) {
  return useQuery<{ logs: AuditLog[]; total: number }>({
    queryKey: companyTestKeys.auditLogsPaginated(companyId ?? '', filters),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getAuditLogsPaginated(companyId!, filters);
    },
    enabled: !!companyId,
  });
}
