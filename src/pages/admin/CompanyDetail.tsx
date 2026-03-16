/**
 * Admin Company Detail Page
 * PRD-020: Detalhe da empresa com abas de visao geral, cadastro, assinatura, vagas, equipe e historico
 */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  LayoutDashboard,
  CreditCard,
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  UserCheck,
  MapPin,
  Globe,
  Linkedin,
  Phone,
  Power,
  PowerOff,
  Bell,
  Loader2,
  ExternalLink,
  Mail,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  FileEdit,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCompany } from '@/hooks/useCompaniesQuery';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { useModeration } from '@/hooks/useModeration';
import { useCompanyUsers, useCompanyInvites } from '@/hooks/useCompanyInvitesQuery';
import { ModerationActions } from '@/components/admin/jobs/ModerationActions';
import { usePlans } from '@/hooks/usePlans';
import { formatRelativeDate, formatDateBR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSendManualNotification } from '@/hooks/useNotificationSendsQuery';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { AdminAction, Company } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  active: {
    label: 'Ativa',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  inactive: {
    label: 'Inativa',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

const PAYMENT_STATUS_CONFIG = {
  ok: {
    label: 'Em dia',
    icon: CheckCircle2,
    color: 'text-success',
    borderColor: 'border-success/30',
  },
  pending: {
    label: 'Pagamento pendente',
    icon: Clock,
    color: 'text-warning',
    borderColor: 'border-warning/30',
  },
  overdue: {
    label: 'Pagamento atrasado',
    icon: XCircle,
    color: 'text-destructive',
    borderColor: 'border-destructive/30',
  },
};

const ACTION_ICON_CONFIG: Record<
  AdminAction['action'],
  { icon: typeof Power; colorClass: string }
> = {
  activated: { icon: Power, colorClass: 'text-success' },
  deactivated: { icon: PowerOff, colorClass: 'text-destructive' },
  plan_changed: { icon: CreditCard, colorClass: 'text-primary' },
  notification_sent: { icon: Bell, colorClass: 'text-warning' },
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

function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '---';
  const stripped = cnpj.replace(/\D/g, '');
  if (stripped.length !== 14) return cnpj;
  return stripped.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdminCompanyDetail() {
  const { id } = useParams<{ id: string }>();

  // Data hooks
  const { data: company, isLoading: isLoadingCompany } = useCompany(id || '');
  const { jobs: allAdminJobs, approveJob, rejectJob, requestCorrection } = useAdminJobs();
  const { config: moderationConfig } = useModeration();
  const { data: companyUsers, isLoading: isLoadingUsers } = useCompanyUsers(id);
  const { data: companyInvites, isLoading: isLoadingInvites } = useCompanyInvites(id);
  const { companyPlans } = usePlans();

  const PLANS = companyPlans.filter((p) => p.isActive).map((p) => p.name);

  // Local state for company overrides (status/plan changes)
  const [localCompanyOverrides, setLocalCompanyOverrides] = useState<Partial<Company>>({});

  // Merge company data with local overrides
  const mergedCompany = useMemo(() => {
    if (!company) return null;
    return { ...company, ...localCompanyOverrides } as Company;
  }, [company, localCompanyOverrides]);

  // Filter jobs for this company (using AdminJob data with moderation fields)
  const companyJobs = useMemo(() => {
    if (!id) return [];
    return allAdminJobs.filter((job) => job.companyId === id);
  }, [allAdminJobs, id]);

  const pendingCount = useMemo(
    () => companyJobs.filter((j) => j.moderationStatus === 'pending').length,
    [companyJobs],
  );

  // Admin actions (local state, same pattern as Companies.tsx)
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);

  // Modal state
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  // Form state
  const [deactivateReason, setDeactivateReason] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const sendNotificationMutation = useSendManualNotification();

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  const handleDeactivate = () => {
    if (!mergedCompany) return;

    setLocalCompanyOverrides((prev) => ({
      ...prev,
      status: 'inactive',
      deactivatedAt: new Date().toISOString(),
    }));

    const newAction: AdminAction = {
      id: `action-${Date.now()}`,
      companyId: mergedCompany.id,
      companyName: mergedCompany.name,
      action: 'deactivated',
      performedBy: 'Voce',
      performedAt: new Date().toISOString(),
      details: deactivateReason || 'Empresa desativada',
    };
    setAdminActions((prev) => [newAction, ...prev]);

    toast.success(`Empresa ${mergedCompany.name} desativada`);
    setDeactivateDialogOpen(false);
    setDeactivateReason('');
  };

  const handleReactivate = () => {
    if (!mergedCompany) return;

    setLocalCompanyOverrides((prev) => ({
      ...prev,
      status: 'active',
      deactivatedAt: undefined,
    }));

    const newAction: AdminAction = {
      id: `action-${Date.now()}`,
      companyId: mergedCompany.id,
      companyName: mergedCompany.name,
      action: 'activated',
      performedBy: 'Voce',
      performedAt: new Date().toISOString(),
      details: 'Empresa reativada',
    };
    setAdminActions((prev) => [newAction, ...prev]);

    toast.success(`Empresa ${mergedCompany.name} reativada`);
    setReactivateDialogOpen(false);
  };

  const handleChangePlan = () => {
    if (!mergedCompany || newPlan === mergedCompany.plan) return;

    const oldPlan = mergedCompany.plan;

    setLocalCompanyOverrides((prev) => ({
      ...prev,
      plan: newPlan,
    }));

    const newAction: AdminAction = {
      id: `action-${Date.now()}`,
      companyId: mergedCompany.id,
      companyName: mergedCompany.name,
      action: 'plan_changed',
      performedBy: 'Voce',
      performedAt: new Date().toISOString(),
      details: `Plano alterado de ${oldPlan} para ${newPlan}`,
      previousValue: oldPlan,
      newValue: newPlan,
    };
    setAdminActions((prev) => [newAction, ...prev]);

    toast.success(`Plano alterado para ${newPlan}`);
    setChangePlanModalOpen(false);
    setNewPlan('');
  };

  const handleSendNotification = async () => {
    if (!mergedCompany || !notificationTitle.trim() || !notificationMessage.trim()) return;

    try {
      await sendNotificationMutation.mutateAsync({
        title: notificationTitle.trim(),
        description: notificationMessage.trim(),
        category: 'informativo',
        priority: 'media',
        targetType: 'specific_user',
        targetUserId: mergedCompany.userId,
      });

      const newAction: AdminAction = {
        id: `action-${Date.now()}`,
        companyId: mergedCompany.id,
        companyName: mergedCompany.name,
        action: 'notification_sent',
        performedBy: 'Voce',
        performedAt: new Date().toISOString(),
        details: `Notificação enviada: ${notificationTitle.trim()}`,
      };
      setAdminActions((prev) => [newAction, ...prev]);

      setNotifyModalOpen(false);
      setNotificationTitle('');
      setNotificationMessage('');
    } catch {
      // toast de erro ja tratado pelo hook
    }
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoadingCompany) {
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

  if (!mergedCompany) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">Empresa nao encontrada.</p>
          <Link to="/admin/empresas" className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Empresas
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const statusConfig = STATUS_CONFIG[mergedCompany.status];
  const StatusIcon = statusConfig.icon;

  const paymentStatus = mergedCompany.paymentStatus ?? 'ok';
  const paymentConfig = PAYMENT_STATUS_CONFIG[paymentStatus];
  const PaymentIcon = paymentConfig.icon;

  const daysOnPlatform = calculateDaysOnPlatform(mergedCompany.createdAt);
  const pendingInvites = (companyInvites ?? []).filter((inv) => {
    const status = dualGet<string>(inv as unknown as Record<string, unknown>, 'status', 'status');
    return status === 'pending';
  });

  // Sorted admin actions
  const sortedActions = [...adminActions].sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Back link */}
        <Link
          to="/admin/empresas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para empresas
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-start gap-4"
        >
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            {mergedCompany.logo ? (
              <img
                src={mergedCompany.logo}
                alt={`Logo da ${mergedCompany.name}`}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Building2 className="w-8 h-8 text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {mergedCompany.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn(statusConfig.bgColor, statusConfig.color)}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(paymentConfig.color, paymentConfig.borderColor)}
                >
                  <PaymentIcon className="w-3 h-3 mr-1" />
                  {paymentConfig.label}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              CNPJ: {formatCNPJ(mergedCompany.cnpj)}
            </p>
            <p className="text-sm text-muted-foreground">
              {[mergedCompany.industry, mergedCompany.size, mergedCompany.city && mergedCompany.state ? `${mergedCompany.city}/${mergedCompany.state}` : mergedCompany.location]
                .filter(Boolean)
                .join(' | ')}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to={`/admin/usuarios/${mergedCompany.userId}`}>
              <Button variant="outline" size="sm">
                <ShieldCheck className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Permissões</span>
                <span className="sm:hidden">Perm.</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotifyModalOpen(true)}
            >
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Enviar Notificação</span>
              <span className="sm:hidden">Notificar</span>
            </Button>
            {mergedCompany.status === 'active' || mergedCompany.status === 'pending' ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeactivateDialogOpen(true)}
              >
                <PowerOff className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Desativar</span>
                <span className="sm:hidden">Desativar</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setReactivateDialogOpen(true)}
              >
                <Power className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Reativar</span>
                <span className="sm:hidden">Reativar</span>
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
            <TabsTrigger value="cadastro" className="gap-1.5">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Cadastro</span>
            </TabsTrigger>
            <TabsTrigger value="assinatura" className="gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Assinatura</span>
            </TabsTrigger>
            <TabsTrigger value="vagas" className="gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Vagas</span>
            </TabsTrigger>
            <TabsTrigger value="equipe" className="gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Equipe</span>
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
                  label="Vagas Ativas"
                  value={companyJobs.filter((j) => j.status === 'active').length}
                  iconColor="text-blue-500"
                  bgColor="bg-blue-500/10"
                />
                <KPICard
                  icon={Users}
                  label="Total Candidaturas"
                  value={companyJobs.reduce((sum, j) => sum + j.applicationsCount, 0)}
                  iconColor="text-emerald-500"
                  bgColor="bg-emerald-500/10"
                />
                <KPICard
                  icon={UserCheck}
                  label="Membros da Equipe"
                  value={companyUsers?.length ?? 0}
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
                    <InfoItem label="Plano Atual" value={mergedCompany.plan || '---'} />
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
                      label="Pagamento"
                      value={
                        <Badge
                          variant="outline"
                          className={cn(paymentConfig.color, paymentConfig.borderColor, 'text-xs')}
                        >
                          <PaymentIcon className="w-3 h-3 mr-1" />
                          {paymentConfig.label}
                        </Badge>
                      }
                    />
                    <InfoItem
                      label="Data de Cadastro"
                      value={formatDateBR(mergedCompany.createdAt)}
                    />
                    <InfoItem label="Setor" value={mergedCompany.industry || '---'} />
                    <InfoItem label="Porte" value={mergedCompany.size || '---'} />
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contato</h3>
                  <div className="space-y-3 text-sm">
                    {mergedCompany.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{mergedCompany.phone}</span>
                      </div>
                    )}
                    {mergedCompany.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        <a
                          href={mergedCompany.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline inline-flex items-center gap-1 truncate"
                        >
                          {mergedCompany.website}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {mergedCompany.linkedin && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <a
                          href={mergedCompany.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline inline-flex items-center gap-1 truncate"
                        >
                          {mergedCompany.linkedin}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {(mergedCompany.address || (mergedCompany.city && mergedCompany.state)) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-foreground">
                          {mergedCompany.address || `${mergedCompany.city}/${mergedCompany.state}`}
                        </span>
                      </div>
                    )}
                    {!mergedCompany.phone && !mergedCompany.website && !mergedCompany.linkedin && !mergedCompany.address && !mergedCompany.city && (
                      <p className="text-muted-foreground italic">
                        Nenhuma informacao de contato cadastrada.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 2: Cadastro
              ================================================================ */}
          <TabsContent value="cadastro">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Dados da Empresa */}
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Dados da Empresa</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <InfoItem
                    label="Razao Social"
                    value={dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'razaoSocial', 'razao_social') || '---'}
                  />
                  <InfoItem
                    label="Nome Fantasia"
                    value={dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'nomeFantasia', 'nome_fantasia') || '---'}
                  />
                  <InfoItem label="CNPJ" value={formatCNPJ(mergedCompany.cnpj)} />
                  <InfoItem
                    label="Situacao Cadastral"
                    value={
                      (dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'situacaoCadastral', 'situacao_cadastral')) ? (
                        <Badge variant="outline" className="text-xs">
                          {dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'situacaoCadastral', 'situacao_cadastral')}
                        </Badge>
                      ) : (
                        '---'
                      )
                    }
                  />
                  <InfoItem label="Setor" value={mergedCompany.industry || '---'} />
                  <InfoItem label="Porte" value={mergedCompany.size || '---'} />
                </div>
                {mergedCompany.description && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Descricao</span>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                        {mergedCompany.description}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Endereco */}
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Endereco</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <InfoItem
                    label="CEP"
                    value={dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'cep', 'cep') || '---'}
                  />
                  <InfoItem
                    label="Logradouro"
                    value={
                      [
                        dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'logradouro', 'logradouro'),
                        dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'numero', 'numero'),
                      ]
                        .filter(Boolean)
                        .join(', ') || '---'
                    }
                  />
                  <InfoItem
                    label="Complemento"
                    value={dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'complemento', 'complemento') || '---'}
                  />
                  <InfoItem
                    label="Bairro"
                    value={dualGet<string>(mergedCompany as unknown as Record<string, unknown>, 'bairro', 'bairro') || '---'}
                  />
                  <InfoItem
                    label="Cidade / Estado"
                    value={
                      mergedCompany.city && mergedCompany.state
                        ? `${mergedCompany.city} / ${mergedCompany.state}`
                        : mergedCompany.address || '---'
                    }
                  />
                </div>
              </div>

              {/* Contato & Links */}
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Contato & Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Telefone" value={mergedCompany.phone || '---'} />
                  <InfoItem
                    label="Website"
                    value={
                      mergedCompany.website ? (
                        <a
                          href={mergedCompany.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline inline-flex items-center gap-1"
                        >
                          {mergedCompany.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        '---'
                      )
                    }
                  />
                  <InfoItem
                    label="LinkedIn"
                    value={
                      mergedCompany.linkedin ? (
                        <a
                          href={mergedCompany.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline inline-flex items-center gap-1"
                        >
                          {mergedCompany.linkedin}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        '---'
                      )
                    }
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 3: Assinatura
              ================================================================ */}
          <TabsContent value="assinatura">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Plano Atual</h3>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold text-foreground">
                        {mergedCompany.plan || 'Sem plano'}
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={cn(paymentConfig.color, paymentConfig.borderColor)}
                        >
                          <PaymentIcon className="w-3 h-3 mr-1" />
                          {paymentConfig.label}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewPlan(mergedCompany.plan || '');
                        setChangePlanModalOpen(true);
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Alterar Plano
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 4: Vagas (com controles de moderacao)
              ================================================================ */}
          <TabsContent value="vagas">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Vagas da Empresa</h3>
                  <div className="flex items-center gap-2">
                    {pendingCount > 0 && (
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-700 dark:text-yellow-400">
                        <ShieldQuestion className="w-3 h-3 mr-1" />
                        {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    <Badge variant="secondary">{companyJobs.length}</Badge>
                  </div>
                </div>

                {companyJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhuma vaga cadastrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {companyJobs.map((job) => {
                      const modStatus = job.moderationStatus;

                      return (
                        <div
                          key={job.id}
                          className={cn(
                            'p-4 rounded-lg border transition-colors',
                            modStatus === 'pending'
                              ? 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-500/5 dark:border-yellow-500/20'
                              : 'bg-muted/30 hover:bg-muted/50',
                          )}
                        >
                          {/* Row 1: Title + Badges */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">{job.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {[job.area, job.location].filter(Boolean).join(' | ')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              <span className="text-sm text-muted-foreground">
                                {job.applicationsCount} candidatura{job.applicationsCount !== 1 ? 's' : ''}
                              </span>
                              <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                                {job.status === 'active' ? 'Ativa' : job.status === 'paused' ? 'Pausada' : job.status === 'rejected' ? 'Rejeitada' : 'Encerrada'}
                              </Badge>
                              <ModerationBadge status={modStatus} />
                            </div>
                          </div>

                          {/* Row 2: Moderation actions (only for pending) + detail link */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                            {modStatus === 'pending' ? (
                              <ModerationActions
                                job={job}
                                onApprove={approveJob}
                                onReject={rejectJob}
                                onRequestCorrection={requestCorrection}
                                reasons={moderationConfig.rejectionReasons}
                              />
                            ) : (
                              <div />
                            )}
                            <Link
                              to={`/admin/vagas/${job.id}`}
                              className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline shrink-0"
                            >
                              <Eye className="w-4 h-4" />
                              Ver detalhes
                            </Link>
                          </div>

                          {/* Rejection reason / correction fields info */}
                          {modStatus === 'rejected' && job.rejectionReason && (
                            <p className="mt-2 text-xs text-destructive">
                              Motivo: {job.rejectionReason}
                            </p>
                          )}
                          {modStatus === 'correction_requested' && job.correctionFields && (
                            <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-400">
                              Campos a corrigir: {job.correctionFields.join(', ')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* ================================================================
              Tab 5: Equipe
              ================================================================ */}
          <TabsContent value="equipe">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Members */}
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Membros da Equipe</h3>
                  <Badge variant="secondary">{companyUsers?.length ?? 0}</Badge>
                </div>

                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !companyUsers || companyUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhum membro na equipe</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {companyUsers.map((member) => {
                      const memberName = dualGet<string>(member as unknown as Record<string, unknown>, 'name', 'name') || 'Sem nome';
                      const memberEmail = dualGet<string>(member as unknown as Record<string, unknown>, 'email', 'email') || '';
                      const memberRole = dualGet<string>(member as unknown as Record<string, unknown>, 'role', 'role') || 'member';
                      const memberLastAccess = dualGet<string | null>(member as unknown as Record<string, unknown>, 'lastAccessAt', 'last_access_at');
                      const memberAvatar = dualGet<string | null>(member as unknown as Record<string, unknown>, 'avatarUrl', 'avatar_url');

                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                        >
                          <Avatar className="h-9 w-9 shrink-0">
                            {memberAvatar ? (
                              <img src={memberAvatar} alt="" className="h-full w-full object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(memberName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{memberName}</p>
                            <p className="text-xs text-muted-foreground truncate">{memberEmail}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs shrink-0',
                              memberRole === 'admin'
                                ? 'border-primary/30 text-primary'
                                : 'border-muted-foreground/30 text-muted-foreground',
                            )}
                          >
                            {memberRole === 'admin' ? 'Admin' : 'Membro'}
                          </Badge>
                          <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                            {memberLastAccess ? formatRelativeDate(memberLastAccess) : 'Nunca acessou'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pending invites */}
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Convites Pendentes</h3>
                  <Badge variant="secondary">{pendingInvites.length}</Badge>
                </div>

                {isLoadingInvites ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingInvites.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhum convite pendente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => {
                      const inviteEmail = invite.email;
                      const inviteRole = invite.role || 'member';
                      const inviteCreatedAt = dualGet<string>(invite as unknown as Record<string, unknown>, 'createdAt', 'created_at');

                      return (
                        <div
                          key={invite.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                        >
                          <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-warning" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{inviteEmail}</p>
                            {inviteCreatedAt && (
                              <p className="text-xs text-muted-foreground">
                                Enviado {formatRelativeDate(inviteCreatedAt)}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs shrink-0',
                              inviteRole === 'admin'
                                ? 'border-primary/30 text-primary'
                                : 'border-muted-foreground/30 text-muted-foreground',
                            )}
                          >
                            {inviteRole === 'admin' ? 'Admin' : 'Membro'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0 border-warning/30 text-warning"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
                Acoes administrativas realizadas nesta empresa.
              </p>

              {sortedActions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
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
                                  : action.action === 'plan_changed'
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
                            {action.previousValue && action.newValue && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {action.previousValue} → {action.newValue}
                              </p>
                            )}
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
            <AlertDialogTitle>Desativar empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Voce tem certeza que deseja desativar {mergedCompany.name}?
              Esta acao pausara todas as vagas ativas.
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
            <AlertDialogTitle>Reativar empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Voce tem certeza que deseja reativar {mergedCompany.name}?
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

      {/* Change Plan Modal */}
      <Dialog open={changePlanModalOpen} onOpenChange={setChangePlanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Empresa: {mergedCompany.name} | Plano atual: {mergedCompany.plan}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPlan">Novo plano</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger id="newPlan">
                  <SelectValue placeholder="Selecione o novo plano" />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan} disabled={!newPlan || newPlan === mergedCompany.plan}>
              <CreditCard className="w-4 h-4 mr-2" />
              Confirmar Alteracao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Modal */}
      <Dialog open={notifyModalOpen} onOpenChange={setNotifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Notificacao</DialogTitle>
            <DialogDescription>
              Enviar notificacao para: {mergedCompany.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notificationTitle">Título</Label>
              <Input
                id="notificationTitle"
                placeholder="Título da notificação"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notificationMessage">Mensagem</Label>
              <Textarea
                id="notificationMessage"
                placeholder="Escreva a mensagem da notificação..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                maxLength={500}
                className="resize-none"
                rows={4}
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
              disabled={!notificationTitle.trim() || !notificationMessage.trim() || sendNotificationMutation.isPending}
            >
              <Bell className="w-4 h-4 mr-2" />
              Enviar Notificação
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
  value: number;
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

/** Moderation status badge */
const MODERATION_BADGE_CONFIG: Record<string, { label: string; icon: typeof ShieldCheck; className: string }> = {
  approved: { label: 'Aprovada', icon: ShieldCheck, className: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400' },
  pending: { label: 'Pendente', icon: ShieldQuestion, className: 'border-yellow-500/30 text-yellow-700 dark:text-yellow-400' },
  rejected: { label: 'Rejeitada', icon: ShieldAlert, className: 'border-destructive/30 text-destructive' },
  correction_requested: { label: 'Correcao', icon: FileEdit, className: 'border-orange-500/30 text-orange-700 dark:text-orange-400' },
};

function ModerationBadge({ status }: { status: string }) {
  const config = MODERATION_BADGE_CONFIG[status] ?? MODERATION_BADGE_CONFIG.pending;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('text-xs', config.className)}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
