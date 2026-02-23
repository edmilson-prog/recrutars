/**
 * OnboardingPersonalProfile
 * PRD-084: Personal profile — step 2 of candidate onboarding (v1.28.0 "Profile")
 * 6 required fields: date of birth, gender, state, city, marital status, nationality
 * Avatar is optional
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import {
  Calendar,
  MapPin,
  User,
  Heart,
  Globe,
  Camera,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DateOfBirthSelect from '@/components/onboarding/DateOfBirthSelect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { OnboardingStepIndicator } from '@/components/onboarding/OnboardingStepIndicator';
import { brazilianCitiesByState } from '@/data/brazilianCities';
import { toast } from 'sonner';

const STATES = Object.keys(brazilianCitiesByState).sort();

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'nao_informar', label: 'Prefiro não informar' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
  { value: 'outro', label: 'Outro' },
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
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error('Canvas is empty')); },
      'image/jpeg',
      0.9
    );
  });
}


export default function OnboardingPersonalProfile() {
  const { currentCandidate, user, refreshCurrentCandidate } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [nationality, setNationality] = useState('Brasileira');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Image cropper states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const candidateId = currentCandidate?.id;

  // Load existing data
  useEffect(() => {
    if (!currentCandidate) return;
    if (currentCandidate.dateOfBirth) setDateOfBirth(currentCandidate.dateOfBirth);
    if (currentCandidate.gender) setGender(currentCandidate.gender);
    if (currentCandidate.state) setSelectedState(currentCandidate.state);
    if (currentCandidate.city) setSelectedCity(currentCandidate.city);
    if (currentCandidate.avatar) setAvatarUrl(currentCandidate.avatar);
    if (currentCandidate.maritalStatus) setMaritalStatus(currentCandidate.maritalStatus);
    if (currentCandidate.nationality) setNationality(currentCandidate.nationality);
  }, [currentCandidate]);

  const cities = selectedState ? (brazilianCitiesByState[selectedState] ?? []) : [];

  // Age validation
  const isAgeValid = () => {
    if (!dateOfBirth) return false;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 16;
  };

  const allFieldsFilled =
    dateOfBirth && isAgeValid() &&
    gender &&
    selectedState &&
    selectedCity &&
    maritalStatus &&
    nationality.trim().length > 0;

  // Auto-save on blur (debounced)
  const saveField = useCallback(async (field: string, value: unknown) => {
    if (!candidateId) return;
    try {
      const dbField = field === 'dateOfBirth' ? 'date_of_birth'
        : field === 'maritalStatus' ? 'marital_status'
        : field === 'avatarUrl' ? 'avatar_url'
        : field;
      await supabase
        .from('candidates')
        .update({ [dbField]: value })
        .eq('id', candidateId);
    } catch {
      // Silent fail for auto-save
    }
  }, [candidateId]);

  // Avatar upload — open crop modal
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Confirm crop and upload
  const handleCropConfirm = async () => {
    if (!cropperImage || !croppedAreaPixels || !user || !candidateId) return;

    setUploading(true);
    setShowCropModal(false);

    try {
      const croppedBlob = await getCroppedImg(cropperImage, croppedAreaPixels);
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setAvatarUrl(publicUrl);

      await supabase.from('candidates').update({ avatar_url: publicUrl }).eq('id', candidateId);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

      toast.success('Foto atualizada com sucesso!');
    } catch {
      toast.error('Erro ao enviar foto. Tente novamente.');
    } finally {
      setUploading(false);
      setCropperImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  // Handle state change — reset city
  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity('');
    saveField('state', value);
  };

  // Submit and advance
  const handleNext = async () => {
    if (!candidateId) return;
    if (!allFieldsFilled) {
      setShowErrors(true);
      return;
    }
    setError('');
    setSaving(true);

    try {
      const locationParts = [selectedCity, STATE_NAMES[selectedState] || selectedState].filter(Boolean);
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          date_of_birth: dateOfBirth,
          gender,
          state: selectedState,
          city: selectedCity,
          marital_status: maritalStatus,
          nationality,
          location: locationParts.join(', '),
          onboarding_step: 'professional_profile',
        })
        .eq('id', candidateId);

      if (updateError) throw updateError;

      await refreshCurrentCandidate();
      navigate('/candidato/onboarding/perfil-profissional');
    } catch {
      setError('Erro ao salvar dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const initials = currentCandidate?.name
    ? currentCandidate.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/images/logo-horizontal.png"
              alt="RecrutaRS"
              className="h-10 w-auto"
            />
          </div>
          <OnboardingStepIndicator currentStep={2} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Perfil Pessoal</h1>
          <p className="text-muted-foreground mb-8">
            Preencha seus dados pessoais para continuar.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-muted">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className={cn(
                    'absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors',
                    uploading && 'opacity-50 pointer-events-none'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                {avatarUrl && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-muted-foreground">
                {avatarUrl ? 'Foto enviada' : 'Clique para enviar foto (JPG, PNG ou WebP, max 2MB)'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date of birth */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  Data de nascimento
                </Label>
                <DateOfBirthSelect
                  value={dateOfBirth}
                  onChange={(isoDate) => setDateOfBirth(isoDate)}
                  onBlur={() => dateOfBirth && saveField('date_of_birth', dateOfBirth)}
                  hasError={showErrors && (!dateOfBirth || !isAgeValid())}
                />
                {dateOfBirth && !isAgeValid() && (
                  <p className="text-xs text-destructive" role="alert">Você deve ter pelo menos 16 anos.</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  Gênero
                </Label>
                <Select value={gender} onValueChange={(v) => { setGender(v); saveField('gender', v); }}>
                  <SelectTrigger className={cn(showErrors && !gender && 'border-destructive')}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Estado
                </Label>
                <Select value={selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger className={cn(showErrors && !selectedState && 'border-destructive')}>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((uf) => (
                      <SelectItem key={uf} value={uf}>{STATE_NAMES[uf] || uf} ({uf})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Cidade
                </Label>
                <Select
                  value={selectedCity}
                  onValueChange={(v) => { setSelectedCity(v); saveField('city', v); }}
                  disabled={!selectedState}
                >
                  <SelectTrigger className={cn(showErrors && !selectedCity && 'border-destructive')}>
                    <SelectValue placeholder={selectedState ? 'Selecione a cidade' : 'Selecione o estado primeiro'} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Marital Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-primary" />
                  Estado civil
                </Label>
                <Select value={maritalStatus} onValueChange={(v) => { setMaritalStatus(v); saveField('marital_status', v); }}>
                  <SelectTrigger className={cn(showErrors && !maritalStatus && 'border-destructive')}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <Label htmlFor="nationality" className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" />
                  Nacionalidade
                </Label>
                <Input
                  id="nationality"
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  onBlur={() => nationality && saveField('nationality', nationality)}
                  placeholder="Brasileira"
                  className={cn(showErrors && !nationality.trim() && 'border-destructive')}
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleNext}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Próximo — Perfil Profissional
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

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
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
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
            <Button onClick={handleCropConfirm} disabled={uploading}>
              {uploading ? (
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
    </div>
  );
}
