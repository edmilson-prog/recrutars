/**
 * Company Settings Page
 * PRD-018: Configurações da Empresa
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Shield,
  Bell,
  AlertTriangle,
  UserPlus,
  Mail,
  MoreHorizontal,
  Check,
  X,
  Star,
  Users,
  CreditCard,
  Heart,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
import type { TeamMember, PendingInvite, CompanyPlan, CompanyNotificationPreferences } from '@/types/company';
import { mockCompanies, mockTeamMembers, mockPendingInvites, mockCompanyPlan } from '@/data/mockData';
import { useCulturalFit } from '@/hooks/useCulturalFit';
import { CultureProfileForm } from '@/components/cultural';

// Constants
const INDUSTRY_OPTIONS = [
  'Tecnologia',
  'Marketing Digital',
  'Fintech',
  'E-commerce',
  'Saúde',
  'Educação',
  'Indústria',
  'Consultoria',
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

const STATE_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

// Plan comparison data (migrated from Plans.tsx)
interface PlanFeature {
  label: string;
  essencial: string | boolean;
  selecao: string | boolean;
  recrutamento: string | boolean;
}

const companyPlanFeatures: PlanFeature[] = [
  { label: 'Vagas ativas', essencial: '2', selecao: '10', recrutamento: 'Ilimitadas' },
  { label: 'Candidatos/mês', essencial: '10', selecao: '100', recrutamento: 'Ilimitados' },
  { label: 'Testes Gauge-Pro', essencial: '5', selecao: 'Ilimitados', recrutamento: 'Ilimitados' },
  { label: 'Banco de talentos', essencial: 'Básico', selecao: 'Completo', recrutamento: 'Completo + API' },
  { label: 'Análise IA', essencial: false, selecao: true, recrutamento: true },
  { label: 'Usuários na conta', essencial: '1', selecao: '5', recrutamento: 'Ilimitados' },
  { label: 'Relatórios', essencial: 'Básico', selecao: 'Avançado', recrutamento: 'Personalizado' },
  { label: 'Suporte', essencial: 'Email', selecao: 'Prioritário', recrutamento: 'Dedicado + SLA' },
];

const companyPlans = [
  {
    name: 'Essencial Empresas',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para empresas que estão começando a recrutar na plataforma.',
    isCurrent: true,
    isPopular: false,
    featureKey: 'essencial' as const,
  },
  {
    name: 'Seleção Inteligente',
    price: 'R$ 299',
    period: '/mês',
    description: 'Para equipes de RH que precisam de mais recursos e escala.',
    isCurrent: false,
    isPopular: true,
    featureKey: 'selecao' as const,
  },
  {
    name: 'Recrutamento Premium',
    price: 'R$ 799',
    period: '/mês',
    description: 'Solução completa para grandes operações de recrutamento.',
    isCurrent: false,
    isPopular: false,
    featureKey: 'recrutamento' as const,
  },
];

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
    question: 'Como funciona o plano Enterprise?',
    answer: 'O Enterprise inclui API de integração, suporte dedicado com SLA, relatórios personalizados e onboarding assistido.',
  },
  {
    question: 'Posso adicionar mais usuários ao meu plano?',
    answer: 'Nos planos Professional e Enterprise, você pode adicionar usuários extras. No Enterprise, o número é ilimitado.',
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="w-4 h-4 text-green-500" />;
  }
  if (value === false) {
    return <X className="w-4 h-4 text-muted-foreground/40" />;
  }
  return <span className="text-sm">{value}</span>;
}

export default function CompanySettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get current company data
  const currentCompany = mockCompanies.find(c => c.id === 'company-1') || mockCompanies[0];

  // Company profile state
  const [companyProfile, setCompanyProfile] = useState({
    name: currentCompany.name,
    industry: currentCompany.industry,
    size: currentCompany.size,
    website: currentCompany.website || '',
    linkedin: currentCompany.linkedin || '',
    description: currentCompany.description,
    city: currentCompany.city,
    state: currentCompany.state,
    address: currentCompany.address || '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(currentCompany.logo || null);

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(mockPendingInvites);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

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
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Plan data
  const [plan] = useState<CompanyPlan>(mockCompanyPlan);

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
  } = useCulturalFit({ companyId: 'company-1' });
  const [culturalValues, setCulturalValuesState] = useState<string[]>(culturalCompanyProfile?.values || []);
  const [culturalDescription, setCulturalDescriptionState] = useState<string>(culturalCompanyProfile?.description || '');

  // Handle logo change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile save
  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso');
  };

  // Handle invite member
  const handleInviteMember = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }
    const newInvite: PendingInvite = {
      id: `invite-${Date.now()}`,
      email: inviteEmail,
      sentAt: new Date().toLocaleDateString('pt-BR'),
    };
    setPendingInvites(prev => [...prev, newInvite]);
    setInviteEmail('');
    setShowInviteModal(false);
    toast.success(`Convite enviado para ${inviteEmail}`);
  };

  // Handle resend invite
  const handleResendInvite = (invite: PendingInvite) => {
    toast.success(`Convite reenviado para ${invite.email}`);
  };

  // Handle cancel invite
  const handleCancelInvite = (inviteId: string) => {
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
    toast.success('Convite cancelado');
  };

  // Handle remove member
  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    setTeamMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
    setShowRemoveMemberModal(false);
    setMemberToRemove(null);
    toast.success('Membro removido da equipe');
  };

  // Handle notification change
  const handleNotificationChange = (key: keyof CompanyNotificationPreferences, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: checked }));
    toast.success('Preferências salvas');
  };

  // Handle change email (mock)
  const handleChangeEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }
    setShowEmailModal(false);
    setNewEmail('');
    toast.success('Email de confirmação enviado para o novo endereço');
  };

  // Handle change password (mock)
  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Senha alterada com sucesso');
  };

  // Handle deactivate account (mock)
  const handleDeactivateAccount = () => {
    setShowDeactivateModal(false);
    logout();
    navigate('/');
    toast.success('Conta da empresa desativada. Vagas pausadas automaticamente.');
  };

  // PRD-042: Handle save cultural profile
  const handleSaveCulturalProfile = () => {
    setCulturalValues(culturalValues);
    setCulturalDescription(culturalDescription);
    saveCulturalProfile();
    toast.success('Perfil cultural salvo com sucesso!');
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie seu perfil, equipe e preferências</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="perfil" className="space-y-6">
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

            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
                  <Input
                    id="companyName"
                    value={companyProfile.name}
                    onChange={e => setCompanyProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

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

            {/* Sobre a Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre a Empresa *</CardTitle>
                <CardDescription>Descreva sua empresa para os candidatos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  value={companyProfile.description}
                  onChange={e => setCompanyProfile(prev => ({ ...prev, description: e.target.value }))}
                  rows={5}
                  maxLength={1000}
                  placeholder="Conte sobre a história, cultura e valores da empresa..."
                />
                <p className="text-xs text-muted-foreground text-right">
                  {companyProfile.description.length}/1000 caracteres
                </p>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={companyProfile.city}
                      onChange={e => setCompanyProfile(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Select
                      value={companyProfile.state}
                      onValueChange={value => setCompanyProfile(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATE_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço (opcional)</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro"
                    value={companyProfile.address}
                    onChange={e => setCompanyProfile(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
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
              onValuesChange={setCulturalValuesState}
              onDescriptionChange={setCulturalDescriptionState}
              onSave={handleSaveCulturalProfile}
              onReset={resetCulturalForm}
              isModified={isCulturalModified || culturalValues.length > 0 || culturalDescription.length > 0}
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
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar membro
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Members */}
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.lastAccess && (
                          <p className="text-xs text-muted-foreground">
                            Último acesso: {member.lastAccess}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role === 'admin' ? 'Admin' : 'Membro'}
                      </Badge>
                      {member.isCurrentUser ? (
                        <Badge variant="outline">Você</Badge>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast.info('Funcionalidade em breve')}>
                              Alterar cargo
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
                      )}
                    </div>
                  </div>
                ))}

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                  <>
                    <Separator />
                    <p className="text-sm font-medium text-foreground">Convites pendentes</p>
                    {pendingInvites.map(invite => (
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
                              Enviado em: {invite.sentAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvite(invite)}
                          >
                            Reenviar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvite(invite.id)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Conta */}
          <TabsContent value="conta" className="space-y-6">
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
            {/* Plano atual */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Plano {plan.name}</CardTitle>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    R$ {plan.price.toFixed(2)}/mês
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Próxima cobrança: {plan.nextBillingDate}
                </p>
              </CardContent>
            </Card>

            {/* Uso do plano */}
            <Card>
              <CardHeader>
                <CardTitle>Uso do plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Vagas ativas</span>
                    <span className="text-muted-foreground">
                      {plan.currentJobs}/{plan.maxJobs}
                    </span>
                  </div>
                  <Progress value={(plan.currentJobs / plan.maxJobs) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Usuários</span>
                    <span className="text-muted-foreground">
                      {plan.currentUsers}/{plan.maxUsers}
                    </span>
                  </div>
                  <Progress value={(plan.currentUsers / plan.maxUsers) * 100} />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Todos os Planos (migrado de Plans.tsx) */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Todos os Planos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {companyPlans.map((p) => (
                  <Card
                    key={p.name}
                    className={
                      p.isPopular
                        ? 'border-primary shadow-lg relative'
                        : 'relative'
                    }
                  >
                    {p.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="gap-1">
                          <Star className="w-3 h-3" />
                          Mais popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{p.price}</span>
                        <span className="text-muted-foreground text-sm">{p.period}</span>
                      </div>
                      <CardDescription className="mt-2">{p.description}</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {companyPlanFeatures.map((feature) => (
                          <li key={feature.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{feature.label}</span>
                            <FeatureValue value={feature[p.featureKey]} />
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        {p.isCurrent ? (
                          <Button variant="outline" className="w-full" disabled>
                            Plano Atual
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            variant={p.isPopular ? 'default' : 'outline'}
                            onClick={() => toast.info(`A assinatura do plano ${p.name} estará disponível em breve.`)}
                          >
                            Assinar {p.name}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInviteMember}>Enviar convite</Button>
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
            <Button onClick={handleChangeEmail}>Enviar confirmação</Button>
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
            <Button onClick={handleChangePassword}>Salvar</Button>
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
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover membro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
