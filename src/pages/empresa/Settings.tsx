/**
 * Company Settings Page
 * PRD-018: Configurações da Empresa
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Shield,
  Bell,
  AlertTriangle,
  UserPlus,
  Mail,
  MoreHorizontal,
  Check,
  Star,
  Users,
  CreditCard,
  Heart,
  Fingerprint,
  Copy,
  Loader2,
  FileText,
  Lock,
  Phone,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CompanyNotificationPreferences, CompanyUser, TeamMemberRole } from '@/types/company';
import { usePlans, useSubscription } from '@/hooks/usePlansQuery';
import { formatBRL } from '@/lib/formatters';
import {
  useCompanyUsers,
  useCompanyInvites,
  useInviteMember,
  useResendInvite,
  useCancelInvite,
  useRemoveMember,
  useUpdateMemberRole,
} from '@/hooks/useCompanyInvitesQuery';

import { useUpdateCompany } from '@/hooks/useCompaniesQuery';
import { supabase } from '@/lib/supabase';
import { formatCNPJ } from '@/lib/cnpj';
import { useCulturalFit } from '@/hooks/useCulturalFit';
import { CultureProfileForm } from '@/components/cultural';

// Constants
const INDUSTRY_OPTIONS = [
  'Agronegócio',
  'Comércio',
  'Consultoria',
  'Educação',
  'E-commerce',
  'Fintech',
  'Indústria',
  'Logística',
  'Marketing Digital',
  'Mercado Financeiro',
  'Saúde',
  'Serviços',
  'Setor Público',
  'Tecnologia',
  'Outro',
];

const SIZE_OPTIONS = [
  '1-10 funcionários',
  '11-50 funcionários',
  '51-200 funcionários',
  '201-500 funcionários',
  '501-1000 funcionários',
  '1000+ funcionários',
];

// Plan data is now fetched dynamically via usePlans hook (PRD-075 fix)

const companyFaq = [
  {
    question: 'Posso cancelar a assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. O acesso continuará até o fim do período pago.',
  },
  {
    question: 'Existe desconto para pagamento anual?',
    answer: 'Sim, oferecemos 20% de desconto para planos anuais. Entre em contato com nosso time comercial.',
  },
  {
    question: 'Como funciona o plano premium?',
    answer: 'O plano de nível mais alto inclui API de integração, suporte dedicado com SLA, relatórios personalizados e onboarding assistido.',
  },
  {
    question: 'Posso adicionar mais usuários ao meu plano?',
    answer: 'Nos planos mais avançados, você pode adicionar usuários extras. Consulte os detalhes de cada plano para saber os limites.',
  },
];

export default function CompanySettings() {
  const { user, logout, currentCompany, companyRole, refreshCurrentCompany } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'perfil';
  const companyId = currentCompany?.id ?? '';

  // Company profile state
  const [companyProfile, setCompanyProfile] = useState({
    name: currentCompany?.name ?? '',
    industry: currentCompany?.industry ?? '',
    size: currentCompany?.size ?? '',
    website: currentCompany?.website || '',
    linkedin: currentCompany?.linkedin || '',
    description: currentCompany?.description ?? '',
    city: currentCompany?.city ?? '',
    state: currentCompany?.state ?? '',
    address: currentCompany?.address || '',
    phone: currentCompany?.phone || '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(currentCompany?.logo || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const updateCompanyMutation = useUpdateCompany();

  // Team state (real Supabase data)
  const { data: companyUsers = [], isLoading: isLoadingUsers } = useCompanyUsers(companyId || undefined);
  const { data: companyInvitesList = [], isLoading: isLoadingInvites } = useCompanyInvites(companyId || undefined);
  const inviteMemberMutation = useInviteMember(companyId || undefined);
  const resendInviteMutation = useResendInvite(companyId || undefined);
  const cancelInviteMutation = useCancelInvite(companyId || undefined);
  const removeMemberMutation = useRemoveMember(companyId || undefined);
  const updateRoleMutation = useUpdateMemberRole(companyId || undefined);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>('member');

  // Account state
  const [notifications, setNotifications] = useState<CompanyNotificationPreferences>({
    newApplications: true,
    messages: true,
    testsCompleted: true,
    weeklyDigest: false,
  });

  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CompanyUser | null>(null);

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  // Plan data — fetched dynamically from Supabase (PRD-075)
  const { data: companyPlans = [] } = usePlans('company');
  const { data: currentSubscription } = useSubscription(user?.id);

  // PRD-042: Cultural Fit
  const {
    formProfile: culturalFormProfile,
    setFormDimension: setCulturalDimension,
    updateCompanyValues: setCulturalValues,
    updateCompanyDescription: setCulturalDescription,
    saveCompanyProfile: saveCulturalProfile,
    resetForm: resetCulturalForm,
    isModified: isCulturalModified,
    companyProfile: culturalCompanyProfile,
    formValues: culturalValues,
    formDescription: culturalDescription,
    isSaving: isSavingCulture,
  } = useCulturalFit({ companyId });

  // Handle logo change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!currentCompany || !user) return;
    setIsSaving(true);
    try {
      let logoUrl = currentCompany.logo;

      // Upload logo se arquivo novo foi selecionado
      if (logoFile) {
        const ext = logoFile.name.split('.').pop() || 'png';
        const fileName = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, logoFile, {
            upsert: true,
            contentType: logoFile.type,
          });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      // Salvar todos os campos do perfil
      await updateCompanyMutation.mutateAsync({
        id: currentCompany.id,
        updates: {
          name: companyProfile.name,
          industry: companyProfile.industry,
          size: companyProfile.size,
          website: companyProfile.website,
          linkedin: companyProfile.linkedin,
          description: companyProfile.description,
          city: companyProfile.city,
          state: companyProfile.state,
          address: companyProfile.address,
          phone: companyProfile.phone,
          logo: logoUrl,
        },
      });

      await refreshCurrentCompany();
      setLogoFile(null);
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle invite member
  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }
    try {
      const result = await inviteMemberMutation.mutateAsync({ email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar convite');
    }
  };

  // Handle resend invite
  const handleResendInvite = async (inviteId: string) => {
    try {
      const result = await resendInviteMutation.mutateAsync(inviteId);
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao reenviar convite');
    }
  };

  // Handle cancel invite
  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInviteMutation.mutateAsync(inviteId);
      toast.success('Convite cancelado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cancelar convite');
    }
  };

  // Handle remove member
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMemberMutation.mutateAsync(memberToRemove.profileId);
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
      toast.success('Membro removido da equipe');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover membro');
    }
  };

  // Handle role change
  const handleRoleChange = async (member: CompanyUser, newRole: TeamMemberRole) => {
    try {
      await updateRoleMutation.mutateAsync({ profileId: member.profileId, role: newRole });
      toast.success(`Cargo de ${member.name} atualizado para ${newRole === 'admin' ? 'Admin' : 'Membro'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar cargo');
    }
  };

  // Handle notification change
  const handleNotificationChange = (key: keyof CompanyNotificationPreferences, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: checked }));
    toast.success('Preferências salvas');
  };

  // Handle change email
  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }
    setChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setShowEmailModal(false);
      setNewEmail('');
      toast.success('Email de confirmação enviado para o novo endereço');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar email');
    } finally {
      setChangingEmail(false);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    setChangingPassword(true);
    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '',
        password: passwordForm.currentPassword,
      });
      if (signInError) {
        toast.error('Senha atual incorreta');
        return;
      }
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (updateError) throw updateError;
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Senha alterada com sucesso');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle deactivate account (mock)
  const handleDeactivateAccount = () => {
    setShowDeactivateModal(false);
    logout();
    navigate('/');
    toast.success('Conta da empresa desativada. Vagas pausadas automaticamente.');
  };

  // PRD-042: Handle save cultural profile
  const handleSaveCulturalProfile = async () => {
    try {
      await saveCulturalProfile();
      toast.success('Perfil cultural salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil cultural:', error);
      toast.error('Erro ao salvar perfil cultural. Tente novamente.');
    }
  };

  // Notification options
  const notificationOptions = [
    { key: 'newApplications' as const, label: 'Novas candidaturas' },
    { key: 'messages' as const, label: 'Mensagens de candidatos' },
    { key: 'testsCompleted' as const, label: 'Testes realizados' },
    { key: 'weeklyDigest' as const, label: 'Resumo semanal' },
  ];

  return (
    <DashboardLayout userType="company">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie seu perfil, equipe e preferências</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="cultura" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Cultura</span>
            </TabsTrigger>
            <TabsTrigger value="equipe" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Equipe</span>
            </TabsTrigger>
            <TabsTrigger value="conta" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="plano" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Plano</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perfil da Empresa */}
          <TabsContent value="perfil" className="space-y-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Logo da Empresa</CardTitle>
                <CardDescription>Exibido nas vagas e mensagens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="max-w-[250px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 200x200px, PNG ou JPG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados Cadastrais (Receita Federal) */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>Dados Cadastrais</CardTitle>
                    <CardDescription>
                      Informações oficiais da Receita Federal — preenchidas automaticamente durante o cadastro
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentCompany?.cnpj ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">CNPJ</p>
                        <p className="mt-0.5 text-sm text-foreground font-mono">
                          {formatCNPJ(currentCompany.cnpj)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Situação Cadastral
                        </p>
                        <div className="mt-0.5">
                          {currentCompany.situacaoCadastral ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                currentCompany.situacaoCadastral.toUpperCase() === 'ATIVA'
                                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
                                  : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400'
                              )}
                            >
                              {currentCompany.situacaoCadastral}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Não informado</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Razão Social</p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {currentCompany.razaoSocial || 'Não informado'}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Nome Fantasia</p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {currentCompany.nomeFantasia || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Endereço Registrado
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">CEP</p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {currentCompany.cep || 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Bairro</p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {currentCompany.bairro || 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Logradouro</p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {[currentCompany.logradouro, currentCompany.numero].filter(Boolean).join(', ') || 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Complemento</p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {currentCompany.complemento || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Dados obtidos da Receita Federal durante o cadastro. Para correções, atualize o cadastro no portal da Receita.
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Dados cadastrais não disponíveis. Esses dados são preenchidos automaticamente ao cadastrar a empresa com CNPJ.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>Contato</CardTitle>
                    <CardDescription>Informações de contato da empresa</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <p className="text-sm text-foreground py-2">
                      {user?.email || 'Não informado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Para alterar o email, acesse a aba <span className="font-medium text-foreground">Conta</span>.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(XX) XXXXX-XXXX"
                      value={companyProfile.phone}
                      onChange={e => setCompanyProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://exemplo.com.br"
                      value={companyProfile.website}
                      onChange={e => setCompanyProfile(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      value={companyProfile.linkedin}
                      onChange={e => setCompanyProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Perfil da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Perfil da Empresa</CardTitle>
                <CardDescription>Informações que aparecem para os candidatos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Setor de Atuação *</Label>
                    <Select
                      value={companyProfile.industry}
                      onValueChange={value => setCompanyProfile(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRY_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Tamanho da Empresa *</Label>
                    <Select
                      value={companyProfile.size}
                      onValueChange={value => setCompanyProfile(prev => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger id="size">
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="description">Sobre a Empresa *</Label>
                  <Textarea
                    id="description"
                    value={companyProfile.description}
                    onChange={e => setCompanyProfile(prev => ({ ...prev, description: e.target.value }))}
                    rows={5}
                    maxLength={1000}
                    placeholder="Conte sobre a história, cultura e valores da empresa..."
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {companyProfile.description.length}/1000 caracteres
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveProfile} className="w-full sm:w-auto" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar alterações
            </Button>
          </TabsContent>

          {/* Tab: Cultura (PRD-042) */}
          <TabsContent value="cultura" className="space-y-6">
            <CultureProfileForm
              profile={culturalFormProfile}
              values={culturalValues}
              description={culturalDescription}
              onDimensionChange={setCulturalDimension}
              onValuesChange={setCulturalValues}
              onDescriptionChange={setCulturalDescription}
              onSave={handleSaveCulturalProfile}
              onReset={resetCulturalForm}
              isModified={isCulturalModified}
            />
          </TabsContent>

          {/* Tab: Equipe */}
          <TabsContent value="equipe" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Equipe</CardTitle>
                  <CardDescription>Gerencie quem tem acesso à conta da empresa</CardDescription>
                </div>
                {companyRole === 'admin' && (
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar membro
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Members */}
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  companyUsers.map(member => {
                    const isCurrentUser = member.profileId === user?.id;
                    const initials = member.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    const lastAccess = member.lastAccessAt
                      ? new Date(member.lastAccessAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : null;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {member.avatarUrl && <AvatarImage src={member.avatarUrl} />}
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            {lastAccess && (
                              <p className="text-xs text-muted-foreground">
                                Último acesso: {lastAccess}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role === 'admin' ? 'Admin' : 'Membro'}
                          </Badge>
                          {isCurrentUser ? (
                            <Badge variant="outline">Você</Badge>
                          ) : companyRole === 'admin' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(
                                      member,
                                      member.role === 'admin' ? 'member' : 'admin'
                                    )
                                  }
                                >
                                  {member.role === 'admin'
                                    ? 'Rebaixar para Membro'
                                    : 'Promover a Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setMemberToRemove(member);
                                    setShowRemoveMemberModal(true);
                                  }}
                                >
                                  Remover membro
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Pending Invites */}
                {!isLoadingInvites && companyInvitesList.length > 0 && (
                  <>
                    <Separator />
                    <p className="text-sm font-medium text-foreground">Convites pendentes</p>
                    {companyInvitesList.map(invite => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{invite.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Enviado em:{' '}
                              {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {invite.role === 'admin' ? 'Admin' : 'Membro'}
                            </Badge>
                          </div>
                        </div>
                        {companyRole === 'admin' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={resendInviteMutation.isPending}
                              onClick={() => handleResendInvite(invite.id)}
                            >
                              {resendInviteMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Reenviar'
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={cancelInviteMutation.isPending}
                              onClick={() => handleCancelInvite(invite.id)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Conta */}
          <TabsContent value="conta" className="space-y-6">
            {/* Informações da Conta */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Fingerprint className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>Informações da Conta</CardTitle>
                    <CardDescription>Identificador único e dados da sua conta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">ID da Empresa</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{currentCompany?.id || '—'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-3 shrink-0"
                    onClick={() => {
                      if (currentCompany?.id) {
                        navigator.clipboard.writeText(currentCompany.id);
                        toast.success('ID copiado para a área de transferência');
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                </div>
                {currentCompany?.createdAt && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Membro desde</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(currentCompany.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || 'rh@techsolutions.com'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowEmailModal(true)}>
                    Alterar email
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Senha</p>
                    <p className="text-sm text-muted-foreground">••••••••</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                    Alterar senha
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações por email
                </CardTitle>
                <CardDescription>Escolha quais notificações você deseja receber</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationOptions.map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label htmlFor={item.key} className="text-foreground cursor-pointer">
                      {item.label}
                    </Label>
                    <Switch
                      id={item.key}
                      checked={notifications[item.key]}
                      onCheckedChange={checked => handleNotificationChange(item.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Zona de Perigo */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Zona de Perigo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Desativar conta da empresa</p>
                    <p className="text-sm text-muted-foreground">
                      Todas as vagas serão pausadas. Pode ser reativada a qualquer momento.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeactivateModal(true)}>
                    Desativar conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Aparência (PRD-029) */}
          <TabsContent value="aparencia" className="space-y-6">
            <ThemeSettings />
          </TabsContent>

          {/* Tab: Plano */}
          <TabsContent value="plano" className="space-y-6">
            {/* Plano atual — dados dinamicos via Supabase */}
            {currentSubscription ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Plano {(currentSubscription as Record<string, unknown>).plan_name as string ?? (currentSubscription as Record<string, unknown>).planName as string ?? '—'}</CardTitle>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {formatBRL((currentSubscription as Record<string, unknown>).price_paid as number ?? (currentSubscription as Record<string, unknown>).pricePaid as number ?? 0)}/mês
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={(currentSubscription as Record<string, unknown>).status === 'active' ? 'default' : 'outline'}>
                      {(currentSubscription as Record<string, unknown>).status === 'active' ? 'Ativa' :
                       (currentSubscription as Record<string, unknown>).status === 'trial' ? 'Trial' :
                       (currentSubscription as Record<string, unknown>).status === 'past_due' ? 'Pagamento Pendente' :
                       String((currentSubscription as Record<string, unknown>).status ?? '')}
                    </Badge>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    Renovacao: {(currentSubscription as Record<string, unknown>).renewal_date
                      ? new Date(String((currentSubscription as Record<string, unknown>).renewal_date)).toLocaleDateString('pt-BR')
                      : (currentSubscription as Record<string, unknown>).renewalDate
                      ? new Date(String((currentSubscription as Record<string, unknown>).renewalDate)).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sem assinatura ativa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Escolha um plano abaixo para comecar.</p>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Todos os Planos — dados dinamicos via usePlans */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Todos os Planos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {companyPlans.map((p) => {
                  const plan = p as Record<string, unknown>;
                  const planName = (plan.name as string) ?? '';
                  const planSlug = (plan.slug as string) ?? '';
                  const prices = (plan.prices as Record<string, number>) ?? {};
                  const monthlyPrice = prices.monthly ?? 0;
                  const isFree = (plan.is_free ?? plan.isFree) as boolean;
                  const features = (plan.features as string[]) ?? [];
                  const descShort = (plan.description_short ?? plan.descriptionShort) as string ?? '';
                  const isCurrent = currentSubscription &&
                    ((currentSubscription as Record<string, unknown>).plan_slug === planSlug ||
                     (currentSubscription as Record<string, unknown>).planSlug === planSlug);
                  const badge = plan.badge as string | undefined;

                  return (
                    <Card
                      key={planSlug}
                      className={isCurrent ? 'border-primary shadow-lg relative' : 'relative'}
                    >
                      {badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="gap-1">
                            <Star className="w-3 h-3" />
                            {badge}
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg">{planName}</CardTitle>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">
                            {isFree ? 'Gratis' : formatBRL(monthlyPrice)}
                          </span>
                          {!isFree && <span className="text-muted-foreground text-sm">/mês</span>}
                        </div>
                        <CardDescription className="mt-2">{descShort}</CardDescription>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          {features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6">
                          {isCurrent ? (
                            <Button variant="outline" className="w-full" disabled>
                              Plano Atual
                            </Button>
                          ) : (
                            <Button
                              className="w-full"
                              variant={badge ? 'default' : 'outline'}
                              onClick={() => navigate('/planos')}
                            >
                              {isFree ? 'Plano Gratuito' : `Assinar ${planName}`}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Perguntas Frequentes */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Perguntas Frequentes</h2>
              <div className="grid gap-4">
                {companyFaq.map((item) => (
                  <Card key={item.question}>
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-sm">{item.question}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal: Convidar Membro */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar membro</DialogTitle>
            <DialogDescription>
              Um email de convite será enviado para o novo membro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="email@empresa.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamMemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInviteMember} disabled={inviteMemberMutation.isPending}>
              {inviteMemberMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar convite'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Alterar Email */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar email</DialogTitle>
            <DialogDescription>
              Um email de confirmação será enviado para o novo endereço.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Novo email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="novo@empresa.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeEmail} disabled={changingEmail}>
              {changingEmail && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar confirmação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Alterar Senha */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={e =>
                  setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={e =>
                  setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e =>
                  setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Desativar Conta */}
      <AlertDialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar conta da empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as vagas serão pausadas automaticamente e sua empresa não aparecerá nas buscas.
              Você pode reativar a conta a qualquer momento fazendo login novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal: Remover Membro */}
      <AlertDialog open={showRemoveMemberModal} onOpenChange={setShowRemoveMemberModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.name} será removido da equipe e perderá acesso à conta da empresa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRemove(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await handleRemoveMember();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMemberMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Remover membro'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
