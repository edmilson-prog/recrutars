/**
 * JobTestManager Page
 * PRD-048: Teste por Vaga
 *
 * Gestão de convites e resultados do teste de uma vaga
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  FileQuestion,
  Users,
  Link2,
  BarChart3,
  Plus,
  Settings,
  Play,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  InternalCandidateList,
  MagicLinkGenerator,
  InviteManager,
} from '@/components/job-assessment';
import type { InternalCandidate } from '@/components/job-assessment';
import { useJob } from '@/hooks/useJobsQuery';
import { useApplicationsByJob } from '@/hooks/useApplicationsQuery';
import {
  useJobAssessmentByJob,
  useJobAssessmentInvites,
  useCreateBulkJobAssessmentInvites,
  useCreateJobAssessmentInvite,
  useCancelJobAssessmentInvite,
  useResendJobAssessmentInvite,
} from '@/hooks/useJobAssessmentsQuery';
import { JOB_TEST_CONFIG } from '@/data/behavioralAssessmentData';
import { useToast } from '@/hooks/use-toast';

/** Maps application status to InternalCandidate status */
function mapApplicationStatus(status: string): InternalCandidate['status'] {
  const map: Record<string, InternalCandidate['status']> = {
    pending: 'new',
    reviewing: 'screening',
    interview: 'interview',
    offer: 'offer',
    hired: 'hired',
    rejected: 'rejected',
    withdrawn: 'rejected',
    talent_pool: 'screening',
  };
  return map[status] ?? 'new';
}

export default function JobTestManager() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('invites');

  // Fetch job data
  const { data: job } = useJob(jobId || '');

  // Fetch assessment for this job (from Supabase)
  const { data: assessment, isLoading: isLoadingAssessment } = useJobAssessmentByJob(jobId || '');

  // Fetch invites (from Supabase)
  const { data: invites = [], isLoading: isLoadingInvites } = useJobAssessmentInvites(
    assessment?.id || '',
  );

  // Fetch real candidates who applied to this job
  const { data: applications = [] } = useApplicationsByJob(jobId || '');

  // Map applications to InternalCandidate format
  const candidates: InternalCandidate[] = useMemo(() => {
    return applications.map((app) => ({
      id: app.candidateId,
      name: app.candidateName,
      email: '', // Email not available in Application type, kept empty
      avatar: app.candidateAvatar,
      appliedAt: app.appliedAt,
      status: mapApplicationStatus(app.status),
    }));
  }, [applications]);

  // Mutations
  const createBulkInvites = useCreateBulkJobAssessmentInvites();
  const createInvite = useCreateJobAssessmentInvite();
  const cancelInvite = useCancelJobAssessmentInvite();
  const resendInvite = useResendJobAssessmentInvite();

  if (!job) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center py-16">
          <FileQuestion className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Vaga não encontrada
          </h2>
          <Button onClick={() => navigate('/empresa/vagas')}>
            Voltar para Vagas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingAssessment) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando teste...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!assessment) {
    return (
      <DashboardLayout userType="company">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Teste Comportamental
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span>{job.title}</span>
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border">
            <FileQuestion className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhum teste configurado
            </h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Crie um teste comportamental personalizado para avaliar os
              candidatos desta vaga.
            </p>
            <Button
              onClick={() => navigate(`/empresa/vagas/${jobId}/criar-teste`)}
              className="gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Teste
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Contagens
  const magicLinkCount = invites.filter((i) => i.type === 'magic_link').length;
  const completedCount = invites.filter((i) => i.status === 'completed').length;

  // Handlers
  const handleSendInvites = async (candidateIds: string[]) => {
    try {
      const inviteData = candidateIds.map((candidateId) => ({
        jobAssessmentId: assessment.id,
        type: 'internal' as const,
        candidateId,
        expirationDays: assessment.expirationDays,
      }));

      await createBulkInvites.mutateAsync(inviteData);

      toast({
        title: 'Convites enviados!',
        description: `${candidateIds.length} convite(s) enviado(s) com sucesso.`,
      });
    } catch {
      toast({
        title: 'Erro ao enviar convites',
        description: 'Não foi possível enviar os convites. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateMagicLink = async (data: {
    externalName?: string;
    externalEmail?: string;
    expirationDays: number;
  }): Promise<string> => {
    const invite = await createInvite.mutateAsync({
      jobAssessmentId: assessment.id,
      type: 'magic_link',
      externalName: data.externalName,
      externalEmail: data.externalEmail,
      expirationDays: data.expirationDays,
    });

    const baseUrl = window.location.origin;
    return `${baseUrl}/t/${invite.magicToken}`;
  };

  const handleResend = (inviteId: string) => {
    resendInvite.mutate(
      { inviteId, assessmentId: assessment.id },
      {
        onSuccess: () => {
          toast({
            title: 'Convite reenviado',
            description: 'O candidato receberá um novo e-mail.',
          });
        },
      },
    );
  };

  const handleCancel = (inviteId: string) => {
    cancelInvite.mutate(
      { inviteId, assessmentId: assessment.id },
      {
        onSuccess: () => {
          toast({
            title: 'Convite cancelado',
            description: 'O convite foi removido.',
          });
        },
      },
    );
  };

  const handleViewResult = (inviteId: string) => {
    const invite = invites.find((i) => i.id === inviteId);
    if (invite?.candidateId) {
      navigate(`/empresa/vagas/${jobId}/teste/${invite.candidateId}`);
    }
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0 self-start"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {assessment.title}
              </h1>
              <Badge
                variant={assessment.status === 'published' ? 'default' : 'secondary'}
                className={assessment.status === 'published' ? 'bg-success' : ''}
              >
                {assessment.status === 'published' ? 'Publicado' : 'Rascunho'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{job.title}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>
                {assessment.totalQuestions} perguntas • ~
                {assessment.estimatedMinutes} min
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/empresa/vagas/${jobId}/teste/comparar`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Comparar
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/empresa/vagas/${jobId}/criar-teste`}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="bg-card p-4 rounded-xl border text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-foreground">
              {invites.length}
            </div>
            <div className="text-xs text-muted-foreground">Convites</div>
          </div>
          <div className="bg-card p-4 rounded-xl border text-center">
            <Play className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-foreground">
              {invites.filter((i) => i.status === 'started').length}
            </div>
            <div className="text-xs text-muted-foreground">Em andamento</div>
          </div>
          <div className="bg-card p-4 rounded-xl border text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold text-foreground">
              {completedCount}
            </div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </div>
          <div className="bg-card p-4 rounded-xl border text-center">
            <Link2 className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-foreground">
              {magicLinkCount}/{JOB_TEST_CONFIG.maxMagicLinksPerJob}
            </div>
            <div className="text-xs text-muted-foreground">Links mágicos</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invites" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Convites
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Candidatos
              </TabsTrigger>
              <TabsTrigger value="magic" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link Mágico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invites" className="mt-4">
              <div className="bg-card rounded-xl p-4 border">
                <InviteManager
                  invites={invites}
                  onResend={handleResend}
                  onCancel={handleCancel}
                  onViewResult={handleViewResult}
                />
              </div>
            </TabsContent>

            <TabsContent value="internal" className="mt-4">
              <div className="bg-card rounded-xl p-4 border">
                <InternalCandidateList
                  candidates={candidates}
                  existingInvites={invites}
                  onSendInvites={handleSendInvites}
                  isSending={createBulkInvites.isPending}
                />
              </div>
            </TabsContent>

            <TabsContent value="magic" className="mt-4">
              <div className="bg-card rounded-xl p-4 border">
                <MagicLinkGenerator
                  jobAssessmentId={assessment.id}
                  currentLinkCount={magicLinkCount}
                  maxLinks={JOB_TEST_CONFIG.maxMagicLinksPerJob}
                  defaultExpirationDays={assessment.expirationDays}
                  onGenerate={handleGenerateMagicLink}
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
