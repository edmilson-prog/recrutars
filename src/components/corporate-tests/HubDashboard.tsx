/**
 * Hub Dashboard
 * PRD-052: Composição: KPIs + funil + alertas + feed
 */

import { useMemo, useState } from 'react';
import { KPICards } from './KPICards';
import { TestFunnel } from './TestFunnel';
import { AlertsList } from './AlertsList';
import { ActivityFeed } from './ActivityFeed';
import { PeriodFilter } from './PeriodFilter';
import { mockCompanyTests, mockTestInvitations, mockTestResults, mockHubAlerts, mockActivityFeed } from '@/data/companyTestData';
import type { PeriodFilter as PeriodFilterType, HubDashboardKPIs, FunnelData } from '@/types/companyTest';

export function HubDashboard() {
  const [period, setPeriod] = useState<PeriodFilterType>('30d');

  const kpis = useMemo<HubDashboardKPIs>(() => {
    const tests = mockCompanyTests;
    const invitations = mockTestInvitations;
    const completed = invitations.filter(i => i.status === 'completed').length;
    const total = invitations.length;

    return {
      totalTests: tests.length,
      activeTests: tests.filter(t => t.status === 'active').length,
      pendingInvites: invitations.filter(i => i.status === 'sent' || i.status === 'viewed').length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgCompletionTime: 2.3,
    };
  }, []);

  const funnelData = useMemo<FunnelData>(() => {
    const invitations = mockTestInvitations;
    return {
      invited: invitations.length,
      started: invitations.filter(i => ['started', 'completed'].includes(i.status)).length,
      completed: invitations.filter(i => i.status === 'completed').length,
      analyzed: mockTestResults.filter(r => r.shortlisted !== undefined).length,
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Visão Geral</h2>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <KPICards kpis={kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TestFunnel data={funnelData} />
        <AlertsList alerts={mockHubAlerts} />
      </div>

      <ActivityFeed activities={mockActivityFeed} />
    </div>
  );
}
