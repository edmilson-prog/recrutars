/**
 * Candidates Page - Candidate Management (Admin)
 * PRD-021: Gestão de Candidatos
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  User,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Power,
  PowerOff,
  Bell,
  RotateCcw,
  Brain,
  Award,
  Mail,
  Phone,
  Linkedin,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { TechnicalAnalysisCard } from '@/components/aiAnalysis';
import { PracticalAnalysisCard } from '@/components/aiAnalysis/PracticalAnalysisCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// TODO: Replace with audit log service/API when available
const initialCandidateAdminActions: CandidateAdminAction[] = [
  {
    id: 'cand-action-1',
    candidateId: 'candidate-1',
    candidateName: 'João Santos',
    action: 'test_reset',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-12-10T14:30:00',
    details: 'Teste comportamental resetado para nova tentativa após falha técnica',
  },
  {
    id: 'cand-action-2',
    candidateId: 'candidate-21',
    candidateName: 'Henrique Pereira',
    action: 'deactivated',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-10T16:00:00',
    details: 'Candidato desativado por solicitação própria - encontrou emprego',
  },
  {
    id: 'cand-action-3',
    candidateId: 'candidate-6',
    candidateName: 'Ana Beatriz Lima',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-15T10:00:00',
    details: 'Notificação enviada: oportunidades compatíveis com perfil disponíveis',
  },
  {
    id: 'cand-action-4',
    candidateId: 'candidate-14',
    candidateName: 'Gabriela Ferreira',
    action: 'test_reset',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-05T09:30:00',
    details: 'Teste comportamental resetado a pedido do candidato',
  },
  {
    id: 'cand-action-5',
    candidateId: 'candidate-29',
    candidateName: 'Rafael Almeida',
    action: 'deactivated',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-15T11:20:00',
    details: 'Candidato desativado por inatividade prolongada (6 meses sem acesso)',
  },
  {
    id: 'cand-action-6',
    candidateId: 'candidate-16',
    candidateName: 'Camila Rodrigues',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-20T14:00:00',
    details: 'Notificação enviada: convite para programa de mentoria da plataforma',
  },
  {
    id: 'cand-action-7',
    candidateId: 'candidate-33',
    candidateName: 'William Santos',
    action: 'deactivated',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-20T15:45:00',
    details: 'Candidato desativado por violação dos termos de uso',
  },
  {
    id: 'cand-action-8',
    candidateId: 'candidate-7',
    candidateName: 'Roberto Silva',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-06-20T09:00:00',
    details: 'Notificação enviada: lembrete para completar perfil (falta experiência profissional)',
  },
  {
    id: 'cand-action-9',
    candidateId: 'candidate-12',
    candidateName: 'Mariana Costa',
    action: 'test_reset',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-01T10:15:00',
    details: 'Teste resetado após reclamação sobre tempo de resposta insuficiente',
  },
  {
    id: 'cand-action-10',
    candidateId: 'candidate-22',
    candidateName: 'Isabela Martins',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-18T11:30:00',
    details: 'Notificação enviada: parabéns por atingir 100% de perfil completo',
  },
  {
    id: 'cand-action-11',
    candidateId: 'candidate-26',
    candidateName: 'Natália Carvalho',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-22T13:00:00',
    details: 'Notificação enviada: destaque na busca de recrutadores por 30 dias como benefício',
  },
  {
    id: 'cand-action-12',
    candidateId: 'candidate-11',
    candidateName: 'Carlos Eduardo Souza',
    action: 'activated',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-06-05T10:00:00',
    details: 'Candidato ativado após aprovação do cadastro',
  },
  {
    id: 'cand-action-13',
    candidateId: 'candidate-3',
    candidateName: 'Pedro Costa',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-05-15T14:45:00',
    details: 'Notificação enviada: recomendação para realizar teste comportamental',
  },
  {
    id: 'cand-action-14',
    candidateId: 'candidate-28',
    candidateName: 'Paula Gomes',
    action: 'test_reset',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-20T16:00:00',
    details: 'Teste resetado após atualização do sistema de avaliação comportamental',
  },
  {
    id: 'cand-action-15',
    candidateId: 'candidate-20',
    candidateName: 'Giovana Alves',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2024-07-25T09:30:00',
    details: 'Notificação enviada: workshop gratuito sobre elaboração de currículo',
  },
];
import { useCandidates } from '@/hooks/useCandidatesQuery';
import { useApplications } from '@/hooks/useApplicationsQuery';
import { useGaugeProResultByCandidate, useAllGaugeProResults } from '@/hooks/useGaugeProQuery';
import { ARCHETYPE_PROFILES } from '@/data/gaugeProArchetypes';
import { GaugeProRadarChart } from '@/components/corporate-tests/GaugeProRadarChart';
import { DimensionBarsGaugePro } from '@/components/corporate-tests/DimensionBarsGaugePro';
import type { Candidate, CandidateStatus, CandidateAdminAction } from '@/types';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

// Constantes
const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG = {
  active: {
    label: 'Ativo',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  inactive: {
    label: 'Inativo',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

const TEST_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Realizado' },
  { value: 'not_completed', label: 'Não Realizado' },
];

const BEHAVIORAL_PROFILES = ARCHETYPE_PROFILES.map((a) => ({
  value: a.id,
  label: a.name,
}));

export default function AdminCandidates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Fetch candidates via service layer
  const { data: candidatesResult, isLoading: isLoadingCandidates } = useCandidates(
    undefined,
    { page: 1, pageSize: 1000 }
  );

  // Search with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [testStatusFilter, setTestStatusFilter] = useState<string>('all');
  const [behavioralProfileFilter, setDiscProfileFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<string>(
    searchParams.get('origin') === 'collaborator' ? 'collaborator' : 'all'
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Action modals
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [resetTestDialogOpen, setResetTestDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Gauge-Pro result for selected candidate (side panel)
  const { data: selectedGaugeResult } = useGaugeProResultByCandidate(selectedCandidate?.id || '');

  // All Gauge-Pro results for behavioral profile filtering
  const { data: allGaugeResults } = useAllGaugeProResults();
  const gaugeResultsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allGaugeResults) {
      for (const r of allGaugeResults) {
        // Keep latest result per candidate (already sorted by generated_at desc)
        if (!map.has(r.candidateId)) {
          map.set(r.candidateId, r.archetype?.id ?? '');
        }
      }
    }
    return map;
  }, [allGaugeResults]);

  // Data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [actions, setActions] = useState<CandidateAdminAction[]>(initialCandidateAdminActions);
  const { data: applicationsResult } = useApplications(undefined, { page: 1, pageSize: 1000 });
  const applications = applicationsResult?.data ?? [];

  // Sync service data to local state
  useEffect(() => {
    if (candidatesResult?.data) {
      setCandidates(candidatesResult.data);
    }
  }, [candidatesResult]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, testStatusFilter, behavioralProfileFilter, originFilter]);

  // Filter logic
  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = debouncedSearch.toLowerCase();
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

    let matchesTestStatus = true;
    if (testStatusFilter === 'completed') {
      matchesTestStatus = candidate.hasTest === true;
    } else if (testStatusFilter === 'not_completed') {
      matchesTestStatus = candidate.hasTest === false;
    }

    const candidateArchetypeId = gaugeResultsMap.get(candidate.id);
    const matchesDiscProfile =
      behavioralProfileFilter === 'all' ||
      candidateArchetypeId === behavioralProfileFilter;

    const matchesOrigin = originFilter === 'all'
      || (originFilter === 'collaborator' && candidate.visibilityLocked)
      || (originFilter === 'candidate' && !candidate.visibilityLocked);

    return matchesSearch && matchesStatus && matchesTestStatus && matchesDiscProfile && matchesOrigin;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Action handlers
  const handleDeactivateCandidate = () => {
    if (!selectedCandidate) return;

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id
          ? {
              ...c,
              status: 'inactive' as CandidateStatus,
              deactivatedAt: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );

    const newAction: CandidateAdminAction = {
      id: `cand-action-${Date.now()}`,
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name,
      action: 'deactivated',
      performedBy: 'Ana Silva (Admin)',
      performedAt: new Date().toISOString(),
      details: deactivateReason || 'Candidato desativado',
    };

    setActions((prev) => [newAction, ...prev]);

    toast.success(`Candidato ${selectedCandidate.name} desativado com sucesso`);
    setDeactivateDialogOpen(false);
    setDeactivateReason('');
  };

  const handleReactivateCandidate = () => {
    if (!selectedCandidate) return;

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id
          ? {
              ...c,
              status: 'active' as CandidateStatus,
              deactivatedAt: undefined,
            }
          : c
      )
    );

    const newAction: CandidateAdminAction = {
      id: `cand-action-${Date.now()}`,
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name,
      action: 'activated',
      performedBy: 'Ana Silva (Admin)',
      performedAt: new Date().toISOString(),
      details: 'Candidato reativado',
    };

    setActions((prev) => [newAction, ...prev]);

    toast.success(`Candidato ${selectedCandidate.name} reativado com sucesso`);
    setReactivateDialogOpen(false);
  };

  const handleResetTest = () => {
    if (!selectedCandidate) return;

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id
          ? {
              ...c,
              hasTest: false,
              testResult: undefined,
            }
          : c
      )
    );

    const newAction: CandidateAdminAction = {
      id: `cand-action-${Date.now()}`,
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name,
      action: 'test_reset',
      performedBy: 'Ana Silva (Admin)',
      performedAt: new Date().toISOString(),
      details: 'Teste comportamental resetado',
    };

    setActions((prev) => [newAction, ...prev]);

    toast.success(`Teste de ${selectedCandidate.name} resetado com sucesso`);
    setResetTestDialogOpen(false);
  };

  const handleSendNotification = () => {
    if (!selectedCandidate || !notificationMessage.trim()) return;

    const newAction: CandidateAdminAction = {
      id: `cand-action-${Date.now()}`,
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name,
      action: 'notification_sent',
      performedBy: 'Ana Silva (Admin)',
      performedAt: new Date().toISOString(),
      details: `Notificação enviada: ${notificationMessage}`,
    };

    setActions((prev) => [newAction, ...prev]);

    toast.success(`Notificação enviada para ${selectedCandidate.name}`);
    setNotificationDialogOpen(false);
    setNotificationMessage('');
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setOriginFilter('all');
    setTestStatusFilter('all');
    setDiscProfileFilter('all');
    setSearchTerm('');
  };

  // Filter content component (reusable for sidebar and mobile sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Origem</Label>
        <Select value={originFilter} onValueChange={setOriginFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="candidate">Candidato</SelectItem>
            <SelectItem value="collaborator">Colaborador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Teste Comportamental</Label>
        <Select value={testStatusFilter} onValueChange={setTestStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {TEST_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Perfil Comportamental</Label>
        <Select value={behavioralProfileFilter} onValueChange={setDiscProfileFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {BEHAVIORAL_PROFILES.map((profile) => (
              <SelectItem key={profile.value} value={profile.value}>
                {profile.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleClearFilters}
      >
        <X className="h-4 w-4 mr-2" />
        Limpar Filtros
      </Button>
    </div>
  );

  // Candidate card component
  const CandidateCard = ({ candidate, index }: { candidate: Candidate; index: number }) => {
    const StatusIcon = STATUS_CONFIG[candidate.status].icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => {
          navigate(`/admin/candidatos/${candidate.id}`);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidate.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {candidate.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{candidate.name}</h3>
                {candidate.visibilityLocked && (
                  <Badge variant="outline" className="text-amber-600 border-amber-400 text-[10px]">
                    Colaborador
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={cn(STATUS_CONFIG[candidate.status].bgColor, STATUS_CONFIG[candidate.status].color)}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {STATUS_CONFIG[candidate.status].label}
                </Badge>
                {candidate.visibilityLocked && (
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 text-xs">
                    Colaborador
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2">{candidate.email}</p>

              <p className="text-sm font-medium mb-2">{candidate.title}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {candidate.location}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {candidate.experience} anos
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Desde {new Date(candidate.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {candidate.hasTest ? (
                  <Badge variant="default" className="bg-success/10 text-success">
                    <Brain className="h-3 w-3 mr-1" />
                    Teste realizado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-warning/10 text-warning">
                    <Brain className="h-3 w-3 mr-1" />
                    Sem teste
                  </Badge>
                )}
                <Badge variant="outline">
                  {candidate.profileCompletion}% completo
                </Badge>
              </div>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </motion.div>
    );
  };

  // Candidate drawer component
  const CandidateDrawer = () => {
    if (!selectedCandidate) return null;

    const candidateActions = actions.filter(
      (action) => action.candidateId === selectedCandidate.id
    );

    const candidateApplications = applications.filter(
      (app) => app.candidateId === selectedCandidate.id
    );

    return (
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCandidate.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedCandidate.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-2xl">{selectedCandidate.name}</SheetTitle>
                  <p className="text-sm text-muted-foreground">{selectedCandidate.title}</p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'mt-2',
                      STATUS_CONFIG[selectedCandidate.status].bgColor,
                      STATUS_CONFIG[selectedCandidate.status].color
                    )}
                  >
                    {STATUS_CONFIG[selectedCandidate.status].label}
                  </Badge>
                  {selectedCandidate.visibilityLocked && (
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 text-xs">
                      Colaborador
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <SheetDescription className="sr-only">Detalhes do candidato {selectedCandidate.name}</SheetDescription>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {selectedCandidate.status === 'active' ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeactivateDialogOpen(true)}
                >
                  <PowerOff className="h-4 w-4 mr-2" />
                  Desativar
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setReactivateDialogOpen(true)}
                >
                  <Power className="h-4 w-4 mr-2" />
                  Reativar
                </Button>
              )}

              {selectedCandidate.hasTest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResetTestDialogOpen(true)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar Teste
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationDialogOpen(true)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Enviar Notificação
              </Button>
            </div>
          </SheetHeader>

          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="test">Teste</TabsTrigger>
              <TabsTrigger value="applications">Candidaturas</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            {/* Tab: Perfil */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações Básicas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCandidate.email}</span>
                    </div>
                    {selectedCandidate.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCandidate.phone}</span>
                      </div>
                    )}
                    {selectedCandidate.linkedin && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={selectedCandidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCandidate.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Experiência e Formação</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experiência:</span>{' '}
                      {selectedCandidate.experience} anos
                    </div>
                    <div>
                      <span className="text-muted-foreground">Formação:</span>{' '}
                      {selectedCandidate.education}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Disponibilidade:</span>{' '}
                      {selectedCandidate.availability}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Pretensão Salarial</h3>
                  <p className="text-sm">
                    R$ {selectedCandidate.salary.min.toLocaleString()} - R${' '}
                    {selectedCandidate.salary.max.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Métricas</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Perfil:</span>{' '}
                      {selectedCandidate.profileCompletion}% completo
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data de cadastro:</span>{' '}
                      {new Date(selectedCandidate.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    {selectedCandidate.deactivatedAt && (
                      <div>
                        <span className="text-muted-foreground">Desativado em:</span>{' '}
                        {new Date(selectedCandidate.deactivatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Teste */}
            <TabsContent value="test" className="space-y-6 mt-6">
              {selectedGaugeResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Resultado Comportamental</h3>
                    <Badge variant="default">{selectedGaugeResult.archetype.name}</Badge>
                  </div>

                  <GaugeProRadarChart
                    scores={selectedGaugeResult.finalScores}
                    candidateName={selectedCandidate.name}
                    size="sm"
                  />
                  <DimensionBarsGaugePro scores={selectedGaugeResult.finalScores} compact />

                  <p className="text-xs text-muted-foreground">
                    Completado em {new Date(selectedGaugeResult.generatedAt).toLocaleDateString('pt-BR')}
                  </p>

                  {/* AI Analysis - PRD-051 */}
                  <TechnicalAnalysisCard
                    candidateId={selectedCandidate.id}
                    candidateName={selectedCandidate.name}
                    gaugeProResult={selectedGaugeResult}
                  />
                  <PracticalAnalysisCard
                    candidateId={selectedCandidate.id}
                    candidateName={selectedCandidate.name}
                    gaugeProResult={selectedGaugeResult}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Teste comportamental nao realizado</p>
                  <p className="text-sm">
                    Este candidato ainda nao completou o teste comportamental Gauge-Pro.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab: Candidaturas */}
            <TabsContent value="applications" className="space-y-4 mt-6">
              {candidateApplications.length > 0 ? (
                <div className="space-y-3">
                  {candidateApplications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{app.jobTitle}</h4>
                          <p className="text-sm text-muted-foreground">{app.companyName}</p>
                        </div>
                        <Badge variant="secondary">{app.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Aplicado em: {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                      </div>
                      {app.match && (
                        <div className="mt-2">
                          <Badge variant="default" className="bg-success/10 text-success">
                            Match: {app.match}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma candidatura registrada</p>
                </div>
              )}
            </TabsContent>

            {/* Tab: Histórico */}
            <TabsContent value="history" className="space-y-4 mt-6">
              {candidateActions.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {candidateActions
                      .sort(
                        (a, b) =>
                          new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
                      )
                      .map((action) => (
                        <div key={action.id} className="border-l-2 border-primary/20 pl-4 pb-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary">
                                  {action.action === 'activated' && 'Ativado'}
                                  {action.action === 'deactivated' && 'Desativado'}
                                  {action.action === 'test_reset' && 'Teste Resetado'}
                                  {action.action === 'notification_sent' && 'Notificação Enviada'}
                                </Badge>
                              </div>
                              <p className="text-sm mb-1">{action.details}</p>
                              <div className="text-xs text-muted-foreground">
                                Por {action.performedBy} em{' '}
                                {new Date(action.performedAt).toLocaleString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma ação registrada</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    );
  };

  if (isLoadingCandidates) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Candidatos"
          description="Visualize e gerencie todos os candidatos cadastrados na plataforma. Acompanhe perfis comportamentais, status de testes e ações administrativas."
          badges={
            candidates.length > 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  <User className="w-3 h-3" />
                  {candidates.length} {candidates.length === 1 ? 'candidato' : 'candidatos'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {candidates.filter(c => c.status === 'active').length} ativos
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 text-xs font-medium text-violet-600 dark:text-violet-400">
                  <Brain className="w-3 h-3" />
                  {candidates.filter(c => c.hasTest === true).length} com teste
                </span>
              </>
            ) : undefined
          }
          howItWorks={[
            'Visualize todos os candidatos cadastrados na plataforma',
            'Filtre por status, teste comportamental e perfil',
            'Use as ações do menu para gerenciar cada candidato',
          ]}
        />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile filter button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription className="sr-only">Filtrar candidatos por status, teste e busca</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="font-semibold mb-4">Filtros</h2>
              <FilterContent />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredCandidates.length} candidato(s) encontrado(s)
              </p>
            </div>

            {/* Candidate list */}
            {paginatedCandidates.length > 0 ? (
              <div className="space-y-4">
                {paginatedCandidates.map((candidate, index) => (
                  <CandidateCard key={candidate.id} candidate={candidate} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-card">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum candidato encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou termo de busca.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={
                          currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === '...' ? (
                          <span className="px-4">...</span>
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(page as number)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Drawer */}
      <CandidateDrawer />

      {/* Deactivate Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o candidato {selectedCandidate?.name}? O candidato
              não poderá mais acessar a plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="deactivate-reason">Motivo (opcional)</Label>
            <Textarea
              id="deactivate-reason"
              placeholder="Digite o motivo da desativação..."
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateCandidate}
              className="bg-destructive hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Dialog */}
      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar Candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reativar o candidato {selectedCandidate?.name}? O candidato
              poderá acessar a plataforma novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivateCandidate}>Reativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Test Dialog */}
      <AlertDialog open={resetTestDialogOpen} onOpenChange={setResetTestDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar Teste Comportamental</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja resetar o teste comportamental de {selectedCandidate?.name}? O
              resultado atual será perdido e o candidato poderá realizar o teste novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetTest}>Resetar Teste</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notification Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Notificação</DialogTitle>
            <DialogDescription>
              Envie uma notificação para {selectedCandidate?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="notification-message">Mensagem</Label>
              <Textarea
                id="notification-message"
                placeholder="Digite a mensagem da notificação..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                className="mt-2"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notificationMessage.length}/500 caracteres
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNotificationDialogOpen(false);
                setNotificationMessage('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={!notificationMessage.trim()}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
