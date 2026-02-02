/**
 * Test Status Actions
 * PRD-052: Ações por status (ativar, encerrar, etc.)
 */

import { Button } from '@/components/ui/button';
import { Play, Square, Archive, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog } from '@/utils/auditLog';
import type { CompanyTest, CompanyTestStatus } from '@/types/companyTest';

interface TestStatusActionsProps {
  test: CompanyTest;
  onStatusChange: (newStatus: CompanyTestStatus) => void;
  onDuplicate?: () => void;
}

export function TestStatusActions({ test, onStatusChange, onDuplicate }: TestStatusActionsProps) {
  const { toast } = useToast();

  const handleActivate = () => {
    addAuditLog('test_activated', 'user-comp-1', 'Maria Recrutadora', 'test', test.id, test.name);
    onStatusChange('active');
    toast({ title: 'Teste ativado', description: `"${test.name}" está agora ativo.` });
  };

  const handleClose = () => {
    addAuditLog('test_closed', 'user-comp-1', 'Maria Recrutadora', 'test', test.id, test.name);
    onStatusChange('closed');
    toast({ title: 'Teste encerrado', description: `"${test.name}" foi encerrado.` });
  };

  const handleArchive = () => {
    addAuditLog('test_archived', 'user-comp-1', 'Maria Recrutadora', 'test', test.id, test.name);
    onStatusChange('archived');
    toast({ title: 'Teste arquivado', description: `"${test.name}" foi arquivado.` });
  };

  const handleDuplicate = () => {
    addAuditLog('test_duplicated', 'user-comp-1', 'Maria Recrutadora', 'test', test.id, test.name);
    toast({ title: 'Teste duplicado', description: `Cópia de "${test.name}" criada como rascunho.` });
    onDuplicate?.();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {test.status === 'draft' && (
        <Button size="sm" onClick={handleActivate}>
          <Play className="h-4 w-4 mr-1" />
          Ativar
        </Button>
      )}
      {test.status === 'active' && (
        <Button size="sm" variant="outline" onClick={handleClose}>
          <Square className="h-4 w-4 mr-1" />
          Encerrar
        </Button>
      )}
      {test.status === 'closed' && (
        <Button size="sm" variant="outline" onClick={handleArchive}>
          <Archive className="h-4 w-4 mr-1" />
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
