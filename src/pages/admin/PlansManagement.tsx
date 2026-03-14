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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { usePlans } from '@/hooks/usePlans';
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

  const [stripeEnv, setStripeEnv] = useState<StripeEnvironment>('test');
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
            'Configure precos, limites de uso e periodos de trial',
            'Use "Novo Plano" para adicionar um plano',
          ]}
        />

        <AdminTabNav />

        {/* PRD-075: Stripe environment toggle + sync all */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                stripeEnv === 'test' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setStripeEnv('test')}
            >
              Teste
            </button>
            <button
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                stripeEnv === 'live' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setStripeEnv('live')}
            >
              Produção
            </button>
          </div>
          <Badge variant="outline" className={cn('text-xs', stripeEnv === 'live' ? 'text-red-600 border-red-300' : 'text-blue-600 border-blue-300')}>
            Stripe: {stripeEnv === 'test' ? 'Teste' : 'Produção'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="text-xs ml-auto"
            disabled={syncAll.isPending}
            onClick={() => {
              syncAll.mutate(stripeEnv, {
                onSuccess: () => toast.success('Todos os planos sincronizados com Stripe!'),
                onError: () => toast.error('Erro ao sincronizar planos com Stripe'),
              });
            }}
          >
            <RefreshCw className={cn('w-3 h-3 mr-1.5', syncAll.isPending && 'animate-spin')} />
            {syncAll.isPending ? 'Sincronizando...' : 'Sincronizar Todos'}
          </Button>
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
                  onDelete={handleDeleteClick}
                  onClone={handleClone}
                  index={index}
                  stripeEnvironment={stripeEnv}
                />
              ))}
            </div>
          </TabsContent>

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
