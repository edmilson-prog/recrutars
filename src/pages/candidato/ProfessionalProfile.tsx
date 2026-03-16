// PRD-073: Página de Perfil Profissional Unificado

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Upload,
  ExternalLink,
  Link as LinkIcon,
  FileText,
  MapPin,
  DollarSign,
  ChevronsUpDown,
  Target,
} from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from 'sonner';

import {
  brazilianStates,
  jobSectorOptions,
  jobRoleOptions,
  workModelOptions,
  contractTypeOptions,
} from '@/data/settingsConfig';
import { brazilianCitiesByState } from '@/data/brazilianCities';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useEnsureProfile, useUpdateCurriculum } from '@/hooks/useCurriculumsQuery';
import type {
  Curriculum,
  ExperienceWithCurrent,
  EducationWithStatus,
  Course,
  EducationStatus,
  CertificateType,
} from '@/types';
import {
  educationStatusLabels,
} from '@/types/curriculum';
import { calculateCompleteness, getProgressColor } from '@/utils/curriculumCompleteness';
import { Progress } from '@/components/ui/progress';
import DocumentsTab from '@/components/profile/DocumentsTab';
import { OnboardingStepIndicator } from '@/components/onboarding/OnboardingStepIndicator';
import { StandardizedSkillSelector } from '@/components/skills/StandardizedSkillSelector';
import { formatBrazilianPhone, stripToDigits } from '@/hooks/usePhoneMask';
import { useSkillCatalog, useCandidateStandardizedSkills, useSetCandidateSkills } from '@/hooks/useStandardizedSkillsQuery';

// Stable layout components — defined OUTSIDE the main component to prevent
// React from creating new component references on every render (which would
// unmount/remount all children and destroy input focus).
function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}

function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <DashboardLayout userType="candidate">{children}</DashboardLayout>;
}

interface ProfessionalProfileProps {
  onboardingMode?: boolean;
  onOnboardingComplete?: () => void;
}

export default function ProfessionalProfile({ onboardingMode = false, onOnboardingComplete }: ProfessionalProfileProps = {}) {
  const navigate = useNavigate();
  const { currentCandidate } = useAuth();
  const candidateId = currentCandidate?.id ?? '';

  // Service layer hooks
  const { data: fetchedProfile, isLoading: fetchLoading } = useProfile(candidateId);
  const updateMutation = useUpdateCurriculum();
  const ensureProfileMutation = useEnsureProfile();

  // Standardized skills hooks
  const { data: skillCatalog } = useSkillCatalog();
  const { data: existingStdSkills } = useCandidateStandardizedSkills(candidateId);
  const setStdSkillsMutation = useSetCandidateSkills();
  const [stdTechnicalIds, setStdTechnicalIds] = useState<string[]>([]);
  const [stdBehavioralIds, setStdBehavioralIds] = useState<string[]>([]);

  // Skill migration banner
  const [skillMigrationNote, setSkillMigrationNote] = useState<{ from: string; to: string }[] | null>(null);

  useEffect(() => {
    if (!candidateId) return;
    supabase
      .from('candidates')
      .select('skill_migration_note')
      .eq('id', candidateId)
      .single()
      .then(({ data }) => {
        if (data?.skill_migration_note) {
          setSkillMigrationNote(data.skill_migration_note as { from: string; to: string }[]);
        }
      });
  }, [candidateId]);

  const handleDismissMigrationNote = async () => {
    setSkillMigrationNote(null);
    await supabase
      .from('candidates')
      .update({ skill_migration_note: null })
      .eq('id', candidateId);
  };

  // Estado do currículo
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado das abas (suporta ?tab=skills via query param)
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'basic';
  });

  // Estado do combobox de cidade
  const [cityOpen, setCityOpen] = useState(false);

  // Validacao visual no onboarding
  const [showOnboardingErrors, setShowOnboardingErrors] = useState(false);
  const [blinkErrors, setBlinkErrors] = useState(false);

  // Estados para modais
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);

  // Estados para edição
  const [editingExperience, setEditingExperience] = useState<ExperienceWithCurrent | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationWithStatus | null>(null);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Guard: evita que refetches background do React Query sobrescrevam estado local nao salvo.
  // Reseta naturalmente ao desmontar/remontar o componente.
  const initializedRef = useRef(false);

  // Snapshot do ultimo estado salvo — para detectar mudancas nao salvas nos campos de texto
  const savedSnapshotRef = useRef<Curriculum | null>(null);

  // Carregar perfil ou garantir que existe (apenas na inicializacao)
  useEffect(() => {
    if (!fetchLoading) {
      if (fetchedProfile && !initializedRef.current) {
        const profileWithDefaults = { ...fetchedProfile };
        if (!profileWithDefaults.email && currentCandidate?.email) {
          profileWithDefaults.email = currentCandidate.email;
        }
        if (!profileWithDefaults.phone && currentCandidate?.phone) {
          profileWithDefaults.phone = currentCandidate.phone;
        }
        if (!profileWithDefaults.state && currentCandidate?.state) {
          profileWithDefaults.state = currentCandidate.state;
        }
        if (!profileWithDefaults.city && currentCandidate?.city) {
          profileWithDefaults.city = currentCandidate.city;
        }
        setCurriculum(profileWithDefaults);
        savedSnapshotRef.current = fetchedProfile;
        setLoading(false);
        initializedRef.current = true;
      } else if (!fetchedProfile && candidateId && !ensureProfileMutation.isPending) {
        ensureProfileMutation.mutate({
          candidateId,
          initialData: {
            email: currentCandidate?.email ?? '',
            phone: currentCandidate?.phone ?? undefined,
            state: currentCandidate?.state ?? undefined,
            city: currentCandidate?.city ?? undefined,
          },
        });
      }
    }
  }, [fetchLoading, fetchedProfile, candidateId]);

  // Quando ensureProfile retorna o perfil criado, usar ele
  useEffect(() => {
    if (ensureProfileMutation.data) {
      setCurriculum({ ...ensureProfileMutation.data });
      savedSnapshotRef.current = ensureProfileMutation.data;
      setLoading(false);
      initializedRef.current = true;
    }
  }, [ensureProfileMutation.data]);

  // Populate standardized skills from existing data
  useEffect(() => {
    if (!existingStdSkills || existingStdSkills.length === 0) return;
    const technical = existingStdSkills
      .filter((s) => s.skill?.type === 'technical')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);
    const behavioral = existingStdSkills
      .filter((s) => s.skill?.type === 'behavioral')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);
    setStdTechnicalIds(technical);
    setStdBehavioralIds(behavioral);
  }, [existingStdSkills]);

  // Save standardized skills
  const handleSaveStdSkills = useCallback(() => {
    if (!candidateId) return;
    const allSkills = [
      ...stdTechnicalIds.map((id, i) => ({ skillId: id, priority: i + 1 })),
      ...stdBehavioralIds.map((id, i) => ({ skillId: id, priority: i + 1 })),
    ];
    setStdSkillsMutation.mutate(
      { candidateId, skills: allSkills },
      {
        onSuccess: () => toast.success('Habilidades padronizadas salvas!'),
        onError: () => toast.error('Erro ao salvar habilidades padronizadas'),
      }
    );
  }, [candidateId, stdTechnicalIds, stdBehavioralIds, setStdSkillsMutation]);

  // Detectar mudancas nao salvas nos campos de texto (sub-entidades sao auto-saved)
  const hasUnsavedChanges = useMemo(() => {
    if (!curriculum || !savedSnapshotRef.current) return false;
    const saved = savedSnapshotRef.current;
    return (
      curriculum.title !== saved.title ||
      curriculum.email !== saved.email ||
      curriculum.phone !== saved.phone ||
      curriculum.linkedin !== saved.linkedin ||
      curriculum.about !== saved.about ||
      curriculum.availability !== saved.availability ||
      curriculum.city !== saved.city ||
      curriculum.state !== saved.state ||
      (curriculum.salary?.min ?? 0) !== (saved.salary?.min ?? 0) ||
      (curriculum.salary?.max ?? 0) !== (saved.salary?.max ?? 0) ||
      curriculum.openToRelocation !== saved.openToRelocation ||
      curriculum.salaryNegotiable !== saved.salaryNegotiable ||
      JSON.stringify(curriculum.preferredSectors) !== JSON.stringify(saved.preferredSectors) ||
      JSON.stringify(curriculum.preferredRoles) !== JSON.stringify(saved.preferredRoles) ||
      JSON.stringify(curriculum.workModel) !== JSON.stringify(saved.workModel) ||
      JSON.stringify(curriculum.contractType) !== JSON.stringify(saved.contractType)
    );
  }, [curriculum]);

  // Proteger contra refresh/fechar aba do navegador
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Handler genérico para atualizar campos
  const updateField = useCallback(
    <K extends keyof Curriculum>(field: K, value: Curriculum[K]) => {
      setCurriculum((prev) =>
        prev ? { ...prev, [field]: value, updatedAt: new Date().toISOString() } : null
      );
    },
    []
  );

  // Toggle para campos de array (checkboxes de interesses)
  const toggleArrayField = useCallback(
    (field: keyof Curriculum, value: string) => {
      setCurriculum((prev) => {
        if (!prev) return null;
        const current = (prev[field] as string[]) || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [field]: updated, updatedAt: new Date().toISOString() };
      });
    },
    []
  );

  // Handlers para experiência (auto-save: persiste no banco imediatamente)
  const handleSaveExperience = async (experience: ExperienceWithCurrent) => {
    if (!curriculum) return;

    const existingIndex = curriculum.experiences.findIndex((e) => e.id === experience.id);
    let updatedExperiences: ExperienceWithCurrent[];

    if (existingIndex >= 0) {
      updatedExperiences = [...curriculum.experiences];
      updatedExperiences[existingIndex] = experience;
    } else {
      updatedExperiences = [...curriculum.experiences, experience];
    }

    const previousExperiences = curriculum.experiences;
    updateField('experiences', updatedExperiences);
    setExperienceDialogOpen(false);
    setEditingExperience(null);

    try {
      const saved = await updateMutation.mutateAsync({
        id: curriculum.id,
        updates: { experiences: updatedExperiences },
      });
      setCurriculum((prev) => prev ? { ...prev, experiences: saved.experiences } : null);
      toast.success(existingIndex >= 0 ? 'Experiência atualizada!' : 'Experiência adicionada!');
    } catch {
      updateField('experiences', previousExperiences);
      toast.error('Erro ao salvar experiência.');
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    if (!curriculum) return;
    const previousExperiences = curriculum.experiences;
    const updatedExperiences = curriculum.experiences.filter((e) => e.id !== experienceId);
    updateField('experiences', updatedExperiences);

    try {
      const saved = await updateMutation.mutateAsync({
        id: curriculum.id,
        updates: { experiences: updatedExperiences },
      });
      setCurriculum((prev) => prev ? { ...prev, experiences: saved.experiences } : null);
      toast.success('Experiência removida.');
    } catch {
      updateField('experiences', previousExperiences);
      toast.error('Erro ao remover experiência.');
    }
  };

  // Handlers para formação (auto-save)
  const handleSaveEducation = async (education: EducationWithStatus) => {
    if (!curriculum) return;

    const existingIndex = curriculum.education.findIndex((e) => e.id === education.id);
    let updatedEducation: EducationWithStatus[];

    if (existingIndex >= 0) {
      updatedEducation = [...curriculum.education];
      updatedEducation[existingIndex] = education;
    } else {
      updatedEducation = [...curriculum.education, education];
    }

    const previousEducation = curriculum.education;
    updateField('education', updatedEducation);
    setEducationDialogOpen(false);
    setEditingEducation(null);

    try {
      const saved = await updateMutation.mutateAsync({
        id: curriculum.id,
        updates: { education: updatedEducation },
      });
      setCurriculum((prev) => prev ? { ...prev, education: saved.education } : null);
      toast.success(existingIndex >= 0 ? 'Formação atualizada!' : 'Formação adicionada!');
    } catch {
      updateField('education', previousEducation);
      toast.error('Erro ao salvar formação.');
    }
  };

  const handleDeleteEducation = async (educationId: string) => {
    if (!curriculum) return;
    const previousEducation = curriculum.education;
    const updatedEducation = curriculum.education.filter((e) => e.id !== educationId);
    updateField('education', updatedEducation);

    try {
      const saved = await updateMutation.mutateAsync({
        id: curriculum.id,
        updates: { education: updatedEducation },
      });
      setCurriculum((prev) => prev ? { ...prev, education: saved.education } : null);
      toast.success('Formação removida.');
    } catch {
      updateField('education', previousEducation);
      toast.error('Erro ao remover formação.');
    }
  };

  // Handlers para cursos (auto-save)
  const handleSaveCourse = async (course: Course) => {
    if (!curriculum) return;

    const existingIndex = curriculum.courses.findIndex((c) => c.id === course.id);
    let updatedCourses: Course[];

    if (existingIndex >= 0) {
      updatedCourses = [...curriculum.courses];
      updatedCourses[existingIndex] = course;
    } else {
      updatedCourses = [...curriculum.courses, course];
    }

    const previousCourses = curriculum.courses;
    updateField('courses', updatedCourses);
    setCourseDialogOpen(false);
    setEditingCourse(null);

    try {
      const saved = await updateMutation.mutateAsync({
        id: curriculum.id,
        updates: { courses: updatedCourses },
      });
      setCurriculum((prev) => prev ? { ...prev, courses: saved.courses } : null);
      toast.success(existingIndex >= 0 ? 'Curso atualizado!' : 'Curso adicionado!');
    } catch {
      updateField('courses', previousCourses);
      toast.error('Erro ao salvar curso.');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!curriculum) return;
    const previousCourses = curriculum.courses;
    const updatedCourses = curriculum.courses.filter((c) => c.id !== courseId);
    updateField('courses', updatedCourses);

    try {
      const saved = await updateMutation.mutateAsync({
        id: curriculum.id,
        updates: { courses: updatedCourses },
      });
      setCurriculum((prev) => prev ? { ...prev, courses: saved.courses } : null);
      toast.success('Curso removido.');
    } catch {
      updateField('courses', previousCourses);
      toast.error('Erro ao remover curso.');
    }
  };

  // Salvar perfil
  const handleSave = async () => {
    if (!curriculum) return;

    // Compor location a partir de city+state para backward compat
    const composedLocation = [curriculum.city, curriculum.state].filter(Boolean).join(', ');
    const updatedCurriculum = { ...curriculum, location: composedLocation || curriculum.location };

    setSaving(true);
    try {
      const saved = await updateMutation.mutateAsync({ id: curriculum.id, updates: updatedCurriculum });
      setCurriculum({ ...saved });
      savedSnapshotRef.current = saved;
      toast.success('Perfil salvo com sucesso!');
    } catch {
      toast.error('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  // Onboarding-specific completeness: stricter requirements for mandatory tabs
  // Must be before early returns to satisfy React hooks ordering rules.
  const onboardingTabStatus = useMemo(() => {
    if (!onboardingMode || !curriculum) return { complete: false, incomplete: [] as string[] };
    const hasBasic = Boolean(curriculum.title?.trim() && curriculum.availability?.trim());
    const hasLocation = Boolean(curriculum.city?.trim() || curriculum.state?.trim());
    const hasSalary = Boolean(curriculum.salary?.min && curriculum.salary?.max);
    const hasInterests = Boolean(
      (curriculum.preferredSectors?.length ?? 0) > 0 &&
      (curriculum.preferredRoles?.length ?? 0) > 0 &&
      (curriculum.workModel?.length ?? 0) > 0 &&
      (curriculum.contractType?.length ?? 0) > 0
    );
    const hasExperience = curriculum.isFirstJob || (curriculum.experiences?.length ?? 0) > 0;
    const hasEducation = Boolean(curriculum.educationLevel) || (curriculum.education?.length ?? 0) > 0;
    const hasSkills = (curriculum.skills?.length ?? 0) > 0;
    const incomplete: string[] = [];
    if (!hasBasic) incomplete.push('basic');
    if (!hasLocation) incomplete.push('location');
    if (!hasSalary) incomplete.push('salary');
    if (!hasInterests) incomplete.push('interests');
    if (!hasExperience) incomplete.push('experience');
    if (!hasEducation) incomplete.push('education');
    if (!hasSkills) incomplete.push('skills');
    return { complete: incomplete.length === 0, incomplete };
  }, [onboardingMode, curriculum]);

  const onboardingComplete = onboardingTabStatus.complete;

  // Pick stable layout component (defined outside this function to avoid re-renders)
  const LayoutWrapper = onboardingMode ? OnboardingLayout : DashboardLayoutWrapper;

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </LayoutWrapper>
    );
  }

  if (!curriculum) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">Currículo não encontrado.</p>
          <Button onClick={() => navigate('/candidato')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </LayoutWrapper>
    );
  }

  const completeness = calculateCompleteness(curriculum);

  return (
    <LayoutWrapper>
      {/* Onboarding header */}
      {onboardingMode && (
        <div className="border-b bg-card">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center mb-6">
              <img src="/images/logo-horizontal.png" alt="RecrutaRS" className="h-10 w-auto" />
            </div>
            <OnboardingStepIndicator currentStep={3} />
          </div>
        </div>
      )}
      <div className={cn("space-y-6", onboardingMode && "max-w-4xl mx-auto px-4 py-8")}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {!onboardingMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/candidato')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Perfil Profissional
              </h1>
              <p className="text-muted-foreground">{curriculum.title || 'Complete seu perfil profissional'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Barra de completude mini */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Completude:</span>
              <Progress value={completeness.percentage} className="w-24 h-2" />
              <span className="text-sm font-medium">{completeness.percentage}%</span>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="basic" className={cn("gap-2", showOnboardingErrors && onboardingTabStatus.incomplete.includes('basic') && cn("ring-1 ring-destructive", blinkErrors && "animate-blink-destructive"))}>
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Informações</span>
            </TabsTrigger>
            <TabsTrigger value="location" className={cn("gap-2", showOnboardingErrors && onboardingTabStatus.incomplete.includes('location') && cn("ring-1 ring-destructive", blinkErrors && "animate-blink-destructive"))}>
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Localização</span>
            </TabsTrigger>
            <TabsTrigger value="salary" className={cn("gap-2", showOnboardingErrors && onboardingTabStatus.incomplete.includes('salary') && cn("ring-1 ring-destructive", blinkErrors && "animate-blink-destructive"))}>
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Salário</span>
            </TabsTrigger>
            <TabsTrigger value="interests" className={cn("gap-2", showOnboardingErrors && onboardingTabStatus.incomplete.includes('interests') && cn("ring-1 ring-destructive", blinkErrors && "animate-blink-destructive"))}>
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Interesses</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className={cn("gap-2", showOnboardingErrors && onboardingTabStatus.incomplete.includes('experience') && cn("ring-1 ring-destructive", blinkErrors && "animate-blink-destructive"))}>
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Experiência</span>
              {curriculum.experiences.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {curriculum.experiences.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="education" className={cn("gap-2", showOnboardingErrors && onboardingTabStatus.incomplete.includes('education') && cn("ring-1 ring-destructive", blinkErrors && "animate-blink-destructive"))}>
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Formação</span>
              {curriculum.education.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {curriculum.education.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="skills" className={cn("gap-2", showOnboardingErrors && onboardingTabStatus.incomplete.includes('skills') && cn("ring-1 ring-destructive", blinkErrors && "animate-blink-destructive"))}>
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Habilidades</span>
              {curriculum.skills.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {curriculum.skills.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Cursos</span>
              {curriculum.courses.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {curriculum.courses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documentos</span>
              {(curriculum.resumePdfUrl || curriculum.presentationVideoUrl) && (
                <Badge variant="secondary" className="ml-1">
                  {(curriculum.resumePdfUrl ? 1 : 0) + (curriculum.presentationVideoUrl ? 1 : 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Informações Básicas */}
          <TabsContent value="basic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Preencha seus dados pessoais e profissionais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Título Profissional</Label>
                    <Input
                      id="title"
                      value={curriculum.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Ex: Analista Administrativo, Vendedor, Enfermeiro..."
                      className={cn("capitalize", showOnboardingErrors && !curriculum.title?.trim() && "border-destructive", showOnboardingErrors && !curriculum.title?.trim() && blinkErrors && "animate-blink-destructive")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={curriculum.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="seu@email.com"
                      className={cn(showOnboardingErrors && !curriculum.email?.trim() && "border-destructive", showOnboardingErrors && !curriculum.email?.trim() && blinkErrors && "animate-blink-destructive")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={formatBrazilianPhone(curriculum.phone || '')}
                      onChange={(e) => {
                        const raw = stripToDigits(e.target.value).slice(0, 11);
                        updateField('phone', raw);
                      }}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                    {(() => {
                      const digits = curriculum.phone || '';
                      if (digits.length >= 3) {
                        const isMobile = digits[2] === '9';
                        return (
                          <span className={cn('text-xs', isMobile ? 'text-emerald-500' : 'text-blue-500')}>
                            {isMobile ? 'Celular' : 'Fixo'}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={curriculum.linkedin || ''}
                      onChange={(e) => updateField('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/seu-perfil"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">Sobre você</Label>
                  <Textarea
                    id="about"
                    value={curriculum.about || ''}
                    onChange={(e) => updateField('about', e.target.value)}
                    placeholder="Descreva brevemente sua experiência e objetivos profissionais..."
                    rows={4}
                    className={cn(showOnboardingErrors && !curriculum.about?.trim() && "border-destructive", showOnboardingErrors && !curriculum.about?.trim() && blinkErrors && "animate-blink-destructive")}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Disponibilidade</Label>
                    <Select
                      value={curriculum.availability}
                      onValueChange={(v) => updateField('availability', v)}
                    >
                      <SelectTrigger className={cn(showOnboardingErrors && !curriculum.availability?.trim() && "border-destructive", showOnboardingErrors && !curriculum.availability?.trim() && blinkErrors && "animate-blink-destructive")}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Imediata">Imediata</SelectItem>
                        <SelectItem value="1 semana">1 semana</SelectItem>
                        <SelectItem value="2 semanas">2 semanas</SelectItem>
                        <SelectItem value="1 mês">1 mês</SelectItem>
                        <SelectItem value="2 meses">2 meses</SelectItem>
                        <SelectItem value="A combinar">A combinar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Localização */}
          <TabsContent value="location" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
                <CardDescription>
                  Cidade e disponibilidade para mudança.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prof-state">Estado</Label>
                    <Select
                      value={curriculum.state || '__none__'}
                      onValueChange={(value) => {
                        const newState = value === '__none__' ? '' : value;
                        setCurriculum((prev) =>
                          prev ? { ...prev, state: newState, city: '' } : null
                        );
                      }}
                    >
                      <SelectTrigger id="prof-state" className={cn(showOnboardingErrors && !curriculum.state?.trim() && !curriculum.city?.trim() && "border-destructive", showOnboardingErrors && !curriculum.state?.trim() && !curriculum.city?.trim() && blinkErrors && "animate-blink-destructive")}>
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
                  <div className="space-y-2">
                    <Label htmlFor="prof-city">Cidade</Label>
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="prof-city"
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityOpen}
                          className={cn("w-full justify-between font-normal", showOnboardingErrors && !curriculum.state?.trim() && !curriculum.city?.trim() && "border-destructive", showOnboardingErrors && !curriculum.state?.trim() && !curriculum.city?.trim() && blinkErrors && "animate-blink-destructive")}
                          disabled={!curriculum.state}
                        >
                          {curriculum.city || 'Selecione a cidade...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar cidade..." />
                          <CommandList>
                            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                            <CommandGroup>
                              {(brazilianCitiesByState[curriculum.state || ''] || []).map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={() => {
                                    setCurriculum((prev) =>
                                      prev ? { ...prev, city } : null
                                    );
                                    setCityOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      curriculum.city === city ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  {city}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {!curriculum.state && (
                      <p className="text-xs text-muted-foreground">Selecione um estado primeiro</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/50 rounded-xl">
                  <div>
                    <Label className="font-medium">Disponível para Mudança</Label>
                    <p className="text-sm text-muted-foreground">
                      Indica se você aceitaria mudar de cidade/estado para uma oportunidade
                    </p>
                  </div>
                  <Switch
                    checked={curriculum.openToRelocation || false}
                    onCheckedChange={(checked) => updateField('openToRelocation', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Salário */}
          <TabsContent value="salary" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Expectativa Salarial</CardTitle>
                <CardDescription>
                  Faixa salarial pretendida.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prof-salaryMin">Salário Mínimo (R$)</Label>
                    <Input
                      id="prof-salaryMin"
                      type="number"
                      min={0}
                      max={100000}
                      placeholder="Ex: 3000"
                      value={curriculum.salary?.min || ''}
                      onChange={(e) =>
                        updateField('salary', {
                          ...curriculum.salary,
                          min: parseInt(e.target.value) || 0,
                        })
                      }
                      className={cn(showOnboardingErrors && !curriculum.salary?.min && "border-destructive", showOnboardingErrors && !curriculum.salary?.min && blinkErrors && "animate-blink-destructive")}
                    />
                    <p className="text-xs text-muted-foreground">Valor mínimo pretendido</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof-salaryMax">Salário Máximo (R$)</Label>
                    <Input
                      id="prof-salaryMax"
                      type="number"
                      min={0}
                      max={100000}
                      placeholder="Ex: 8000"
                      value={curriculum.salary?.max || ''}
                      onChange={(e) =>
                        updateField('salary', {
                          ...curriculum.salary,
                          max: parseInt(e.target.value) || 0,
                        })
                      }
                      className={cn(showOnboardingErrors && !curriculum.salary?.max && "border-destructive", showOnboardingErrors && !curriculum.salary?.max && blinkErrors && "animate-blink-destructive")}
                    />
                    <p className="text-xs text-muted-foreground">Valor máximo pretendido</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/50 rounded-xl">
                  <div>
                    <Label className="font-medium">Aceita Negociar</Label>
                    <p className="text-sm text-muted-foreground">
                      Indicar se você está aberto a negociação salarial
                    </p>
                  </div>
                  <Switch
                    checked={curriculum.salaryNegotiable || false}
                    onCheckedChange={(checked) => updateField('salaryNegotiable', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Interesses */}
          <TabsContent value="interests" className="mt-6">
            <div className="space-y-6">
              <Card className={cn(showOnboardingErrors && ((curriculum.workModel?.length ?? 0) === 0 || (curriculum.contractType?.length ?? 0) === 0) && "border-destructive", showOnboardingErrors && ((curriculum.workModel?.length ?? 0) === 0 || (curriculum.contractType?.length ?? 0) === 0) && blinkErrors && "animate-blink-destructive")}>
                <CardHeader>
                  <CardTitle>Modelo de Trabalho</CardTitle>
                  <CardDescription>
                    Preferências de modalidade e tipo de contrato.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Modalidade</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {workModelOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`work-${option.value}`}
                            checked={(curriculum.workModel || []).includes(option.value)}
                            onCheckedChange={() => toggleArrayField('workModel', option.value)}
                          />
                          <Label htmlFor={`work-${option.value}`} className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Tipo de Contrato</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {contractTypeOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`contract-${option.value}`}
                            checked={(curriculum.contractType || []).includes(option.value)}
                            onCheckedChange={() => toggleArrayField('contractType', option.value)}
                          />
                          <Label htmlFor={`contract-${option.value}`} className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(showOnboardingErrors && ((curriculum.preferredSectors?.length ?? 0) === 0 || (curriculum.preferredRoles?.length ?? 0) === 0) && "border-destructive", showOnboardingErrors && ((curriculum.preferredSectors?.length ?? 0) === 0 || (curriculum.preferredRoles?.length ?? 0) === 0) && blinkErrors && "animate-blink-destructive")}>
                <CardHeader>
                  <CardTitle>Áreas de Interesse</CardTitle>
                  <CardDescription>
                    Selecione os setores e funções que mais te interessam.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Setores Preferidos</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {jobSectorOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sector-${option.value}`}
                            checked={(curriculum.preferredSectors || []).includes(option.value)}
                            onCheckedChange={() => toggleArrayField('preferredSectors', option.value)}
                          />
                          <Label htmlFor={`sector-${option.value}`} className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Funções Desejadas</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {jobRoleOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${option.value}`}
                            checked={(curriculum.preferredRoles || []).includes(option.value)}
                            onCheckedChange={() => toggleArrayField('preferredRoles', option.value)}
                          />
                          <Label htmlFor={`role-${option.value}`} className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Experiência */}
          <TabsContent value="experience" className="mt-6">
            <div className="space-y-6">
              {/* Toggle Primeiro Emprego */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="first-job" className="text-sm font-medium">Primeiro Emprego</Label>
                  <p className="text-xs text-muted-foreground">Ainda não possuo experiência profissional.</p>
                </div>
                <Switch
                  id="first-job"
                  checked={curriculum.isFirstJob || false}
                  onCheckedChange={(checked) => updateField('isFirstJob', checked)}
                />
              </div>

              {!curriculum.isFirstJob && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Experiência Profissional</CardTitle>
                      <CardDescription>
                        Adicione suas experiências mais relevantes.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingExperience(null);
                        setExperienceDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {curriculum.experiences.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma experiência adicionada.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {curriculum.experiences.map((exp, index) => (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  {exp.role}
                                  {exp.current && (
                                    <Badge className="bg-green-500">Atual</Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {exp.company}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {exp.startDate}
                                  {exp.current ? ' - Atual' : exp.endDate ? ` - ${exp.endDate}` : ''}
                                </p>
                                {exp.description && (
                                  <p className="text-sm mt-2">{exp.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingExperience(exp);
                                    setExperienceDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteExperience(exp.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab: Formação */}
          <TabsContent value="education" className="mt-6">
            <div className="space-y-6">
              {/* Card: Escolaridade */}
              <Card>
                <CardHeader>
                  <CardTitle>Escolaridade</CardTitle>
                  <CardDescription>
                    Selecione seu nível de escolaridade e status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={curriculum.educationLevel || ''}
                    onValueChange={(value) => {
                      updateField('educationLevel', value);
                      if (!curriculum.educationLevelStatus) {
                        updateField('educationLevelStatus', 'completo');
                      }
                    }}
                  >
                    {[
                      { value: 'fundamental_i', label: 'Ensino Fundamental I (1º ao 5º)' },
                      { value: 'fundamental_ii', label: 'Ensino Fundamental II (6º ao 9º)' },
                      { value: 'medio', label: 'Ensino Médio (1º ao 3º)' },
                      { value: 'superior', label: 'Ensino Superior' },
                    ].map((level, index, arr) => {
                      const isSelected = curriculum.educationLevel === level.value;
                      const isFirst = index === 0;
                      const isLast = index === arr.length - 1;
                      return (
                        <div
                          key={level.value}
                          className={cn(
                            'relative flex items-center gap-3 border px-4 py-3 -mt-px first:mt-0 transition-colors',
                            isFirst && 'rounded-t-lg',
                            isLast && 'rounded-b-lg',
                            isSelected
                              ? 'z-10 border-primary bg-primary/5 dark:bg-primary/10'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <RadioGroupItem value={level.value} id={`edu-level-${level.value}`} />
                          <Label
                            htmlFor={`edu-level-${level.value}`}
                            className="flex-1 cursor-pointer font-medium text-sm"
                          >
                            {level.label}
                          </Label>
                          {isSelected && (
                            <div className="flex items-center rounded-full border p-0.5 gap-0">
                              <button
                                type="button"
                                onClick={() => updateField('educationLevelStatus', 'completo')}
                                className={cn(
                                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                  (curriculum.educationLevelStatus || 'completo') === 'completo'
                                    ? 'bg-green-500 text-white'
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                Completo
                              </button>
                              <button
                                type="button"
                                onClick={() => updateField('educationLevelStatus', 'incompleto')}
                                className={cn(
                                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                  curriculum.educationLevelStatus === 'incompleto'
                                    ? 'bg-amber-500 text-white'
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                Incompleto
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Card: Formação Acadêmica (Opcional) */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      Formação Acadêmica
                      <Badge variant="outline" className="ml-2 text-xs font-normal">Opcional</Badge>
                    </CardTitle>
                    <CardDescription>
                      Adicione cursos de graduação, pós ou técnico, se houver.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingEducation(null);
                      setEducationDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </CardHeader>
                <CardContent>
                  {curriculum.education.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma formação adicionada.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {curriculum.education.map((edu, index) => (
                        <motion.div
                          key={edu.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">
                                {edu.degree} em {edu.field}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {edu.institution}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {edu.startYear}
                                {edu.endYear ? ` - ${edu.endYear}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={edu.status === 'completed' ? 'default' : 'secondary'}
                                className={
                                  edu.status === 'completed'
                                    ? 'bg-green-500'
                                    : edu.status === 'in_progress'
                                    ? 'bg-blue-500'
                                    : ''
                                }
                              >
                                {educationStatusLabels[edu.status]}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingEducation(edu);
                                  setEducationDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEducation(edu.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Habilidades */}
          <TabsContent value="skills" className="mt-6 space-y-6">
            {/* Banner de migração por similaridade */}
            {skillMigrationNote && skillMigrationNote.length > 0 && (
              <Alert className="border-cyan-500/30 bg-cyan-500/10">
                <Info className="h-4 w-4 text-cyan-500" />
                <AlertTitle className="text-cyan-700 dark:text-cyan-400">
                  Suas habilidades foram atualizadas
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Algumas competências foram ajustadas para o formato padronizado. Revise abaixo e corrija se necessário.
                  </p>
                  <ul className="text-sm space-y-1">
                    {skillMigrationNote.map((note, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">{note.from}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium text-foreground">{note.to}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismissMigrationNote}
                    className="mt-2"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Entendi, está correto
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Habilidades Padronizadas */}
            {skillCatalog && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Habilidades</CardTitle>
                    <CardDescription>
                      Selecione suas principais competências para que empresas encontrem seu perfil.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleSaveStdSkills}
                    disabled={setStdSkillsMutation.isPending}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {setStdSkillsMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StandardizedSkillSelector
                    type="technical"
                    selectedSkillIds={stdTechnicalIds}
                    onChange={setStdTechnicalIds}
                    maxSelections={10}
                    catalog={skillCatalog}
                  />
                  <Separator />
                  <StandardizedSkillSelector
                    type="behavioral"
                    selectedSkillIds={stdBehavioralIds}
                    onChange={setStdBehavioralIds}
                    maxSelections={10}
                    catalog={skillCatalog}
                  />
                </CardContent>
              </Card>
            )}

          </TabsContent>

          {/* Tab: Cursos */}
          <TabsContent value="courses" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cursos e Certificações</CardTitle>
                  <CardDescription>
                    Adicione seus cursos e certificações profissionais.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {curriculum.courses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum curso adicionado.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {curriculum.courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{course.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {course.institution} · {course.year}
                            </p>
                            {course.hours && (
                              <p className="text-xs text-muted-foreground">
                                {course.hours} horas
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {course.certificateType && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                {course.certificateType === 'link' ? (
                                  <ExternalLink className="h-3 w-3" />
                                ) : (
                                  <FileText className="h-3 w-3" />
                                )}
                                Certificado
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCourse(course);
                                setCourseDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Documentos */}
          <TabsContent value="documents">
            <DocumentsTab
              curriculum={curriculum}
              candidateId={candidateId}
              onUpdate={async (updates) => {
                await updateMutation.mutateAsync({ id: curriculum.id, updates });
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Dialog: Experiência */}
        <ExperienceDialog
          open={experienceDialogOpen}
          onOpenChange={setExperienceDialogOpen}
          experience={editingExperience}
          onSave={handleSaveExperience}
        />

        {/* Dialog: Formação */}
        <EducationDialog
          open={educationDialogOpen}
          onOpenChange={setEducationDialogOpen}
          education={editingEducation}
          onSave={handleSaveEducation}
        />

        {/* Dialog: Curso */}
        <CourseDialog
          open={courseDialogOpen}
          onOpenChange={setCourseDialogOpen}
          course={editingCourse}
          onSave={handleSaveCourse}
        />

        {/* Onboarding: Navigation buttons (Previous / Next) */}
        {onboardingMode && (() => {
          const ONBOARDING_TAB_ORDER = ['basic', 'location', 'salary', 'interests', 'experience', 'education', 'skills', 'courses', 'documents'];
          const currentTabIndex = ONBOARDING_TAB_ORDER.indexOf(activeTab);
          const isLastTab = currentTabIndex === ONBOARDING_TAB_ORDER.length - 1;
          const isFirstTab = currentTabIndex <= 0;

          return (
            <div className="pt-6 border-t space-y-3">
              <div className="flex gap-3">
                {!isFirstTab && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setActiveTab(ONBOARDING_TAB_ORDER[currentTabIndex - 1])}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                )}
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={async () => {
                    if (!isLastTab) {
                      // Validate current tab before advancing (only for mandatory tabs)
                      const currentTab = ONBOARDING_TAB_ORDER[currentTabIndex];
                      if (onboardingTabStatus.incomplete.includes(currentTab)) {
                        setShowOnboardingErrors(true);
                        setBlinkErrors(true);
                        setTimeout(() => setBlinkErrors(false), 1200);
                        toast.error('Preencha os campos obrigatórios desta aba antes de avançar.');
                        return;
                      }
                      setActiveTab(ONBOARDING_TAB_ORDER[currentTabIndex + 1]);
                      return;
                    }
                    // Last tab — validate and advance to Gauge-Pro test
                    if (!onboardingComplete) {
                      setShowOnboardingErrors(true);
                      setBlinkErrors(true);
                      setTimeout(() => setBlinkErrors(false), 1200);
                      const firstIncomplete = onboardingTabStatus.incomplete[0];
                      if (firstIncomplete) setActiveTab(firstIncomplete);
                      return;
                    }
                    await handleSave();
                    onOnboardingComplete?.();
                  }}
                  disabled={saving}
                >
                  {saving
                    ? 'Salvando...'
                    : isLastTab
                      ? 'Próximo — Teste Comportamental'
                      : 'Próximo'}
                  {!saving && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
              {showOnboardingErrors && !onboardingComplete && (
                <p className="text-xs text-destructive text-center">
                  Complete as abas destacadas para avançar.
                </p>
              )}
            </div>
          );
        })()}
      </div>

    </LayoutWrapper>
  );
}

// Dialog de Experiência
function ExperienceDialog({
  open,
  onOpenChange,
  experience,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience: ExperienceWithCurrent | null;
  onSave: (experience: ExperienceWithCurrent) => void;
}) {
  const [form, setForm] = useState<ExperienceWithCurrent>({
    id: '',
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  useEffect(() => {
    if (experience) {
      setForm(experience);
    } else {
      setForm({
        id: `exp-${Date.now()}`,
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
    }
  }, [experience, open]);

  const handleSubmit = () => {
    if (!form.company || !form.role || !form.startDate) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {experience ? 'Editar Experiência' : 'Adicionar Experiência'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da sua experiência profissional.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exp-company">Empresa *</Label>
            <Input
              id="exp-company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Nome da empresa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-role">Cargo *</Label>
            <Input
              id="exp-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Seu cargo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exp-start">Início *</Label>
              <Input
                id="exp-start"
                type="month"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-end">Término</Label>
              <Input
                id="exp-end"
                type="month"
                value={form.endDate || ''}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                disabled={form.current}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exp-current"
              checked={form.current}
              onCheckedChange={(checked) =>
                setForm({ ...form, current: !!checked, endDate: checked ? '' : form.endDate })
              }
            />
            <Label htmlFor="exp-current">Trabalho atual</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-desc">Descrição</Label>
            <Textarea
              id="exp-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descreva suas responsabilidades e conquistas..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog de Formação
function EducationDialog({
  open,
  onOpenChange,
  education,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  education: EducationWithStatus | null;
  onSave: (education: EducationWithStatus) => void;
}) {
  const [form, setForm] = useState<EducationWithStatus>({
    id: '',
    institution: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    status: 'completed',
  });

  useEffect(() => {
    if (education) {
      setForm(education);
    } else {
      setForm({
        id: `edu-${Date.now()}`,
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: '',
        status: 'completed',
      });
    }
  }, [education, open]);

  const handleSubmit = () => {
    if (!form.institution || !form.degree || !form.field || !form.startYear) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {education ? 'Editar Formação' : 'Adicionar Formação'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da sua formação acadêmica.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edu-institution">Instituição *</Label>
            <Input
              id="edu-institution"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="Nome da instituição"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edu-degree">Grau *</Label>
              <Select
                value={form.degree}
                onValueChange={(v) => setForm({ ...form, degree: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                  <SelectItem value="Bacharelado">Bacharelado</SelectItem>
                  <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                  <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                  <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                  <SelectItem value="MBA">MBA</SelectItem>
                  <SelectItem value="Mestrado">Mestrado</SelectItem>
                  <SelectItem value="Doutorado">Doutorado</SelectItem>
                  <SelectItem value="Especialização">Especialização</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-status">Status *</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as EducationStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completo</SelectItem>
                  <SelectItem value="in_progress">Cursando</SelectItem>
                  <SelectItem value="suspended">Trancado</SelectItem>
                  <SelectItem value="incomplete">Incompleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edu-field">Área de estudo *</Label>
            <Input
              id="edu-field"
              value={form.field}
              onChange={(e) => setForm({ ...form, field: e.target.value })}
              placeholder="Ex: Administração, Enfermagem, Direito..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edu-start">Ano de início *</Label>
              <Input
                id="edu-start"
                value={form.startYear}
                onChange={(e) => setForm({ ...form, startYear: e.target.value })}
                placeholder="2020"
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-end">Ano de conclusão</Label>
              <Input
                id="edu-end"
                value={form.endYear || ''}
                onChange={(e) => setForm({ ...form, endYear: e.target.value })}
                placeholder="2024"
                maxLength={4}
                disabled={form.status === 'in_progress'}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog de Curso
function CourseDialog({
  open,
  onOpenChange,
  course,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onSave: (course: Course) => void;
}) {
  const [form, setForm] = useState<Course>({
    id: '',
    name: '',
    institution: '',
    year: new Date().getFullYear(),
    hours: undefined,
    certificateType: undefined,
    certificateUrl: '',
    certificateFileName: '',
  });

  useEffect(() => {
    if (course) {
      setForm(course);
    } else {
      setForm({
        id: `course-${Date.now()}`,
        name: '',
        institution: '',
        year: new Date().getFullYear(),
        hours: undefined,
        certificateType: undefined,
        certificateUrl: '',
        certificateFileName: '',
      });
    }
  }, [course, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm({
          ...form,
          certificateUrl: reader.result as string,
          certificateFileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.institution || !form.year) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {course ? 'Editar Curso' : 'Adicionar Curso'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do curso ou certificação.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-name">Nome do curso *</Label>
            <Input
              id="course-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: NR-10, Gestão de Projetos, Excel Avançado..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-institution">Instituição *</Label>
            <Input
              id="course-institution"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="Ex: Senai, Sebrae, Coursera..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-year">Ano *</Label>
              <Input
                id="course-year"
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-hours">Carga horária</Label>
              <Input
                id="course-hours"
                type="number"
                value={form.hours || ''}
                onChange={(e) => setForm({ ...form, hours: parseInt(e.target.value) || undefined })}
                placeholder="40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certificado (opcional)</Label>
            <RadioGroup
              value={form.certificateType || ''}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  certificateType: v ? (v as CertificateType) : undefined,
                  certificateUrl: '',
                  certificateFileName: '',
                })
              }
              className="flex flex-col sm:flex-row gap-2 sm:gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="cert-none" />
                <Label htmlFor="cert-none">Sem certificado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="link" id="cert-link" />
                <Label htmlFor="cert-link">Link</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="cert-file" />
                <Label htmlFor="cert-file">Arquivo</Label>
              </div>
            </RadioGroup>
          </div>

          {form.certificateType === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="course-link">URL do certificado</Label>
              <Input
                id="course-link"
                value={form.certificateUrl || ''}
                onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}

          {form.certificateType === 'file' && (
            <div className="space-y-2">
              <Label>Upload do certificado</Label>
              {form.certificateFileName ? (
                <div className="flex items-center gap-2 p-2 border rounded">
                  <FileText className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm flex-1 truncate">{form.certificateFileName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setForm({ ...form, certificateUrl: '', certificateFileName: '' })
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    PDF, PNG ou JPG (max 5MB)
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cert-upload"
                  />
                  <Label htmlFor="cert-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>Selecionar arquivo</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
