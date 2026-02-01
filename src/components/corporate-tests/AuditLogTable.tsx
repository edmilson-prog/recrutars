/**
 * Audit Log Table
 * PRD-054: Tabela do log de auditoria
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AuditLogFilters } from './AuditLogFilters';
import { LGPDReport } from './LGPDReport';
import { mockAuditLogs } from '@/data/companyTestData';
import { getActionLabel } from '@/utils/auditLog';
import { useToast } from '@/hooks/use-toast';
import type { AuditAction } from '@/types/companyTest';

export function AuditLogTable() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const filtered = useMemo(() => {
    return mockAuditLogs.filter(log => {
      const matchesSearch = search === '' ||
        log.resourceName?.toLowerCase().includes(search.toLowerCase()) ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.details?.toLowerCase().includes(search.toLowerCase());
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesResource = resourceFilter === 'all' || log.resourceType === resourceFilter;
      return matchesSearch && matchesAction && matchesResource;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [search, actionFilter, resourceFilter]);

  const handleExportLog = () => {
    const wb = XLSX.utils.book_new();
    const headers = ['Data/Hora', 'Ação', 'Usuário', 'Tipo', 'Recurso', 'Detalhes'];
    const data = filtered.map(log => [
      new Date(log.timestamp).toLocaleString('pt-BR'),
      getActionLabel(log.action),
      log.userName,
      log.resourceType,
      log.resourceName || '—',
      log.details || '—',
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Log de Auditoria');
    XLSX.writeFile(wb, `recrutars-auditoria-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast({ title: 'Log exportado' });
  };

  return (
    <div className="space-y-6">
      {/* Log Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ScrollText className="h-4 w-4 text-blue-500" />
              Log de Auditoria ({filtered.length} registros)
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportLog}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuditLogFilters
            search={search}
            onSearchChange={setSearch}
            actionFilter={actionFilter}
            onActionFilterChange={setActionFilter}
            resourceFilter={resourceFilter}
            onResourceFilterChange={setResourceFilter}
          />

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.userName}</TableCell>
                    <TableCell className="text-sm">
                      {log.resourceName || log.resourceId}
                      <Badge variant="secondary" className="ml-1 text-[9px]">
                        {log.resourceType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.details || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* LGPD Report */}
      <LGPDReport />
    </div>
  );
}
