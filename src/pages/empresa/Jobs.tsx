import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Users, Eye, Pause, Play, Trash2, Edit } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockJobs, Job } from '@/data/mockData';
import { toast } from 'sonner';

export default function CompanyJobs() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs.filter(j => j.companyId === 'company-1'));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    type: 'remote' as 'remote' | 'hybrid' | 'onsite',
    level: '',
    area: '',
    salaryMin: '',
    salaryMax: '',
    requirements: '',
    benefits: '',
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.description || !newJob.location) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const job: Job = {
      id: `job-${Date.now()}`,
      companyId: 'company-1',
      companyName: 'Tech Solutions',
      title: newJob.title,
      description: newJob.description,
      requirements: newJob.requirements.split('\n').filter(r => r.trim()),
      benefits: newJob.benefits.split('\n').filter(b => b.trim()),
      location: newJob.location,
      type: newJob.type,
      level: newJob.level,
      salary: { 
        min: parseInt(newJob.salaryMin) || 0, 
        max: parseInt(newJob.salaryMax) || 0 
      },
      status: 'active',
      applicationsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      area: newJob.area,
    };

    setJobs([job, ...jobs]);
    setIsCreateOpen(false);
    setNewJob({
      title: '',
      description: '',
      location: '',
      type: 'remote',
      level: '',
      area: '',
      salaryMin: '',
      salaryMax: '',
      requirements: '',
      benefits: '',
    });
    toast.success('Vaga criada com sucesso!');
  };

  const toggleJobStatus = (jobId: string) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        const newStatus = job.status === 'active' ? 'paused' : 'active';
        toast.success(`Vaga ${newStatus === 'active' ? 'ativada' : 'pausada'}`);
        return { ...job, status: newStatus };
      }
      return job;
    }));
  };

  const deleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
    toast.success('Vaga removida');
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Nova Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Vaga</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="title">Título da vaga *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Desenvolvedor Full Stack Senior"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Área</Label>
                    <Select value={newJob.area} onValueChange={(v) => setNewJob({ ...newJob, area: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="Produto">Produto</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Dados">Dados</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="RH">RH</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Nível</Label>
                    <Select value={newJob.level} onValueChange={(v) => setNewJob({ ...newJob, level: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
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
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização *</Label>
                    <Input
                      id="location"
                      placeholder="Ex: São Paulo, SP"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Modalidade</Label>
                    <Select value={newJob.type} onValueChange={(v: 'remote' | 'hybrid' | 'onsite') => setNewJob({ ...newJob, type: v })}>
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
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salário mínimo (R$)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="8000"
                      value={newJob.salaryMin}
                      onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salário máximo (R$)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="12000"
                      value={newJob.salaryMax}
                      onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descrição da vaga *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva as responsabilidades e atividades do cargo..."
                      className="min-h-[100px]"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="requirements">Requisitos (um por linha)</Label>
                    <Textarea
                      id="requirements"
                      placeholder="5+ anos de experiência&#10;Conhecimento em React&#10;Inglês avançado"
                      className="min-h-[80px]"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="benefits">Benefícios (um por linha)</Label>
                    <Textarea
                      id="benefits"
                      placeholder="Vale refeição&#10;Plano de saúde&#10;Home office"
                      className="min-h-[80px]"
                      value={newJob.benefits}
                      onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateJob}>
                    Criar Vaga
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar vagas..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
              <SelectItem value="closed">Encerradas</SelectItem>
            </SelectContent>
          </Select>
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
                    <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                    <Badge variant={
                      job.status === 'active' ? 'default' : 
                      job.status === 'paused' ? 'secondary' : 'outline'
                    } className={
                      job.status === 'active' ? 'bg-success text-success-foreground' :
                      job.status === 'paused' ? 'bg-warning text-warning-foreground' : ''
                    }>
                      {job.status === 'active' ? 'Ativa' : 
                       job.status === 'paused' ? 'Pausada' : 'Encerrada'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial'}</span>
                    <span>•</span>
                    <span>{job.level}</span>
                    <span>•</span>
                    <span>R$ {job.salary.min.toLocaleString('pt-BR')} - {job.salary.max.toLocaleString('pt-BR')}</span>
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
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleJobStatus(job.id)}>
                        {job.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground line-clamp-2">{job.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
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
    </DashboardLayout>
  );
}
