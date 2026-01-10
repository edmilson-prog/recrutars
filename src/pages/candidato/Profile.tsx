import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, Code, DollarSign, MapPin, Save, Plus, X, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { mockCandidates } from '@/data/mockData';

interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export default function CandidateProfile() {
  const candidate = mockCandidates[0];

  const [profile, setProfile] = useState({
    name: candidate.name,
    email: candidate.email,
    title: candidate.title,
    location: candidate.location,
    phone: '(11) 99999-9999',
    linkedin: 'linkedin.com/in/joaosantos',
    about: 'Desenvolvedor Full Stack apaixonado por criar soluções inovadoras. Com 5 anos de experiência, tenho trabalhado em projetos de grande escala utilizando tecnologias modernas.',
  });

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      company: 'Empresa Atual',
      role: 'Desenvolvedor Full Stack Senior',
      startDate: '2022-01',
      endDate: '',
      current: true,
      description: 'Desenvolvimento de aplicações web com React e Node.js',
    },
    {
      id: '2',
      company: 'Empresa Anterior',
      role: 'Desenvolvedor Full Stack Pleno',
      startDate: '2020-03',
      endDate: '2021-12',
      current: false,
      description: 'Criação de APIs RESTful e integração com sistemas legados',
    },
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      institution: 'Universidade de São Paulo',
      degree: 'Bacharelado',
      field: 'Ciência da Computação',
      startYear: '2015',
      endYear: '2019',
    },
  ]);

  const [skills, setSkills] = useState<string[]>(candidate.skills);
  const [newSkill, setNewSkill] = useState('');

  const [salary, setSalary] = useState({
    min: candidate.salary.min.toString(),
    max: candidate.salary.max.toString(),
  });

  const [availability, setAvailability] = useState(candidate.availability);

  const calculateCompletion = () => {
    let total = 0;
    if (profile.name) total += 10;
    if (profile.email) total += 10;
    if (profile.title) total += 10;
    if (profile.location) total += 10;
    if (profile.about) total += 15;
    if (experiences.length > 0) total += 20;
    if (education.length > 0) total += 10;
    if (skills.length >= 3) total += 10;
    if (salary.min && salary.max) total += 5;
    return total;
  };

  const completion = calculateCompletion();

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperiences(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: '',
      },
    ]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
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
            <p className="text-muted-foreground">Mantenha suas informações atualizadas</p>
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
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
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
                value={profile.about}
                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
              />
            </div>
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Experiência Profissional</h2>
            </div>
            <Button variant="outline" size="sm" onClick={addExperience}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="relative p-4 border border-border rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive"
                  onClick={() => removeExperience(exp.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data início</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data fim</Label>
                    <Input
                      type="month"
                      value={exp.endDate}
                      disabled={exp.current}
                      placeholder={exp.current ? 'Atual' : ''}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        className="rounded"
                      />
                      Trabalho atual
                    </label>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Descrição das atividades</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Formação Acadêmica</h2>
            </div>
            <Button variant="outline" size="sm" onClick={addEducation}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.id} className="relative p-4 border border-border rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive"
                  onClick={() => removeEducation(edu.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instituição</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grau</Label>
                    <Select
                      value={edu.degree}
                      onValueChange={(v) => updateEducation(edu.id, 'degree', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                        <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                        <SelectItem value="Bacharelado">Bacharelado</SelectItem>
                        <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                        <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="Mestrado">Mestrado</SelectItem>
                        <SelectItem value="Doutorado">Doutorado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Área</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input
                        type="number"
                        placeholder="2020"
                        value={edu.startYear}
                        onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Conclusão</Label>
                      <Input
                        type="number"
                        placeholder="2024"
                        value={edu.endYear}
                        onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Habilidades</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => removeSkill(skill)}
              >
                {skill}
                <X className="w-3 h-3 ml-2" />
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Adicionar habilidade..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button variant="outline" onClick={addSkill}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Salary & Availability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Pretensão Salarial</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Salário mínimo (R$)</Label>
              <Input
                type="number"
                value={salary.min}
                onChange={(e) => setSalary({ ...salary, min: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Salário máximo (R$)</Label>
              <Input
                type="number"
                value={salary.max}
                onChange={(e) => setSalary({ ...salary, max: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Disponibilidade</Label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Imediata">Imediata</SelectItem>
                  <SelectItem value="1 semana">1 semana</SelectItem>
                  <SelectItem value="2 semanas">2 semanas</SelectItem>
                  <SelectItem value="1 mês">1 mês</SelectItem>
                  <SelectItem value="2 meses">2 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
