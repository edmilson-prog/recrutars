/**
 * FinancialCategories page
 * Módulo financeiro — CRUD de categorias.
 * NOTE: CRUD completo será implementado na Fase 6 (PR B).
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function FinancialCategories() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Categorias"
          description="Organize receitas e despesas em categorias gerenciáveis."
        />
        <AdminTabNav />
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          CRUD de categorias em construção.
        </div>
      </div>
    </DashboardLayout>
  );
}
