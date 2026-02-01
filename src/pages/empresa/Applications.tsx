/**
 * Applications Page - Application Pipeline (Kanban)
 * PRD-015: Gestão de Candidaturas
 * PRD-016: Envio de Testes
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
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
import {
  mockJobs,
  mockApplications,
  mockCandidates,
  mockApplicationNotes,
  mockApplicationHistory,
  mockMessages,
  mockConversations,
  getCandidateBehavioralProfile,
  getIdealBehavioralProfile,
} from '@/data/mockData';
import type { Application, ApplicationStatus, ApplicationNote, ApplicationHistory, TestRequestStatus, Message } from '@/types';
import type { CandidateForComparison } from '@/types/disc';
import { toast } from 'sonner';
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
// selectedJobId é usado para determinar qual vaga usar no cálculo
let currentSelectedJobId = '';
const calculateMatch = (candidateId: string): number => {
  const candidate = mockCandidates.find((c) => c.id === candidateId);
  if (!candidate) return 0;

  // Usa a vaga selecionada atualmente ou a primeira vaga da empresa
  const job = mockJobs.find((j) => j.id === currentSelectedJobId) ||
    mockJobs.find((j) => j.companyId === 'company-1' && j.status === 'active');
  if (!job) return 0;

  const idealProfile = getIdealBehavioralProfile(job.id);
  const matchResult = calculateMatchBreakdown(candidate, job, idealProfile);
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
  // State
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectedOpen, setRejectedOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // PRD-016: Test request modal state
  const [requestTestModalOpen, setRequestTestModalOpen] = useState(false);
  const [testMessage, setTestMessage] = useState(DEFAULT_TEST_MESSAGE);
  const [testDeadline, setTestDeadline] = useState('7');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  // Filters
  const [matchFilter, setMatchFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [testFilter, setTestFilter] = useState<string>('all');

  // Local state for applications (to allow status changes)
  const [applications, setApplications] = useState<Application[]>(mockApplications);

  // Notes state (local)
  const [notes, setNotes] = useState<ApplicationNote[]>(mockApplicationNotes);
  const [newNote, setNewNote] = useState('');

  // History state (local)
  const [history, setHistory] = useState<ApplicationHistory[]>(mockApplicationHistory);

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
  const { createInterview } = useCompanyInterviews('company-1');

  // Get company jobs (mock: company-1)
  const companyJobs = mockJobs.filter(
    (job) =>
      job.companyId === 'company-1' &&
      (job.status === 'active' || job.status === 'paused')
  );

  // Set default job on load
  useEffect(() => {
    if (companyJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(companyJobs[0].id);
    }
  }, [companyJobs, selectedJobId]);

  // PRD-035: Atualiza o jobId global para cálculo de match
  useEffect(() => {
    currentSelectedJobId = selectedJobId;
  }, [selectedJobId]);

  // Filter applications for selected job
  const jobApplications = applications.filter(
    (app) => app.jobId === selectedJobId
  );

  // Apply filters
  const filteredApplications = jobApplications.filter((app) => {
    const candidate = mockCandidates.find((c) => c.id === app.candidateId);
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
  };

  // PRD-032: Candidatos para exportação
  const candidatesForExport: Candidate[] = filteredApplications
    .map((app) => mockCandidates.find((c) => c.id === app.candidateId))
    .filter((c): c is Candidate => c !== undefined);

  const handleCardClick = (app: Application) => {
    setSelectedApplication(app);
    setDrawerOpen(true);
  };

  const handleMove = (applicationId: string, newStatus: ApplicationStatus) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    const oldStatus = app.status;

    // Update application
    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? { ...a, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : a
      )
    );

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
    setHistory((prev) => [...prev, newHistoryEntry]);

    toast.success(
      `Candidato movido para ${STATUS_CONFIG[newStatus]?.label || newStatus}`
    );
  };

  const handleReject = () => {
    if (!selectedApplication) return;

    const oldStatus = selectedApplication.status;

    // Update application
    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApplication.id
          ? { ...a, status: 'rejected' as ApplicationStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : a
      )
    );

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
    setHistory((prev) => [...prev, newHistoryEntry]);

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
    setNotes((prev) => [...prev, newNoteEntry]);
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

    // Update application testStatus
    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApplication.id
          ? {
              ...a,
              testStatus: 'solicitado' as TestRequestStatus,
              testRequestedAt: new Date().toISOString(),
              testDeadline: deadlineDate,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );

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

    // Find or create conversation
    let conversation = mockConversations.find(
      (c) => c.candidateId === selectedApplication.candidateId && c.jobId === selectedApplication.jobId
    );

    const conversationId = conversation?.id || `conv-${Date.now()}`;

    // Create test request message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'company-1',
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
    ? mockCandidates.find((c) => c.id === selectedApplication.candidateId)
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

  // PRD-002-dgn: Converter candidato para formato de comparação
  const convertToComparisonCandidate = (candidateId: string): CandidateForComparison | null => {
    const candidate = mockCandidates.find((c) => c.id === candidateId);
    if (!candidate) return null;

    const behavioralProfile = getCandidateBehavioralProfile(candidateId);
    if (!behavioralProfile) return null;

    // PRD-035: Usa cálculo dinâmico de match
    const matchScore = calculateMatch(candidateId);

    return {
      id: candidate.id,
      name: candidate.name,
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidaturas</h1>
          <p className="text-muted-foreground">
            Gerencie as candidaturas das suas vagas
          </p>
        </div>

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
                    {job.title} ({job.applicationsCount} candidaturas)
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

        {/* Kanban Board */}
        {selectedJobId ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
              {(['pending', 'reviewing', 'interview', 'offer'] as const).map(
                (status) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    applications={groupedApplications[status]}
                    onCardClick={handleCardClick}
                  />
                )
              )}
            </div>

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
                        onClick={() => handleCardClick(app)}
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
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedApplication && selectedCandidate && (
            <>
              {/* Header */}
              <SheetHeader className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedCandidate.avatar} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {selectedCandidate.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">
                      {selectedCandidate.name}
                    </SheetTitle>
                    <p className="text-muted-foreground">
                      {selectedCandidate.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Candidatura: {selectedApplication.appliedAt}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
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
                      Sem teste comportamental
                    </Badge>
                  )}
                  <Badge
                    className={STATUS_CONFIG[selectedApplication.status]?.bgColor}
                  >
                    {STATUS_CONFIG[selectedApplication.status]?.label}
                  </Badge>
                </div>
              </SheetHeader>

              {/* Tabs */}
              <Tabs defaultValue="perfil" className="mt-6">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="perfil">Perfil</TabsTrigger>
                  <TabsTrigger value="experiencia">Exp.</TabsTrigger>
                  <TabsTrigger value="teste">Teste</TabsTrigger>
                  <TabsTrigger value="mensagem">Msg</TabsTrigger>
                  <TabsTrigger value="historico">Hist.</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[300px] mt-4">
                  <TabsContent value="perfil" className="space-y-4 mt-0">
                    <div>
                      <h4 className="font-medium mb-2">Localização</h4>
                      <p className="text-muted-foreground">
                        {selectedCandidate.location}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Experiência</h4>
                      <p className="text-muted-foreground">
                        {selectedCandidate.experience} anos
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Formação</h4>
                      <p className="text-muted-foreground">
                        {selectedCandidate.education}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Disponibilidade</h4>
                      <p className="text-muted-foreground">
                        {selectedCandidate.availability}
                      </p>
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
                                  {new Date(entry.changedAt).toLocaleString(
                                    'pt-BR'
                                  )}
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
                </ScrollArea>
              </Tabs>

              {/* Notes Section */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-3">Anotações Internas</h4>
                <div className="flex gap-2 mb-4">
                  <Textarea
                    placeholder="Adicionar anotação..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    Adicionar
                  </Button>
                </div>
                {currentNotes.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
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
                              {new Date(note.createdAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </span>
                          </div>
                          <p>{note.content}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
                {/* PRD-034: Botão de agendar entrevista */}
                {selectedApplication.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full sm:w-auto"
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
                  className="w-full sm:w-auto"
                >
                  {isSelectedForComparison(selectedApplication.candidateId)
                    ? 'Remover da comparação'
                    : 'Adicionar à comparação'}
                </Button>

                {selectedApplication.status !== 'rejected' && (
                  <>
                    <Select
                      value=""
                      onValueChange={(status) =>
                        handleMove(
                          selectedApplication.id,
                          status as ApplicationStatus
                        )
                      }
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Mover para..." />
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
                    >
                      Reprovar
                    </Button>
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprovar candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja reprovar{' '}
              {selectedCandidate?.name || 'este candidato'}?
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
              Candidato: {selectedCandidate?.name} | Vaga: {selectedApplication?.jobTitle}
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
          const candidate = mockCandidates.find((c) => c.id === candidateId);
          if (candidate) {
            toast.success(`Candidato ${candidate.name} movido para Entrevista`);
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
          candidateName={selectedCandidate.name}
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
    </DashboardLayout>
  );
}

// Kanban Column Component
interface KanbanColumnProps {
  status: 'pending' | 'reviewing' | 'interview' | 'offer';
  applications: Application[];
  onCardClick: (app: Application) => void;
}

function KanbanColumn({ status, applications, onCardClick }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`rounded-xl border p-4 ${config.bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
        <Badge variant="secondary">{applications.length}</Badge>
      </div>
      <div className="space-y-3">
        {applications.map((app, index) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onClick={() => onCardClick(app)}
            index={index}
          />
        ))}
        {applications.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum candidato
          </p>
        )}
      </div>
    </div>
  );
}

// Application Card Component
interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
  index?: number;
  compact?: boolean;
}

function ApplicationCard({
  application,
  onClick,
  index = 0,
  compact = false,
}: ApplicationCardProps) {
  const candidate = mockCandidates.find(
    (c) => c.id === application.candidateId
  );
  const match = calculateMatch(application.candidateId);

  if (!candidate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-card rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow border ${
        compact ? 'min-w-[200px]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={candidate.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {candidate.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{candidate.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {candidate.title}
          </p>
        </div>
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
        {/* PRD-016: Test status indicator */}
        <Badge
          variant="outline"
          className={`text-xs ${TEST_STATUS_CONFIG[application.testStatus]?.color || ''}`}
        >
          {TEST_STATUS_CONFIG[application.testStatus]?.icon}{' '}
          {application.testStatus === 'realizado' ? 'Teste' : 'Teste: ' + (TEST_STATUS_CONFIG[application.testStatus]?.label || '')}
        </Badge>
      </div>
    </motion.div>
  );
}
