/**
 * Corporate Tests Hub - Main Page
 * PRD-052: Dashboard, criação, gestão e convites
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  HubDashboard,
  TestCreateForm,
  TestList,
  InvitePanel,
} from '@/components/corporate-tests';

export default function CorporateTestsHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hub de Testes Comportamentais
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie testes Gauge-Pro, analise resultados e compare candidatos
            </p>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>

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
