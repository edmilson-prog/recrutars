/**
 * LGPD Report
 * PRD-054: Relatório de acesso a dados por candidato
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog, getActionLabel } from '@/utils/auditLog';
import { mockAuditLogs } from '@/data/companyTestData';
import type { AuditLog } from '@/types/companyTest';

export function LGPDReport() {
  const { toast } = useToast();
  const [candidateName, setCandidateName] = useState('');
  const [results, setResults] = useState<AuditLog[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!candidateName.trim()) return;
    const filtered = mockAuditLogs.filter(
      log => log.resourceName?.toLowerCase().includes(candidateName.toLowerCase()) ||
             log.details?.toLowerCase().includes(candidateName.toLowerCase())
    );
    setResults(filtered);
    setSearched(true);

    addAuditLog(
      'lgpd_report_generated',
      'user-comp-1',
      'Maria Recrutadora',
      'result',
      candidateName,
      candidateName,
      'Relatório LGPD de acessos'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4 text-blue-500" />
          Relatório de Conformidade LGPD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Consulte quem acessou os dados de um candidato específico.
        </p>

        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="lgpd-name" className="text-xs">Nome do candidato</Label>
            <Input
              id="lgpd-name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Ex: Ana Silva"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="self-end">
            <Search className="h-4 w-4 mr-2" />
            Consultar
          </Button>
        </div>

        {searched && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm">
                {results.length} registro{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''} para "{candidateName}"
              </p>
              {results.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => {
                  toast({ title: 'Em desenvolvimento', description: 'Exportação LGPD será implementada.' });
                }}>
                  <FileDown className="h-3.5 w-3.5 mr-1" />
                  Exportar
                </Button>
              )}
            </div>

            {results.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getActionLabel(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.userName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{log.details || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
