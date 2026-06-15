/**
 * PackagesManagement Page
 * Admin test packages CRUD management page.
 * Follows PlansManagement.tsx pattern.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Package } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { Skeleton } from '@/components/ui/skeleton';
import { PackageCard } from '@/components/admin/packages/PackageCard';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import {
  useAllTestPackages,
  useUpdateTestPackage,
  useDeleteTestPackage,
} from '@/hooks/useTestPackagesQuery';
import { getStripeService } from '@/services/stripe/stripeService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { TestPackage } from '@/types/testPackages';
import type { StripeEnvironment } from '@/types/plans';
import { StripeEnvironmentSelector } from '@/components/admin/stripe/StripeEnvironmentSelector';
import { StripeEnvironmentBanner } from '@/components/admin/stripe/StripeEnvironmentBanner';
import { STRIPE_ENV_LABELS } from '@/components/admin/stripe/stripeEnvironmentLabels';

export default function PackagesManagement() {
  const navigate = useNavigate();
  const { data: packages, isLoading } = useAllTestPackages();
  const updatePackageMutation = useUpdateTestPackage();
  const deletePackageMutation = useDeleteTestPackage();

  const [stripeEnv, setStripeEnv] = useState<StripeEnvironment>('live');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingPackageId, setSyncingPackageId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState<TestPackage | null>(null);

  const handleNewPackage = () => navigate('/admin/pacotes/novo');

  const handleEdit = (pkg: TestPackage) => navigate(`/admin/pacotes/${pkg.id}`);

  const handleClone = (pkg: TestPackage) => navigate(`/admin/pacotes/novo?clone=${pkg.id}`);

  const handleToggleActive = async (pkg: TestPackage) => {
    const currentActive = pkg.isActive ?? (pkg as unknown as Record<string, unknown>).is_active ?? true;
    const newStatus = !currentActive;
    try {
      await updatePackageMutation.mutateAsync({ id: pkg.id, updates: { is_active: newStatus } });
      toast.success(newStatus ? 'Pacote ativado.' : 'Pacote desativado.');
    } catch {
      toast.error('Erro ao alterar status do pacote.');
    }
  };

  const handleDeleteClick = (pkg: TestPackage) => {
    setDeletingPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;
    try {
      await deletePackageMutation.mutateAsync(deletingPackage.id);
      toast.success(`Pacote "${deletingPackage.name}" excluído.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir pacote.');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingPackage(null);
    }
  };

  const handleSyncPackage = async (pkg: TestPackage) => {
    setSyncingPackageId(pkg.id);
    try {
      const svc = await getStripeService();
      const result = await svc.syncPackage(pkg.id, stripeEnv);
      if (result.success) {
        toast.success(`Pacote "${pkg.name}" sincronizado com Stripe!`);
      } else {
        toast.error(result.error ?? 'Erro ao sincronizar pacote.');
      }
    } catch {
      toast.error('Erro ao sincronizar pacote com Stripe.');
    } finally {
      setSyncingPackageId(null);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const svc = await getStripeService();
      const allPkgs = packages ?? [];
      let successCount = 0;
      let errorCount = 0;
      for (const pkg of allPkgs) {
        try {
          const result = await svc.syncPackage(pkg.id, stripeEnv);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }
      if (errorCount === 0) {
        toast.success(`Todos os ${successCount} pacotes sincronizados com Stripe!`);
      } else {
        toast.warning(`${successCount} sincronizados, ${errorCount} com erro.`);
      }
    } catch {
      toast.error('Erro ao sincronizar pacotes com Stripe.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const packageCount = packages?.length ?? 0;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Pacotes de Créditos · Gauge-Pro"
          description="Créditos avulsos de testes Gauge-Pro. Configure preços, recursos e sincronização com o Stripe."
          actions={
            <Button onClick={handleNewPackage} className="bg-cyan-600 hover:bg-cyan-700 shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pacote
            </Button>
          }
          howItWorks={[
            'Crie e gerencie pacotes de créditos de testes',
            'Configure preços, quantidades e recursos incluídos',
            'Use "Novo Pacote" para adicionar um pacote',
          ]}
        />

        <AdminTabNav />

        {/* Stripe environment controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {packageCount} {packageCount === 1 ? 'pacote' : 'pacotes'}
            </Badge>
            <div className="ml-auto flex items-end gap-3">
              <StripeEnvironmentSelector value={stripeEnv} onChange={setStripeEnv} />
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isSyncingAll}
                onClick={handleSyncAll}
              >
                <RefreshCw className={cn('mr-1.5 h-3 w-3', isSyncingAll && 'animate-spin')} />
                {isSyncingAll
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

        {/* Loading state */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl shadow-soft overflow-hidden">
                <Skeleton className="h-1.5 w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && packageCount === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Package className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">Nenhum pacote cadastrado.</p>
            <Button onClick={handleNewPackage} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Pacote
            </Button>
          </div>
        )}

        {/* Packages grid */}
        {!isLoading && packageCount > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(packages ?? []).map((pkg, index) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onEdit={() => handleEdit(pkg)}
                onClone={() => handleClone(pkg)}
                onToggleActive={() => handleToggleActive(pkg)}
                onDelete={() => handleDeleteClick(pkg)}
                onSync={() => handleSyncPackage(pkg)}
                isSyncing={syncingPackageId === pkg.id}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Pacote</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o pacote{' '}
                <strong>&quot;{deletingPackage?.name}&quot;</strong> ({deletingPackage?.slug})?
                Esta ação não pode ser desfeita. Pacotes com compras ativas não podem ser excluídos.
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
                disabled={deletePackageMutation.isPending}
              >
                {deletePackageMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
