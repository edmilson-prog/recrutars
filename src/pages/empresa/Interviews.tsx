/**
 * Company Interviews Page
 * PRD-034: Agendamento de Entrevistas (Empresa)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  CalendarCheck,
  CalendarX,
  Info,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CompanyInterviewCard } from '@/components/empresa/CompanyInterviewCard';
import { AcceptSuggestionModal } from '@/components/empresa/AcceptSuggestionModal';
import { CompanyCancelInterviewModal } from '@/components/empresa/CompanyCancelInterviewModal';
import { WeeklyCalendar } from '@/components/empresa/WeeklyCalendar';
import { useCompanyInterviews, type CompanyCancellationReason } from '@/hooks/useCompanyInterviews';
import { mockJobs, mockCandidates } from '@/data/mockData';
import { toast } from 'sonner';
import type { Interview } from '@/types/interview';

type TabValue = 'pending' | 'confirmed' | 'completed';

export default function CompanyInterviews() {
  const navigate = useNavigate();
  const {
    waitingInterviews,
    pendingCompanyInterviews,
    confirmedInterviews,
    completedInterviews,
    pendingCount,
    acceptSuggestedSlot,
    cancelInterview,
    markAsCompleted,
    getInterviewsByJob,
  } = useCompanyInterviews('company-1');

  const [activeTab, setActiveTab] = useState<TabValue>('pending');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [jobFilter, setJobFilter] = useState<string>('all');

  // Vagas da empresa para filtro
  const companyJobs = mockJobs.filter(
    (job) => job.companyId === 'company-1' && (job.status === 'active' || job.status === 'paused')
  );

  // Filtrar entrevistas por vaga na aba de realizadas
  const filteredCompletedInterviews = jobFilter === 'all'
    ? completedInterviews
    : completedInterviews.filter((i) => i.jobId === jobFilter);

  // Handlers
  const handleAcceptSuggestion = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowAcceptModal(true);
  };

  const handleProposeNew = (interview: Interview) => {
    // TODO: Abrir modal para propor novos horarios
    toast.info('Funcionalidade em desenvolvimento');
  };

  const handleCancel = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowCancelModal(true);
  };

  const handleMessage = (interview: Interview) => {
    navigate('/empresa/mensagens');
  };

  const handleMarkCompleted = (interview: Interview) => {
    markAsCompleted(interview.id);
    toast.success('Entrevista marcada como realizada');
  };

  const handleViewCandidate = (interview: Interview) => {
    navigate(`/empresa/candidatos/${interview.candidateId}`);
  };

  const handleRemind = (interview: Interview) => {
    toast.success('Lembrete enviado ao candidato');
  };

  const handleAcceptConfirm = (slotIndex: number) => {
    if (selectedInterview) {
      acceptSuggestedSlot(selectedInterview.id, slotIndex);
      setShowAcceptModal(false);
      setSelectedInterview(null);
      toast.success('Horario confirmado com sucesso!');
      setActiveTab('confirmed');
    }
  };

  const handleCancelConfirm = (reason: CompanyCancellationReason, details?: string) => {
    if (selectedInterview) {
      cancelInterview(selectedInterview.id, reason, details);
      setShowCancelModal(false);
      setSelectedInterview(null);
      toast.success('Entrevista cancelada');
      setActiveTab('completed');
    }
  };

  const handleCalendarInterviewClick = (interview: Interview) => {
    // Rolar para o card da entrevista ou abrir detalhes
    toast.info(`${interview.title} - ${interview.jobTitle}`);
  };

  // Helper para obter avatar do candidato
  const getCandidateAvatar = (candidateId: string) => {
    const candidate = mockCandidates.find((c) => c.id === candidateId);
    return candidate?.avatar;
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Entrevistas
            {pendingCount > 0 && (
              <Badge className="bg-yellow-500 text-white">
                {pendingCount} aguardando acao
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Gerencie as entrevistas com candidatos
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Aguardando Candidato</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {waitingInterviews.filter((i) => i.status === 'pending_candidate').length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Sugestoes Pendentes</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{pendingCompanyInterviews.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Confirmadas</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{confirmedInterviews.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-1">
              <CalendarX className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-muted-foreground">Realizadas</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{completedInterviews.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="pending" className="relative">
              Aguardando
              {waitingInterviews.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                  {waitingInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmadas
              {confirmedInterviews.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                  {confirmedInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Realizadas
            </TabsTrigger>
          </TabsList>

          {/* Aguardando Resposta */}
          <TabsContent value="pending" className="space-y-6">
            {pendingCompanyInterviews.length > 0 && (
              <Alert className="border-yellow-500/30 bg-yellow-500/5">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertTitle>Atencao</AlertTitle>
                <AlertDescription>
                  Voce tem {pendingCompanyInterviews.length} entrevista(s) com sugestoes de
                  horario do candidato aguardando sua confirmacao.
                </AlertDescription>
              </Alert>
            )}

            {waitingInterviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-card rounded-2xl shadow-soft"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma entrevista pendente
                </h3>
                <p className="text-muted-foreground">
                  Todas as entrevistas estao confirmadas ou finalizadas
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Candidato sugeriu horarios - requer acao */}
                {pendingCompanyInterviews.map((interview, index) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CompanyInterviewCard
                      interview={interview}
                      candidateAvatar={getCandidateAvatar(interview.candidateId)}
                      onAcceptSuggestion={() => handleAcceptSuggestion(interview)}
                      onProposeNew={() => handleProposeNew(interview)}
                      onCancel={() => handleCancel(interview)}
                    />
                  </motion.div>
                ))}
                {/* Aguardando resposta do candidato */}
                {waitingInterviews
                  .filter((i) => i.status === 'pending_candidate')
                  .map((interview, index) => (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (pendingCompanyInterviews.length + index) * 0.05 }}
                    >
                      <CompanyInterviewCard
                        interview={interview}
                        candidateAvatar={getCandidateAvatar(interview.candidateId)}
                        onRemind={() => handleRemind(interview)}
                        onCancel={() => handleCancel(interview)}
                      />
                    </motion.div>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Confirmadas */}
          <TabsContent value="confirmed" className="space-y-6">
            {confirmedInterviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-card rounded-2xl shadow-soft"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <CalendarCheck className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma entrevista confirmada
                </h3>
                <p className="text-muted-foreground">
                  Quando voce ou o candidato confirmar um horario, a entrevista aparecera aqui
                </p>
              </motion.div>
            ) : (
              <>
                {/* Calendario Semanal */}
                <WeeklyCalendar
                  interviews={confirmedInterviews}
                  currentWeek={currentWeek}
                  onWeekChange={setCurrentWeek}
                  onInterviewClick={handleCalendarInterviewClick}
                />

                {/* Lista de Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {confirmedInterviews.map((interview, index) => (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CompanyInterviewCard
                        interview={interview}
                        candidateAvatar={getCandidateAvatar(interview.candidateId)}
                        onMessage={() => handleMessage(interview)}
                        onMarkCompleted={() => handleMarkCompleted(interview)}
                        onCancel={() => handleCancel(interview)}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Realizadas */}
          <TabsContent value="completed" className="space-y-6">
            {/* Filtro por vaga */}
            {completedInterviews.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Filtrar por vaga:</span>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Todas as vagas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as vagas</SelectItem>
                    {companyJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filteredCompletedInterviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-card rounded-2xl shadow-soft"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <CalendarX className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma entrevista realizada
                </h3>
                <p className="text-muted-foreground">
                  Seu historico de entrevistas aparecera aqui
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCompletedInterviews.map((interview, index) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CompanyInterviewCard
                      interview={interview}
                      candidateAvatar={getCandidateAvatar(interview.candidateId)}
                      onViewCandidate={() => handleViewCandidate(interview)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - Tipos de Entrevista (visivel apenas em desktop) */}
      <div className="hidden xl:block fixed right-8 top-32 w-64">
        <div className="bg-card rounded-2xl p-4 shadow-soft">
          <h4 className="font-semibold mb-3">Tipos de Entrevista</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Videochamada</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Telefone</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Presencial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedInterview && (
        <>
          <AcceptSuggestionModal
            interview={selectedInterview}
            open={showAcceptModal}
            onOpenChange={setShowAcceptModal}
            onAccept={handleAcceptConfirm}
          />
          <CompanyCancelInterviewModal
            interview={selectedInterview}
            open={showCancelModal}
            onOpenChange={setShowCancelModal}
            onCancel={handleCancelConfirm}
          />
        </>
      )}
    </DashboardLayout>
  );
}
