/**
 * Corporate Test Reports Page
 * PRD-054: Relatórios PDF/Excel
 */

import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, FileSpreadsheet, Download, Users } from 'lucide-react';
import { mockCompanyTests, mockTestResults, mockTestInvitations } from '@/data/companyTestData';
import { ExcelExportHub } from '@/components/corporate-tests';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog } from '@/utils/auditLog';

export default function CorporateTestReports() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<string>('all');

  const test = useMemo(() => mockCompanyTests.find(t => t.id === testId), [testId]);
  const results = useMemo(
    () => mockTestResults.filter(r => r.testId === testId),
    [testId]
  );
  const invitations = useMemo(
    () => mockTestInvitations.filter(i => i.testId === testId),
    [testId]
  );

  if (!test) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Teste não encontrado.</p>
          <Button variant="link" onClick={() => navigate('/empresa/testes')}>
            Voltar ao Hub
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handlePDFIndividual = async (candidateId: string) => {
    const result = results.find(r => r.candidateId === candidateId);
    if (!result) return;

    addAuditLog('pdf_downloaded', 'user-comp-1', 'Maria Recrutadora', 'result', result.id, result.candidateName, 'PDF individual');
    toast({
      title: 'PDF gerado',
      description: `Relatório de ${result.candidateName} pronto para download.`,
    });
  };

  const handlePDFComparative = async () => {
    addAuditLog('pdf_downloaded', 'user-comp-1', 'Maria Recrutadora', 'test', test.id, test.name, 'PDF comparativo');
    toast({
      title: 'PDF comparativo gerado',
      description: `Relatório comparativo de ${results.length} candidatos pronto.`,
    });
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/testes/${testId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao teste
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">{test.name}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* PDF Individual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-red-500" />
                Relatório PDF Individual
              </CardTitle>
              <CardDescription>
                Relatório completo de 3 páginas com radar chart, análise por dimensão e análise IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o candidato" />
                </SelectTrigger>
                <SelectContent>
                  {results.map(r => (
                    <SelectItem key={r.candidateId} value={r.candidateId}>
                      {r.candidateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                disabled={selectedCandidate === 'all'}
                onClick={() => handlePDFIndividual(selectedCandidate)}
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar PDF Individual
              </Button>
            </CardContent>
          </Card>

          {/* PDF Comparativo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-500" />
                Relatório PDF Comparativo
              </CardTitle>
              <CardDescription>
                Comparativo de todos os candidatos com radar sobreposto, tabela e ranking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {results.length} candidato{results.length !== 1 ? 's' : ''} concluído{results.length !== 1 ? 's' : ''}
              </p>
              <Button
                className="w-full"
                variant="outline"
                disabled={results.length < 2}
                onClick={handlePDFComparative}
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar PDF Comparativo
              </Button>
            </CardContent>
          </Card>

          {/* Excel */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                Relatório Excel Consolidado
              </CardTitle>
              <CardDescription>
                Planilha com 4 abas: Resumo, Resultados Individuais, Estatísticas e Convites.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelExportHub
                test={test}
                results={results}
                invitations={invitations}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
