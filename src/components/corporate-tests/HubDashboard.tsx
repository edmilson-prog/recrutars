/**
 * Hub Dashboard
 * PRD-052: Composição: KPIs + funil + alertas + feed
 */

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { KPICards } from './KPICards';
import { TestFunnel } from './TestFunnel';
import { AlertsList } from './AlertsList';
import { ActivityFeed } from './ActivityFeed';
import { PeriodFilter } from './PeriodFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyTests, useCompanyTestStats, useTestAuditLogs, companyTestKeys } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { PeriodFilter as PeriodFilterType, HubDashboardKPIs, FunnelData, HubAlert, ActivityItem } from '@/types/companyTest';

/** Map audit log actions to ActivityItem types (only supported types) */
const auditToActivityType: Record<string, ActivityItem['type'] | null> = {
  test_created: 'test_created',
  test_activated: 'test_activated',
  invite_sent: 'invite_sent',
  shortlist_added: 'shortlist_added',
  pdf_downloaded: 'report_downloaded',
  excel_downloaded: 'report_downloaded',
};

export function HubDashboard() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id;

  const [period, setPeriod] = useState<PeriodFilterType>('30d');

  const { data: statsData, isLoading: loadingStats } = useCompanyTestStats(companyId);
  const { data: tests, isLoading: loadingTests } = useCompanyTests(companyId);
  const { data: auditLogs, isLoading: loadingAudit } = useTestAuditLogs(companyId);

  // Fetch all invitations and results across company tests for funnel + alerts
  const testIds = useMemo(() => (tests ?? []).map(t => t.id), [tests]);

  const { data: allInvitations } = useQuery({
    queryKey: [...companyTestKeys.all, 'allInvitations', companyId],
    queryFn: async () => {
      if (testIds.length === 0) return [];
      const { data, error } = await supabase
        .from('test_invitations')
        .select('id, test_id, status, candidate_name, sent_at, expires_at')
        .in('test_id', testIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: testIds.length > 0,
  });

  const { data: allResults } = useQuery({
    queryKey: [...companyTestKeys.all, 'allResults', companyId],
    queryFn: async () => {
      if (testIds.length === 0) return [];
      const { data, error } = await supabase
        .from('test_results')
        .select('id, test_id, shortlisted')
        .in('test_id', testIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: testIds.length > 0,
  });

  const kpis = useMemo<HubDashboardKPIs>(() => {
    if (statsData) return statsData;
    return { totalTests: 0, activeTests: 0, pendingInvites: 0, completionRate: 0, avgCompletionTime: 0 };
  }, [statsData]);

  const funnelData = useMemo<FunnelData>(() => {
    const invitations = allInvitations ?? [];
    const results = allResults ?? [];
    return {
      invited: invitations.length,
      started: invitations.filter(i => ['started', 'completed'].includes(i.status)).length,
      completed: invitations.filter(i => i.status === 'completed').length,
      analyzed: results.filter(r => r.shortlisted !== undefined && r.shortlisted !== null).length,
    };
  }, [allInvitations, allResults]);

  // Derive alerts from real data
  const alerts = useMemo<HubAlert[]>(() => {
    const alertList: HubAlert[] = [];
    const now = Date.now();
    const invitations = allInvitations ?? [];
    const testsList = tests ?? [];

    // Expired invitations per test
    const testMap = new Map(testsList.map(t => [t.id, t]));
    const expiredByTest = new Map<string, number>();
    invitations.forEach(inv => {
      if (inv.status === 'expired') {
        expiredByTest.set(inv.test_id, (expiredByTest.get(inv.test_id) ?? 0) + 1);
      }
    });
    expiredByTest.forEach((count, testId) => {
      const test = testMap.get(testId);
      if (test) {
        alertList.push({
          id: `alert-expired-${testId}`,
          type: 'expired_invites',
          message: `${count} convite${count > 1 ? 's' : ''} expirado${count > 1 ? 's' : ''} no teste "${test.name}"`,
          testId,
          testName: test.name,
          severity: 'warning',
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Abandoned tests
    invitations.forEach(inv => {
      if (inv.status === 'abandoned') {
        const test = testMap.get(inv.test_id);
        if (test) {
          alertList.push({
            id: `alert-abandoned-${inv.id}`,
            type: 'abandoned_tests',
            message: `${inv.candidate_name ?? 'Candidato'} abandonou o teste "${test.name}"`,
            testId: inv.test_id,
            testName: test.name,
            severity: 'error',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    // Deadline approaching (within 7 days)
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    testsList.forEach(test => {
      if (test.status === 'active' && test.deadline) {
        const deadlineMs = new Date(test.deadline).getTime();
        if (deadlineMs > now && deadlineMs - now <= sevenDays) {
          const daysLeft = Math.ceil((deadlineMs - now) / (24 * 60 * 60 * 1000));
          alertList.push({
            id: `alert-deadline-${test.id}`,
            type: 'deadline_approaching',
            message: `Prazo do teste "${test.name}" expira em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`,
            testId: test.id,
            testName: test.name,
            severity: 'info',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    // Tests with no candidates (draft or active with 0 invitations)
    testsList.forEach(test => {
      if (['draft', 'active'].includes(test.status)) {
        const hasInvitations = invitations.some(inv => inv.test_id === test.id);
        if (!hasInvitations) {
          alertList.push({
            id: `alert-nocand-${test.id}`,
            type: 'no_candidates',
            message: `Teste "${test.name}" ainda não possui candidatos`,
            testId: test.id,
            testName: test.name,
            severity: 'info',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    return alertList;
  }, [tests, allInvitations]);

  // Convert audit logs to activity feed items
  const activities = useMemo<ActivityItem[]>(() => {
    const logs = auditLogs ?? [];
    return logs
      .map(log => {
        const activityType = auditToActivityType[log.action] ?? null;
        if (!activityType) return null;
        return {
          id: log.id,
          type: activityType,
          message: log.resourceName
            ? `${log.resourceName} — ${log.details ?? log.action.replace(/_/g, ' ')}`
            : log.details ?? log.action.replace(/_/g, ' '),
          timestamp: log.timestamp,
          testId: log.resourceType === 'test' ? log.resourceId : undefined,
          candidateName: ['invitation', 'result'].includes(log.resourceType) ? log.resourceName : undefined,
        } satisfies ActivityItem;
      })
      .filter((item): item is ActivityItem => item !== null);
  }, [auditLogs]);

  const isLoading = loadingStats || loadingTests;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Visão Geral</h2>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <KPICards kpis={kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TestFunnel data={funnelData} />
        <AlertsList alerts={alerts} />
      </div>

      <ActivityFeed activities={activities} />
    </div>
  );
}
