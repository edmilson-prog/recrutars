/**
 * Test Candidate List
 * PRD-052: Lista de candidatos dentro de um teste
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, RefreshCw, Trash2, Mail, Link2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TestInvitation, CompanyTestResult } from '@/types/companyTest';

interface TestCandidateListProps {
  testId: string;
  invitations: TestInvitation[];
  results: CompanyTestResult[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  sent: { label: 'Convidado', color: 'bg-slate-100 text-slate-600' },
  viewed: { label: 'Visualizado', color: 'bg-blue-100 text-blue-600' },
  started: { label: 'Em andamento', color: 'bg-amber-100 text-amber-600' },
  completed: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-600' },
  abandoned: { label: 'Abandonado', color: 'bg-red-100 text-red-600' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-600' },
};

const methodIcons: Record<string, typeof Mail> = {
  email: Mail,
  public_link: Link2,
  internal: Users,
};

export function TestCandidateList({ testId, invitations, results }: TestCandidateListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getResult = (candidateId?: string) =>
    candidateId ? results.find(r => r.candidateId === candidateId) : undefined;

  const handleResend = (inv: TestInvitation) => {
    toast({ title: 'Convite reenviado', description: `Convite reenviado para ${inv.candidateName}.` });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Candidatos ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum candidato convidado ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => {
              const result = getResult(inv.candidateId);
              const config = statusConfig[inv.status] ?? { label: inv.status, color: 'bg-gray-100 text-gray-500' };
              const MethodIcon = methodIcons[inv.method] || Mail;

              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {inv.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{inv.candidateName}</p>
                      <MethodIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">{inv.candidateEmail}</p>
                  </div>

                  <Badge variant="outline" className={`shrink-0 text-[10px] ${config.color}`}>
                    {config.label}
                  </Badge>

                  {result?.fitScore !== undefined && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      Fit: {result.fitScore.toFixed(1)}%
                    </Badge>
                  )}

                  <div className="flex gap-1 shrink-0">
                    {inv.status === 'completed' && inv.candidateId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate(`/empresa/testes/${testId}/resultado/${inv.candidateId}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {['sent', 'expired'].includes(inv.status) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleResend(inv)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
