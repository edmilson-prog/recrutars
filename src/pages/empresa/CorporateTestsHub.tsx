/**
 * Corporate Tests Hub - Main Page
 * PRD-052: Dashboard, criação, gestão e convites
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Hub de Testes Comportamentais</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gerencie testes Gauge-Pro, analise resultados e compare candidatos para decisões mais assertivas no recrutamento.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
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
            </div>
          </div>
        </motion.div>

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
