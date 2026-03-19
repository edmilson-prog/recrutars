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
import TeamMemberForm from '@/components/team-management/TeamMemberForm';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMember, useDepartments, usePositions, useUpdateTeamMember } from '@/hooks/useTeamsQuery';
import { useCompanyCreditBalance } from '@/hooks/useTestPackagesQuery';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useGaugeProSessionByCandidate, useGaugeProResultByCandidate } from '@/hooks/useGaugeProQuery';
import type { GaugeProDimension, GaugeProResult, DimensionScores, DimensionClassification } from '@/types/gaugePro';
import type { TestHistoryEntry } from '@/types/teamManagement';
import { ARCHETYPE_PROFILES } from '@/data/gaugeProArchetypes';

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
  const [editFormOpen, setEditFormOpen] = useState(false);
  const updateMember = useUpdateTeamMember();

  // Get active company test for behavioral assessments
  const { data: companyTests = [] } = useQuery({
    queryKey: ['company-tests-active', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_tests')
        .select('id, name, status, weights')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const activeTestId = companyTests.length > 0 ? companyTests[0].id : '';
  const activeTestWeights = companyTests.length > 0
    ? (companyTests[0].weights as Record<GaugeProDimension, number> | undefined)
    : undefined;

  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  const { data: memberTestHistory = [] } = useQuery<TestHistoryEntry[]>({
    queryKey: ['team-member-test-history', id, candidateId],
    queryFn: async () => {
      const allResults: Record<string, unknown>[] = [];
      const seenIds = new Set<string>();

      // Query by candidate_id (legacy flow results)
      if (candidateId) {
        const { data, error } = await supabase
          .from('gauge_pro_results')
          .select('*')
          .eq('candidate_id', candidateId)
          .order('generated_at', { ascending: false });
        if (!error && data) {
          for (const r of data) {
            seenIds.add((r as Record<string, unknown>).id as string);
            allResults.push(r as Record<string, unknown>);
          }
        }
      }

      // Query by team_member_id (unified flow results — PRD-088)
      if (id) {
        const { data: tmResults, error: tmErr } = await supabase
          .from('gauge_pro_results')
          .select('*')
          .eq('team_member_id', id)
          .order('generated_at', { ascending: false });
        if (!tmErr && tmResults) {
          for (const r of tmResults) {
            const rid = (r as Record<string, unknown>).id as string;
            if (!seenIds.has(rid)) {
              allResults.push(r as Record<string, unknown>);
            }
          }
        }
      }

      // Sort merged results by generated_at descending
      allResults.sort((a, b) =>
        new Date(b.generated_at as string).getTime() - new Date(a.generated_at as string).getTime()
      );

      return allResults.map((r) => ({
        id: r.id as string,
        memberId: id ?? '',
        scores: r.final_scores as DimensionScores,
        archetype: (r.archetype_id as string) ?? '–',
        completedAt: r.generated_at as string,
        part1Scores: r.part1_scores as DimensionScores | undefined,
        part2Scores: r.part2_scores as DimensionScores | undefined,
        classifications: r.classifications as Record<string, DimensionClassification> | undefined,
        primaryDimension: r.primary_dimension as string | undefined,
        secondaryDimension: r.secondary_dimension as string | undefined,
        strengths: r.strengths as string[] | undefined,
        developmentAreas: r.development_areas as string[] | undefined,
        careerRecommendations: r.career_recommendations as string[] | undefined,
        xpAwarded: r.xp_awarded as number | undefined,
        badgeAwarded: r.badge_awarded as string | undefined,
      }));
    },
    enabled: !!id, // Enable even without candidateId (unified flow may only have team_member_id)
  });

  // Derive selected GaugeProResult from history (default = most recent)
  const selectedEntry = selectedResultId
    ? memberTestHistory.find((e) => e.id === selectedResultId)
    : memberTestHistory[0];

  const selectedGaugeProResult: GaugeProResult | undefined = selectedEntry
    ? {
        id: selectedEntry.id,
        assessmentId: '',
        candidateId: candidateId || '',
        part1Scores: selectedEntry.part1Scores ?? selectedEntry.scores,
        part2Scores: selectedEntry.part2Scores ?? selectedEntry.scores,
        finalScores: selectedEntry.scores,
        classifications: (selectedEntry.classifications ?? {}) as Record<GaugeProDimension, DimensionClassification>,
        archetype: ARCHETYPE_PROFILES.find(
          (p) => p.id === selectedEntry.archetype || p.name === selectedEntry.archetype
        ) ?? { id: selectedEntry.archetype, name: selectedEntry.archetype, description: '', strengths: [], developmentAreas: [], idealRoles: [], workStyle: '', communicationStyle: '' },
        primaryDimension: (selectedEntry.primaryDimension ?? 'D1') as GaugeProDimension,
        secondaryDimension: (selectedEntry.secondaryDimension ?? 'D2') as GaugeProDimension,
        strengths: selectedEntry.strengths ?? [],
        developmentAreas: selectedEntry.developmentAreas ?? [],
        careerRecommendations: selectedEntry.careerRecommendations ?? [],
        xpAwarded: selectedEntry.xpAwarded ?? 0,
        badgeAwarded: selectedEntry.badgeAwarded ?? '',
        generatedAt: selectedEntry.completedAt,
      }
    : undefined;

  // Use selected result when user picks from timeline, otherwise fall back to the hook result
  const effectiveGaugeProResult = selectedResultId ? selectedGaugeProResult : (gaugeProResult ?? selectedGaugeProResult);

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
          selectedTestId={selectedResultId}
          onSelectTest={setSelectedResultId}
          candidateId={candidateId || undefined}
          gaugeProAssessment={gaugeProAssessment ?? undefined}
          gaugeProResult={effectiveGaugeProResult ?? undefined}
          testWeights={activeTestWeights}
          onEdit={() => setEditFormOpen(true)}
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

        {member && (
          <TeamMemberForm
            open={editFormOpen}
            onOpenChange={setEditFormOpen}
            member={member}
            departments={departments}
            positions={positions}
            onSave={async (data) => {
              try {
                await updateMember.mutateAsync({ id: member.id, updates: data });
                setEditFormOpen(false);
                queryClient.invalidateQueries({ queryKey: ['team-member', id] });
              } catch {
                // Toast de erro é tratado pelo mutation
              }
            }}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}
