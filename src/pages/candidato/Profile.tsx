import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, Save, Camera, FileText, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { mockCandidates } from '@/data/mockData';
import { calculateProfileCompletion } from '@/utils/profileCompleteness';

const MAX_ABOUT_LENGTH = 500;

export default function CandidateProfile() {
  const candidate = mockCandidates[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(candidate.avatar || null);

  const [profile, setProfile] = useState({
    name: candidate.name,
    email: candidate.email,
    title: candidate.title,
    location: candidate.location,
    phone: candidate.phone || '(11) 99999-9999',
    linkedin: candidate.linkedin || 'linkedin.com/in/joaosantos',
    about: candidate.about || 'Desenvolvedor Full Stack apaixonado por criar soluções inovadoras. Com 5 anos de experiência, tenho trabalhado em projetos de grande escala utilizando tecnologias modernas.',
  });

  const completion = calculateProfileCompletion(profile);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast.success('Foto atualizada!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toast.success('Perfil atualizado com sucesso!');
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Mantenha suas informações pessoais atualizadas</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-5 h-5 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Completude do Perfil</h2>
            <span className="text-2xl font-bold text-foreground">{completion}%</span>
          </div>
          <Progress value={completion} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {completion < 100
              ? 'Complete seu perfil para aumentar suas chances de ser encontrado'
              : 'Parabéns! Seu perfil está completo!'}
          </p>
        </motion.div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
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
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.title}</p>
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Trocar foto
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
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
              <Label htmlFor="location">Localização</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  className="pl-9"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>
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
          transition={{ delay: 0.15 }}
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
          <Button size="lg" onClick={handleSave}>
            <Save className="w-5 h-5 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
