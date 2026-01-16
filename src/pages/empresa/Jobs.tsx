import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Users, Eye, Pause, Play, Trash2, Edit, Copy, XCircle, X, Briefcase } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockJobs } from '@/data/mockData';
import { Job, JobStatus } from '@/types';
import { toast } from 'sonner';

// Common benefits for checkboxes
const COMMON_BENEFITS = [
  'Vale Refeição',
  'Plano de Saúde',
  'Vale Transporte',
  'Home Office',
  'PLR',
  'Gym Pass',
  'Auxílio Creche',
  'Seguro de Vida',
];

// Initial form state
const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  location: '',
  type: 'remote' as 'remote' | 'hybrid' | 'onsite',
  level: '',
  area: '',
  salaryMin: '',
  salaryMax: '',
  salaryNegotiable: false,
  requirements: '',
};

export default function CompanyJobs() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs.filter(j => j.companyId === 'company-1'));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [otherBenefits, setOtherBenefits] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Confirmation dialogs states
  const [jobToPause, setJobToPause] = useState<Job | null>(null);
  const [jobToReactivate, setJobToReactivate] = useState<Job | null>(null);
  const [jobToClose, setJobToClose] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Character limits
  const DESCRIPTION_LIMIT = 2000;
  const REQUIREMENTS_LIMIT = 1500;

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count jobs by status
  const counts = {
    all: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  // Reset form
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setSelectedBenefits([]);
    setOtherBenefits('');
    setSkills([]);
    setNewSkill('');
    setEditingJob(null);
  };

  // Open form for new job
  const openNewJobForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Open form for editing
  const openEditJobForm = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      level: job.level,
      area: job.area,
      salaryMin: job.salary.min.toString(),
      salaryMax: job.salary.max.toString(),
      salaryNegotiable: job.salary.min === 0 && job.salary.max === 0,
      requirements: job.requirements.join('\n'),
    });
    // Separate common benefits from other benefits
    const common = job.benefits.filter(b => COMMON_BENEFITS.includes(b));
    const other = job.benefits.filter(b => !COMMON_BENEFITS.includes(b));
    setSelectedBenefits(common);
    setOtherBenefits(other.join('\n'));
    setSkills([]); // Jobs don't have skills field yet
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    resetForm();
  };

  // Toggle benefit checkbox
  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits(prev =>
      prev.includes(benefit)
        ? prev.filter(b => b !== benefit)
        : [...prev, benefit]
    );
  };

  // Add skill
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Skill já adicionada');
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill('');
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Handle skill input key press
  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Save job (create or update)
  const handleSaveJob = () => {
    // Validation
    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (formData.requirements.trim().length === 0) {
      toast.error('Informe os requisitos da vaga');
      return;
    }

    // Combine benefits
    const allBenefits = [
      ...selectedBenefits,
      ...otherBenefits.split('\n').filter(b => b.trim()),
    ];

    if (editingJob) {
      // Update existing job
      setJobs(jobs.map(job => {
        if (job.id === editingJob.id) {
          return {
            ...job,
            title: formData.title,
            description: formData.description,
            location: formData.location,
            type: formData.type,
            level: formData.level,
            area: formData.area,
            salary: formData.salaryNegotiable
              ? { min: 0, max: 0 }
              : { min: parseInt(formData.salaryMin) || 0, max: parseInt(formData.salaryMax) || 0 },
            requirements: formData.requirements.split('\n').filter(r => r.trim()),
            benefits: allBenefits,
          };
        }
        return job;
      }));
      toast.success('Vaga atualizada com sucesso!');
    } else {
      // Create new job
      const job: Job = {
        id: `job-${Date.now()}`,
        companyId: 'company-1',
        companyName: 'Tech Solutions',
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        benefits: allBenefits,
        location: formData.location,
        type: formData.type,
        level: formData.level,
        salary: formData.salaryNegotiable
          ? { min: 0, max: 0 }
          : { min: parseInt(formData.salaryMin) || 0, max: parseInt(formData.salaryMax) || 0 },
        status: 'active',
        applicationsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        area: formData.area,
      };
      setJobs([job, ...jobs]);
      toast.success('Vaga publicada com sucesso!');
    }

    handleFormClose();
  };

  // Status actions
  const handlePauseJob = () => {
    if (!jobToPause) return;
    setJobs(jobs.map(job =>
      job.id === jobToPause.id ? { ...job, status: 'paused' as JobStatus } : job
    ));
    toast.success('Vaga pausada. Ela não aparecerá mais para candidatos.');
    setJobToPause(null);
  };

  const handleReactivateJob = () => {
    if (!jobToReactivate) return;
    setJobs(jobs.map(job =>
      job.id === jobToReactivate.id ? { ...job, status: 'active' as JobStatus } : job
    ));
    toast.success('Vaga reativada com sucesso!');
    setJobToReactivate(null);
  };

  const handleCloseJob = () => {
    if (!jobToClose) return;
    setJobs(jobs.map(job =>
      job.id === jobToClose.id ? { ...job, status: 'closed' as JobStatus } : job
    ));
    toast.success('Vaga encerrada. Não receberá mais candidaturas.');
    setJobToClose(null);
  };

  const handleDeleteJob = () => {
    if (!jobToDelete || deleteConfirmText !== 'EXCLUIR') return;
    setJobs(jobs.filter(job => job.id !== jobToDelete.id));
    toast.success('Vaga excluída permanentemente.');
    setJobToDelete(null);
    setDeleteConfirmText('');
  };

  // Duplicate job
  const handleDuplicateJob = (job: Job) => {
    const duplicated: Job = {
      ...job,
      id: `job-${Date.now()}`,
      title: `${job.title} - Cópia`,
      status: 'active',
      applicationsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setJobs([duplicated, ...jobs]);
    toast.success('Vaga duplicada! A cópia foi criada como ativa.');
  };

  // Get contextual actions based on job status
  const getJobActions = (job: Job) => {
    switch (job.status) {
      case 'active':
        return (
          <>
            <DropdownMenuItem onClick={() => openEditJobForm(job)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setJobToPause(job)}>
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setJobToClose(job)} className="text-destructive">
              <XCircle className="w-4 h-4 mr-2" />
              Encerrar
            </DropdownMenuItem>
          </>
        );
      case 'paused':
        return (
          <>
            <DropdownMenuItem onClick={() => openEditJobForm(job)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setJobToReactivate(job)}>
              <Play className="w-4 h-4 mr-2" />
              Reativar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setJobToClose(job)} className="text-destructive">
              <XCircle className="w-4 h-4 mr-2" />
              Encerrar
            </DropdownMenuItem>
          </>
        );
      case 'closed':
        return (
          <>
            <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setJobToDelete(job)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </>
        );
    }
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minhas Vagas</h1>
            <p className="text-muted-foreground">Gerencie suas vagas e processos seletivos</p>
          </div>
          <Button onClick={openNewJobForm}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Vaga
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'paused', 'closed'] as const).map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="gap-2"
            >
              {status === 'all' && 'Todas'}
              {status === 'active' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Ativas
                </>
              )}
              {status === 'paused' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  Pausadas
                </>
              )}
              {status === 'closed' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Encerradas
                </>
              )}
              <Badge variant="secondary" className="ml-1 text-xs">
                {counts[status]}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar vagas..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          job.status === 'active' ? 'default' :
                          job.status === 'paused' ? 'secondary' : 'outline'
                        } className={
                          job.status === 'active' ? 'bg-success text-success-foreground' :
                          job.status === 'paused' ? 'bg-warning text-warning-foreground' : ''
                        }>
                          {job.status === 'active' ? '● Ativa' :
                           job.status === 'paused' ? '● Pausada' : '● Encerrada'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground ml-12">
                    <span>{job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial'}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    {job.salary.min === 0 && job.salary.max === 0 ? (
                      <span>A combinar</span>
                    ) : (
                      <span>R$ {job.salary.min.toLocaleString('pt-BR')} - {job.salary.max.toLocaleString('pt-BR')}</span>
                    )}
                    <span>•</span>
                    <span>Criada em {job.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl">
                    <Users className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{job.applicationsCount}</div>
                      <div className="text-xs text-muted-foreground">candidatos</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      {getJobActions(job)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground line-clamp-2 ml-12">{job.description}</p>
              <div className="flex flex-wrap gap-2 mt-4 ml-12">
                {job.requirements.slice(0, 3).map((req, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {req}
                  </span>
                ))}
                {job.requirements.length > 3 && (
                  <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                    +{job.requirements.length - 3}
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros ou crie uma nova vaga</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Job Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Editar Vaga' : 'Nova Vaga'}</DialogTitle>
            <DialogDescription>
              {editingJob ? 'Atualize as informações da vaga.' : 'Preencha os dados para criar uma nova vaga.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="title">Título da vaga *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Desenvolvedor Full Stack Senior"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Contrato *</Label>
                  <Select value={formData.area} onValueChange={(v) => setFormData({ ...formData, area: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="Estágio">Estágio</SelectItem>
                      <SelectItem value="Freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modalidade *</Label>
                  <Select value={formData.type} onValueChange={(v: 'remote' | 'hybrid' | 'onsite') => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remoto</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                      <SelectItem value="onsite">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="location">Localização *</Label>
                  <Input
                    id="location"
                    placeholder="Ex: São Paulo, SP"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nível</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Estágio">Estágio</SelectItem>
                      <SelectItem value="Junior">Júnior</SelectItem>
                      <SelectItem value="Pleno">Pleno</SelectItem>
                      <SelectItem value="Senior">Sênior</SelectItem>
                      <SelectItem value="Especialista">Especialista</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Salary Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Remuneração</h3>
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  id="salaryNegotiable"
                  checked={formData.salaryNegotiable}
                  onCheckedChange={(checked) => setFormData({ ...formData, salaryNegotiable: checked as boolean })}
                />
                <Label htmlFor="salaryNegotiable" className="cursor-pointer">Salário a combinar</Label>
              </div>
              {!formData.salaryNegotiable && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salário mínimo (R$)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="8000"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salário máximo (R$)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="12000"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Descrição da Vaga *</h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="Descreva as responsabilidades e atividades do cargo..."
                  className="min-h-[120px]"
                  maxLength={DESCRIPTION_LIMIT}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="text-right text-sm text-muted-foreground">
                  {formData.description.length}/{DESCRIPTION_LIMIT}
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Requisitos *</h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="5+ anos de experiência&#10;Conhecimento em React&#10;Inglês avançado"
                  className="min-h-[100px]"
                  maxLength={REQUIREMENTS_LIMIT}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
                <div className="text-right text-sm text-muted-foreground">
                  {formData.requirements.length}/{REQUIREMENTS_LIMIT}
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Benefícios</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COMMON_BENEFITS.map(benefit => (
                  <div key={benefit} className="flex items-center gap-2">
                    <Checkbox
                      id={`benefit-${benefit}`}
                      checked={selectedBenefits.includes(benefit)}
                      onCheckedChange={() => toggleBenefit(benefit)}
                    />
                    <Label htmlFor={`benefit-${benefit}`} className="text-sm cursor-pointer">
                      {benefit}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Outros benefícios</Label>
                <Textarea
                  placeholder="Horário flexível&#10;Ambiente descontraído&#10;Cursos gratuitos"
                  className="min-h-[60px]"
                  value={otherBenefits}
                  onChange={(e) => setOtherBenefits(e.target.value)}
                />
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Skills Desejadas</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma skill e pressione Enter"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleSkillKeyPress}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  Adicionar
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleFormClose}>
                Cancelar
              </Button>
              <Button onClick={handleSaveJob}>
                {editingJob ? 'Salvar Alterações' : 'Publicar Vaga'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Confirmation */}
      <AlertDialog open={!!jobToPause} onOpenChange={() => setJobToPause(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pausar vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              A vaga "{jobToPause?.title}" não aparecerá mais para candidatos. Você pode reativá-la depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePauseJob}>Pausar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation */}
      <AlertDialog open={!!jobToReactivate} onOpenChange={() => setJobToReactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              A vaga "{jobToReactivate?.title}" voltará a aparecer para candidatos e poderá receber novas candidaturas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivateJob}>Reativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Confirmation */}
      <AlertDialog open={!!jobToClose} onOpenChange={() => setJobToClose(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              A vaga "{jobToClose?.title}" será encerrada e não poderá mais receber candidaturas. Esta ação é significativa mas pode ser revertida duplicando a vaga.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Encerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation (Double Confirmation) */}
      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => {
        if (!open) {
          setJobToDelete(null);
          setDeleteConfirmText('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vaga permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                A vaga "{jobToDelete?.title}" será excluída permanentemente. Esta ação não pode ser desfeita.
              </p>
              <p>
                Digite <strong>EXCLUIR</strong> para confirmar:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite EXCLUIR"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              disabled={deleteConfirmText !== 'EXCLUIR'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
