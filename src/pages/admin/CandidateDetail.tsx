/**
 * Admin Candidate Detail Page
 * PRD-021: Detalhe do candidato com abas de visao geral, perfil, teste, candidaturas, curriculo e historico
 */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LayoutDashboard,
  User,
  Brain,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Linkedin,
  Phone,
  Power,
  PowerOff,
  Bell,
  Loader2,
  ExternalLink,
  Mail,
  RotateCcw,
  Award,
  Eye,
  Ban,
  GraduationCap,
  Star,
  AlertTriangle,
  BookOpen,
  Wrench,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCandidate } from '@/hooks/useCandidatesQuery';
import { useApplicationsByCandidate } from '@/hooks/useApplicationsQuery';
import { useProfile } from '@/hooks/useCurriculumsQuery';
import { useGaugeProResultByCandidate } from '@/hooks/useGaugeProQuery';
import { formatRelativeDate, formatDateBR, formatBRL } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TechnicalAnalysisCard } from '@/components/aiAnalysis';
import type { Candidate, CandidateAdminAction, CandidateStatus, ApplicationStatus } from '@/types';
import { skillLevelLabels, educationStatusLabels } from '@/types/curriculum';
import type { SkillLevel, EducationStatus } from '@/types/curriculum';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<CandidateStatus, { label: string; icon: typeof CheckCircle2; color: string; bgColor: string }> = {
  active: {
    label: 'Ativo',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  inactive: {
    label: 'Inativo',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

const ACTION_ICON_CONFIG: Record<
  CandidateAdminAction['action'],
  { icon: typeof Power; colorClass: string }
> = {
  activated: { icon: Power, colorClass: 'text-success' },
  deactivated: { icon: PowerOff, colorClass: 'text-destructive' },
  test_reset: { icon: RotateCcw, colorClass: 'text-primary' },
  notification_sent: { icon: Bell, colorClass: 'text-warning' },
};

const APP_STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', color: 'bg-muted text-muted-foreground', icon: Clock },
  reviewing: { label: 'Em analise', color: 'bg-warning/10 text-warning', icon: Eye },
  interview: { label: 'Entrevista', color: 'bg-secondary/10 text-secondary', icon: Calendar },
  offer: { label: 'Proposta', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  rejected: { label: 'Reprovado', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  hired: { label: 'Contratado', color: 'bg-success/10 text-success', icon: Award },
  withdrawn: { label: 'Desistencia', color: 'bg-muted text-muted-foreground', icon: Ban },
  talent_pool: { label: 'Banco de Talentos', color: 'bg-primary/10 text-primary', icon: Star },
};

const DISC_BARS = [
  { key: 'dominance' as const, label: 'Dominancia', color: 'bg-red-500' },
  { key: 'influence' as const, label: 'Influencia', color: 'bg-yellow-500' },
  { key: 'steadiness' as const, label: 'Estabilidade', color: 'bg-green-500' },
  { key: 'compliance' as const, label: 'Conformidade', color: 'bg-blue-500' },
];

const SKILL_LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-gray-200 dark:bg-gray-700',
  beginner: 'bg-blue-200 dark:bg-blue-800',
  intermediate: 'bg-emerald-200 dark:bg-emerald-800',
  advanced: 'bg-purple-200 dark:bg-purple-800',
  expert: 'bg-amber-200 dark:bg-amber-800',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Dual-access helper for snake_case / camelCase fields from Supabase */
function dualGet<T>(obj: Record<string, unknown>, camel: string, snake: string): T {
  return (obj[camel] ?? obj[snake]) as T;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function calculateDaysOnPlatform(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatCPF(cpf: string): string {
  if (!cpf) return '---';
  const stripped = cpf.replace(/\D/g, '');
  if (stripped.length !== 11) return cpf;
  return stripped.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    '$1.$2.$3-$4',
  );
}

function formatDateOfBirth(dateStr: string | undefined): string {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdminCandidateDetail() {
  const { id } = useParams<{ id: string }>();

  // Data hooks
  const { data: candidate, isLoading: isLoadingCandidate } = useCandidate(id || '');
  const { data: applicationsData } = useApplicationsByCandidate(id || '');
  const { data: profile, isLoading: isLoadingProfile } = useProfile(id || '');
  const { data: gaugeProResult } = useGaugeProResultByCandidate(id || '');

  const applications = useMemo(() => {
    if (!applicationsData) return [];
    // useApplicationsByCandidate may return Application[] or PaginatedResult
    if (Array.isArray(applicationsData)) return applicationsData;
    if ('data' in applicationsData && Array.isArray((applicationsData as Record<string, unknown>).data)) {
      return (applicationsData as Record<string, unknown>).data as typeof applications;
    }
    return [];
  }, [applicationsData]);

  // Local state for candidate overrides (status changes)
  const [localCandidateOverrides, setLocalCandidateOverrides] = useState<Partial<Candidate>>({});

  // Merge candidate data with local overrides
  const mergedCandidate = useMemo(() => {
    if (!candidate) return null;
    return { ...candidate, ...localCandidateOverrides } as Candidate;
  }, [candidate, localCandidateOverrides]);

  // Admin actions (local state, same pattern as CompanyDetail.tsx)
  const [adminActions, setAdminActions] = useState<CandidateAdminAction[]>([]);

  // Modal state
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [resetTestDialogOpen, setResetTestDialogOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  // Form state
  const [deactivateReason, setDeactivateReason] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  const handleDeactivate = () => {
    if (!mergedCandidate) return;

    setLocalCandidateOverrides((prev) => ({
      ...prev,
      status: 'inactive',
      deactivatedAt: new Date().toISOString(),
    }));

    const newAction: CandidateAdminAction = {
      id: `action-${Date.now()}`,
      candidateId: mergedCandidate.id,
      candidateName: mergedCandidate.name,
      action: 'deactivated',
      performedBy: 'Voce',
      performedAt: new Date().toISOString(),
      details: deactivateReason || 'Candidato desativado',
    };
    setAdminActions((prev) => [newAction, ...prev]);

    toast.success(`Candidato ${mergedCandidate.name} desativado`);
    setDeactivateDialogOpen(false);
    setDeactivateReason('');
  };

  const handleReactivate = () => {
    if (!mergedCandidate) return;

    setLocalCandidateOverrides((prev) => ({
      ...prev,
      status: 'active',
      deactivatedAt: undefined,
    }));

    const newAction: CandidateAdminAction = {
      id: `action-${Date.now()}`,
      candidateId: mergedCandidate.id,
      candidateName: mergedCandidate.name,
      action: 'activated',
      performedBy: 'Voce',
      performedAt: new Date().toISOString(),
      details: 'Candidato reativado',
    };
    setAdminActions((prev) => [newAction, ...prev]);

    toast.success(`Candidato ${mergedCandidate.name} reativado`);
    setReactivateDialogOpen(false);
  };

  const handleResetTest = () => {
    if (!mergedCandidate) return;

    setLocalCandidateOverrides((prev) => ({
      ...prev,
      hasTest: false,
      testResult: undefined,
    }));

    const newAction: CandidateAdminAction = {
      id: `action-${Date.now()}`,
      candidateId: mergedCandidate.id,
      candidateName: mergedCandidate.name,
      action: 'test_reset',
      performedBy: 'Voce',
      performedAt: new Date().toISOString(),
      details: 'Teste comportamental resetado',
    };
    setAdminActions((prev) => [newAction, ...prev]);

    toast.success(`Teste de ${mergedCandidate.name} resetado`);
    setResetTestDialogOpen(false);
  };

  const handleSendNotification = () => {
    if (!mergedCandidate || !notificationMessage.trim()) return;

    const newAction: CandidateAdminAction = {
      id: `action-${Date.now()}`,
      candidateId: mergedCandidate.id,
      candidateName: mergedCandidate.name,
      action: 'notification_sent',
      performedBy: 'Voce',
      performedAt: new Date().toISOString(),
      details: `Notificacao enviada: ${notificationMessage.substring(0, 50)}${notificationMessage.length > 50 ? '...' : ''}`,
    };
    setAdminActions((prev) => [newAction, ...prev]);

    toast.success(`Notificacao enviada para ${mergedCandidate.name}`);
    setNotifyModalOpen(false);
    setNotificationMessage('');
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoadingCandidate) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // Not found state
  // ---------------------------------------------------------------------------

  if (!mergedCandidate) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">Candidato nao encontrado.</p>
          <Link to="/admin/candidatos" className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Candidatos
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const statusConfig = STATUS_CONFIG[mergedCandidate.status];
  const StatusIcon = statusConfig.icon;

  const daysOnPlatform = calculateDaysOnPlatform(mergedCandidate.createdAt);

  // Sorted admin actions
  const sortedActions = [...adminActions].sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
  );

  // Test result from candidate (for DISC bars)
  const testResult = mergedCandidate.testResult?.result;

  // Location display
  const locationDisplay = mergedCandidate.city && mergedCandidate.state
    ? `${mergedCandidate.city}/${mergedCandidate.state}`
    : mergedCandidate.location || '---';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Back link */}
        <Link
          to="/admin/candidatos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para candidatos
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-start gap-4"
        >
          {/* Avatar */}
          <Avatar className="w-16 h-16 shrink-0">
            {mergedCandidate.avatar ? (
              <AvatarImage
                src={mergedCandidate.avatar}
                alt={`Foto de ${mergedCandidate.name}`}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(mergedCandidate.name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {mergedCandidate.displayName || mergedCandidate.name}
              </h1>
              <Badge
                variant="secondary"
                className={cn(statusConfig.bgColor, statusConfig.color)}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {mergedCandidate.title || 'Sem titulo profissional'}
            </p>
            <p className="text-sm text-muted-foreground">
              {mergedCandidate.email}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotifyModalOpen(true)}
            >
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Enviar Notificacao</span>
              <span className="sm:hidden">Notificar</span>
            </Button>
            {mergedCandidate.hasTest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetTestDialogOpen(true)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Resetar Teste</span>
                <span className="sm:hidden">Resetar</span>
              </Button>
            )}
            {mergedCandidate.status === 'active' ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeactivateDialogOpen(true)}
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Desativar
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setReactivateDialogOpen(true)}
              >
                <Power className="w-4 h-4 mr-2" />
                Reativar
              </Button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="visao-geral">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="visao-geral" className="gap-1.5">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Visao Geral</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="gap-1.5">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="teste" className="gap-1.5">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Teste</span>
            </TabsTrigger>
            <TabsTrigger value="candidaturas" className="gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Candidaturas</span>
            </TabsTrigger>
            <TabsTrigger value="curriculo" className="gap-1.5">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Curriculo</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Historico</span>
            </TabsTrigger>
          </TabsList>

          {/* ================================================================
              Tab 1: Visao Geral
              ================================================================ */}
          <TabsContent value="visao-geral">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  icon={Briefcase}
                  label="Candidaturas"
                  value={applications.length}
                  iconColor="text-blue-500"
                  bgColor="bg-blue-500/10"
                />
                <KPICard
                  icon={User}
                  label="Perfil Completo"
                  value={`${mergedCandidate.profileCompletion ?? 0}%`}
                  iconColor="text-emerald-500"
                  bgColor="bg-emerald-500/10"
                />
                <KPICard
                  icon={Brain}
                  label="Teste"
                  value={mergedCandidate.hasTest ? 'Sim' : 'Nao'}
                  iconColor="text-purple-500"
                  bgColor="bg-purple-500/10"
                />
                <KPICard
                  icon={Calendar}
                  label="Dias na Plataforma"
                  value={daysOnPlatform}
                  iconColor="text-amber-500"
                  bgColor="bg-amber-500/10"
                />
              </div>

              {/* Info + Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick info */}
                <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Informacoes Rapidas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <InfoItem
                      label="Status"
                      value={
                        <Badge
                          variant="secondary"
                          className={cn(statusConfig.bgColor, statusConfig.color, 'text-xs')}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      }
                    />
                    <InfoItem
                      label="Localizacao"
                      value={locationDisplay}
                    />
                    <InfoItem
                      label="Experiencia"
                      value={mergedCandidate.experience ? `${mergedCandidate.experience} ano${mergedCandidate.experience !== 1 ? 's' : ''}` : '---'}
                    />
                    <InfoItem
                      label="Disponibilidade"
                      value={mergedCandidate.availability || '---'}
                    />
                    <InfoItem
                      label="Data de Cadastro"
                      value={formatDateBR(mergedCandidate.createdAt)}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contato</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{mergedCandidate.email}</span>
                    </div>
                    {mergedCandidate.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{mergedCandidate.phone}</span>
                      </div>
                    )}
                    {mergedCandidate.linkedin && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <a
                          href={mergedCandidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline inline-flex items-center gap-1 truncate"
                        >
                          {mergedCandidate.linkedin}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {!mergedCandidate.phone && !mergedCandidate.linkedin && (
                      <p className="text-muted-foreground italic">
                        Apenas e-mail cadastrado.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 2: Perfil
              ================================================================ */}
          <TabsContent value="perfil">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Informacoes Pessoais */}
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informacoes Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Nome" value={mergedCandidate.displayName || mergedCandidate.name} />
                  <InfoItem label="E-mail" value={mergedCandidate.email} />
                  <InfoItem label="Telefone" value={mergedCandidate.phone || '---'} />
                  <InfoItem
                    label="Localizacao"
                    value={
                      mergedCandidate.city && mergedCandidate.state
                        ? `${mergedCandidate.city} / ${mergedCandidate.state}`
                        : mergedCandidate.location || '---'
                    }
                  />
                  <InfoItem label="CPF" value={formatCPF(mergedCandidate.cpf || '')} />
                  <InfoItem label="Data de Nascimento" value={formatDateOfBirth(mergedCandidate.dateOfBirth)} />
                </div>
                {mergedCandidate.about && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Sobre</span>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                        {mergedCandidate.about}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Experiencia & Formacao */}
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Experiencia & Formacao</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <InfoItem
                    label="Anos de Experiencia"
                    value={mergedCandidate.experience ? `${mergedCandidate.experience} ano${mergedCandidate.experience !== 1 ? 's' : ''}` : '---'}
                  />
                  <InfoItem label="Educacao" value={mergedCandidate.education || '---'} />
                  <InfoItem label="Disponibilidade" value={mergedCandidate.availability || '---'} />
                  <InfoItem
                    label="Aberto a Realocacao"
                    value={
                      mergedCandidate.openToRelocation != null
                        ? mergedCandidate.openToRelocation ? 'Sim' : 'Nao'
                        : '---'
                    }
                  />
                </div>
              </div>

              {/* Habilidades */}
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Habilidades</h3>
                {mergedCandidate.skills && mergedCandidate.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {mergedCandidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhuma habilidade cadastrada.</p>
                )}
              </div>

              {/* Pretensao Salarial */}
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Pretensao Salarial</h3>
                {mergedCandidate.salary ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-foreground">
                      {formatBRL(mergedCandidate.salary.min)} - {formatBRL(mergedCandidate.salary.max)}
                    </p>
                    {mergedCandidate.salaryNegotiable && (
                      <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        Negociavel
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nao informada.</p>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 3: Teste
              ================================================================ */}
          <TabsContent value="teste">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {mergedCandidate.hasTest && testResult ? (
                <>
                  {/* Result header */}
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Resultado Comportamental</h3>
                        <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
                          <Brain className="w-3 h-3 mr-1" />
                          {testResult.profile}
                        </Badge>
                      </div>
                      {mergedCandidate.testResult?.completedAt && (
                        <p className="text-sm text-muted-foreground">
                          Concluido em {formatDateBR(mergedCandidate.testResult.completedAt)}
                        </p>
                      )}
                    </div>

                    {/* DISC Bars */}
                    <div className="space-y-4">
                      {DISC_BARS.map((bar) => {
                        const value = testResult[bar.key] ?? 0;
                        return (
                          <div key={bar.key} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-foreground font-medium">{bar.label}</span>
                              <span className="text-muted-foreground">{value}%</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full transition-all duration-500', bar.color)}
                                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Strengths & Watch Points */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <Star className="w-4 h-4 text-emerald-500" />
                          Pontos Fortes
                        </h4>
                        {testResult.strengths && testResult.strengths.length > 0 ? (
                          <ul className="space-y-2">
                            {testResult.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Nenhum ponto forte registrado.</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Pontos de Atencao
                        </h4>
                        {testResult.watchPoints && testResult.watchPoints.length > 0 ? (
                          <ul className="space-y-2">
                            {testResult.watchPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Nenhum ponto de atencao registrado.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Technical Analysis */}
                  <TechnicalAnalysisCard
                    candidateId={mergedCandidate.id}
                    candidateName={mergedCandidate.name}
                    gaugeProResult={gaugeProResult}
                  />
                </>
              ) : (
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Teste nao realizado
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Este candidato ainda nao completou o teste comportamental Gauge-Pro.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 4: Candidaturas
              ================================================================ */}
          <TabsContent value="candidaturas">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Candidaturas</h3>
                  <Badge variant="secondary">{applications.length}</Badge>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhuma candidatura registrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => {
                      const appObj = app as unknown as Record<string, unknown>;
                      const appStatus = dualGet<ApplicationStatus>(appObj, 'status', 'status');
                      const appStatusCfg = APP_STATUS_CONFIG[appStatus] ?? APP_STATUS_CONFIG.pending;
                      const AppStatusIcon = appStatusCfg.icon;
                      const jobTitle = dualGet<string>(appObj, 'jobTitle', 'job_title') || 'Vaga';
                      const companyName = dualGet<string>(appObj, 'companyName', 'company_name') || '';
                      const appliedAt = dualGet<string>(appObj, 'appliedAt', 'applied_at');

                      return (
                        <div
                          key={(app as Record<string, unknown>).id as string}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{jobTitle}</h4>
                            <p className="text-sm text-muted-foreground">
                              {companyName}
                              {appliedAt && ` | ${formatRelativeDate(appliedAt)}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge
                              variant="secondary"
                              className={cn(appStatusCfg.color, 'text-xs')}
                            >
                              <AppStatusIcon className="w-3 h-3 mr-1" />
                              {appStatusCfg.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 5: Curriculo
              ================================================================ */}
          <TabsContent value="curriculo">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !profile ? (
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Perfil profissional nao cadastrado
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Este candidato ainda nao preencheu seu perfil profissional.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Experiencias */}
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Experiencias</h3>
                    </div>
                    {profile.experiences && profile.experiences.length > 0 ? (
                      <div className="space-y-4">
                        {profile.experiences.map((exp) => (
                          <div key={exp.id} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <div>
                                <h4 className="font-medium text-foreground">{exp.role}</h4>
                                <p className="text-sm text-muted-foreground">{exp.company}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {exp.current && (
                                  <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    Atual
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {exp.startDate}
                                  {exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Presente' : ''}
                                </span>
                              </div>
                            </div>
                            {exp.description && (
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Nenhuma experiencia cadastrada.</p>
                    )}
                  </div>

                  {/* Formacao */}
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Formacao</h3>
                    </div>
                    {profile.education && profile.education.length > 0 ? (
                      <div className="space-y-4">
                        {profile.education.map((edu) => (
                          <div key={edu.id} className="p-4 rounded-lg border bg-muted/30 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <div>
                                <h4 className="font-medium text-foreground">{edu.degree}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {edu.institution} | {edu.field}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {educationStatusLabels[edu.status as EducationStatus] || edu.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {edu.startYear}
                                  {edu.endYear ? ` - ${edu.endYear}` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Nenhuma formacao cadastrada.</p>
                    )}
                  </div>

                  {/* Cursos & Certificacoes */}
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Cursos & Certificacoes</h3>
                    </div>
                    {profile.courses && profile.courses.length > 0 ? (
                      <div className="space-y-3">
                        {profile.courses.map((course) => (
                          <div key={course.id} className="p-4 rounded-lg border bg-muted/30">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <div>
                                <h4 className="font-medium text-foreground">{course.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {course.institution}
                                  {course.hours ? ` | ${course.hours}h` : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-muted-foreground">{course.year}</span>
                                {course.certificateUrl && (
                                  <a
                                    href={course.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-secondary hover:underline inline-flex items-center gap-1 text-xs"
                                  >
                                    Certificado
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Nenhum curso ou certificacao cadastrado.</p>
                    )}
                  </div>

                  {/* Habilidades (from profile with levels) */}
                  <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Habilidades</h3>
                    </div>
                    {profile.skills && profile.skills.length > 0 ? (
                      <div className="space-y-3">
                        {profile.skills.map((skill) => (
                          <div key={skill.id} className="flex items-center justify-between gap-3">
                            <span className="text-sm text-foreground font-medium">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-xs',
                                  SKILL_LEVEL_COLORS[skill.level] || 'bg-muted',
                                )}
                              >
                                {skillLevelLabels[skill.level as SkillLevel] || skill.level}
                              </Badge>
                              {/* Level dots */}
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((dot) => {
                                  const levelOrder: Record<string, number> = {
                                    basic: 1,
                                    beginner: 2,
                                    intermediate: 3,
                                    advanced: 4,
                                    expert: 5,
                                  };
                                  const filled = dot <= (levelOrder[skill.level] || 0);
                                  return (
                                    <div
                                      key={dot}
                                      className={cn(
                                        'w-2 h-2 rounded-full',
                                        filled ? 'bg-primary' : 'bg-muted-foreground/20',
                                      )}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Nenhuma habilidade no perfil profissional.</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 6: Historico
              ================================================================ */}
          <TabsContent value="historico">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 shadow-soft space-y-4"
            >
              <h3 className="text-lg font-semibold text-foreground">Historico de Acoes</h3>
              <p className="text-sm text-muted-foreground">
                Acoes administrativas realizadas neste candidato.
              </p>

              {sortedActions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Nenhuma acao registrada</p>
                </div>
              ) : (
                <div className="relative ml-3">
                  {/* Timeline line */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/20" />

                  <div className="space-y-6 pl-6">
                    {sortedActions.map((action) => {
                      const actionConfig = ACTION_ICON_CONFIG[action.action];
                      const ActionIcon = actionConfig.icon;

                      return (
                        <div key={action.id} className="relative">
                          {/* Dot */}
                          <div
                            className={cn(
                              'absolute -left-6 top-0 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center z-10',
                              action.action === 'activated'
                                ? 'bg-success/20'
                                : action.action === 'deactivated'
                                  ? 'bg-destructive/20'
                                  : action.action === 'test_reset'
                                    ? 'bg-primary/20'
                                    : 'bg-warning/20',
                            )}
                          >
                            <ActionIcon
                              className={cn('w-3 h-3', actionConfig.colorClass)}
                            />
                          </div>

                          {/* Content */}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {action.details}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {action.performedBy} &bull;{' '}
                              {new Date(action.performedAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ================================================================
          Dialogs / Modals
          ================================================================ */}

      {/* Deactivate Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Voce tem certeza que deseja desativar {mergedCandidate.name}?
              O candidato nao podera acessar a plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="deactivateReason" className="sr-only">
              Motivo da desativacao
            </Label>
            <Textarea
              id="deactivateReason"
              placeholder="Motivo da desativacao (opcional)"
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Dialog */}
      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Voce tem certeza que deseja reativar {mergedCandidate.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivate}>
              Reativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Test Dialog */}
      <AlertDialog open={resetTestDialogOpen} onOpenChange={setResetTestDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar teste comportamental</AlertDialogTitle>
            <AlertDialogDescription>
              Voce tem certeza que deseja resetar o teste de {mergedCandidate.name}?
              O candidato precisara refazer o teste Gauge-Pro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetTest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Resetar Teste
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Notification Modal */}
      <Dialog open={notifyModalOpen} onOpenChange={setNotifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Notificacao</DialogTitle>
            <DialogDescription>
              Enviar notificacao para: {mergedCandidate.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notificationMessage">Mensagem</Label>
              <Textarea
                id="notificationMessage"
                placeholder="Escreva a mensagem da notificacao..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                maxLength={500}
                className="resize-none"
                rows={5}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notificationMessage.length}/500 caracteres
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={!notificationMessage.trim()}
            >
              <Bell className="w-4 h-4 mr-2" />
              Enviar Notificacao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** KPI metric card */
interface KPICardProps {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  iconColor: string;
  bgColor: string;
}

function KPICard({ icon: Icon, label, value, iconColor, bgColor }: KPICardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', bgColor)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}

/** Label + Value pair for read-only info */
interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-0.5 text-sm text-foreground">{value}</div>
    </div>
  );
}
