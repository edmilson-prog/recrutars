/**
 * JobDetail Page
 * PRD-058: Detalhamento da vaga com abas (Detalhes, Pipeline, Moderacao, Notas)
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  Pause,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Save,
  Users,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { useModeration } from '@/hooks/useModeration';
import { useApplicationsByJob } from '@/hooks/useApplicationsQuery';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { JobPipeline } from '@/components/admin/jobs/JobPipeline';
import { ModerationActions } from '@/components/admin/jobs/ModerationActions';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    jobs,
    approveJob,
    rejectJob,
    requestCorrection,
    toggleHighlight,
    addNote,
  } = useAdminJobs();
  const { actions: moderationActions, config: moderationConfig } = useModeration();
  const { data: applications = [], isLoading: isLoadingApplications } = useApplicationsByJob(id ?? '');

  const [noteText, setNoteText] = useState('');

  const job = useMemo(() => jobs.find((j) => j.id === id), [jobs, id]);

  const jobModerationHistory = useMemo(
    () => moderationActions.filter((a) => a.jobId === id),
    [moderationActions, id]
  );

  if (!job) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center py-20">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Vaga nao encontrada</h2>
          <p className="text-muted-foreground mt-1">A vaga solicitada nao existe ou foi removida.</p>
          <Button className="mt-4" onClick={() => navigate('/admin/vagas/lista')}>
            Voltar para lista
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pipelineStages = [
    { name: 'Candidatura', count: job.applicationsCount, color: '#3b82f6' },
    { name: 'Triagem', count: Math.round(job.applicationsCount * 0.4), color: '#8b5cf6' },
    { name: 'Entrevista', count: Math.round(job.applicationsCount * 0.15), color: '#f59e0b' },
    { name: 'Contratacao', count: Math.round(job.applicationsCount * 0.05), color: '#10b981' },
  ];

  const handleSaveNote = () => {
    if (noteText.trim()) {
      addNote(job.id, noteText.trim());
      setNoteText('');
    }
  };

  const APPLICATION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending:     { label: 'Pendente',          className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' },
    reviewing:   { label: 'Em Analise',        className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
    interview:   { label: 'Entrevista',        className: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
    offer:       { label: 'Proposta',          className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400' },
    rejected:    { label: 'Rejeitado',         className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
    hired:       { label: 'Contratado',        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    withdrawn:   { label: 'Desistiu',          className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400' },
    talent_pool: { label: 'Banco de Talentos', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' },
  };

  const TEST_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    nao_solicitado: { label: 'Nao solicitado', className: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400' },
    solicitado:     { label: 'Solicitado',     className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' },
    realizado:      { label: 'Realizado',      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  };

  const statusColor =
    job.status === 'active'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
      : job.status === 'pending'
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
        : job.status === 'rejected'
          ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={job.companyLogo} />
                <AvatarFallback>{job.companyName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.companyName}
                    {job.isAnonymous && (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" title="Empresa confidencial para candidatos" />
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary" className={cn('text-xs', statusColor)}>
                    {job.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {job.companyPlan}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {job.type}
                  </Badge>
                  {job.isHighlighted && (
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 text-xs">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Destaque
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {job.moderationStatus === 'pending' && (
                <ModerationActions
                  job={job}
                  onApprove={approveJob}
                  onReject={rejectJob}
                  onRequestCorrection={requestCorrection}
                  reasons={moderationConfig.rejectionReasons}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleHighlight(job.id)}
              >
                <Star className={cn('w-4 h-4 mr-1', job.isHighlighted && 'fill-yellow-500 text-yellow-500')} />
                {job.isHighlighted ? 'Remover Destaque' : 'Destacar'}
              </Button>
              <Button variant="outline" size="sm" className="text-orange-600">
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <EyeOff className="w-4 h-4 mr-1" />
                Despublicar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full flex">
              <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
              <TabsTrigger value="pipeline" className="flex-1">Pipeline</TabsTrigger>
              <TabsTrigger value="moderation" className="flex-1">Moderacao</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">Notas</TabsTrigger>
              <TabsTrigger value="candidates" className="flex-1">
                Candidatos
                {applications.length > 0 && (
                  <span className="ml-1.5 text-xs bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full px-1.5 py-0.5 font-medium">
                    {applications.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Details tab */}
            <TabsContent value="details" className="mt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Job info */}
                <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-600" />
                    Dados da Vaga
                  </h3>
                  <Separator />
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Titulo</span>
                      <span className="font-medium">{job.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Area</span>
                      <span className="font-medium">{job.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo</span>
                      <span className="font-medium">{job.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salario</span>
                      <span className="font-medium">{job.salary || 'A combinar'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Localidade</span>
                      <span className="font-medium">{job.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criada em</span>
                      <span className="font-medium">{formatDate(job.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Publicada em</span>
                      <span className="font-medium">{formatDate(job.publishedAt)}</span>
                    </div>
                    {job.finalizedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Finalizada em</span>
                        <span className="font-medium">{formatDate(job.finalizedAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Candidaturas</span>
                      <span className="font-bold text-cyan-600">{job.applicationsCount}</span>
                    </div>
                  </div>
                </div>

                {/* Company info */}
                <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-600" />
                    Dados da Empresa
                  </h3>
                  <Separator />
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={job.companyLogo} />
                      <AvatarFallback>{job.companyName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{job.companyName}</p>
                      <Badge variant="outline" className="text-[10px]">{job.companyPlan}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plano</span>
                      <span className="font-medium">{job.companyPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Empresa</span>
                      <span className="font-mono text-xs">{job.companyId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pipeline tab */}
            <TabsContent value="pipeline" className="mt-6">
              <div className="bg-card rounded-2xl p-6 shadow-soft space-y-6">
                <h3 className="text-lg font-semibold text-foreground">Pipeline da Vaga</h3>
                <JobPipeline stages={pipelineStages} />
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>
                    Total de <strong>{job.applicationsCount}</strong> candidaturas recebidas.
                    {job.applicationsCount > 0 &&
                      ` Media de conversao: ${((pipelineStages[3].count / job.applicationsCount) * 100).toFixed(1)}% para contratacao.`}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Moderation tab */}
            <TabsContent value="moderation" className="mt-6 space-y-4">
              {/* Current status */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-foreground mb-4">Status Atual da Moderacao</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {job.moderationStatus === 'approved' && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aprovada
                    </Badge>
                  )}
                  {job.moderationStatus === 'rejected' && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejeitada
                    </Badge>
                  )}
                  {job.moderationStatus === 'pending' && (
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                  {job.moderationStatus === 'correction_requested' && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                      <FileText className="w-3 h-3 mr-1" />
                      Correcao Solicitada
                    </Badge>
                  )}
                  {job.moderatedBy && (
                    <span className="text-xs text-muted-foreground">
                      por {job.moderatedBy} em {formatDate(job.moderatedAt)}
                    </span>
                  )}
                </div>
                {job.rejectionReason && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <strong>Motivo:</strong> {job.rejectionReason}
                    </p>
                  </div>
                )}
                {job.correctionFields && job.correctionFields.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20">
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      <strong>Campos a corrigir:</strong> {job.correctionFields.join(', ')}
                    </p>
                  </div>
                )}
                {job.moderationStatus === 'pending' && (
                  <div className="mt-4">
                    <ModerationActions
                      job={job}
                      onApprove={approveJob}
                      onReject={rejectJob}
                      onRequestCorrection={requestCorrection}
                      reasons={moderationConfig.rejectionReasons}
                    />
                  </div>
                )}
              </div>

              {/* History */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-foreground mb-4">Historico de Moderacao</h3>
                {jobModerationHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum registro de moderacao.</p>
                ) : (
                  <div className="space-y-3">
                    {jobModerationHistory.map((action) => (
                      <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          action.action === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                          action.action === 'rejected' ? 'bg-red-100 dark:bg-red-500/20' :
                          action.action === 'highlighted' ? 'bg-yellow-100 dark:bg-yellow-500/20' :
                          'bg-orange-100 dark:bg-orange-500/20'
                        )}>
                          {action.action === 'approved' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                          {action.action === 'rejected' && <XCircle className="w-4 h-4 text-red-600" />}
                          {action.action === 'highlighted' && <Star className="w-4 h-4 text-yellow-600" />}
                          {action.action === 'correction_requested' && <FileText className="w-4 h-4 text-orange-600" />}
                          {action.action === 'unpublished' && <EyeOff className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {action.action.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {action.performedByName} - {formatDate(action.performedAt)}
                          </p>
                          {action.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Motivo: {action.reason}
                            </p>
                          )}
                          {action.details && (
                            <p className="text-xs text-muted-foreground mt-1">{action.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Candidates tab */}
            <TabsContent value="candidates" className="mt-6 space-y-4">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-600" />
                    Candidatos
                  </h3>
                  {!isLoadingApplications && applications.length > 0 && (
                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                      {applications.length} candidatura{applications.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <Separator className="my-4" />

                {/* Loading state */}
                {isLoadingApplications && (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-40 rounded bg-muted" />
                          <div className="h-3 w-24 rounded bg-muted" />
                        </div>
                        <div className="h-6 w-20 rounded-full bg-muted" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!isLoadingApplications && applications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">Nenhuma candidatura recebida</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quando candidatos se inscreverem nesta vaga, eles aparecerao aqui.
                    </p>
                  </div>
                )}

                {/* Candidate list */}
                {!isLoadingApplications && applications.length > 0 && (
                  <div className="space-y-2">
                    {applications.map((app) => {
                      const statusCfg = APPLICATION_STATUS_CONFIG[app.status] ?? APPLICATION_STATUS_CONFIG['pending'];
                      const testCfg = TEST_STATUS_CONFIG[app.testStatus] ?? TEST_STATUS_CONFIG['nao_solicitado'];
                      const initials = app.candidateName
                        .split(' ')
                        .map((n: string) => n.charAt(0))
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <div
                          key={app.id}
                          className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarImage src={app.candidateAvatar} alt={app.candidateName} />
                            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => navigate('/admin/candidatos/' + app.candidateId)}
                              className="text-sm font-semibold text-foreground hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left truncate block max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-sm"
                            >
                              {app.candidateName}
                            </button>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Candidatou-se em {formatDate(app.appliedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                            <Badge variant="secondary" className={cn('text-[10px] font-medium', testCfg.className)}>
                              {testCfg.label}
                            </Badge>
                            <Badge variant="secondary" className={cn('text-[10px] font-medium', statusCfg.className)}>
                              {statusCfg.label}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400"
                              onClick={() => navigate('/admin/candidatos/' + app.candidateId)}
                              aria-label={`Ver perfil de ${app.candidateName}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Notes tab */}
            <TabsContent value="notes" className="mt-6">
              <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Notas do Admin</h3>
                {job.adminNotes && (
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                      {job.adminNotes}
                    </pre>
                  </div>
                )}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Adicionar nota interna (visivel apenas para admins)..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleSaveNote} disabled={!noteText.trim()} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Nota
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
