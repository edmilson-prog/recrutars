/**
 * Metrics Per Job Table
 * PRD-054: Tabela de métricas por vaga
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { CompanyTest, TestInvitation, CompanyTestResult } from '@/types/companyTest';

interface MetricsPerJobTableProps {
  tests: CompanyTest[];
  allInvitations: TestInvitation[];
  allResults: CompanyTestResult[];
}

export function MetricsPerJobTable({ tests, allInvitations, allResults }: MetricsPerJobTableProps) {
  const testsWithJobs = useMemo(() => tests.filter(t => t.jobTitle), [tests]);

  const rows = useMemo(() => {
    return testsWithJobs.map(test => {
      const invitations = allInvitations.filter(i => i.testId === test.id);
      const results = allResults.filter(r => r.testId === test.id);
      const completed = invitations.filter(i => i.status === 'completed').length;
      const rate = invitations.length > 0 ? Math.round((completed / invitations.length) * 100) : 0;
      const fitScores = results.filter(r => r.fitScore !== undefined).map(r => r.fitScore!);
      const avgFit = fitScores.length > 0 ? Math.round((fitScores.reduce((a, b) => a + b, 0) / fitScores.length) * 10) / 10 : 0;

      return {
        test,
        invitations: invitations.length,
        completed,
        rate,
        results: results.length,
        avgFit,
        shortlisted: results.filter(r => r.shortlisted).length,
      };
    });
  }, [testsWithJobs, allInvitations, allResults]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Métricas por Vaga</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma vaga vinculada a testes ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaga</TableHead>
                  <TableHead className="text-center">Convites</TableHead>
                  <TableHead className="text-center">Concluídos</TableHead>
                  <TableHead className="text-center">Taxa</TableHead>
                  <TableHead className="text-center">Fit Médio</TableHead>
                  <TableHead className="text-center">Shortlist</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.test.id}>
                    <TableCell className="font-medium text-sm">
                      {row.test.jobTitle}
                      <Badge variant="outline" className="ml-2 text-[10px]">{row.test.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{row.invitations}</TableCell>
                    <TableCell className="text-center">{row.completed}</TableCell>
                    <TableCell className="text-center">
                      <span className={row.rate >= 60 ? 'text-green-600' : 'text-amber-600'}>
                        {row.rate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{row.avgFit}%</TableCell>
                    <TableCell className="text-center">{row.shortlisted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
