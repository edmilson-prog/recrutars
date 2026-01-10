import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, DollarSign, Building2, Clock, Heart, Filter, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { mockJobs, Job } from '@/data/mockData';
import { toast } from 'sonner';

const locations = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Porto Alegre, RS'];
const areas = ['Tecnologia', 'Produto', 'Design', 'Dados', 'Marketing', 'Comercial', 'RH', 'Financeiro'];
const levels = ['Estágio', 'Junior', 'Pleno', 'Senior', 'Especialista', 'Gerente'];

export default function CandidateJobSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [salaryRange, setSalaryRange] = useState([0, 30000]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeJobs = mockJobs.filter(job => job.status === 'active');

  const filteredJobs = activeJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || job.location.includes(locationFilter);
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesArea = areaFilter === 'all' || job.area === areaFilter;
    const matchesLevel = levelFilter === 'all' || job.level === levelFilter;
    const matchesSalary = job.salary.min >= salaryRange[0] && job.salary.max <= salaryRange[1];
    
    return matchesSearch && matchesLocation && matchesType && matchesArea && matchesLevel && matchesSalary;
  });

  const toggleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      toast.success('Vaga removida dos favoritos');
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast.success('Vaga salva nos favoritos');
    }
  };

  const applyToJob = (job: Job) => {
    toast.success(`Candidatura enviada para ${job.title}!`);
    setSelectedJob(null);
  };

  const clearFilters = () => {
    setLocationFilter('all');
    setTypeFilter('all');
    setAreaFilter('all');
    setLevelFilter('all');
    setSalaryRange([0, 30000]);
  };

  const hasActiveFilters = locationFilter !== 'all' || typeFilter !== 'all' || 
                           areaFilter !== 'all' || levelFilter !== 'all' ||
                           salaryRange[0] > 0 || salaryRange[1] < 30000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Localização</label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as cidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Work Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Modalidade</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="remote">Remoto</SelectItem>
            <SelectItem value="hybrid">Híbrido</SelectItem>
            <SelectItem value="onsite">Presencial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Area */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Área</label>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as áreas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            {areas.map(area => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Nível</label>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os níveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            {levels.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Salary Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Faixa salarial</label>
        <div className="pt-2 px-2">
          <Slider
            value={salaryRange}
            onValueChange={setSalaryRange}
            max={30000}
            min={0}
            step={1000}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>R$ {salaryRange[0].toLocaleString('pt-BR')}</span>
          <span>R$ {salaryRange[1].toLocaleString('pt-BR')}</span>
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpar filtros
        </Button>
      )}
    </div>
  );

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buscar Vagas</h1>
          <p className="text-muted-foreground">Encontre a oportunidade ideal para sua carreira</p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cargo, empresa ou palavra-chave..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Mobile Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-secondary">!</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar
                  </Button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Jobs List */}
          <div className="flex-1 space-y-4">
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredJobs.length} vaga{filteredJobs.length !== 1 ? 's' : ''} encontrada{filteredJobs.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all cursor-pointer group"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-muted-foreground">{job.companyName}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(job.id);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Heart 
                          className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} 
                        />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        R$ {job.salary.min.toLocaleString('pt-BR')} - {job.salary.max.toLocaleString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.createdAt}
                      </span>
                    </div>

                    <p className="mt-3 text-muted-foreground line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary">{job.level}</Badge>
                      <Badge variant="secondary">{job.area}</Badge>
                      {job.requirements.slice(0, 2).map((req, i) => (
                        <Badge key={i} variant="outline">{req}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl shadow-soft">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma vaga encontrada</h3>
                <p className="text-muted-foreground mb-4">Tente ajustar os filtros de busca</p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Job Details Dialog */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedJob && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                      <p className="text-muted-foreground">{selectedJob.companyName}</p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-primary text-primary-foreground">{selectedJob.level}</Badge>
                    <Badge variant="secondary">{selectedJob.area}</Badge>
                    <Badge variant="outline">
                      {selectedJob.type === 'remote' ? 'Remoto' : selectedJob.type === 'hybrid' ? 'Híbrido' : 'Presencial'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <span>R$ {selectedJob.salary.min.toLocaleString('pt-BR')} - {selectedJob.salary.max.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
                    <p className="text-muted-foreground">{selectedJob.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Requisitos</h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="w-1.5 h-1.5 mt-2 rounded-full bg-primary flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Benefícios</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.benefits.map((benefit, i) => (
                        <Badge key={i} variant="outline" className="bg-success/10 text-success border-success/20">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" onClick={() => applyToJob(selectedJob)}>
                      Candidatar-se
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => toggleSaveJob(selectedJob.id)}
                    >
                      <Heart className={`w-5 h-5 ${savedJobs.includes(selectedJob.id) ? 'fill-destructive text-destructive' : ''}`} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
