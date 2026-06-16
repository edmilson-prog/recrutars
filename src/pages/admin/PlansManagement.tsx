/**
 * PlansManagement Page
 * PRD-060: Admin plans CRUD management page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StripeEnvironmentSelector } from '@/components/admin/stripe/StripeEnvironmentSelector';
import { StripeEnvironmentBanner } from '@/components/admin/stripe/StripeEnvironmentBanner';
import { STRIPE_ENV_LABELS } from '@/components/admin/stripe/stripeEnvironmentLabels';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlanCard } from '@/components/admin/plans/PlanCard';
import { useAllPlansAdmin as usePlans } from '@/hooks/usePlans';
import { useUpdatePlan, useDeletePlan } from '@/hooks/usePlansQuery';
import { useSyncAllPlans } from '@/hooks/useStripeQuery';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Plan, StripeEnvironment } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function PlansManagement() {
  const navigate = useNavigate();
  const { candidatePlans, companyPlans } = usePlans();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  const [stripeEnv, setStripeEnv] = useState<StripeEnvironment>('live');
  const syncAll = useSyncAllPlans();

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

  const handleNewPlan = () => navigate('/admin/planos/novo');

  const handleEdit = (plan: Plan) => navigate(`/admin/planos/${plan.id}`);

  const handleClone = (plan: Plan) => navigate(`/admin/planos/novo?clone=${plan.id}`);

  const handleToggleStatus = async (id: string) => {
    const plan = [...candidatePlans, ...companyPlans].find(p => p.id === id);
    if (!plan) return;
    const currentActive = (plan as unknown as Record<string, unknown>).isActive ?? (plan as unknown as Record<string, unknown>).is_active ?? true;
    const newStatus = !currentActive;
    try {
      await updatePlanMutation.mutateAsync({ id, updates: { is_active: newStatus } });
      toast.success(newStatus ? 'Plano ativado.' : 'Plano desativado.');
    } catch {
      toast.error('Erro ao alterar status do plano.');
    }
  };

  const handleDeleteClick = (plan: Plan) => {
    setDeletingPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    try {
      await deletePlanMutation.mutateAsync(deletingPlan.id);
      toast.success(`Plano "${deletingPlan.name}" excluído.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir plano.');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingPlan(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Planos"
          description="Configure planos de assinatura para candidatos e empresas. Gerencie preços, recursos e sincronização com Stripe."
          actions={
            <Button onClick={handleNewPlan} className="bg-cyan-600 hover:bg-cyan-700 shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          }
          howItWorks={[
            'Crie e gerencie os planos da plataforma',
            'Configure preços, limites de uso e períodos de trial',
            'Use "Novo Plano" para adicionar um plano',
          ]}
        />

        <AdminTabNav />

        {/* Stripe environment controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="ml-auto flex items-end gap-3">
              <StripeEnvironmentSelector value={stripeEnv} onChange={setStripeEnv} />
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={syncAll.isPending}
                onClick={() => {
                  syncAll.mutate(stripeEnv, {
                    onSuccess: () => toast.success('Todos os planos sincronizados com Stripe!'),
                    onError: () => toast.error('Erro ao sincronizar planos com Stripe'),
                  });
                }}
              >
                <RefreshCw className={cn('mr-1.5 h-3 w-3', syncAll.isPending && 'animate-spin')} />
                {syncAll.isPending
                  ? 'Sincronizando...'
                  : `Sincronizar todos · ${STRIPE_ENV_LABELS[stripeEnv]}`}
              </Button>
            </div>
          </div>
          <StripeEnvironmentBanner
            environment={stripeEnv}
            onSwitchToProduction={() => setStripeEnv('live')}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="empresa" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="candidato">Candidato</TabsTrigger>
          </TabsList>

          <TabsContent value="empresa" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {companyPlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteClick}
                  onClone={handleClone}
                  index={index}
                  stripeEnvironment={stripeEnv}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="candidato" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatePlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteClick}
                  onClone={handleClone}
                  index={index}
                  stripeEnvironment={stripeEnv}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Plano</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o plano{' '}
                <strong>&quot;{deletingPlan?.name}&quot;</strong> ({deletingPlan?.slug})?
                Esta ação não pode ser desfeita. Planos com assinaturas ativas não podem ser excluídos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDelete();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deletePlanMutation.isPending}
              >
                {deletePlanMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
