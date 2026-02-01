/**
 * Corporate Test Result Page
 * PRD-053: Resultado individual do candidato
 */

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown } from 'lucide-react';
import { mockCompanyTests, mockTestResults } from '@/data/companyTestData';
import { CandidateResultView } from '@/components/corporate-tests';

export default function CorporateTestResult() {
  const { testId, candidateId } = useParams<{ testId: string; candidateId: string }>();
  const navigate = useNavigate();

  const test = useMemo(() => mockCompanyTests.find(t => t.id === testId), [testId]);
  const result = useMemo(
    () => mockTestResults.find(r => r.testId === testId && r.candidateId === candidateId),
    [testId, candidateId]
  );

  if (!test || !result) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Resultado não encontrado.</p>
          <Button variant="link" onClick={() => navigate(`/empresa/testes/${testId}`)}>
            Voltar ao teste
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/testes/${testId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao teste
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/empresa/testes/${testId}/relatorios`)}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
        </div>

        <CandidateResultView result={result} test={test} />
      </div>
    </DashboardLayout>
  );
}
