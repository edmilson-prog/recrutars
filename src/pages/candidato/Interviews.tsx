/**
 * My Interviews Page
 * PRD-027: Agendamento de Entrevistas (Candidato)
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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InterviewCard } from '@/components/candidato/InterviewCard';
import { AcceptInterviewModal } from '@/components/candidato/AcceptInterviewModal';
import { SuggestAlternativeModal } from '@/components/candidato/SuggestAlternativeModal';
import { CancelInterviewModal } from '@/components/candidato/CancelInterviewModal';
import { MiniCalendar } from '@/components/candidato/MiniCalendar';
import { useInterviews } from '@/hooks/useInterviews';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Interview, CancellationReason } from '@/types/interview';

type TabValue = 'pending' | 'confirmed' | 'completed';

export default function CandidateInterviews() {
  const navigate = useNavigate();
  const { currentCandidate } = useAuth();
  const {
    pendingInterviews,
    confirmedInterviews,
    completedInterviews,
    pendingCount,
    acceptInterview,
    suggestAlternative,
    cancelInterview,
    interviewDates,
  } = useInterviews(currentCandidate?.id ?? '');

  const [activeTab, setActiveTab] = useState<TabValue>('pending');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Handlers
  const handleAccept = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowAcceptModal(true);
  };

  const handleSuggest = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowSuggestModal(true);
  };

  const handleCancel = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowCancelModal(true);
  };

  const handleAcceptConfirm = (slotIndex: number, message?: string) => {
    if (selectedInterview) {
      acceptInterview(selectedInterview.id, slotIndex, message);
      setShowAcceptModal(false);
      setSelectedInterview(null);
      toast.success('Entrevista confirmada com sucesso!');
      setActiveTab('confirmed');
    }
  };

  const handleSuggestConfirm = (slots: string[], reason?: string) => {
    if (selectedInterview) {
      suggestAlternative(selectedInterview.id, slots, reason);
      setShowSuggestModal(false);
      setSelectedInterview(null);
      toast.success('Sugestão enviada para a empresa!');
    }
  };

  const handleCancelConfirm = (reason: CancellationReason, details?: string) => {
    if (selectedInterview) {
      cancelInterview(selectedInterview.id, reason, details);
      setShowCancelModal(false);
      setSelectedInterview(null);
      toast.success('Entrevista cancelada');
      setActiveTab('completed');
    }
  };

  const handleViewApplication = (interview: Interview) => {
    navigate('/candidato/candidaturas');
  };

  const handleMessage = (interview: Interview) => {
    navigate('/candidato/mensagens');
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    // Se houver entrevistas confirmadas nessa data, muda para aba confirmadas
    const hasConfirmed = confirmedInterviews.some(i => {
      if (i.confirmedDatetime) {
        return i.confirmedDatetime.split('T')[0] === date.toISOString().split('T')[0];
      }
      return false;
    });
    if (hasConfirmed) {
      setActiveTab('confirmed');
    }
  };

  // Todas as entrevistas para o calendário
  const allInterviews = [...pendingInterviews, ...confirmedInterviews, ...completedInterviews];

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Minhas Entrevistas
            {pendingCount > 0 && (
              <Badge className="bg-yellow-500 text-white">{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Gerencie suas entrevistas agendadas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              <div className="bg-card rounded-xl p-3 sm:p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{pendingInterviews.length}</p>
              </div>
              <div className="bg-card rounded-xl p-3 sm:p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarCheck className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{confirmedInterviews.length}</p>
              </div>
              <div className="bg-card rounded-xl p-3 sm:p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarX className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-muted-foreground">Realizadas</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{completedInterviews.length}</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pending" className="relative">
                  Pendentes
                  {pendingInterviews.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                      {pendingInterviews.length}
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
                  {completedInterviews.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                      {completedInterviews.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Pendentes */}
              <TabsContent value="pending" className="space-y-4">
                {pendingInterviews.length === 0 ? (
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
                      Você não tem entrevistas aguardando resposta
                    </p>
                  </motion.div>
                ) : (
                  pendingInterviews.map((interview, index) => (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <InterviewCard
                        interview={interview}
                        onAccept={() => handleAccept(interview)}
                        onSuggest={() => handleSuggest(interview)}
                      />
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* Confirmadas */}
              <TabsContent value="confirmed" className="space-y-4">
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
                      Quando você confirmar um horário, a entrevista aparecerá aqui
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <Alert className="border-primary/30 bg-primary/5">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Dica</AlertTitle>
                      <AlertDescription>
                        Chegue 15 minutos antes para entrevistas presenciais e teste sua câmera e microfone para videochamadas.
                      </AlertDescription>
                    </Alert>
                    {confirmedInterviews.map((interview, index) => (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <InterviewCard
                          interview={interview}
                          onCancel={() => handleCancel(interview)}
                          onMessage={() => handleMessage(interview)}
                        />
                      </motion.div>
                    ))}
                  </>
                )}
              </TabsContent>

              {/* Realizadas */}
              <TabsContent value="completed" className="space-y-4">
                {completedInterviews.length === 0 ? (
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
                      Seu histórico de entrevistas aparecerá aqui
                    </p>
                  </motion.div>
                ) : (
                  completedInterviews.map((interview, index) => (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <InterviewCard
                        interview={interview}
                        onViewApplication={() => handleViewApplication(interview)}
                      />
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Mini Calendar */}
          <div className="hidden lg:block">
            <MiniCalendar
              interviews={allInterviews}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />

            {/* Interview Types Legend */}
            <div className="bg-card rounded-2xl p-4 shadow-soft mt-6">
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
        </div>
      </div>

      {/* Modals */}
      {selectedInterview && (
        <>
          <AcceptInterviewModal
            interview={selectedInterview}
            open={showAcceptModal}
            onOpenChange={setShowAcceptModal}
            onAccept={handleAcceptConfirm}
          />
          <SuggestAlternativeModal
            interview={selectedInterview}
            open={showSuggestModal}
            onOpenChange={setShowSuggestModal}
            onSuggest={handleSuggestConfirm}
          />
          <CancelInterviewModal
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
