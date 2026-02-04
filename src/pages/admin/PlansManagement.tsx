/**
 * PlansManagement Page
 * PRD-060: Admin plans CRUD management page
 */

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanCard } from '@/components/admin/plans/PlanCard';
import { PlanEditor } from '@/components/admin/plans/PlanEditor';
import { usePlans } from '@/hooks/usePlans';
import { toast } from 'sonner';
import type { Plan } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function PlansManagement() {
  const { candidatePlans, companyPlans, updatePlan, togglePlanStatus } = usePlans();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingPlan(null);
  };

  const handleSave = (id: string, updates: Partial<Plan>) => {
    updatePlan(id, updates);
    toast.success('Plano atualizado com sucesso!');
  };

  const handleToggleStatus = (id: string) => {
    togglePlanStatus(id);
    toast.success('Status do plano alterado.');
  };

  return (
    <DashboardLayout userType="admin">
      <AdminTabNav />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-cyan-600" />
            Gestao de Planos
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure planos de assinatura para candidatos e empresas
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="candidato" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="candidato">Candidato</TabsTrigger>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
          </TabsList>

          <TabsContent value="candidato" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatePlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  index={index}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="empresa" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyPlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  index={index}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Plan Editor Dialog */}
        <PlanEditor
          plan={editingPlan}
          open={editorOpen}
          onClose={handleCloseEditor}
          onSave={handleSave}
        />
      </div>
    </DashboardLayout>
  );
}
