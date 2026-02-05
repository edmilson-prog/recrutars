/**
 * Metrics Dashboard
 * PRD-054: Dashboard de métricas agregadas
 */

import { useState, useMemo } from 'react';
import { PeriodFilter } from './PeriodFilter';
import { CompletionGauge } from './CompletionGauge';
import { ProfileDistributionChart } from './ProfileDistributionChart';
import { DimensionDistributionChart } from './DimensionDistributionChart';
import { TrendsChart } from './TrendsChart';
import { MetricsPerJobTable } from './MetricsPerJobTable';
// TODO: PRD-072 — migrate to service layer
import { mockTestInvitations, mockTestResults } from '@/data/companyTestData';
import type { PeriodFilter as PeriodFilterType } from '@/types/companyTest';

const trendData = [
  { month: 'Out', testes: 1, conclusao: 80, fitMedio: 65 },
  { month: 'Nov', testes: 2, conclusao: 75, fitMedio: 68 },
  { month: 'Dez', testes: 2, conclusao: 85, fitMedio: 72 },
  { month: 'Jan', testes: 4, conclusao: 60, fitMedio: 70 },
];

export function MetricsDashboard() {
  const [period, setPeriod] = useState<PeriodFilterType>('90d');

  const metrics = useMemo(() => {
    const invitations = mockTestInvitations;
    const completed = invitations.filter(i => i.status === 'completed').length;
    const abandoned = invitations.filter(i => i.status === 'abandoned').length;
    const total = invitations.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const abandonRate = total > 0 ? Math.round((abandoned / total) * 100) : 0;
    return { completionRate, abandonRate };
  }, []);

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
        <DimensionDistributionChart results={mockTestResults} />
        <ProfileDistributionChart results={mockTestResults} />
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
      <MetricsPerJobTable />
    </div>
  );
}
