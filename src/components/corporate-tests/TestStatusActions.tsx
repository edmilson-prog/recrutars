/**
 * Test Status Actions
 * PRD-052: Ações por status (ativar, encerrar, etc.)
 */

import { Button } from '@/components/ui/button';
import { Play, Square, Archive, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateCompanyTest, useAddTestAuditLog } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';
import type { CompanyTest, CompanyTestStatus } from '@/types/companyTest';

interface TestStatusActionsProps {
  test: CompanyTest;
  onStatusChange: (newStatus: CompanyTestStatus) => void;
  onDuplicate?: () => void;
}

export function TestStatusActions({ test, onStatusChange, onDuplicate }: TestStatusActionsProps) {
  const { toast } = useToast();
  const { currentCompany, user } = useAuth();
  const updateTest = useUpdateCompanyTest();
  const addAuditLogMutation = useAddTestAuditLog();

  const logAudit = (action: Parameters<typeof addAuditLogMutation.mutate>[0]['action']) => {
    addAuditLogMutation.mutate({
      action,
      userId: user?.id ?? '',
      userName: user?.user_metadata?.full_name ?? '',
      resourceType: 'test',
      resourceId: test.id,
      resourceName: test.name,
      companyId: currentCompany?.id ?? '',
    });
  };

  const handleActivate = async () => {
    try {
      await updateTest.mutateAsync({ id: test.id, updates: { status: 'active', activatedAt: new Date().toISOString() } });
      logAudit('test_activated');
      onStatusChange('active');
      toast({ title: 'Teste ativado', description: `"${test.name}" está agora ativo.` });
    } catch {
      // Error toast handled by mutation
    }
  };

  const handleClose = async () => {
    try {
      await updateTest.mutateAsync({ id: test.id, updates: { status: 'closed', closedAt: new Date().toISOString() } });
      logAudit('test_closed');
      onStatusChange('closed');
      toast({ title: 'Teste encerrado', description: `"${test.name}" foi encerrado.` });
    } catch {
      // Error toast handled by mutation
    }
  };

  const handleArchive = async () => {
    try {
      await updateTest.mutateAsync({ id: test.id, updates: { status: 'archived', archivedAt: new Date().toISOString() } });
      logAudit('test_archived');
      onStatusChange('archived');
      toast({ title: 'Teste arquivado', description: `"${test.name}" foi arquivado.` });
    } catch {
      // Error toast handled by mutation
    }
  };

  const handleDuplicate = () => {
    logAudit('test_duplicated');
    toast({ title: 'Teste duplicado', description: `Cópia de "${test.name}" criada como rascunho.` });
    onDuplicate?.();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {test.status === 'draft' && (
        <Button size="sm" onClick={handleActivate} disabled={updateTest.isPending}>
          {updateTest.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
          Ativar
        </Button>
      )}
      {test.status === 'active' && (
        <Button size="sm" variant="outline" onClick={handleClose} disabled={updateTest.isPending}>
          {updateTest.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Square className="h-4 w-4 mr-1" />}
          Encerrar
        </Button>
      )}
      {test.status === 'closed' && (
        <Button size="sm" variant="outline" onClick={handleArchive} disabled={updateTest.isPending}>
          {updateTest.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Archive className="h-4 w-4 mr-1" />}
          Arquivar
        </Button>
      )}
      {test.status !== 'archived' && (
        <Button size="sm" variant="ghost" onClick={handleDuplicate}>
          <Copy className="h-4 w-4 mr-1" />
          Duplicar
        </Button>
      )}
    </div>
  );
}
