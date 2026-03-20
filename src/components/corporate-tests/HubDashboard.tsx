/**
 * Hub Dashboard
 * PRD-052 + PRD-089: Composição: KPIs + funil + créditos + alertas + feed
 */

import { useMemo, useState } from 'react';
import { KPICards } from './KPICards';
import { TestFunnel } from './TestFunnel';
import { AlertsList } from './AlertsList';
import { ActivityFeed } from './ActivityFeed';
import { PeriodFilter } from './PeriodFilter';
import { CreditSummaryCard } from './CreditSummaryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyTests, useCompanyTestStats, useTestAuditLogs, useTestMetrics, useDetectAbandonment } from '@/hooks/useCompanyTestsQuery';
import { useCompanyCreditBalance } from '@/hooks/useTestPackagesQuery';
import { useAuth } from '@/contexts/AuthContext';
import { getActionLabel } from '@/utils/auditLog';
import type { PeriodFilter as PeriodFilterType, HubDashboardKPIs, FunnelData, HubAlert, ActivityItem, AuditAction } from '@/types/companyTest';

/** Map audit log actions to ActivityItem types */
const auditToActivityType: Record<string, ActivityItem['type'] | null> = {
  test_created: 'test_created',
  test_activated: 'test_activated',
  invite_sent: 'invite_sent',
  test_completed: 'test_completed',
  shortlist_added: 'shortlist_added',
  pdf_downloaded: 'report_downloaded',
  excel_downloaded: 'report_downloaded',
  // PRD-089: new events mapped to existing activity types
  invite_viewed: 'invite_sent',
  credit_consumed: 'invite_sent',
  test_started: 'test_completed',
};

export function HubDashboard() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id;

  const [period, setPeriod] = useState<PeriodFilterType>('30d');

  // PRD-089: Detect abandoned invitations on Hub load (fire-and-forget)
  useDetectAbandonment(companyId);

  const { data: statsData, isLoading: loadingStats } = useCompanyTestStats(companyId);
  const { data: tests, isLoading: loadingTests } = useCompanyTests(companyId);
  const { data: auditLogs } = useTestAuditLogs(companyId, { limit: 20 });

  // PRD-089: Enhanced metrics from RPC
  const { data: metricsData } = useTestMetrics(companyId, period);
  // Direct credit balance (authoritative source, same as CreditBadge)
  const { data: creditBalance } = useCompanyCreditBalance(companyId);

  // Build KPIs: prefer enhanced metrics when available, fallback to basic stats
  const kpis = useMemo<HubDashboardKPIs>(() => {
    const base = statsData ?? {
      totalTests: 0, activeTests: 0, pendingInvites: 0,
      completionRate: 0, avgCompletionTime: 0,
      abandonRate: 0, mappedMembers: 0, totalMembers: 0,
      creditsUsed: 0, creditsAvailable: 0, pendingRetests: 0,
    };

    if (metricsData) {
      return {
        ...base,
        pendingInvites: metricsData.pending,
        completionRate: metricsData.completionRate,
        avgCompletionTime: metricsData.avgCompletionHours,
        abandonRate: metricsData.abandonRate,
        mappedMembers: metricsData.mappedMembers,
        totalMembers: metricsData.totalMembers,
        creditsUsed: metricsData.creditsUsed,
        creditsAvailable: creditBalance ?? metricsData.creditsAvailable,
        pendingRetests: metricsData.pendingRetests,
      };
    }

    return base;
  }, [statsData, metricsData, creditBalance]);

  // Build funnel from metrics RPC
  const funnelData = useMemo<FunnelData>(() => {
    if (metricsData) {
      return {
        invited: metricsData.totalInvitations,
        viewed: metricsData.viewed,
        started: metricsData.started + metricsData.completed,
        completed: metricsData.completed,
        analyzed: 0, // Will be enriched later if needed
      };
    }
    return { invited: 0, viewed: 0, started: 0, completed: 0, analyzed: 0 };
  }, [metricsData]);

  // Derive alerts from tests + invitations
  const alerts = useMemo<HubAlert[]>(() => {
    const alertList: HubAlert[] = [];
    const testsList = tests ?? [];

    // Deadline approaching (within 7 days)
    const now = Date.now();
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

    // PRD-089: Pending retests alert
    if (metricsData && metricsData.pendingRetests > 0) {
      alertList.push({
        id: 'alert-pending-retests',
        type: 'deadline_approaching',
        message: `${metricsData.pendingRetests} reteste${metricsData.pendingRetests > 1 ? 's' : ''} pendente${metricsData.pendingRetests > 1 ? 's' : ''}`,
        testId: '',
        testName: '',
        severity: 'warning',
        createdAt: new Date().toISOString(),
      });
    }

    // PRD-089: Abandonment alert
    if (metricsData && metricsData.abandoned > 0) {
      alertList.push({
        id: 'alert-abandoned',
        type: 'abandoned_tests',
        message: `${metricsData.abandoned} teste${metricsData.abandoned > 1 ? 's' : ''} abandonado${metricsData.abandoned > 1 ? 's' : ''}`,
        testId: '',
        testName: '',
        severity: 'error',
        createdAt: new Date().toISOString(),
      });
    }

    return alertList;
  }, [tests, metricsData]);

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
            ? `${log.resourceName} — ${getActionLabel(log.action as AuditAction)}`
            : getActionLabel(log.action as AuditAction),
          timestamp: log.timestamp,
          testId: log.resourceType === 'test' ? log.resourceId : undefined,
          candidateName: ['invitation', 'result', 'assessment', 'team_member'].includes(log.resourceType) ? log.resourceName : undefined,
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
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
        <div className="space-y-6">
          <CreditSummaryCard
            creditsAvailable={kpis.creditsAvailable}
            creditsUsed={kpis.creditsUsed}
          />
          <AlertsList alerts={alerts} />
        </div>
      </div>

      <ActivityFeed activities={activities} />
    </div>
  );
}
