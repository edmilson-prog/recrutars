/**
 * Corporate Test Metrics Page
 * PRD-054: Dashboard de métricas agregadas
 */

import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MetricsDashboard } from '@/components/corporate-tests';

export default function CorporateTestMetrics() {
  const navigate = useNavigate();

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/empresa/testes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Hub
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Métricas Agregadas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão consolidada de todos os testes comportamentais
          </p>
        </div>

        <MetricsDashboard />
      </div>
    </DashboardLayout>
  );
}
