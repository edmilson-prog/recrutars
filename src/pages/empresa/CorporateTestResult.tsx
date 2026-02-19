/**
 * Corporate Test Result Page
 * PRD-053: Resultado individual do candidato
 */

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileDown } from 'lucide-react';
import { useCompanyTest, useTestResults } from '@/hooks/useCompanyTestsQuery';
import { CandidateResultView } from '@/components/corporate-tests';

export default function CorporateTestResult() {
  const { testId, candidateId } = useParams<{ testId: string; candidateId: string }>();
  const navigate = useNavigate();

  const { data: test, isLoading: isLoadingTest } = useCompanyTest(testId);
  const { data: results = [], isLoading: isLoadingResults } = useTestResults(testId);

  const result = useMemo(
    () => results.find(r => r.candidateId === candidateId),
    [results, candidateId]
  );

  const isLoading = isLoadingTest || isLoadingResults;

  if (isLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

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
