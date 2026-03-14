import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Users, Eye, Pause, Play, Trash2, Edit, Copy, XCircle, X, Briefcase, Brain, Loader2, Sparkles, List, LayoutGrid, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useJobsByCompany, useUpdateJob, useDeleteJob, useCreateJob } from '@/hooks/useJobsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Job, JobStatus } from '@/types';
import { toast } from 'sonner';

type ViewMode = 'list' | 'grid';

export default function CompanyJobs() {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';
  const { data: fetchedJobs = [], isLoading } = useJobsByCompany(companyId);
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const createJobMutation = useCreateJob();

  // Local override state for optimistic updates (jobs modified this session)
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Job>>>({});
  const [localDeleted, setLocalDeleted] = useState<Set<string>>(new Set());
  const [localAdded, setLocalAdded] = useState<Job[]>([]);

  // Merge fetched jobs with local optimistic state
  const jobs = useMemo(() => {
    const merged = fetchedJobs
      .filter(j => !localDeleted.has(j.id))
      .map(j => localOverrides[j.id] ? { ...j, ...localOverrides[j.id] } : j);
    return [...localAdded, ...merged];
  }, [fetchedJobs, localOverrides, localDeleted, localAdded]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('active');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Confirmation dialogs states
  const [jobToPause, setJobToPause] = useState<Job | null>(null);
  const [jobToReactivate, setJobToReactivate] = useState<Job | null>(null);
  const [jobToClose, setJobToClose] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  // Status actions
  const handlePauseJob = () => {
    if (!jobToPause) return;
    setLocalOverrides(prev => ({ ...prev, [jobToPause.id]: { status: 'paused' as JobStatus } }));
    updateJobMutation.mutate({ id: jobToPause.id, updates: { status: 'paused' as JobStatus } });
    toast.success('Vaga pausada. Ela não aparecerá mais para candidatos.');
    setJobToPause(null);
  };

  const handleReactivateJob = () => {
    if (!jobToReactivate) return;
    setLocalOverrides(prev => ({ ...prev, [jobToReactivate.id]: { status: 'active' as JobStatus } }));
    updateJobMutation.mutate({ id: jobToReactivate.id, updates: { status: 'active' as JobStatus } });
    toast.success('Vaga reativada com sucesso!');
    setJobToReactivate(null);
  };

  const handleCloseJob = () => {
    if (!jobToClose) return;
    setLocalOverrides(prev => ({ ...prev, [jobToClose.id]: { status: 'closed' as JobStatus } }));
    updateJobMutation.mutate({ id: jobToClose.id, updates: { status: 'closed' as JobStatus } });
    toast.success('Vaga encerrada. Não receberá mais candidaturas.');
    setJobToClose(null);
  };

  const handleDeleteJob = () => {
    if (!jobToDelete || deleteConfirmText !== 'EXCLUIR') return;
    setLocalDeleted(prev => new Set(prev).add(jobToDelete.id));
    deleteJobMutation.mutate(jobToDelete.id);
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
    setLocalAdded(prev => [duplicated, ...prev]);
    createJobMutation.mutate(duplicated);
    toast.success('Vaga duplicada! A cópia foi criada como ativa.');
  };

  // Get contextual actions based on job status
  const getJobActions = (job: Job) => {
    switch (job.status) {
      case 'active':
        return (
          <>
            <DropdownMenuItem onClick={() => navigate(`/empresa/vagas/${job.id}/editar`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/empresa/vagas/${job.id}/candidatos-sugeridos`)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Candidatos Sugeridos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/empresa/vagas/${job.id}/teste`)}>
              <Brain className="w-4 h-4 mr-2" />
              Teste Comportamental
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
            <DropdownMenuItem onClick={() => navigate(`/empresa/vagas/${job.id}/editar`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/empresa/vagas/${job.id}/candidatos-sugeridos`)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Candidatos Sugeridos
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
        {/* Banner */}
        <PageHeader
          title="Minhas Vagas"
          description="Gerencie suas vagas e processos seletivos. Acompanhe candidaturas, configure testes comportamentais e encontre os melhores talentos."
          actions={
            <Button onClick={() => navigate('/empresa/vagas/nova')} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Nova Vaga
            </Button>
          }
          howItWorks={[
            'Gerencie suas vagas e processos seletivos',
            'Publique novas vagas com "Nova Vaga"',
            'Acompanhe candidaturas e configure testes comportamentais',
          ]}
        />

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

        {/* Search + View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-md flex-1">
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

          {/* View mode toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode('list')}
              aria-label="Visualização em lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode('grid')}
              aria-label="Visualização em grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Jobs List / Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros ou crie uma nova vaga</p>
          </div>
        ) : viewMode === 'list' ? (
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
                        <h3
                          className="text-xl font-semibold text-foreground hover:text-primary cursor-pointer transition-colors"
                          onClick={() => navigate(`/empresa/vagas/${job.id}/editar`)}
                        >
                          {job.title}
                        </h3>
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/empresa/candidaturas?jobId=${job.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition-colors"
                      aria-label={`Ver ${job.applicationsCount} candidaturas para ${job.title}`}
                    >
                      <Users className="w-5 h-5 text-primary" />
                      <div className="text-center">
                        <div className="font-semibold text-foreground">{job.applicationsCount}</div>
                        <div className="text-xs text-muted-foreground">candidatos</div>
                      </div>
                    </button>
                    {job.status !== 'closed' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/empresa/vagas/${job.id}/candidatos-sugeridos`)}
                              className="text-muted-foreground hover:text-secondary"
                              aria-label="Candidatos Sugeridos"
                            >
                              <Sparkles className="w-5 h-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Candidatos Sugeridos</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/empresa/vagas/${job.id}/editar`)}>
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
          </div>
        ) : (
          /* Grid View */
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                variants={staggerItem}
                className="bg-card rounded-2xl shadow-soft hover:shadow-medium transition-shadow cursor-pointer flex flex-col"
                onClick={() => navigate(`/empresa/vagas/${job.id}/editar`)}
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/empresa/vagas/${job.id}/editar`); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                        {getJobActions(job)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Badge variant={
                    job.status === 'active' ? 'default' :
                    job.status === 'paused' ? 'secondary' : 'outline'
                  } className={cn(
                    'mb-3',
                    job.status === 'active' ? 'bg-success text-success-foreground' :
                    job.status === 'paused' ? 'bg-warning text-warning-foreground' : ''
                  )}>
                    {job.status === 'active' ? '● Ativa' :
                     job.status === 'paused' ? '● Pausada' : '● Encerrada'}
                  </Badge>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <span>{job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial'}</span>
                    </div>
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t px-5 py-3 flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/empresa/candidaturas?jobId=${job.id}`); }}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Ver ${job.applicationsCount} candidaturas para ${job.title}`}
                  >
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{job.applicationsCount}</span>
                    <span>candidatos</span>
                  </button>
                  {job.status !== 'closed' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-secondary"
                            onClick={(e) => { e.stopPropagation(); navigate(`/empresa/vagas/${job.id}/candidatos-sugeridos`); }}
                            aria-label="Candidatos Sugeridos"
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Candidatos Sugeridos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

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
