/**
 * Corporate Test Compare Page
 * PRD-053: Comparativo lado a lado
 */

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockCompanyTests, mockTestResults } from '@/data/companyTestData';
import { ComparisonView } from '@/components/corporate-tests';

export default function CorporateTestCompare() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const test = useMemo(() => mockCompanyTests.find(t => t.id === testId), [testId]);
  const results = useMemo(
    () => mockTestResults.filter(r => r.testId === testId),
    [testId]
  );

  if (!test || results.length < 2) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            São necessários pelo menos 2 resultados para comparar.
          </p>
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
        <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/testes/${testId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao teste
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Comparativo de Candidatos</h1>
          <p className="text-sm text-muted-foreground mt-1">{test.name}</p>
        </div>

        <ComparisonView test={test} results={results} />
      </div>
    </DashboardLayout>
  );
}
