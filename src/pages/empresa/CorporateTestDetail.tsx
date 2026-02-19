/**
 * Corporate Test Detail Page
 * PRD-052: Detalhe de um teste específico
 */

import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users, Clock, CalendarDays, Link2, Send, FileText, GitCompare, AlertTriangle, TimerOff } from 'lucide-react';
import { useCompanyTest, useTestInvitations, useTestResults, useUpdateCompanyTest } from '@/hooks/useCompanyTestsQuery';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import {
  TestStatusBadge,
  TestStatusActions,
  TestCandidateList,
} from '@/components/corporate-tests';

export default function CorporateTestDetail() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const { data: test, isLoading: isLoadingTest } = useCompanyTest(testId);
  const { data: invitations = [], isLoading: isLoadingInvitations } = useTestInvitations(testId);
  const { data: results = [], isLoading: isLoadingResults } = useTestResults(testId);
  const updateTest = useUpdateCompanyTest();

  const isLoading = isLoadingTest || isLoadingInvitations || isLoadingResults;

  if (isLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

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

  const completedCount = invitations.filter(i => i.status === 'completed').length;
  const startedCount = invitations.filter(i => i.status === 'started').length;
  const abandonedCount = invitations.filter(i => i.status === 'abandoned').length;
  const expiredCount = invitations.filter(i => i.status === 'expired').length;

  const handleStatusChange = (newStatus: typeof test.status) => {
    updateTest.mutate({ id: test.id, updates: { status: newStatus } });
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Back + Header */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/empresa/testes')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Hub
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{test.name}</h1>
                <TestStatusBadge status={test.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
              {test.jobTitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  Vaga: <span className="font-medium text-foreground">{test.jobTitle}</span>
                </p>
              )}
            </div>
            <TestStatusActions test={test} onStatusChange={handleStatusChange} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{invitations.length}</p>
                  <p className="text-xs text-muted-foreground">Convidados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{startedCount}</p>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {abandonedCount > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{abandonedCount}</p>
                    <p className="text-xs text-muted-foreground">Abandonado{abandonedCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {expiredCount > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <TimerOff className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-2xl font-bold">{expiredCount}</p>
                    <p className="text-xs text-muted-foreground">Expirado{expiredCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {test.deadline
                      ? new Date(test.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                      : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Prazo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pesos por Dimensão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(test.weights) as [string, number][]).map(([dim, weight]) => (
                <Badge key={dim} variant="outline" className="text-sm px-3 py-1">
                  {DIMENSION_SHORT_NAMES[dim as keyof typeof DIMENSION_SHORT_NAMES]}: {weight.toFixed(1)}x
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {results.length >= 2 && (
            <Button variant="outline" onClick={() => navigate(`/empresa/testes/${testId}/comparar`)}>
              <GitCompare className="h-4 w-4 mr-2" />
              Comparar Candidatos
            </Button>
          )}
          {results.length > 0 && (
            <Button variant="outline" onClick={() => navigate(`/empresa/testes/${testId}/relatorios`)}>
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          )}
          {test.publicLinkSlug && test.publicLinkActive && (
            <Button variant="outline" size="sm">
              <Link2 className="h-4 w-4 mr-2" />
              Link Público
            </Button>
          )}
        </div>

        {/* Candidate List */}
        <TestCandidateList
          testId={testId!}
          invitations={invitations}
          results={results}
        />
      </div>
    </DashboardLayout>
  );
}
