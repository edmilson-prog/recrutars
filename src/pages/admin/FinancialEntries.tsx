/**
 * FinancialEntries page (lista de lançamentos)
 * NOTE: Stub inicial — a Task 3.9 reescreve com KPIs, filtros e as views
 * Tabela e Fluxo. Serve para o import de rota compilar já nesta task.
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function FinancialEntries() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Lançamentos"
          description="Receitas e despesas avulsas, contas a pagar e a receber."
        />
        <AdminTabNav />
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Lista de lançamentos em construção.
        </div>
      </div>
    </DashboardLayout>
  );
}
