/**
 * TeamMemberProfile Page
 * PRD-055: Página de perfil completo do colaborador.
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { MemberProfile } from '@/components/team-management/MemberProfile';
import SendTestModal from '@/components/team-management/SendTestModal';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMember, useDepartments, usePositions } from '@/hooks/useTeamsQuery';
import { useCompanyCreditBalance } from '@/hooks/useTestPackagesQuery';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useGaugeProSessionByCandidate, useGaugeProResultByCandidate } from '@/hooks/useGaugeProQuery';

export default function TeamMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  const { data: member, isLoading: memberLoading } = useTeamMember(id ?? '');
  const { data: departments = [] } = useDepartments(companyId);
  const { data: positions = [] } = usePositions('all');

  const department = member
    ? departments.find((d) => d.id === member.departmentId)
    : undefined;
  const position = member
    ? positions.find((p) => p.id === member.positionId)
    : undefined;
  const candidateId = member?.importedFromCandidateId ?? '';
  const { data: gaugeProAssessment } = useGaugeProSessionByCandidate(candidateId);
  const { data: gaugeProResult } = useGaugeProResultByCandidate(candidateId);

  const { data: creditBalance } = useCompanyCreditBalance(companyId);
  const queryClient = useQueryClient();
  const [sendTestOpen, setSendTestOpen] = useState(false);

  // Get active company test for behavioral assessments
  const { data: companyTests = [] } = useQuery({
    queryKey: ['company-tests-active', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_tests')
        .select('id, name, status')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const activeTestId = companyTests.length > 0 ? companyTests[0].id : '';

  const { data: memberTestHistory = [] } = useQuery({
    queryKey: ['team-member-test-history', candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gauge_pro_results')
        .select('id, generated_at, archetype_id, final_scores, candidate_id')
        .eq('candidate_id', candidateId!)
        .order('generated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        scores: r.final_scores as Record<string, number>,
        archetype: (r.archetype_id as string) ?? '–',
        completedAt: r.generated_at as string,
      }));
    },
    enabled: !!candidateId,
  });

  if (memberLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout userType="company">
        <motion.div {...pageTransition} className="space-y-6">
          <div className="flex items-center gap-4">
            <Link to="/empresa/equipes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Perfil do Colaborador</h1>
              <p className="text-muted-foreground">Colaborador não encontrado</p>
            </div>
          </div>
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">Colaborador não encontrado</p>
            <p className="text-sm mt-2">
              O colaborador com ID &quot;{id}&quot; não existe ou foi removido.
            </p>
            <Link to="/empresa/equipes">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Equipes
              </Button>
            </Link>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <motion.div {...pageTransition} className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/empresa/equipes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Perfil do Colaborador</h1>
            <p className="text-muted-foreground">
              Visualize o perfil comportamental completo de {member.name}
            </p>
          </div>
          {activeTestId && (
            <Button
              className="bg-cyan-600 hover:bg-cyan-700 shrink-0"
              onClick={() => setSendTestOpen(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Teste Comportamental
            </Button>
          )}
        </div>

        <MemberProfile
          member={member}
          department={department}
          position={position}
          testHistory={memberTestHistory}
          candidateId={candidateId || undefined}
          gaugeProAssessment={gaugeProAssessment ?? undefined}
          gaugeProResult={gaugeProResult ?? undefined}
          onEdit={() => {
            // Placeholder: open edit modal
          }}
          onScheduleRetest={() => {
            // Placeholder: open retest scheduling
          }}
          onViewDevelopment={() => navigate(`/empresa/equipes/desenvolvimento/${id}`)}
          onViewEvolution={() => navigate(`/empresa/equipes/evolucao/${id}`)}
        />

        {member && activeTestId && (
          <SendTestModal
            open={sendTestOpen}
            onOpenChange={setSendTestOpen}
            member={member}
            companyId={companyId}
            testId={activeTestId}
            creditBalance={creditBalance ?? 0}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['team-member-test-history'] });
            }}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}
