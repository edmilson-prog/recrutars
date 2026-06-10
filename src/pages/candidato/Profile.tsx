import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Save, Camera, FileText, ArrowRight, Download,
  Shield, Bell, AlertTriangle, CreditCard, Palette, Check, X, Star, Loader2,
  Eye,
  Copy, Fingerprint,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { calculateProfileCompletion } from '@/utils/profileCompleteness';
import { useCandidateByProfile, useUpdateCandidate } from '@/hooks/useCandidatesQuery';
import { useApplicationsByCandidate } from '@/hooks/useApplicationsQuery';
import { useProfile as useCurriculumProfile } from '@/hooks/useCurriculumsQuery';
import { supabase } from '@/lib/supabase';
import { maskCPFInput, stripCPF, isValidCPF, checkCPFExists } from '@/lib/cpf';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { profileVisibilityOptions, resumeVisibilityOptions } from '@/data/settingsConfig';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import type { CandidatePlanType, VisibilityMode } from '@/types/candidate';
import { usePlans, useSubscription } from '@/hooks/usePlansQuery';
import { formatBRL } from '@/lib/formatters';
import { CheckoutButton } from '@/components/billing/CheckoutButton';

// Plan data is now fetched dynamically via usePlans hook (PRD-075 fix)

// Tabs válidas para deep-link via ?tab= (ex.: /candidato/conta?tab=plano)
const VALID_TABS = ['perfil', 'privacidade', 'conta', 'aparencia', 'plano'] as const;
type AccountTab = (typeof VALID_TABS)[number];

const faq = [
  {
    question: 'Posso cancelar a assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.',
  },
  {
    question: 'Como funciona o período de teste?',
    answer: 'Oferecemos um período de teste gratuito para planos pagos. Você pode cancelar antes do fim do período sem ser cobrado.',
  },
  {
    question: 'Posso trocar de plano depois?',
    answer: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A diferença será calculada proporcionalmente.',
  },
];

// Helper functions for image cropping
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas is empty'));
      },
      'image/jpeg',
      0.9
    );
  });
}

// Formata CPF: 000.000.000-00
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Formata telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    // Fixo: (XX) XXXX-XXXX
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  // Celular: (XX) XXXXX-XXXX
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export default function CandidateProfile() {
  const { user, refreshCurrentCandidate } = useAuth();
  const { data: candidate, isLoading } = useCandidateByProfile(user?.id || '');
  const updateCandidateMutation = useUpdateCandidate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep-link de abas via ?tab= (permite abrir direto a aba "Plano" pela sidebar/CTA)
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: AccountTab = VALID_TABS.includes(tabParam as AccountTab)
    ? (tabParam as AccountTab)
    : 'perfil';

  const handleTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  };

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados do Image Cropper
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // CPF edit states
  const [cpfInput, setCpfInput] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [cpfSaving, setCpfSaving] = useState(false);
  const hasCpf = !!(candidate?.cpf && isValidCPF(candidate.cpf));

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    dateOfBirth: '',
    // Campos de perfil consolidado
    displayName: '',
    // Privacidade
    profileVisibility: 'public' as string,
    showSalaryExpectation: false,
    resumeVisibility: 'companies' as string,
  });

  // Hydrate form when candidate loads
  useEffect(() => {
    if (candidate) {
      setAvatarPreview(candidate.avatar || null);
      setProfile({
        name: candidate.name,
        email: candidate.email,
        cpf: candidate.cpf || '',
        phone: candidate.phone || '',
        dateOfBirth: candidate.dateOfBirth || '',
        // Campos de perfil consolidado
        displayName: candidate.displayName || '',
        // Privacidade
        profileVisibility: candidate.visibility?.mode || 'public',
        showSalaryExpectation: candidate.showSalaryExpectation ?? false,
        resumeVisibility: candidate.resumeVisibility || 'companies',
      });
    }
  }, [candidate]);

  // Conta tab — modais
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Notificacoes
  const [notifications, setNotifications] = useState({
    newJobs: true,
    applicationUpdates: true,
    messages: true,
  });

  const currentPlan: CandidatePlanType = candidate?.plan || 'Essencial';
  // Dynamic plan data from Supabase (PRD-075)
  const { data: candidatePlans = [] } = usePlans('candidate');
  const { data: candidateSubscription } = useSubscription(user?.id);
  const { data: applications = [] } = useApplicationsByCandidate(candidate?.id || '');
  const { data: curriculum } = useCurriculumProfile(candidate?.id || '');
  const currentPlanObj = candidatePlans.find((p) => {
    const row = p as Record<string, unknown>;
    const planName = (row.name as string) ?? '';
    return planName === currentPlan;
  });
  const planFeatures = (currentPlanObj as Record<string, unknown>)?.features as string[]
    ?? (currentPlanObj as Record<string, unknown>)?.features as string[]
    ?? ['Perfil basico'];
  const currentPrices = (currentPlanObj as Record<string, unknown>)?.prices as Record<string, number> ?? {};
  const currentMonthlyPrice = currentPrices.monthly ?? 0;
  const isCurrentFree = ((currentPlanObj as Record<string, unknown>)?.is_free ?? (currentPlanObj as Record<string, unknown>)?.isFree) as boolean;

  if (isLoading || !candidate) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Real usage data from Supabase
  const now = new Date();
  const usedApplications = applications.filter((a) => {
    const raw = a as Record<string, unknown>;
    const dateStr = (raw.createdAt ?? raw.created_at) as string;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const usedResumes = curriculum ? 1 : 0;
  const applicationLimit = isCurrentFree ? 5 : 50;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !candidate) return;

    // Validação de tamanho (máximo 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    // Validação de tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG ou WebP');
      return;
    }

    // Ler arquivo e abrir modal de crop
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!cropperImage || !croppedAreaPixels || !user || !candidate) return;

    setIsUploading(true);
    setShowCropModal(false);

    try {
      // Recortar imagem
      const croppedBlob = await getCroppedImg(cropperImage, croppedAreaPixels);

      // Upload para Supabase Storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Atualizar candidato no banco
      await updateCandidateMutation.mutateAsync({
        id: candidate.id,
        updates: { avatar: publicUrl },
      });

      await refreshCurrentCandidate();
      setAvatarPreview(publicUrl);
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao atualizar foto. Tente novamente.');
    } finally {
      setIsUploading(false);
      setCropperImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const handleSaveCpf = async () => {
    if (!candidate) return;
    setCpfError('');
    const digits = stripCPF(cpfInput);

    if (digits.length !== 11) {
      setCpfError('CPF deve ter 11 dígitos.');
      return;
    }
    if (!isValidCPF(digits)) {
      setCpfError('CPF inválido. Verifique os dígitos.');
      return;
    }

    setCpfSaving(true);
    try {
      const exists = await checkCPFExists(digits);
      if (exists) {
        setCpfError('Este CPF já está cadastrado por outro usuário.');
        return;
      }

      await updateCandidateMutation.mutateAsync({
        id: candidate.id,
        updates: { cpf: digits },
      });

      await refreshCurrentCandidate();
      toast.success('CPF salvo com sucesso!');
    } catch {
      setCpfError('Erro ao salvar CPF. Tente novamente.');
    } finally {
      setCpfSaving(false);
    }
  };

  const handleSave = async () => {
    if (!candidate) return;

    setIsSaving(true);

    // Calcular profileCompletion com os dados atuais
    const newProfileCompletion = calculateProfileCompletion({
      name: profile.name,
      email: profile.email,
      title: candidate.title,
      location: candidate.location,
      phone: profile.phone,
      linkedin: candidate.linkedin,
      about: candidate.about,
    });

    try {
      await updateCandidateMutation.mutateAsync({
        id: candidate.id,
        updates: {
          name: profile.name,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth || null,
          // Campos de perfil consolidado
          displayName: profile.displayName || null,
          // Completude do perfil (sincroniza com o banco)
          profileCompletion: newProfileCompletion,
          // Privacidade
          visibility: { mode: profile.profileVisibility as VisibilityMode, anonymousId: candidate.visibility?.anonymousId || '' },
          showSalaryExpectation: profile.showSalaryExpectation,
          resumeVisibility: profile.resumeVisibility,
        },
      });

      await refreshCurrentCandidate();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // LGPD Data Export
  const handleExportData = async () => {
    if (!candidate) return;
    setIsExporting(true);
    try {
      const exportData = {
        exportadoEm: new Date().toISOString(),
        plataforma: 'RecrutaRS',
        lgpd: 'Exportação conforme Art. 18 da Lei Geral de Proteção de Dados',
        dadosPessoais: {
          nome: candidate.name,
          email: candidate.email,
          cpf: candidate.cpf || null,
          telefone: candidate.phone || null,
          dataNascimento: candidate.dateOfBirth || null,
          genero: candidate.gender || null,
          estadoCivil: candidate.maritalStatus || null,
          nacionalidade: candidate.nationality || null,
          cidade: candidate.city || null,
          estado: candidate.state || null,
          avatar: candidate.avatar || null,
        },
        preferencias: {
          visibilidadePerfil: profile.profileVisibility,
          exibirPretensaoSalarial: profile.showSalaryExpectation,
          visibilidadeCurriculo: profile.resumeVisibility,
          notificacoes: notifications,
        },
        conta: {
          id: candidate.id,
          membroDesde: candidate.createdAt || null,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `recrutars-meus-dados-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!');
    } catch {
      toast.error('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minha Conta</h1>
            <p className="text-muted-foreground">Gerencie suas informações, conta e preferências</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="privacidade" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Privacidade</span>
            </TabsTrigger>
            <TabsTrigger value="conta" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="plano" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Plano</span>
            </TabsTrigger>
          </TabsList>

          {/* ============ TAB PERFIL ============ */}
          <TabsContent value="perfil" className="space-y-6">
            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview || undefined} alt={profile.name} />
                    <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-1 -right-1 rounded-full w-10 h-10 sm:w-8 sm:h-8"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </Button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{profile.displayName || profile.name}</h2>
                  <p className="text-muted-foreground">{candidate.title}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Enviando...' : 'Trocar foto'}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Personal Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Informações Pessoais</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de Exibição</Label>
                  <Input
                    id="displayName"
                    placeholder="Como você gosta de ser chamado"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Como você será identificado na plataforma</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    className="uppercase"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado aqui</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  {hasCpf ? (
                    <>
                      <Input
                        id="cpf"
                        value={formatCPF(profile.cpf)}
                        disabled
                        className="bg-muted cursor-not-allowed"
                        placeholder="000.000.000-00"
                      />
                      <p className="text-xs text-muted-foreground">O CPF não pode ser alterado</p>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id="cpf"
                          value={maskCPFInput(cpfInput)}
                          onChange={(e) => {
                            setCpfInput(stripCPF(e.target.value));
                            setCpfError('');
                          }}
                          placeholder="000.000.000-00"
                          inputMode="numeric"
                          maxLength={14}
                          className={cpfError ? 'border-destructive' : ''}
                        />
                        <Button
                          size="sm"
                          className="h-10 sm:h-auto"
                          onClick={handleSaveCpf}
                          disabled={cpfSaving || stripCPF(cpfInput).length !== 11}
                        >
                          {cpfSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                        </Button>
                      </div>
                      {cpfError && <p className="text-xs text-destructive">{cpfError}</p>}
                      {!cpfError && <p className="text-xs text-muted-foreground">Informe seu CPF. Após salvar, não poderá ser alterado.</p>}
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formatPhone(profile.phone)}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  />
                </div>
                <div /> {/* spacer para manter grid alinhado */}
              </div>
            </motion.div>

            {/* Curriculum Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Dados Profissionais</h3>
                    <p className="text-sm text-muted-foreground">
                      Experiência, formação, habilidades e pretensão salarial são gerenciados no seu perfil profissional.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                  <Link to="/candidato/perfil">
                    Ir para Meu Perfil
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Save Button */}
            <div className="flex justify-end pb-8">
              <Button size="lg" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* ============ TAB PRIVACIDADE ============ */}
          <TabsContent value="privacidade" className="space-y-6">
            {/* Visibilidade do Perfil */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Visibilidade do Perfil</h2>
                  <p className="text-sm text-muted-foreground">Controle quem pode ver suas informações</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">Visibilidade do Perfil</Label>
                  <Select
                    value={profile.profileVisibility}
                    onValueChange={(value) => setProfile({ ...profile, profileVisibility: value })}
                    disabled={candidate?.visibilityLocked}
                  >
                    <SelectTrigger id="profileVisibility">
                      <SelectValue placeholder="Selecione a visibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {profileVisibilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {candidate?.visibilityLocked ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Sua visibilidade está definida como Privado porque você é colaborador de uma empresa.
                      Essa configuração não pode ser alterada.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Controle quem pode ver seu perfil completo</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/50 rounded-xl">
                  <div>
                    <Label className="font-medium">Exibir Expectativa Salarial</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar sua faixa salarial pretendida para empresas
                    </p>
                  </div>
                  <Switch
                    checked={profile.showSalaryExpectation}
                    onCheckedChange={(checked) => setProfile({ ...profile, showSalaryExpectation: checked })}
                  />
                </div>
              </div>
            </motion.div>

            {/* Dados Pessoais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Dados Pessoais</h2>
                  <p className="text-sm text-muted-foreground">Controle de acesso ao perfil</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumeVisibility">Visibilidade do Perfil</Label>
                <Select
                  value={profile.resumeVisibility}
                  onValueChange={(value) => setProfile({ ...profile, resumeVisibility: value })}
                >
                  <SelectTrigger id="resumeVisibility">
                    <SelectValue placeholder="Selecione a visibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumeVisibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Quem pode visualizar seu perfil profissional completo</p>
              </div>
            </motion.div>

            {/* Save Button */}
            <div className="flex justify-end pb-8">
              <Button size="lg" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* ============ TAB CONTA ============ */}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">ID do Candidato</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{candidate?.id || '—'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-3 shrink-0 h-10 sm:h-auto"
                    onClick={() => {
                      if (candidate?.id) {
                        navigator.clipboard.writeText(candidate.id);
                        toast.success('ID copiado para a área de transferência');
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                </div>
                {candidate?.createdAt && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Membro desde</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(candidate.createdAt).toLocaleDateString('pt-BR', {
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Gerencie seu e-mail e senha de acesso</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">E-mail</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 sm:h-auto" onClick={() => setShowEmailModal(true)}>
                    Alterar e-mail
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Senha</p>
                    <p className="text-sm text-muted-foreground">••••••••••</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 sm:h-auto" onClick={() => setShowPasswordModal(true)}>
                    Alterar senha
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>Escolha quais notificações deseja receber</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Novas vagas compatíveis</p>
                    <p className="text-xs text-muted-foreground">Receba alertas quando novas vagas combinarem com seu perfil</p>
                  </div>
                  <Switch
                    checked={notifications.newJobs}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newJobs: checked })}
                  />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Atualizações de candidaturas</p>
                    <p className="text-xs text-muted-foreground">Saiba quando o status de suas candidaturas mudar</p>
                  </div>
                  <Switch
                    checked={notifications.applicationUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, applicationUpdates: checked })}
                  />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Mensagens de empresas</p>
                    <p className="text-xs text-muted-foreground">Receba notificações quando uma empresa enviar uma mensagem</p>
                  </div>
                  <Switch
                    checked={notifications.messages}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Exportar Dados — LGPD */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Download className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>Exportar Dados</CardTitle>
                    <CardDescription>Portabilidade de dados (LGPD Art. 18)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Baixar meus dados</p>
                    <p className="text-xs text-muted-foreground">
                      Exporte todos os seus dados pessoais em formato JSON
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 sm:h-auto" onClick={handleExportData} disabled={isExporting}>
                    {isExporting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                    Baixar dados
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Zona de Perigo */}
            <Card className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle>Zona de Perigo</CardTitle>
                    <CardDescription>Ações irreversíveis na sua conta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Desativar conta</p>
                    <p className="text-xs text-muted-foreground">Sua conta ficará invisível, mas seus dados serão preservados</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 sm:h-auto" onClick={() => setShowDeactivateModal(true)}>
                    Desativar
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Excluir conta permanentemente</p>
                    <p className="text-xs text-muted-foreground">Todos os seus dados serão removidos permanentemente</p>
                  </div>
                  <Button variant="destructive" size="sm" className="h-10 sm:h-auto" onClick={() => setShowDeleteModal(true)}>
                    Excluir conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ TAB APARÊNCIA ============ */}
          <TabsContent value="aparencia" className="space-y-6">
            <ThemeSettings />
          </TabsContent>

          {/* ============ TAB PLANO ============ */}
          <TabsContent value="plano" className="space-y-6">
            {/* Seu Plano */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Seu Plano</CardTitle>
                    <CardDescription>Detalhes da sua assinatura atual</CardDescription>
                  </div>
                  <Badge variant={(currentPlanObj as Record<string, unknown>)?.badge ? 'default' : isCurrentFree ? 'outline' : 'secondary'}>
                    {currentPlan}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {isCurrentFree ? 'Gratis' : formatBRL(currentMonthlyPrice)}
                  </span>
                  {!isCurrentFree && <span className="text-muted-foreground">/mês</span>}
                </div>

                {!isCurrentFree && candidateSubscription && (
                  <p className="text-sm text-muted-foreground">
                    Próxima cobrança em {(() => {
                      const sub = candidateSubscription as Record<string, unknown>;
                      const date = sub.renewal_date ?? sub.renewalDate ?? sub.end_date ?? sub.endDate;
                      return date ? new Date(String(date)).toLocaleDateString('pt-BR') : '—';
                    })()}
                  </p>
                )}

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Recursos inclusos:</p>
                  <ul className="space-y-2">
                    {planFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Uso do Plano */}
            <Card>
              <CardHeader>
                <CardTitle>Uso do Plano</CardTitle>
                <CardDescription>Acompanhe o consumo dos recursos do seu plano</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Candidaturas este mês</span>
                    <span className="font-medium">
                      {usedApplications}/{applicationLimit}
                    </span>
                  </div>
                  <Progress
                    value={Math.min((usedApplications / applicationLimit) * 100, 100)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Perfil profissional</span>
                    <span className="font-medium">
                      {usedResumes}/1
                    </span>
                  </div>
                  <Progress
                    value={usedResumes > 0 ? 100 : 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Todos os Planos — dados dinamicos via usePlans (PRD-075) */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Todos os Planos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {candidatePlans.map((p) => {
                  const plan = p as Record<string, unknown>;
                  const planId = (plan.id as string) ?? '';
                  const planName = (plan.name as string) ?? '';
                  const planSlug = (plan.slug as string) ?? '';
                  const prices = (plan.prices as Record<string, number>) ?? {};
                  const monthlyPrice = prices.monthly ?? 0;
                  const isFree = (plan.is_free ?? plan.isFree) as boolean;
                  const features = (plan.features as string[]) ?? [];
                  const descShort = (plan.description_short ?? plan.descriptionShort) as string ?? '';
                  const isCurrent = planName === currentPlan;
                  const badge = plan.badge as string | undefined;

                  return (
                    <Card
                      key={planSlug}
                      className={badge ? 'border-primary shadow-lg relative' : 'relative'}
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
                          <span className="text-2xl sm:text-3xl font-bold">
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
                              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6">
                          {isCurrent ? (
                            <Button variant="outline" className="w-full" disabled>
                              Plano Atual
                            </Button>
                          ) : isFree ? (
                            <Button variant="outline" className="w-full" disabled>
                              Plano Gratuito
                            </Button>
                          ) : (
                            <CheckoutButton
                              planId={planId}
                              planName={planName}
                              period="monthly"
                              variant={badge ? 'default' : 'outline'}
                              className="w-full"
                            />
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
                {faq.map((item) => (
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

      {/* ============ MODAIS ============ */}

      {/* Modal Alterar E-mail */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar e-mail</DialogTitle>
            <DialogDescription>
              Digite seu novo endereço de e-mail. Você receberá um link de confirmação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">E-mail atual</Label>
              <Input id="current-email" value={profile.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Novo e-mail</Label>
              <Input id="new-email" type="email" placeholder="novo@email.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancelar</Button>
            <Button onClick={() => {
              toast.success('Link de confirmação enviado para o novo e-mail!');
              setShowEmailModal(false);
            }}>
              Enviar confirmação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Alterar Senha */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha desejada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
            <Button onClick={() => {
              toast.success('Senha alterada com sucesso!');
              setShowPasswordModal(false);
            }}>
              Alterar senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Desativar Conta */}
      <AlertDialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar conta</AlertDialogTitle>
            <AlertDialogDescription>
              Sua conta ficará invisível para empresas e recrutadores. Seus dados serão preservados e você poderá reativar a conta a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              toast.success('Conta desativada. Você pode reativá-la a qualquer momento.');
              setShowDeactivateModal(false);
            }}>
              Desativar conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Excluir Conta */}
      <AlertDialog open={showDeleteModal} onOpenChange={(open) => {
        setShowDeleteModal(open);
        if (!open) setDeleteConfirmText('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os seus dados, candidaturas, perfil profissional e resultados de testes serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="delete-confirm">
              Digite <strong>EXCLUIR</strong> para confirmar:
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="EXCLUIR"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== 'EXCLUIR'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast.success('Conta excluída permanentemente.');
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
            >
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Crop de Avatar */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajustar foto</DialogTitle>
            <DialogDescription>
              Arraste para posicionar e use o zoom para enquadrar seu rosto.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-48 sm:h-64 w-full bg-muted rounded-lg overflow-hidden">
            {cropperImage && (
              <Cropper
                image={cropperImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Zoom</Label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCropConfirm} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
