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
  Archive,
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
import { mockJobAssessments, mockJobAssessmentInvites } from '@/data/behavioralAssessmentData';
import { JOB_TEST_CONFIG } from '@/data/behavioralAssessmentData';
import { useToast } from '@/hooks/use-toast';

// Mock de candidatos da vaga
const mockCandidates: InternalCandidate[] = [
  {
    id: 'cand-1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    appliedAt: '2024-01-15',
    status: 'screening',
  },
  {
    id: 'cand-2',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    appliedAt: '2024-01-14',
    status: 'interview',
  },
  {
    id: 'cand-3',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    appliedAt: '2024-01-13',
    status: 'new',
  },
  {
    id: 'cand-4',
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    appliedAt: '2024-01-12',
    status: 'offer',
  },
];

export default function JobTestManager() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('invites');
  const [invites, setInvites] = useState(mockJobAssessmentInvites);

  // Fetch data from service layer
  const { data: job } = useJob(jobId || '');

  // Buscar dados do assessment
  const assessment = mockJobAssessments.find((a) => a.jobId === jobId);

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
  const handleSendInvites = (candidateIds: string[]) => {
    const newInvites = candidateIds.map((candidateId) => ({
      id: `inv-${Date.now()}-${candidateId}`,
      jobAssessmentId: assessment.id,
      type: 'internal' as const,
      candidateId,
      status: 'pending' as const,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + assessment.expirationDays * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));

    setInvites((prev) => [...prev, ...newInvites]);
    toast({
      title: 'Convites enviados!',
      description: `${candidateIds.length} convite(s) enviado(s) com sucesso.`,
    });
  };

  const handleGenerateMagicLink = async (data: {
    externalName?: string;
    externalEmail?: string;
    expirationDays: number;
  }) => {
    const token = crypto.randomUUID();
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/t/${token}`;

    const newInvite = {
      id: `inv-${Date.now()}`,
      jobAssessmentId: assessment.id,
      type: 'magic_link' as const,
      externalName: data.externalName,
      externalEmail: data.externalEmail,
      magicToken: token,
      status: 'pending' as const,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + data.expirationDays * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    setInvites((prev) => [...prev, newInvite]);
    return link;
  };

  const handleResend = (inviteId: string) => {
    toast({
      title: 'Convite reenviado',
      description: 'O candidato receberá um novo e-mail.',
    });
  };

  const handleCancel = (inviteId: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    toast({
      title: 'Convite cancelado',
      description: 'O convite foi removido.',
    });
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
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
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
                  candidates={mockCandidates}
                  existingInvites={invites}
                  onSendInvites={handleSendInvites}
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
