/**
 * Metrics Dashboard
 * PRD-054: Dashboard de métricas agregadas
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PeriodFilter } from './PeriodFilter';
import { CompletionGauge } from './CompletionGauge';
import { ProfileDistributionChart } from './ProfileDistributionChart';
import { DimensionDistributionChart } from './DimensionDistributionChart';
import { TrendsChart } from './TrendsChart';
import { MetricsPerJobTable } from './MetricsPerJobTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyTests, companyTestKeys } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyTestsService } from '@/services/companyTests/companyTestsService';
import type { PeriodFilter as PeriodFilterType, CompanyTestResult, TestInvitation } from '@/types/companyTest';

const trendData = [
  { month: 'Out', testes: 1, conclusao: 80, fitMedio: 65 },
  { month: 'Nov', testes: 2, conclusao: 75, fitMedio: 68 },
  { month: 'Dez', testes: 2, conclusao: 85, fitMedio: 72 },
  { month: 'Jan', testes: 4, conclusao: 60, fitMedio: 70 },
];

export function MetricsDashboard() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id;

  const [period, setPeriod] = useState<PeriodFilterType>('90d');

  const { data: tests, isLoading: loadingTests } = useCompanyTests(companyId);
  const testIds = useMemo(() => (tests ?? []).map(t => t.id), [tests]);

  // Fetch all invitations across company tests (via service layer for proper camelCase conversion)
  const { data: allInvitations, isLoading: loadingInvitations } = useQuery({
    queryKey: [...companyTestKeys.all, 'allInvitationsFull', companyId],
    queryFn: async () => {
      if (testIds.length === 0) return [] as TestInvitation[];
      const service = await getCompanyTestsService();
      const invByTest = await Promise.all(testIds.map(id => service.getInvitations(id)));
      return invByTest.flat();
    },
    enabled: testIds.length > 0,
  });

  // Fetch all results across company tests (with full data for charts)
  const { data: allResults, isLoading: loadingResults } = useQuery({
    queryKey: [...companyTestKeys.all, 'allResultsFull', companyId],
    queryFn: async () => {
      if (testIds.length === 0) return [] as CompanyTestResult[];
      const service = await getCompanyTestsService();
      const resultsByTest = await Promise.all(testIds.map(id => service.getResults(id)));
      return resultsByTest.flat();
    },
    enabled: testIds.length > 0,
  });

  const metrics = useMemo(() => {
    const invitations = allInvitations ?? [];
    const completed = invitations.filter(i => i.status === 'completed').length;
    const abandoned = invitations.filter(i => i.status === 'abandoned').length;
    const total = invitations.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const abandonRate = total > 0 ? Math.round((abandoned / total) * 100) : 0;
    return { completionRate, abandonRate };
  }, [allInvitations]);

  const isLoading = loadingTests || loadingInvitations || loadingResults;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  const resultsList = allResults ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard de Métricas</h2>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CompletionGauge label="Taxa de Conclusão" value={metrics.completionRate} color="#22c55e" />
        <CompletionGauge label="Taxa de Abandono" value={metrics.abandonRate} color="#ef4444" />
        <DimensionDistributionChart results={resultsList} />
        <ProfileDistributionChart results={resultsList} />
      </div>

      {/* Trends */}
      <TrendsChart
        title="Tendências Mensais"
        data={trendData}
        lines={[
          { key: 'testes', label: 'Testes/mês', color: '#0891b2' },
          { key: 'conclusao', label: 'Conclusão %', color: '#22c55e' },
          { key: 'fitMedio', label: 'Fit Médio %', color: '#8b5cf6' },
        ]}
      />

      {/* Per Job */}
      <MetricsPerJobTable
        tests={tests ?? []}
        allInvitations={allInvitations ?? []}
        allResults={resultsList}
      />
    </div>
  );
}
