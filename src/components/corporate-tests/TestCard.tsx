/**
 * Test Card
 * PRD-052: Card de teste individual
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarDays, ChevronRight, Loader2 } from 'lucide-react';
import { TestStatusBadge } from './TestStatusBadge';
import { useTestInvitations, useTestResults } from '@/hooks/useCompanyTestsQuery';
import type { CompanyTest } from '@/types/companyTest';

interface TestCardProps {
  test: CompanyTest;
}

export function TestCard({ test }: TestCardProps) {
  const navigate = useNavigate();
  const { data: invitations, isLoading: loadingInvitations } = useTestInvitations(test.id);
  const { data: results, isLoading: loadingResults } = useTestResults(test.id);

  const invitationsList = invitations ?? [];
  const resultsList = results ?? [];
  const completed = invitationsList.filter(i => i.status === 'completed').length;
  const isLoading = loadingInvitations || loadingResults;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/empresa/testes/${test.id}`)}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{test.name}</h3>
              <TestStatusBadge status={test.status} />
            </div>
            {test.jobTitle && (
              <p className="text-xs text-muted-foreground mb-2">
                Vaga: {test.jobTitle}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Users className="h-3 w-3" />
                    {invitationsList.length} convidados · {completed} concluídos
                  </>
                )}
              </span>
              {test.deadline && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(test.deadline).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
            {!isLoading && resultsList.length > 0 && (
              <div className="flex gap-1 mt-2">
                <Badge variant="outline" className="text-[10px]">
                  {resultsList.length} resultado{resultsList.length !== 1 ? 's' : ''}
                </Badge>
                {resultsList.filter(r => r.shortlisted).length > 0 && (
                  <Badge variant="default" className="text-[10px]">
                    {resultsList.filter(r => r.shortlisted).length} shortlist
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
