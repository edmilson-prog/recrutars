/**
 * Applications Page - Application Pipeline (Kanban)
 * PRD-015: Gestão de Candidaturas
 * PRD-016: Envio de Testes
 */

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Star,
  MessageSquare,
  ClipboardCheck,
  AlertCircle,
  Filter,
  Send,
  Clock,
  FileDown,
  Calendar,
  MoreVertical,
  Loader2,
  Trophy,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Label } from '@/components/ui/label';
import { useJobsByCompany } from '@/hooks/useJobsQuery';
import {
  useApplications as useApplicationsQuery,
  useUpdateApplicationStatus,
  useAddApplicationNote,
} from '@/hooks/useApplicationsQuery';
import { useCandidates } from '@/hooks/useCandidatesQuery';
import { useBehavioralTests } from '@/hooks/useBehavioralTestsQuery';
import { useAllGaugeProResults } from '@/hooks/useGaugeProQuery';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCompositeBehavioralProfile,
  getOrGenerateIdealProfile,
} from '@/lib/behavioralProfiles';
import type { GaugeProResult } from '@/types/gaugePro';
import type { Conversation } from '@/types/message';
import type { Application, ApplicationStatus, ApplicationNote, ApplicationHistory, TestRequestStatus, Message } from '@/types';
import type { CandidateForComparison } from '@/types/disc';
import { toast } from 'sonner';
import { formatDateBR, formatRelativeDate } from '@/lib/formatters';
import { getCandidateDisplayName, getCandidateInitials } from '@/lib/candidateDisplayName';
import { calculateMatchBreakdown } from '@/lib/matchCalculator';
import { getMatchScoreColor } from '@/types/disc';
// PRD-002-dgn: Componentes de comparação
import { useCandidateSelection, SelectionBar } from '@/components/compare/CandidateSelector';
import { CandidateComparisonModal } from '@/components/compare/CandidateComparison';
import { Checkbox } from '@/components/ui/checkbox';
// PRD-032: Exportação de candidatos
import { ExportCandidatesModal } from '@/components/export';
// PRD-034: Agendamento de entrevistas
import { ScheduleInterviewModal } from '@/components/empresa/ScheduleInterviewModal';
import { useCompanyInterviews } from '@/hooks/useCompanyInterviews';
import type { ExportContext } from '@/types/export';
import type { Candidate } from '@/types';

// PRD-077: Fluxo de contratacao
import { HiringModal } from '@/components/empresa/HiringModal';
import { JobClosureModal } from '@/components/empresa/JobClosureModal';
import { useHiredCountForJob, useIsAlreadyTeamMember } from '@/hooks/useHiringsQuery';
import type { HireResult } from '@/types/hiring';

// Status configuration
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: 'Novos',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
  },
  reviewing: {
    label: 'Em Análise',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
  },
  interview: {
    label: 'Entrevista',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
  },
  offer: {
    label: 'Aprovados',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10 border-green-500/20',
  },
  rejected: {
    label: 'Reprovados',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10 border-red-500/20',
  },
  hired: {
    label: 'Contratados',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
  talent_pool: {
    label: 'Banco de Talentos',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
  },
};

const BEHAVIORAL_PROFILES = ['Executor', 'Influenciador', 'Analítico', 'Estável'];

// PRD-016: Test request status configuration
const TEST_STATUS_CONFIG: Record<TestRequestStatus, { label: string; icon: string; color: string }> = {
  nao_solicitado: { label: 'Não solicitado', icon: '❌', color: 'text-muted-foreground' },
  solicitado: { label: 'Solicitado', icon: '⏳', color: 'text-yellow-600' },
  realizado: { label: 'Realizado', icon: '✅', color: 'text-green-600' },
};

const DEADLINE_OPTIONS = [
  { value: '3', label: '3 dias' },
  { value: '5', label: '5 dias' },
  { value: '7', label: '7 dias' },
  { value: '14', label: '14 dias' },
  { value: 'none', label: 'Sem prazo' },
];

const DEFAULT_TEST_MESSAGE = `Olá! Para darmos continuidade ao processo seletivo, gostaríamos que você realizasse nosso teste comportamental Gauge-Pro. O teste leva cerca de 15-20 minutos e nos ajuda a entender melhor seu perfil.`;

// PRD-035: Cálculo dinâmico de match - esta função é usada em múltiplos lugares
// NOTE: This uses candidatesMap, companyJobs and behavioralTests from the component scope
// via closures, set during render
let _candidatesMap: Record<string, import('@/types').Candidate> = {};
let _companyJobs: import('@/types').Job[] = [];
let _behavioralTests: Array<{ candidateId: string; status: string; result?: { dominance: number; influence: number; steadiness: number; compliance: number } | null }> = [];
let _gaugeResultsByCandidate: Map<string, GaugeProResult> = new Map();
let currentSelectedJobId = '';
const calculateMatch = (candidateId: string): number => {
  const candidate = _candidatesMap[candidateId];
  if (!candidate) return 0;

  // Usa a vaga selecionada atualmente ou a primeira vaga da empresa
  const job = _companyJobs.find((j) => j.id === currentSelectedJobId) ||
    _companyJobs.find((j) => j.status === 'active');
  if (!job) return 0;

  const idealProfile = getOrGenerateIdealProfile(job);
  const candidateProfile = getCompositeBehavioralProfile(candidateId, _behavioralTests, _gaugeResultsByCandidate);
  const matchResult = calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile);
  return matchResult.totalScore;
};

// Generate mock experience from candidate data
const generateMockExperiences = (candidateTitle: string, years: number) => {
  const experiences = [];

  if (years >= 3) {
    experiences.push({
      id: 'exp-1',
      company: 'Empresa Atual',
      role: candidateTitle,
      startDate: '2022',
      endDate: null,
      current: true,
      description: 'Atuação na área com foco em resultados.',
    });
  }

  if (years >= 5) {
    experiences.push({
      id: 'exp-2',
      company: 'Empresa Anterior',
      role: `${candidateTitle} Jr`,
      startDate: '2019',
      endDate: '2022',
      current: false,
      description: 'Desenvolvimento de habilidades.',
    });
  }

  return experiences;
};

export default function CompanyApplications() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  // Fetch data from service layer
  const { data: fetchedCompanyJobs = [], isLoading: isLoadingJobs } = useJobsByCompany(companyId);
  const { data: applicationsResult, isLoading: isLoadingApps } = useApplicationsQuery(
    { companyId },
    { page: 1, pageSize: 500 }
  );
  const { data: candidatesResult, isLoading: isLoadingCandidates } = useCandidates(
    undefined,
    { page: 1, pageSize: 1000 }
  );
  const { data: behavioralTests = [] } = useBehavioralTests();
  const { data: allGaugeResults = [] } = useAllGaugeProResults();

  const candidatesMap = useMemo(() => {
    const candidates = candidatesResult?.data ?? [];
    const map: Record<string, import('@/types').Candidate> = {};
    candidates.forEach(c => { map[c.id] = c; });
    return map;
  }, [candidatesResult]);

  const gaugeResultsByCandidate = useMemo(() => {
    const map = new Map<string, GaugeProResult>();
    allGaugeResults.forEach(r => {
      if (!map.has(r.candidateId)) map.set(r.candidateId, r);
    });
    return map;
  }, [allGaugeResults]);

  // Update module-level refs for calculateMatch (synchronous during render)
  _candidatesMap = candidatesMap;
  _companyJobs = fetchedCompanyJobs;
  _behavioralTests = behavioralTests;
  _gaugeResultsByCandidate = gaugeResultsByCandidate;

  const applications_ = useMemo(() => applicationsResult?.data ?? [], [applicationsResult]);
  const isLoading = isLoadingJobs || isLoadingApps || isLoadingCandidates;

  // Mutations
  const updateStatusMutation = useUpdateApplicationStatus();
  const addNoteMutation = useAddApplicationNote();

  // Read jobId from URL query params (e.g. /empresa/candidaturas?jobId=xxx)
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') ?? '';

  // State
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectedOpen, setRejectedOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // PRD-077: Hiring flow state
  const [hiringModalOpen, setHiringModalOpen] = useState(false);
  const [jobClosureModalOpen, setJobClosureModalOpen] = useState(false);
  const [lastHireResult, setLastHireResult] = useState<HireResult | null>(null);
  const [hiredOpen, setHiredOpen] = useState(false);
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false);

  // PRD-016: Test request modal state
  const [requestTestModalOpen, setRequestTestModalOpen] = useState(false);
  const [testMessage, setTestMessage] = useState(DEFAULT_TEST_MESSAGE);
  const [testDeadline, setTestDeadline] = useState('7');
  // TODO: Replace with messages service hook when available
  const [messages, setMessages] = useState<Message[]>([]);

  // Filters
  const [matchFilter, setMatchFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [testFilter, setTestFilter] = useState<string>('all');

  // PRD-035: Sync selectedJobId to module-level ref for calculateMatch (synchronous during render)
  currentSelectedJobId = selectedJobId;

  // Local state for applications (to allow status changes within the session)
  const [localStatusOverrides, setLocalStatusOverrides] = useState<Record<string, Partial<Application>>>({});

  // Merge fetched applications with local overrides
  const applications = useMemo(() =>
    applications_.map(app =>
      localStatusOverrides[app.id] ? { ...app, ...localStatusOverrides[app.id] } : app
    ),
    [applications_, localStatusOverrides]
  );

  // Real application count per job (excludes withdrawn)
  const applicationsCountByJob = useMemo(() => {
    const map: Record<string, number> = {};
    for (const app of applications) {
      if (app.status !== 'withdrawn') {
        map[app.jobId] = (map[app.jobId] ?? 0) + 1;
      }
    }
    return map;
  }, [applications]);

  // Total de candidaturas ativas (exclui withdrawn) — exibido no badge do titulo
  const totalActiveApplications = applications.filter(a => a.status !== 'withdrawn').length;

  // Notes state (local + fetched)
  const [localNotes, setLocalNotes] = useState<ApplicationNote[]>([]);
  const notes = localNotes; // Will be populated from fetched + local
  const [newNote, setNewNote] = useState('');

  // History state (local)
  const [localHistory, setLocalHistory] = useState<ApplicationHistory[]>([]);
  const history = localHistory;

  // PRD-002-dgn: Seleção de candidatos para comparação
  const {
    selectedIds,
    toggleCandidate: toggleCompareCandidate,
    clearSelection,
    isSelected: isSelectedForComparison,
    canSelect,
  } = useCandidateSelection(3);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // PRD-032: Estado do modal de exportação
  const [showExportModal, setShowExportModal] = useState(false);

  // PRD-034: Agendamento de entrevistas
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { createInterview } = useCompanyInterviews(companyId);

  // Get company jobs (active or paused)
  const companyJobs = useMemo(() =>
    fetchedCompanyJobs.filter(
      (job) => job.status === 'active' || job.status === 'paused'
    ),
    [fetchedCompanyJobs]
  );

  // Set default job on load
  useEffect(() => {
    if (companyJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(companyJobs[0].id);
    }
  }, [companyJobs, selectedJobId]);

  // Filter applications for selected job
  const jobApplications = applications.filter(
    (app) => app.jobId === selectedJobId
  );

  // Apply filters
  const filteredApplications = jobApplications.filter((app) => {
    const candidate = candidatesMap[app.candidateId];
    if (!candidate) return false;

    const match = calculateMatch(app.candidateId);

    const matchesMatchFilter =
      matchFilter === 'all' ||
      (matchFilter === '>80' && match >= 80) ||
      (matchFilter === '>60' && match >= 60);

    const matchesProfileFilter =
      profileFilter === 'all' ||
      (candidate.testResult?.result.profile
        .toLowerCase()
        .includes(profileFilter.toLowerCase()) ??
        false);

    const matchesTestFilter =
      testFilter === 'all' ||
      (testFilter === 'done' && candidate.hasTest) ||
      (testFilter === 'pending' && !candidate.hasTest);

    return matchesMatchFilter && matchesProfileFilter && matchesTestFilter;
  });

  // Group by status
  const groupedApplications = {
    pending: filteredApplications.filter((a) => a.status === 'pending'),
    reviewing: filteredApplications.filter((a) => a.status === 'reviewing'),
    interview: filteredApplications.filter((a) => a.status === 'interview'),
    offer: filteredApplications.filter((a) => a.status === 'offer'),
    rejected: filteredApplications.filter((a) => a.status === 'rejected'),
    hired: filteredApplications.filter((a) => a.status === 'hired'),
    talent_pool: filteredApplications.filter((a) => a.status === 'talent_pool'),
  };

  // PRD-032: Candidatos para exportação
  const candidatesForExport: Candidate[] = filteredApplications
    .map((app) => candidatesMap[app.candidateId])
    .filter((c): c is Candidate => c !== undefined);

  const navigate = useNavigate();

  const handleCardClick = (app: Application) => {
    setSelectedApplication(app);
    setDrawerOpen(true);
  };

  const handleNavigateToProfile = (candidateId: string) => {
    navigate(`/empresa/candidatos/${candidateId}?jobId=${selectedJobId}`);
  };

  // --- Drag-and-Drop (dnd-kit) ---
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string): ApplicationStatus | null => {
    if (['pending', 'reviewing', 'interview', 'offer'].includes(id)) {
      return id as ApplicationStatus;
    }
    const app = filteredApplications.find((a) => a.id === id);
    return app?.status ?? null;
  };

  const activeApplication = activeId
    ? filteredApplications.find((a) => a.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer) return;

    handleMove(active.id as string, overContainer);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };
  // --- Fim Drag-and-Drop ---

  const handleMove = (applicationId: string, newStatus: ApplicationStatus) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    const oldStatus = app.status;

    // Optimistic local update
    setLocalStatusOverrides((prev) => ({
      ...prev,
      [applicationId]: { status: newStatus, updatedAt: new Date().toISOString().split('T')[0] },
    }));

    // Fire mutation
    updateStatusMutation.mutate({ id: applicationId, status: newStatus });

    // Update selected application if it's the one being moved
    if (selectedApplication?.id === applicationId) {
      setSelectedApplication((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );
    }

    // Add history entry
    const newHistoryEntry: ApplicationHistory = {
      id: `hist-${Date.now()}`,
      applicationId,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedBy: 'Você',
      changedAt: new Date().toISOString(),
    };
    setLocalHistory((prev) => [...prev, newHistoryEntry]);

    toast.success(
      `Candidato movido para ${STATUS_CONFIG[newStatus]?.label || newStatus}`
    );
  };

  const handleReject = () => {
    if (!selectedApplication) return;

    const oldStatus = selectedApplication.status;

    // Optimistic local update
    setLocalStatusOverrides((prev) => ({
      ...prev,
      [selectedApplication.id]: { status: 'rejected' as ApplicationStatus, updatedAt: new Date().toISOString().split('T')[0] },
    }));

    // Fire mutation
    updateStatusMutation.mutate({
      id: selectedApplication.id,
      status: 'rejected',
      reason: rejectReason || undefined,
    });

    // Add history entry
    const newHistoryEntry: ApplicationHistory = {
      id: `hist-${Date.now()}`,
      applicationId: selectedApplication.id,
      fromStatus: oldStatus,
      toStatus: 'rejected',
      changedBy: 'Você',
      changedAt: new Date().toISOString(),
      reason: rejectReason || undefined,
    };
    setLocalHistory((prev) => [...prev, newHistoryEntry]);

    toast.success('Candidato reprovado');
    setRejectDialogOpen(false);
    setRejectReason('');
    setDrawerOpen(false);
    setSelectedApplication(null);
  };

  const handleAddNote = () => {
    if (!selectedApplication || !newNote.trim()) return;

    const newNoteEntry: ApplicationNote = {
      id: `note-${Date.now()}`,
      applicationId: selectedApplication.id,
      content: newNote.trim(),
      author: 'Você',
      createdAt: new Date().toISOString(),
    };
    setLocalNotes((prev) => [...prev, newNoteEntry]);
    addNoteMutation.mutate({
      applicationId: selectedApplication.id,
      content: newNote.trim(),
    });
    setNewNote('');
    toast.success('Anotação adicionada');
  };

  // PRD-016: Handle test request
  const handleRequestTest = () => {
    if (!selectedApplication || !selectedCandidate) return;

    // Calculate deadline date
    const deadlineDate = testDeadline !== 'none'
      ? new Date(Date.now() + parseInt(testDeadline) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    // Optimistic local update for testStatus
    setLocalStatusOverrides((prev) => ({
      ...prev,
      [selectedApplication.id]: {
        ...(prev[selectedApplication.id] || {}),
        testStatus: 'solicitado' as TestRequestStatus,
        testRequestedAt: new Date().toISOString(),
        testDeadline: deadlineDate,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    }));

    // Update selected application
    setSelectedApplication((prev) =>
      prev
        ? {
            ...prev,
            testStatus: 'solicitado' as TestRequestStatus,
            testRequestedAt: new Date().toISOString(),
            testDeadline: deadlineDate,
          }
        : prev
    );

    // TODO: Replace with conversations service hook when available
    const conversation: Conversation | undefined = undefined;

    const conversationId = conversation?.id || `conv-${Date.now()}`;

    // Create test request message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: companyId,
      senderName: 'Tech Solutions',
      senderType: 'company',
      receiverId: selectedApplication.candidateId,
      receiverName: selectedApplication.candidateName,
      subject: 'Solicitação de Teste Comportamental',
      content: testMessage,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'solicitacao_teste',
      metadata: {
        jobId: selectedApplication.jobId,
        jobTitle: selectedApplication.jobTitle,
        deadline: deadlineDate,
      },
    };

    setMessages((prev) => [...prev, newMessage]);

    // Close modal and reset
    setRequestTestModalOpen(false);
    setTestMessage(DEFAULT_TEST_MESSAGE);
    setTestDeadline('7');

    toast.success('Solicitação de teste enviada');
  };

  // Get notes for current application
  const currentNotes = notes.filter(
    (n) => n.applicationId === selectedApplication?.id
  );

  // Get history for current application
  const currentHistory = history.filter(
    (h) => h.applicationId === selectedApplication?.id
  );

  // Get candidate for selected application
  const selectedCandidate = selectedApplication
    ? candidatesMap[selectedApplication.candidateId] ?? null
    : null;

  const selectedMatch = selectedApplication
    ? calculateMatch(selectedApplication.candidateId)
    : 0;

  const selectedExperiences = selectedCandidate
    ? generateMockExperiences(
        selectedCandidate.title,
        selectedCandidate.experience
      )
    : [];

  const selectedJob = companyJobs.find((j) => j.id === selectedJobId);

  // PRD-077: Hired count for selected job
  const { data: hiredCount = 0 } = useHiredCountForJob(selectedJobId);

  // PRD-077: Check duplicate team member
  const selectedCandidateId = selectedApplication?.candidateId ?? '';
  const { data: duplicateCheck } = useIsAlreadyTeamMember(selectedCandidateId, companyId);

  // PRD-002-dgn: Converter candidato para formato de comparação
  const convertToComparisonCandidate = (candidateId: string): CandidateForComparison | null => {
    const candidate = candidatesMap[candidateId];
    if (!candidate) return null;

    const behavioralProfile = getCompositeBehavioralProfile(candidateId, behavioralTests, gaugeResultsByCandidate);

    // PRD-035: Usa cálculo dinâmico de match
    const matchScore = calculateMatch(candidateId);

    return {
      id: candidate.id,
      name: getCandidateDisplayName(candidate),
      avatar: candidate.avatar,
      matchScore,
      behavioralProfile,
      metrics: {
        experience: candidate.experience,
        education: candidate.education,
        location: candidate.location,
        availability: candidate.availability,
        skillsCount: candidate.skills.length,
        hasTest: candidate.hasTest,
        profileCompletion: candidate.profileCompletion,
      },
    };
  };

  // PRD-002-dgn: Candidatos selecionados convertidos para comparação
  const selectedCandidatesForComparison = selectedIds
    .map((id) => convertToComparisonCandidate(id))
    .filter((c): c is CandidateForComparison => c !== null);

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Candidaturas
                <Badge
                  variant="secondary"
                  className="text-base font-semibold px-3 py-1 bg-secondary/10 text-secondary"
                  aria-label={`${totalActiveApplications} candidaturas no total`}
                >
                  {totalActiveApplications}
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Acompanhe e gerencie todas as candidaturas das suas vagas. Filtre por status, avalie candidatos e avance no processo seletivo.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Job Selector and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Job Selector */}
          <div className="flex-1">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full lg:w-80">
                <SelectValue placeholder="Selecione uma vaga" />
              </SelectTrigger>
              <SelectContent>
                {companyJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} ({applicationsCountByJob[job.id] ?? 0} candidaturas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={matchFilter} onValueChange={setMatchFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Match" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value=">80">&gt; 80%</SelectItem>
                <SelectItem value=">60">&gt; 60%</SelectItem>
              </SelectContent>
            </Select>

            <Select value={profileFilter} onValueChange={setProfileFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Perfil Comportamental" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                {BEHAVIORAL_PROFILES.map((profile) => (
                  <SelectItem key={profile} value={profile}>
                    {profile}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={testFilter} onValueChange={setTestFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Teste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="done">Realizado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>

            {/* PRD-032: Botão de exportar */}
            {filteredApplications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(true)}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar Lista
              </Button>
            )}
          </div>
        </div>

        {/* Summary Strip — breakdown da vaga selecionada */}
        {selectedJobId && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-muted/50 rounded-xl border border-border/50"
            role="status"
            aria-live="polite"
          >
            <span className="text-sm font-medium text-foreground">
              {jobApplications.filter(a => a.status !== 'withdrawn').length} nesta vaga
            </span>
            <Separator orientation="vertical" className="h-4" />
            {[
              { key: 'pending',   label: 'Novos',       color: 'text-blue-600',   bg: 'bg-blue-500/10' },
              { key: 'reviewing', label: 'Em Análise',   color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
              { key: 'interview', label: 'Entrevista',   color: 'text-purple-600', bg: 'bg-purple-500/10' },
              { key: 'offer',     label: 'Aprovados',    color: 'text-green-600',  bg: 'bg-green-500/10' },
            ].map(({ key, label, color, bg }) => (
              <span
                key={key}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full",
                  bg, color
                )}
              >
                <span className="font-bold">
                  {groupedApplications[key as keyof typeof groupedApplications]?.length ?? 0}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Kanban Board */}
        {!isLoading && selectedJobId ? (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {(['pending', 'reviewing', 'interview', 'offer'] as const).map(
                  (status) => (
                    <KanbanColumn
                      key={status}
                      status={status}
                      applications={groupedApplications[status]}
                      onCardClick={handleCardClick}
                      onNavigateToProfile={handleNavigateToProfile}
                    />
                  )
                )}
              </div>
              <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                {activeApplication ? (
                  <ApplicationCard
                    application={activeApplication}
                    onManage={() => {}}
                    onNavigate={() => {}}
                    isDragOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Rejected Section */}
            {groupedApplications.rejected.length > 0 && (
              <Collapsible open={rejectedOpen} onOpenChange={setRejectedOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-muted-foreground hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      {rejectedOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      Reprovados ({groupedApplications.rejected.length})
                    </span>
                    <span className="text-sm">Ver lista</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex gap-4 overflow-x-auto py-4">
                    {groupedApplications.rejected.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        onManage={() => handleCardClick(app)}
                        onNavigate={() => handleNavigateToProfile(app.candidateId)}
                        compact
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* PRD-077: Hired Section */}
            {groupedApplications.hired.length > 0 && (
              <Collapsible open={hiredOpen} onOpenChange={setHiredOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-emerald-600 hover:text-emerald-700"
                  >
                    <span className="flex items-center gap-2">
                      {hiredOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <Trophy className="w-4 h-4" />
                      Contratados ({groupedApplications.hired.length})
                    </span>
                    <span className="text-sm">Ver lista</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex gap-4 overflow-x-auto py-4">
                    {groupedApplications.hired.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        onManage={() => handleCardClick(app)}
                        onNavigate={() => handleNavigateToProfile(app.candidateId)}
                        compact
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl shadow-soft">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Selecione uma vaga
            </h3>
            <p className="text-muted-foreground">
              Escolha uma vaga para ver as candidaturas
            </p>
          </div>
        )}
      </div>

      {/* Candidate Drawer */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          {selectedApplication && selectedCandidate && (
            <>
              {/* Header */}
              <DialogHeader className="flex-shrink-0 space-y-3 pb-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedCandidate.avatar} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {getCandidateInitials(selectedCandidate)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg truncate">
                      {getCandidateDisplayName(selectedCandidate)}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedCandidate.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Candidatura em {formatDateBR(selectedApplication.appliedAt)}{' '}
                      <span className="opacity-70">({formatRelativeDate(selectedApplication.appliedAt)})</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-start justify-end shrink-0">
                    <Badge
                      className={`${getMatchScoreColor(selectedMatch).bg} ${getMatchScoreColor(selectedMatch).text} border ${getMatchScoreColor(selectedMatch).border}`}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {selectedMatch}% match
                    </Badge>
                    {selectedCandidate.testResult ? (
                      <Badge variant="secondary">
                        {selectedCandidate.testResult.result.profile}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Sem teste
                      </Badge>
                    )}
                    <Badge
                      className={STATUS_CONFIG[selectedApplication.status]?.bgColor}
                    >
                      {STATUS_CONFIG[selectedApplication.status]?.label}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              {/* Two-column body */}
              <div className="flex flex-1 min-h-0 mt-4 flex-col md:flex-row gap-0">
                {/* LEFT: Tabs content */}
                <div className="flex-1 min-w-0 flex flex-col min-h-0">
                  <Tabs defaultValue="perfil" className="flex flex-col flex-1 min-h-0">
                    <TabsList className="grid grid-cols-6 w-full flex-shrink-0">
                      <TabsTrigger value="perfil">Perfil</TabsTrigger>
                      <TabsTrigger value="experiencia">Exp.</TabsTrigger>
                      <TabsTrigger value="teste">Teste</TabsTrigger>
                      <TabsTrigger value="mensagem">Msg</TabsTrigger>
                      <TabsTrigger value="historico">Hist.</TabsTrigger>
                      <TabsTrigger value="notas" className="relative">
                        Notas
                        {currentNotes.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">
                            {currentNotes.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1 mt-3 pr-4">
                      <TabsContent value="perfil" className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="bg-muted/30 rounded-lg p-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Localização</h4>
                            <p className="text-sm">{selectedCandidate.location}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Experiência</h4>
                            <p className="text-sm">{selectedCandidate.experience} anos</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Formação</h4>
                            <p className="text-sm">{selectedCandidate.education}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Disponibilidade</h4>
                            <p className="text-sm">{selectedCandidate.availability}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.skills.map((skill) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="experiencia" className="space-y-4 mt-0">
                        {selectedExperiences.length > 0 ? (
                          selectedExperiences.map((exp, index) => (
                            <div
                              key={exp.id}
                              className={`relative pl-6 ${
                                index !== selectedExperiences.length - 1
                                  ? 'border-l-2 border-muted pb-4'
                                  : ''
                              }`}
                            >
                              <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-primary" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{exp.role}</h4>
                                  {exp.current && (
                                    <Badge variant="secondary" className="text-xs">
                                      Atual
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground">{exp.company}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {exp.startDate} - {exp.endDate || 'Presente'}
                                </p>
                                <p className="text-sm mt-2">{exp.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">
                            Experiências não informadas
                          </p>
                        )}
                      </TabsContent>

                      <TabsContent value="teste" className="space-y-4 mt-0">
                        {selectedCandidate.testResult ? (
                          <>
                            <div className="text-center mb-4">
                              <Badge variant="secondary" className="text-lg px-4 py-1">
                                {selectedCandidate.testResult.result.profile}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">Dominância (D)</span>
                                  <span className="text-muted-foreground">
                                    {selectedCandidate.testResult.result.dominance}%
                                  </span>
                                </div>
                                <Progress
                                  value={selectedCandidate.testResult.result.dominance}
                                  className="h-2"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">Influência (I)</span>
                                  <span className="text-muted-foreground">
                                    {selectedCandidate.testResult.result.influence}%
                                  </span>
                                </div>
                                <Progress
                                  value={selectedCandidate.testResult.result.influence}
                                  className="h-2"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">Estabilidade (S)</span>
                                  <span className="text-muted-foreground">
                                    {selectedCandidate.testResult.result.steadiness}%
                                  </span>
                                </div>
                                <Progress
                                  value={selectedCandidate.testResult.result.steadiness}
                                  className="h-2"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">Conformidade (C)</span>
                                  <span className="text-muted-foreground">
                                    {selectedCandidate.testResult.result.compliance}%
                                  </span>
                                </div>
                                <Progress
                                  value={selectedCandidate.testResult.result.compliance}
                                  className="h-2"
                                />
                              </div>
                            </div>

                            <Separator className="my-4" />

                            <div>
                              <h4 className="font-medium mb-2">Pontos Fortes</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCandidate.testResult.result.strengths.map(
                                  (s) => (
                                    <Badge
                                      key={s}
                                      variant="outline"
                                      className="text-success border-success/30"
                                    >
                                      {s}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>

                            {selectedCandidate.testResult.result.watchPoints && (
                              <div>
                                <h4 className="font-medium mb-2">Pontos de Atenção</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedCandidate.testResult.result.watchPoints.map(
                                    (p) => (
                                      <Badge
                                        key={p}
                                        variant="outline"
                                        className="text-warning border-warning/30"
                                      >
                                        {p}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : selectedCandidate.hasTest ? (
                          /* v1.14.3: Candidato fez Gauge-Pro voluntariamente */
                          <div className="text-center py-8 space-y-4">
                            <ClipboardCheck className="w-12 h-12 mx-auto text-cyan-500" />
                            <div>
                              <p className="font-medium">Gauge-Pro realizado voluntariamente</p>
                              {(() => {
                                const gaugeResult = gaugeResultsByCandidate.get(selectedCandidate.id);
                                return gaugeResult?.generatedAt ? (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Realizado em {formatDateBR(gaugeResult.generatedAt)}{' '}
                                    <span className="opacity-70">({formatRelativeDate(gaugeResult.generatedAt)})</span>
                                  </p>
                                ) : null;
                              })()}
                              <p className="text-sm text-muted-foreground mt-1">
                                O candidato realizou o teste comportamental por iniciativa própria.
                                Visualize o perfil completo na página do candidato.
                              </p>
                            </div>
                            <Button variant="outline" asChild>
                              <Link to={`/empresa/candidatos/${selectedCandidate.id}`}>
                                Ver perfil completo
                              </Link>
                            </Button>
                            {selectedApplication.testStatus === 'nao_solicitado' && (
                              <Button variant="outline" onClick={() => setRequestTestModalOpen(true)}>
                                <Send className="w-4 h-4 mr-2" />
                                Solicitar novo teste
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 space-y-4">
                            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                            <div>
                              <p className="font-medium">Teste não realizado</p>
                              {selectedApplication.testStatus === 'solicitado' ? (
                                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                                  <p className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Solicitado em:{' '}
                                    {selectedApplication.testRequestedAt
                                      ? new Date(selectedApplication.testRequestedAt).toLocaleDateString('pt-BR')
                                      : '-'}
                                  </p>
                                  {selectedApplication.testDeadline && (
                                    <p>
                                      Prazo:{' '}
                                      {new Date(selectedApplication.testDeadline).toLocaleDateString('pt-BR')}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Solicite que o candidato realize o teste comportamental
                                </p>
                              )}
                            </div>
                            {selectedApplication.testStatus === 'nao_solicitado' && (
                              <Button onClick={() => setRequestTestModalOpen(true)}>
                                <Send className="w-4 h-4 mr-2" />
                                Solicitar Teste
                              </Button>
                            )}
                            {selectedApplication.testStatus === 'solicitado' && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600/30">
                                <Clock className="w-3 h-3 mr-1" />
                                Aguardando realização
                              </Badge>
                            )}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="mensagem" className="space-y-4 mt-0">
                        {selectedApplication.message ? (
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">
                              Mensagem do candidato
                            </h4>
                            <p className="text-muted-foreground">
                              {selectedApplication.message}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Nenhuma mensagem enviada
                          </p>
                        )}
                        <Button variant="outline" className="w-full" asChild>
                          <Link
                            to={`/empresa/mensagens?candidato=${selectedCandidate.id}`}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Enviar mensagem
                          </Link>
                        </Button>
                      </TabsContent>

                      <TabsContent value="historico" className="space-y-4 mt-0">
                        {currentHistory.length > 0 ? (
                          <div className="space-y-3">
                            {currentHistory
                              .sort(
                                (a, b) =>
                                  new Date(b.changedAt).getTime() -
                                  new Date(a.changedAt).getTime()
                              )
                              .map((entry) => (
                                <div
                                  key={entry.id}
                                  className="flex items-start gap-3 text-sm"
                                >
                                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                                  <div>
                                    <p>
                                      <span className="font-medium">
                                        {entry.changedBy}
                                      </span>{' '}
                                      moveu para{' '}
                                      <Badge variant="outline" className="text-xs">
                                        {STATUS_CONFIG[entry.toStatus]?.label ||
                                          entry.toStatus}
                                      </Badge>
                                    </p>
                                    {entry.reason && (
                                      <p className="text-muted-foreground mt-1">
                                        Motivo: {entry.reason}
                                      </p>
                                    )}
                                    <p className="text-muted-foreground text-xs mt-1">
                                      {new Date(entry.changedAt).toLocaleDateString('pt-BR')}{' '}
                                      às {new Date(entry.changedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Nenhuma movimentação registrada
                          </p>
                        )}
                      </TabsContent>

                      {/* Notes Tab */}
                      <TabsContent value="notas" className="space-y-4 mt-0">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Adicionar anotação..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="resize-none flex-1"
                            rows={3}
                          />
                          <Button
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            size="sm"
                            className="self-end"
                          >
                            Adicionar
                          </Button>
                        </div>

                        {currentNotes.length > 0 ? (
                          <div className="space-y-2">
                            {currentNotes
                              .sort(
                                (a, b) =>
                                  new Date(b.createdAt).getTime() -
                                  new Date(a.createdAt).getTime()
                              )
                              .map((note) => (
                                <div
                                  key={note.id}
                                  className="text-sm bg-muted/50 p-3 rounded-lg"
                                >
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span className="font-medium">{note.author}</span>
                                    <span>
                                      {formatDateBR(note.createdAt)}
                                    </span>
                                  </div>
                                  <p>{note.content}</p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhuma anotação registrada
                          </p>
                        )}
                      </TabsContent>
                    </ScrollArea>
                  </Tabs>
                </div>

                {/* RIGHT: Action Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0 md:border-l md:border-border md:pl-4 md:ml-4 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 overflow-y-auto space-y-5">
                  {/* Current Status */}
                  <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status Atual
                    </h4>
                    <Badge className={`${STATUS_CONFIG[selectedApplication.status]?.bgColor} w-full justify-center py-1`}>
                      {STATUS_CONFIG[selectedApplication.status]?.label}
                    </Badge>
                  </div>

                  {/* Primary Actions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ações
                    </h4>

                    {/* PRD-077: Botão de contratar (apenas para status offer/aprovado) */}
                    {selectedApplication.status === 'offer' && (
                      <Button
                        onClick={() => {
                          if (duplicateCheck?.exists) {
                            setDuplicateWarningOpen(true);
                          } else {
                            setHiringModalOpen(true);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                        size="sm"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Contratar
                      </Button>
                    )}

                    {/* PRD-034: Botão de agendar entrevista */}
                    {selectedApplication.status !== 'rejected' && selectedApplication.status !== 'hired' && (
                      <Button
                        variant="outline"
                        onClick={() => setShowScheduleModal(true)}
                        className="w-full"
                        size="sm"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar Entrevista
                      </Button>
                    )}

                    {/* PRD-002-dgn: Botão de comparação */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedApplication) {
                          toggleCompareCandidate(selectedApplication.candidateId);
                        }
                      }}
                      disabled={!isSelectedForComparison(selectedApplication.candidateId) && !canSelect}
                      className="w-full"
                      size="sm"
                    >
                      {isSelectedForComparison(selectedApplication.candidateId)
                        ? 'Remover comparação'
                        : 'Comparar'}
                    </Button>
                  </div>

                  {/* Pipeline Movement */}
                  {selectedApplication.status !== 'rejected' && selectedApplication.status !== 'hired' && selectedApplication.status !== 'talent_pool' && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Mover para
                      </h4>
                      <Select
                        value=""
                        onValueChange={(status) =>
                          handleMove(
                            selectedApplication.id,
                            status as ApplicationStatus
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecionar etapa..." />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedApplication.status !== 'pending' && (
                            <SelectItem value="pending">Novos</SelectItem>
                          )}
                          {selectedApplication.status !== 'reviewing' && (
                            <SelectItem value="reviewing">Em Análise</SelectItem>
                          )}
                          {selectedApplication.status !== 'interview' && (
                            <SelectItem value="interview">Entrevista</SelectItem>
                          )}
                          {selectedApplication.status !== 'offer' && (
                            <SelectItem value="offer">Aprovado</SelectItem>
                          )}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="destructive"
                        onClick={() => setRejectDialogOpen(true)}
                        className="w-full"
                        size="sm"
                      >
                        Reprovar
                      </Button>
                    </div>
                  )}

                  {/* Quick Info */}
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Resumo
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experiência</span>
                      <span className="font-medium">{selectedCandidate.experience} anos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Skills</span>
                      <span className="font-medium">{selectedCandidate.skills.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teste</span>
                      <span className="font-medium">
                        {selectedCandidate.testResult || selectedCandidate.hasTest || gaugeResultsByCandidate.has(selectedCandidate.id)
                          ? 'Realizado'
                          : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprovar candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja reprovar{' '}
              {selectedCandidate ? getCandidateDisplayName(selectedCandidate) : 'este candidato'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo da reprovação (opcional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PRD-016: Test Request Modal */}
      <Dialog open={requestTestModalOpen} onOpenChange={setRequestTestModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Teste Comportamental</DialogTitle>
            <DialogDescription>
              Candidato: {selectedCandidate ? getCandidateDisplayName(selectedCandidate) : ''} | Vaga: {selectedApplication?.jobTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="testMessage">Mensagem para o candidato</Label>
              <Textarea
                id="testMessage"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                maxLength={500}
                className="resize-none"
                rows={5}
              />
              <p className="text-xs text-muted-foreground text-right">
                {testMessage.length}/500 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testDeadline">Prazo para realização</Label>
              <Select value={testDeadline} onValueChange={setTestDeadline}>
                <SelectTrigger id="testDeadline">
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  {DEADLINE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestTestModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestTest}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRD-002-dgn: Barra de seleção para comparação */}
      <SelectionBar
        selectedCandidates={selectedCandidatesForComparison}
        onRemove={(id) => toggleCompareCandidate(id)}
        onClear={clearSelection}
        onCompare={() => setShowComparisonModal(true)}
      />

      {/* PRD-002-dgn: Modal de comparação */}
      <CandidateComparisonModal
        open={showComparisonModal}
        onOpenChange={setShowComparisonModal}
        candidates={selectedCandidatesForComparison}
        onInviteToInterview={(candidateId) => {
          const candidate = candidatesMap[candidateId];
          if (candidate) {
            toast.success(`Candidato ${getCandidateDisplayName(candidate)} movido para Entrevista`);
            // Encontrar a candidatura e mover para entrevista
            const app = applications.find((a) => a.candidateId === candidateId);
            if (app) {
              handleMove(app.id, 'interview');
            }
          }
          setShowComparisonModal(false);
        }}
        onContactCandidate={(candidateId) => {
          toast.success('Redirecionando para mensagens...');
        }}
      />

      {/* PRD-032: Modal de exportação */}
      <ExportCandidatesModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        candidates={candidatesForExport}
        context={{
          source: 'job_applications',
          jobId: selectedJobId,
          jobTitle: selectedJob?.title,
          candidateCount: candidatesForExport.length,
          companyName: 'TechCorp Soluções',
        }}
        calculateMatch={(candidate) => calculateMatch(candidate.id)}
      />

      {/* PRD-034: Modal de agendamento de entrevista */}
      {selectedApplication && selectedCandidate && (
        <ScheduleInterviewModal
          open={showScheduleModal}
          onOpenChange={setShowScheduleModal}
          candidateId={selectedApplication.candidateId}
          candidateName={getCandidateDisplayName(selectedCandidate)}
          jobId={selectedApplication.jobId}
          jobTitle={selectedApplication.jobTitle}
          applicationId={selectedApplication.id}
          onSchedule={(data) => {
            createInterview(data);
            // Mover para status de entrevista automaticamente
            handleMove(selectedApplication.id, 'interview');
            toast.success('Entrevista agendada! O candidato foi notificado.');
            setDrawerOpen(false);
          }}
        />
      )}

      {/* PRD-077: Modal de contratacao */}
      {selectedApplication && selectedCandidate && (
        <HiringModal
          open={hiringModalOpen}
          onOpenChange={setHiringModalOpen}
          application={selectedApplication}
          candidateName={getCandidateDisplayName(selectedCandidate)}
          candidateAvatar={selectedCandidate.avatar}
          jobTitle={selectedApplication.jobTitle}
          matchScore={calculateMatch(selectedApplication.candidateId)}
          testStatus={selectedApplication.testStatus}
          candidateHasTest={selectedCandidate.hasTest}
          onHired={(result) => {
            setLastHireResult(result);
            setHiringModalOpen(false);
            setDrawerOpen(false);
            if (result.allPositionsFilled) {
              setJobClosureModalOpen(true);
            } else {
              const remaining = result.positionsCount - result.hiredCount;
              toast.info(`Vaga ainda possui ${remaining} posicao(oes) em aberto.`);
            }
          }}
        />
      )}

      {/* PRD-077: Modal de encerramento de vaga */}
      {lastHireResult && (
        <JobClosureModal
          open={jobClosureModalOpen}
          onOpenChange={setJobClosureModalOpen}
          jobId={lastHireResult.jobId}
          jobTitle={lastHireResult.jobTitle}
          hiredCount={lastHireResult.hiredCount}
          positionsCount={lastHireResult.positionsCount}
          onClosed={() => {
            setJobClosureModalOpen(false);
            setLastHireResult(null);
          }}
        />
      )}

      {/* PRD-077: Aviso de candidato ja e colaborador */}
      <AlertDialog open={duplicateWarningOpen} onOpenChange={setDuplicateWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Candidato ja e colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Este candidato ja faz parte da sua equipe
              {duplicateCheck?.hireDate ? ` desde ${duplicateCheck.hireDate}` : ''}.
              Deseja registrar nova contratacao mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDuplicateWarningOpen(false);
                setHiringModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Sim, contratar novamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

// Kanban Column Component
interface KanbanColumnProps {
  status: 'pending' | 'reviewing' | 'interview' | 'offer';
  applications: Application[];
  onCardClick: (app: Application) => void;
  onNavigateToProfile: (candidateId: string) => void;
}

function KanbanColumn({ status, applications, onCardClick, onNavigateToProfile }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl border p-4 transition-colors duration-200',
        config.bgColor,
        isOver && 'ring-2 ring-primary/50 bg-primary/5',
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
        <Badge variant="secondary">{applications.length}</Badge>
      </div>
      <SortableContext
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 min-h-[60px]">
          {applications.map((app, index) => (
            <SortableApplicationCard
              key={app.id}
              application={app}
              onManage={() => onCardClick(app)}
              onNavigate={() => onNavigateToProfile(app.candidateId)}
              index={index}
            />
          ))}
          {applications.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum candidato
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Sortable wrapper for ApplicationCard
function SortableApplicationCard({
  application,
  onManage,
  onNavigate,
  index,
}: {
  application: Application;
  onManage: () => void;
  onNavigate: () => void;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ApplicationCard
        application={application}
        onManage={onManage}
        onNavigate={onNavigate}
        index={index}
        isDragging={isDragging}
      />
    </div>
  );
}

// Application Card Component
interface ApplicationCardProps {
  application: Application;
  onManage: () => void;
  onNavigate: () => void;
  index?: number;
  compact?: boolean;
  isDragging?: boolean;
  isDragOverlay?: boolean;
}

function ApplicationCard({
  application,
  onManage,
  onNavigate,
  index = 0,
  compact = false,
  isDragging = false,
  isDragOverlay = false,
}: ApplicationCardProps) {
  const candidate = _candidatesMap[application.candidateId];
  const match = calculateMatch(application.candidateId);

  if (!candidate) return null;

  return (
    <motion.div
      initial={isDragOverlay ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      transition={{ delay: isDragOverlay ? 0 : index * 0.05 }}
      className={cn(
        'bg-card rounded-lg p-4 transition-shadow border',
        compact && 'min-w-[200px]',
        isDragging && 'border-dashed border-primary/50',
        isDragOverlay && 'shadow-xl ring-2 ring-primary/30 rotate-[2deg] scale-105',
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onNavigate}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={candidate.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getCandidateInitials(candidate)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate hover:text-primary transition-colors">{getCandidateDisplayName(candidate)}</p>
            <p className="text-sm text-muted-foreground truncate">
              {candidate.title}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Gerenciar candidatura"
          onClick={(e) => {
            e.stopPropagation();
            onManage();
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Badge
          variant="outline"
          className={`${getMatchScoreColor(match).text} ${getMatchScoreColor(match).border.replace('border-', 'border-')}`}
        >
          <Star className="w-3 h-3 mr-1" />
          {match}%
        </Badge>
        {candidate.testResult && (
          <Badge variant="secondary" className="text-xs">
            {candidate.testResult.result.profile.split(' ')[0]}
          </Badge>
        )}
        {/* PRD-016: Test status indicator (v1.14.3: voluntary vs requested) */}
        {application.testStatus === 'nao_solicitado' && candidate.hasTest ? (
          <Badge variant="outline" className="text-xs text-cyan-600 border-cyan-600/30">
            ✓ Gauge-Pro voluntário
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className={`text-xs ${TEST_STATUS_CONFIG[application.testStatus]?.color || ''}`}
          >
            {TEST_STATUS_CONFIG[application.testStatus]?.icon}{' '}
            {application.testStatus === 'realizado' ? 'Teste' : 'Teste: ' + (TEST_STATUS_CONFIG[application.testStatus]?.label || '')}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}
