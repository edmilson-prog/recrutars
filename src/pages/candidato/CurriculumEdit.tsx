// PRD-022: Página de Edição de Currículo

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
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
import { toast } from 'sonner';

import { mockCurriculums } from '@/data/mockData';
import type {
  Curriculum,
  ExperienceWithCurrent,
  EducationWithStatus,
  SkillWithLevel,
  Course,
  SkillLevel,
  EducationStatus,
  SkillType,
  CertificateType,
} from '@/types';
import {
  skillLevelLabels,
  skillLevelOrder,
  educationStatusLabels,
  skillTypeLabels,
} from '@/types/curriculum';
import { calculateCompleteness, getProgressColor } from '@/utils/curriculumCompleteness';
import { Progress } from '@/components/ui/progress';

// Template para novo currículo
const newCurriculumTemplate: Omit<Curriculum, 'id' | 'candidateId'> = {
  name: 'Novo Currículo',
  isDefault: false,
  isArchived: false,
  title: '',
  location: '',
  email: '',
  phone: '',
  linkedin: '',
  about: '',
  availability: '',
  salary: { min: 0, max: 0 },
  experiences: [],
  education: [],
  skills: [],
  courses: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Componente de nível de habilidade visual
function SkillLevelSelector({
  level,
  onChange,
}: {
  level: SkillLevel;
  onChange: (level: SkillLevel) => void;
}) {
  const levels: SkillLevel[] = ['basic', 'beginner', 'intermediate', 'advanced', 'expert'];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-sm ${
                  i <= skillLevelOrder[level] ? 'text-cyan-500' : 'text-gray-300'
                }`}
              >
                ●
              </span>
            ))}
          </div>
          <span className="text-xs">{skillLevelLabels[level]}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-1">
          {levels.map((l) => (
            <Button
              key={l}
              variant={l === level ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onChange(l)}
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`text-xs ${
                      i <= skillLevelOrder[l] ? 'text-cyan-500' : 'text-gray-300'
                    }`}
                  >
                    ●
                  </span>
                ))}
              </div>
              <span className="text-xs">{skillLevelLabels[l]}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function CurriculumEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewCurriculum = id === 'novo';

  // Estado do currículo
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado das abas
  const [activeTab, setActiveTab] = useState('basic');

  // Estados para modais
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);

  // Estados para edição
  const [editingExperience, setEditingExperience] = useState<ExperienceWithCurrent | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationWithStatus | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillWithLevel | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Carregar currículo
  useEffect(() => {
    if (isNewCurriculum) {
      setCurriculum({
        ...newCurriculumTemplate,
        id: `curriculum-${Date.now()}`,
        candidateId: 'candidate-1',
      } as Curriculum);
      setLoading(false);
    } else {
      const found = mockCurriculums.find((c) => c.id === id);
      if (found) {
        setCurriculum({ ...found });
      }
      setLoading(false);
    }
  }, [id, isNewCurriculum]);

  // Handler genérico para atualizar campos
  const updateField = useCallback(
    <K extends keyof Curriculum>(field: K, value: Curriculum[K]) => {
      setCurriculum((prev) =>
        prev ? { ...prev, [field]: value, updatedAt: new Date().toISOString() } : null
      );
    },
    []
  );

  // Handlers para experiência
  const handleSaveExperience = (experience: ExperienceWithCurrent) => {
    if (!curriculum) return;

    const existingIndex = curriculum.experiences.findIndex((e) => e.id === experience.id);
    let updatedExperiences: ExperienceWithCurrent[];

    if (existingIndex >= 0) {
      updatedExperiences = [...curriculum.experiences];
      updatedExperiences[existingIndex] = experience;
    } else {
      updatedExperiences = [...curriculum.experiences, experience];
    }

    updateField('experiences', updatedExperiences);
    setExperienceDialogOpen(false);
    setEditingExperience(null);
    toast.success(existingIndex >= 0 ? 'Experiência atualizada!' : 'Experiência adicionada!');
  };

  const handleDeleteExperience = (experienceId: string) => {
    if (!curriculum) return;
    updateField(
      'experiences',
      curriculum.experiences.filter((e) => e.id !== experienceId)
    );
    toast.success('Experiência removida.');
  };

  // Handlers para formação
  const handleSaveEducation = (education: EducationWithStatus) => {
    if (!curriculum) return;

    const existingIndex = curriculum.education.findIndex((e) => e.id === education.id);
    let updatedEducation: EducationWithStatus[];

    if (existingIndex >= 0) {
      updatedEducation = [...curriculum.education];
      updatedEducation[existingIndex] = education;
    } else {
      updatedEducation = [...curriculum.education, education];
    }

    updateField('education', updatedEducation);
    setEducationDialogOpen(false);
    setEditingEducation(null);
    toast.success(existingIndex >= 0 ? 'Formação atualizada!' : 'Formação adicionada!');
  };

  const handleDeleteEducation = (educationId: string) => {
    if (!curriculum) return;
    updateField(
      'education',
      curriculum.education.filter((e) => e.id !== educationId)
    );
    toast.success('Formação removida.');
  };

  // Handlers para habilidades
  const handleSaveSkill = (skill: SkillWithLevel) => {
    if (!curriculum) return;

    const existingIndex = curriculum.skills.findIndex((s) => s.id === skill.id);
    let updatedSkills: SkillWithLevel[];

    if (existingIndex >= 0) {
      updatedSkills = [...curriculum.skills];
      updatedSkills[existingIndex] = skill;
    } else {
      updatedSkills = [...curriculum.skills, skill];
    }

    updateField('skills', updatedSkills);
    setSkillDialogOpen(false);
    setEditingSkill(null);
    toast.success(existingIndex >= 0 ? 'Habilidade atualizada!' : 'Habilidade adicionada!');
  };

  const handleDeleteSkill = (skillId: string) => {
    if (!curriculum) return;
    updateField(
      'skills',
      curriculum.skills.filter((s) => s.id !== skillId)
    );
    toast.success('Habilidade removida.');
  };

  const handleChangeSkillLevel = (skillId: string, newLevel: SkillLevel) => {
    if (!curriculum) return;
    updateField(
      'skills',
      curriculum.skills.map((s) =>
        s.id === skillId ? { ...s, level: newLevel } : s
      )
    );
  };

  // Handlers para cursos
  const handleSaveCourse = (course: Course) => {
    if (!curriculum) return;

    const existingIndex = curriculum.courses.findIndex((c) => c.id === course.id);
    let updatedCourses: Course[];

    if (existingIndex >= 0) {
      updatedCourses = [...curriculum.courses];
      updatedCourses[existingIndex] = course;
    } else {
      updatedCourses = [...curriculum.courses, course];
    }

    updateField('courses', updatedCourses);
    setCourseDialogOpen(false);
    setEditingCourse(null);
    toast.success(existingIndex >= 0 ? 'Curso atualizado!' : 'Curso adicionado!');
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!curriculum) return;
    updateField(
      'courses',
      curriculum.courses.filter((c) => c.id !== courseId)
    );
    toast.success('Curso removido.');
  };

  // Salvar currículo
  const handleSave = async () => {
    if (!curriculum) return;

    setSaving(true);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('Currículo salvo com sucesso!');
  };

  if (loading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!curriculum) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">Currículo não encontrado.</p>
          <Button onClick={() => navigate('/candidato/curriculos')}>
            Voltar para currículos
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const completeness = calculateCompleteness(curriculum);

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/candidato/curriculos')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isNewCurriculum ? 'Novo Currículo' : 'Editar Currículo'}
              </h1>
              <p className="text-muted-foreground">{curriculum.name}</p>
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
            <TabsTrigger value="basic" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Informações</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Experiência</span>
              {curriculum.experiences.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {curriculum.experiences.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Formação</span>
              {curriculum.education.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {curriculum.education.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Currículo</Label>
                    <Input
                      id="name"
                      value={curriculum.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Ex: Currículo Principal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título Profissional</Label>
                    <Input
                      id="title"
                      value={curriculum.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Ex: Desenvolvedor Full Stack Senior"
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={curriculum.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={curriculum.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="São Paulo, SP"
                    />
                  </div>
                  <div className="space-y-2">
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
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Disponibilidade</Label>
                    <Select
                      value={curriculum.availability}
                      onValueChange={(v) => updateField('availability', v)}
                    >
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Pretensão Mínima (R$)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={curriculum.salary?.min || ''}
                      onChange={(e) =>
                        updateField('salary', {
                          ...curriculum.salary,
                          min: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="8000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Pretensão Máxima (R$)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={curriculum.salary?.max || ''}
                      onChange={(e) =>
                        updateField('salary', {
                          ...curriculum.salary,
                          max: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="15000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Experiência */}
          <TabsContent value="experience" className="mt-6">
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
          </TabsContent>

          {/* Tab: Formação */}
          <TabsContent value="education" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Formação Acadêmica</CardTitle>
                  <CardDescription>
                    Adicione sua formação educacional.
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
          </TabsContent>

          {/* Tab: Habilidades */}
          <TabsContent value="skills" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Habilidades</CardTitle>
                  <CardDescription>
                    Adicione suas habilidades técnicas e comportamentais.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingSkill(null);
                    setSkillDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {curriculum.skills.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma habilidade adicionada.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Habilidades Técnicas */}
                    {curriculum.skills.filter((s) => s.type === 'technical').length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Code className="h-4 w-4 text-cyan-500" />
                          Técnicas
                        </h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          {curriculum.skills
                            .filter((s) => s.type === 'technical')
                            .map((skill, index) => (
                              <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <span className="font-medium">{skill.name}</span>
                                <div className="flex items-center gap-2">
                                  <SkillLevelSelector
                                    level={skill.level}
                                    onChange={(l) => handleChangeSkillLevel(skill.id, l)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteSkill(skill.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Habilidades Comportamentais */}
                    {curriculum.skills.filter((s) => s.type === 'behavioral').length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <User className="h-4 w-4 text-pink-500" />
                          Comportamentais
                        </h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          {curriculum.skills
                            .filter((s) => s.type === 'behavioral')
                            .map((skill, index) => (
                              <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <span className="font-medium">{skill.name}</span>
                                <div className="flex items-center gap-2">
                                  <SkillLevelSelector
                                    level={skill.level}
                                    onChange={(l) => handleChangeSkillLevel(skill.id, l)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteSkill(skill.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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

        {/* Dialog: Habilidade */}
        <SkillDialog
          open={skillDialogOpen}
          onOpenChange={setSkillDialogOpen}
          skill={editingSkill}
          onSave={handleSaveSkill}
        />

        {/* Dialog: Curso */}
        <CourseDialog
          open={courseDialogOpen}
          onOpenChange={setCourseDialogOpen}
          course={editingCourse}
          onSave={handleSaveCourse}
        />
      </div>
    </DashboardLayout>
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
              placeholder="Ex: Ciência da Computação"
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

// Dialog de Habilidade
function SkillDialog({
  open,
  onOpenChange,
  skill,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: SkillWithLevel | null;
  onSave: (skill: SkillWithLevel) => void;
}) {
  const [form, setForm] = useState<SkillWithLevel>({
    id: '',
    name: '',
    level: 'intermediate',
    type: 'technical',
  });

  useEffect(() => {
    if (skill) {
      setForm(skill);
    } else {
      setForm({
        id: `skill-${Date.now()}`,
        name: '',
        level: 'intermediate',
        type: 'technical',
      });
    }
  }, [skill, open]);

  const handleSubmit = () => {
    if (!form.name) {
      toast.error('Informe o nome da habilidade.');
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {skill ? 'Editar Habilidade' : 'Adicionar Habilidade'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da habilidade.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Nome da habilidade *</Label>
            <Input
              id="skill-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: React, Liderança, Python..."
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <RadioGroup
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as SkillType })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technical" id="type-tech" />
                <Label htmlFor="type-tech">Técnica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="behavioral" id="type-behav" />
                <Label htmlFor="type-behav">Comportamental</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Nível de proficiência</Label>
            <Select
              value={form.level}
              onValueChange={(v) => setForm({ ...form, level: v as SkillLevel })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
                <SelectItem value="expert">Especialista</SelectItem>
              </SelectContent>
            </Select>
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
              placeholder="Ex: AWS Solutions Architect"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-institution">Instituição *</Label>
            <Input
              id="course-institution"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="Ex: Amazon Web Services"
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
              className="flex gap-4"
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
