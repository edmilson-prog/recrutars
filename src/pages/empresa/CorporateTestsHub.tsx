/**
 * Corporate Tests Hub - Main Page
 * PRD-052: Dashboard, criação, gestão e convites
 */

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Shield } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  GaugeProOnboardingBanner,
  GaugeProMiniManual,
  HubDashboard,
  TestCreateForm,
  TestList,
  InvitePanel,
} from '@/components/corporate-tests';
import { useCompanyTests } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';

export default function CorporateTestsHub() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  // Sync tab from URL params (deep-link from profile page)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'create', 'tests', 'invites'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const { currentCompany } = useAuth();
  const { data: companyTests = [], isLoading } = useCompanyTests(currentCompany?.id);

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Onboarding Banner */}
        {isLoading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : (
          <GaugeProOnboardingBanner
            hasTests={companyTests.length > 0}
            onNavigateToCreate={() => setActiveTab('create')}
            onNavigateToTests={() => setActiveTab('tests')}
          />
        )}

        {/* Header */}
        <PageHeader
          title="Hub de Testes Comportamentais"
          description="Gerencie testes Gauge-Pro, analise resultados e compare candidatos para decisões mais assertivas no recrutamento."
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/empresa/testes/metricas')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Métricas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/empresa/testes/auditoria')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Auditoria
              </Button>
              <GaugeProMiniManual />
            </>
          }
          howItWorks={[
            'Central de testes comportamentais da empresa',
            'Envie convites de teste para colaboradores',
            'Acompanhe resultados e compare perfis da equipe',
          ]}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="create">Criar Teste</TabsTrigger>
            <TabsTrigger value="tests">Meus Testes</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <HubDashboard />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <TestCreateForm onCreated={() => setActiveTab('tests')} />
          </TabsContent>

          <TabsContent value="tests" className="mt-6">
            <TestList />
          </TabsContent>

          <TabsContent value="invites" className="mt-6">
            <InvitePanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
