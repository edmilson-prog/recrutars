/**
 * Corporate Test Audit Page
 * PRD-054: Log de auditoria e LGPD
 */

import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuditLogTable } from '@/components/corporate-tests';

export default function CorporateTestAudit() {
  const navigate = useNavigate();

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/empresa/testes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Hub
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Auditoria e Conformidade</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log de todas as ações realizadas no Hub de Testes
          </p>
        </div>

        <AuditLogTable />
      </div>
    </DashboardLayout>
  );
}
