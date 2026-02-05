import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, MapPin, Save, Camera, FileText, ArrowRight,
  Shield, Bell, AlertTriangle, CreditCard, Palette, Check, X, Star, Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCandidateByProfile, useUpdateCandidate } from '@/hooks/useCandidatesQuery';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { brazilianStates } from '@/data/settingsConfig';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import type { CandidatePlanType } from '@/types/candidate';

const MAX_ABOUT_LENGTH = 500;

interface PlanFeature {
  label: string;
  essencial: string | boolean;
  avancar: string | boolean;
  destaque: string | boolean;
}

const planFeatures: PlanFeature[] = [
  { label: 'Perfil básico', essencial: true, avancar: true, destaque: true },
  { label: 'Candidaturas/mês', essencial: '5', avancar: '30', destaque: 'Ilimitadas' },
  { label: 'Teste comportamental', essencial: '1', avancar: 'Ilimitados', destaque: 'Ilimitados' },
  { label: 'Vagas recomendadas', essencial: false, avancar: true, destaque: true },
  { label: 'Currículos', essencial: '1', avancar: '3', destaque: '10' },
  { label: 'Destaque nas buscas', essencial: false, avancar: false, destaque: true },
  { label: 'Análise IA do perfil', essencial: false, avancar: false, destaque: true },
  { label: 'Suporte', essencial: 'Email', avancar: 'Prioritário', destaque: 'VIP' },
];

const allPlans = [
  {
    name: 'Essencial',
    price: 'R$ 0',
    period: '/mês',
    description: 'Ideal para quem está começando a buscar oportunidades.',
    isCurrent: true,
    isPopular: false,
    featureKey: 'essencial' as const,
  },
  {
    name: 'Avançar',
    price: 'R$ 29',
    period: '/mês',
    description: 'Para candidatos que querem se destacar e ter mais visibilidade.',
    isCurrent: false,
    isPopular: true,
    featureKey: 'avancar' as const,
  },
  {
    name: 'Destaque Máximo',
    price: 'R$ 59',
    period: '/mês',
    description: 'Acesso completo com recursos exclusivos e suporte VIP.',
    isCurrent: false,
    isPopular: false,
    featureKey: 'destaque' as const,
  },
];

const faq = [
  {
    question: 'Posso cancelar a assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.',
  },
  {
    question: 'Como funciona o período de teste?',
    answer: 'Oferecemos 7 dias grátis para os planos Avançar e Destaque Máximo. Você pode cancelar antes do fim do período sem ser cobrado.',
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

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="w-4 h-4 text-green-500" />;
  }
  if (value === false) {
    return <X className="w-4 h-4 text-muted-foreground/40" />;
  }
  return <span className="text-sm">{value}</span>;
}

// Formata CPF: 000.000.000-00
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

const candidatePlanData: Record<CandidatePlanType, {
  price: number;
  features: string[];
  maxApplications: number;
  maxResumes: number;
}> = {
  'Essencial': {
    price: 0,
    features: ['Perfil basico', '5 candidaturas/mes', '1 teste comportamental', '1 curriculo'],
    maxApplications: 5,
    maxResumes: 1,
  },
  'Avançar': {
    price: 29,
    features: ['30 candidaturas/mes', 'Testes ilimitados', '3 curriculos', 'Vagas recomendadas'],
    maxApplications: 30,
    maxResumes: 3,
  },
  'Destaque Máximo': {
    price: 59,
    features: ['Candidaturas ilimitadas', 'Testes ilimitados', '10 curriculos', 'Destaque nas buscas', 'Analise IA'],
    maxApplications: 999,
    maxResumes: 10,
  },
};

export default function CandidateProfile() {
  const { user, refreshCurrentCandidate } = useAuth();
  const { data: candidate, isLoading } = useCandidateByProfile(user?.id || '');
  const updateCandidateMutation = useUpdateCandidate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast: toastShadcn } = useToast();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados do Image Cropper
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    cpf: '',
    title: '',
    phone: '(11) 99999-9999',
    linkedin: 'linkedin.com/in/joaosantos',
    about: 'Desenvolvedor Full Stack apaixonado por criar soluções inovadoras. Com 5 anos de experiência, tenho trabalhado em projetos de grande escala utilizando tecnologias modernas.',
    dateOfBirth: '',
    // Campos de perfil consolidado
    displayName: '',
    city: '',
    state: '',
    openToRelocation: false,
  });

  // Hydrate form when candidate loads
  useEffect(() => {
    if (candidate) {
      setAvatarPreview(candidate.avatar || null);
      setProfile({
        name: candidate.name,
        email: candidate.email,
        cpf: candidate.cpf || '',
        title: candidate.title,
        phone: candidate.phone || '(11) 99999-9999',
        linkedin: candidate.linkedin || 'linkedin.com/in/joaosantos',
        about: candidate.about || 'Desenvolvedor Full Stack apaixonado por criar soluções inovadoras. Com 5 anos de experiência, tenho trabalhado em projetos de grande escala utilizando tecnologias modernas.',
        dateOfBirth: candidate.dateOfBirth || '',
        // Campos de perfil consolidado
        displayName: candidate.displayName || '',
        city: candidate.city || '',
        state: candidate.state || '',
        openToRelocation: candidate.openToRelocation || false,
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
  const planData = candidatePlanData[currentPlan];

  if (isLoading || !candidate) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Mock usage data
  const usedApplications = 3;
  const usedResumes = 1;

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

  const handleSave = async () => {
    if (!candidate) return;

    setIsSaving(true);

    try {
      await updateCandidateMutation.mutateAsync({
        id: candidate.id,
        updates: {
          name: profile.name,
          title: profile.title,
          phone: profile.phone,
          linkedin: profile.linkedin,
          about: profile.about,
          dateOfBirth: profile.dateOfBirth || null,
          // Campos de perfil consolidado
          displayName: profile.displayName || null,
          city: profile.city || null,
          state: profile.state || null,
          openToRelocation: profile.openToRelocation,
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

  return (
    <DashboardLayout userType="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações, conta e preferências</p>
          </div>
        </div>

        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="localizacao" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Localização</span>
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
              className="bg-card rounded-2xl p-6 shadow-soft"
            >
              <div className="flex items-center gap-6">
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
                    className="absolute -bottom-1 -right-1 rounded-full w-8 h-8"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </Button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{profile.displayName || profile.name}</h2>
                  <p className="text-muted-foreground">{profile.title}</p>
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
              className="bg-card rounded-2xl p-6 shadow-soft"
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
                  <Input
                    id="cpf"
                    value={formatCPF(profile.cpf)}
                    disabled
                    className="bg-muted cursor-not-allowed"
                    placeholder="000.000.000-00"
                  />
                  <p className="text-xs text-muted-foreground">O CPF não pode ser alterado</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Cargo/Título</Label>
                  <Input
                    id="title"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
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
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="about">Sobre mim</Label>
                  <Textarea
                    id="about"
                    placeholder="Conte um pouco sobre você, sua carreira e objetivos..."
                    className="min-h-[120px]"
                    maxLength={MAX_ABOUT_LENGTH}
                    value={profile.about}
                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {profile.about.length}/{MAX_ABOUT_LENGTH} caracteres
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Curriculum Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Dados Profissionais</h3>
                    <p className="text-sm text-muted-foreground">
                      Experiência, formação, habilidades e pretensão salarial são gerenciados nos seus currículos.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                  <Link to="/candidato/curriculos">
                    Ir para Currículos
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

          {/* ============ TAB LOCALIZAÇÃO ============ */}
          <TabsContent value="localizacao" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Localização</h2>
                  <p className="text-sm text-muted-foreground">Cidade e disponibilidade para mudança</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Sua cidade atual"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={profile.state || '__none__'}
                    onValueChange={(value) => setProfile({ ...profile, state: value === '__none__' ? '' : value })}
                  >
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div>
                      <Label className="font-medium">Disponível para Mudança</Label>
                      <p className="text-sm text-muted-foreground">
                        Indica se você aceitaria mudar de cidade/estado para uma oportunidade
                      </p>
                    </div>
                    <Switch
                      checked={profile.openToRelocation}
                      onCheckedChange={(checked) => setProfile({ ...profile, openToRelocation: checked })}
                    />
                  </div>
                </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">E-mail</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowEmailModal(true)}>
                    Alterar e-mail
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Senha</p>
                    <p className="text-sm text-muted-foreground">••••••••••</p>
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
                <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Desativar conta</p>
                    <p className="text-xs text-muted-foreground">Sua conta ficará invisível, mas seus dados serão preservados</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowDeactivateModal(true)}>
                    Desativar
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Excluir conta permanentemente</p>
                    <p className="text-xs text-muted-foreground">Todos os seus dados serão removidos permanentemente</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
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
                  <Badge variant={currentPlan === 'Destaque Máximo' ? 'default' : currentPlan === 'Avançar' ? 'secondary' : 'outline'}>
                    {currentPlan}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">R$ {planData.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>

                {currentPlan !== 'Essencial' && (
                  <p className="text-sm text-muted-foreground">
                    Próxima cobrança em 15/03/2026
                  </p>
                )}

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Recursos inclusos:</p>
                  <ul className="space-y-2">
                    {planData.features.map((feature, index) => (
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
                      {usedApplications}/{planData.maxApplications === 999 ? '∞' : planData.maxApplications}
                    </span>
                  </div>
                  <Progress
                    value={planData.maxApplications === 999 ? 5 : (usedApplications / planData.maxApplications) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Currículos criados</span>
                    <span className="font-medium">
                      {usedResumes}/{planData.maxResumes}
                    </span>
                  </div>
                  <Progress
                    value={(usedResumes / planData.maxResumes) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Todos os Planos (migrado de Plans.tsx) */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Todos os Planos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allPlans.map((plan) => (
                  <Card
                    key={plan.name}
                    className={
                      plan.isPopular
                        ? 'border-primary shadow-lg relative'
                        : 'relative'
                    }
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="gap-1">
                          <Star className="w-3 h-3" />
                          Mais popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {planFeatures.map((feature) => (
                          <li key={feature.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{feature.label}</span>
                            <FeatureValue value={feature[plan.featureKey]} />
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        {plan.isCurrent ? (
                          <Button variant="outline" className="w-full" disabled>
                            Plano Atual
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            variant={plan.isPopular ? 'default' : 'outline'}
                            onClick={() => toastShadcn({
                              title: 'Funcionalidade em breve',
                              description: `A assinatura do plano ${plan.name} estará disponível em breve.`,
                            })}
                          >
                            Assinar {plan.name}
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
              Esta ação é irreversível. Todos os seus dados, candidaturas, currículos e resultados de testes serão permanentemente excluídos.
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajustar foto</DialogTitle>
            <DialogDescription>
              Arraste para posicionar e use o zoom para enquadrar seu rosto.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-64 w-full bg-muted rounded-lg overflow-hidden">
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
