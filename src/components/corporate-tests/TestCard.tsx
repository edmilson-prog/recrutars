/**
 * Test Card
 * PRD-052: Card de teste individual
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarDays, ChevronRight } from 'lucide-react';
import { TestStatusBadge } from './TestStatusBadge';
// TODO: PRD-072 — migrate to service layer
import { mockTestInvitations, mockTestResults } from '@/data/companyTestData';
import type { CompanyTest } from '@/types/companyTest';

interface TestCardProps {
  test: CompanyTest;
}

export function TestCard({ test }: TestCardProps) {
  const navigate = useNavigate();
  const invitations = mockTestInvitations.filter(i => i.testId === test.id);
  const results = mockTestResults.filter(r => r.testId === test.id);
  const completed = invitations.filter(i => i.status === 'completed').length;

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
                <Users className="h-3 w-3" />
                {invitations.length} convidados · {completed} concluídos
              </span>
              {test.deadline && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(test.deadline).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
            {results.length > 0 && (
              <div className="flex gap-1 mt-2">
                <Badge variant="outline" className="text-[10px]">
                  {results.length} resultado{results.length !== 1 ? 's' : ''}
                </Badge>
                {results.filter(r => r.shortlisted).length > 0 && (
                  <Badge variant="default" className="text-[10px]">
                    {results.filter(r => r.shortlisted).length} shortlist
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
