/**
 * FluxoCaixaDashboard page (Visão Geral do Fluxo de Caixa)
 * Módulo financeiro — lançamentos manuais (cash flow).
 * NOTE: Conteúdo de KPIs/gráficos será implementado na Fase 5 (PR B).
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function FluxoCaixaDashboard() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Fluxo de Caixa"
          description="Consolide receitas e despesas avulsas com as assinaturas da plataforma."
        />
        <AdminTabNav />
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Dashboard de fluxo de caixa em construção.
        </div>
      </div>
    </DashboardLayout>
  );
}
