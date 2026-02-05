/**
 * useCompanyInterviews hook
 * PRD-034: Agendamento de Entrevistas (Empresa)
 *
 * Delegates to useInterviewsQuery hooks (PRD-070 migration).
 */

import { useCallback, useMemo } from 'react';
import {
  useInterviewsByCompany,
  useCreateInterview,
  useConfirmInterview,
  useUpdateInterview,
  useCancelInterview,
} from '@/hooks/useInterviewsQuery';
import type { Interview, InterviewType, ProposedSlot } from '@/types/interview';

export interface CreateInterviewData {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  title: string;
  type: InterviewType;
  proposedSlots: ProposedSlot[];
  duration: number;
  responseDeadline?: string;
  videoLink?: string;
  phoneNumber?: string;
  address?: string;
  mapLink?: string;
  interviewerName?: string;
  interviewerRole?: string;
  notes?: string;
}

// Motivos de cancelamento da empresa
export type CompanyCancellationReason =
  | 'position_filled'
  | 'candidate_withdrew'
  | 'schedule_conflict'
  | 'internal_changes'
  | 'other';

export const companyCancellationReasonLabels: Record<CompanyCancellationReason, string> = {
  position_filled: 'Vaga preenchida',
  candidate_withdrew: 'Candidato desistiu',
  schedule_conflict: 'Conflito de agenda',
  internal_changes: 'Mudanças internas',
  other: 'Outro motivo',
};

export function useCompanyInterviews(companyId: string) {
  const {
    data: interviews = [],
    isLoading,
  } = useInterviewsByCompany(companyId);

  const createMutation = useCreateInterview();
  const confirmMutation = useConfirmInterview();
  const updateMutation = useUpdateInterview();
  const cancelMutation = useCancelInterview();

  // Entrevistas aguardando resposta do candidato
  const pendingCandidateInterviews = useMemo(() =>
    interviews.filter(i => i.status === 'pending_candidate'),
    [interviews]
  );

  // Entrevistas com sugestões do candidato (aguardando empresa aceitar)
  const pendingCompanyInterviews = useMemo(() =>
    interviews.filter(i => i.status === 'pending_company'),
    [interviews]
  );

  // Todas as pendentes (aguardando resposta de ambos os lados)
  const waitingInterviews = useMemo(() =>
    interviews.filter(i => i.status === 'pending_candidate' || i.status === 'pending_company'),
    [interviews]
  );

  // Entrevistas confirmadas
  const confirmedInterviews = useMemo(() =>
    interviews.filter(i => i.status === 'confirmed'),
    [interviews]
  );

  // Entrevistas finalizadas (realizadas ou canceladas)
  const completedInterviews = useMemo(() =>
    interviews.filter(i =>
      i.status === 'completed' ||
      i.status === 'cancelled_by_candidate' ||
      i.status === 'cancelled_by_company'
    ),
    [interviews]
  );

  // Contador de entrevistas que requerem ação da empresa
  const pendingCount = useMemo(() =>
    interviews.filter(i => i.status === 'pending_company').length,
    [interviews]
  );

  // Criar nova entrevista (propor horários)
  const createInterview = useCallback((data: CreateInterviewData) => {
    const newData: Partial<Interview> = {
      applicationId: data.applicationId,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      companyId,
      candidateId: data.candidateId,
      title: data.title,
      type: data.type,
      status: 'pending_candidate',
      proposedSlots: data.proposedSlots,
      duration: data.duration,
      videoLink: data.videoLink,
      phoneNumber: data.phoneNumber,
      address: data.address,
      mapLink: data.mapLink,
      interviewerName: data.interviewerName,
      interviewerRole: data.interviewerRole,
      notes: data.notes,
      responseDeadline: data.responseDeadline,
    };

    createMutation.mutate(newData);

    // Return optimistic result for immediate UI feedback
    return { ...newData, id: `interview-${Date.now()}`, createdAt: new Date().toISOString() } as Interview;
  }, [companyId, createMutation]);

  // Aceitar sugestão de horário do candidato
  const acceptSuggestedSlot = useCallback((
    interviewId: string,
    slotIndex: number
  ) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (!interview?.suggestedSlots?.[slotIndex]) return;
    const datetime = interview.suggestedSlots[slotIndex];
    confirmMutation.mutate({ id: interviewId, datetime });
  }, [interviews, confirmMutation]);

  // Propor novos horários (quando candidato sugere e empresa não aceita)
  const proposeNewSlots = useCallback((
    interviewId: string,
    newSlots: ProposedSlot[],
    newDeadline?: string
  ) => {
    updateMutation.mutate({
      id: interviewId,
      updates: {
        status: 'pending_candidate',
        proposedSlots: newSlots,
        suggestedSlots: undefined,
        suggestionReason: undefined,
        responseDeadline: newDeadline,
      } as Partial<Interview>,
    });
  }, [updateMutation]);

  // Cancelar entrevista
  const cancelInterview = useCallback((
    interviewId: string,
    reason: CompanyCancellationReason,
    details?: string
  ) => {
    cancelMutation.mutate({ id: interviewId, reason, details });
  }, [cancelMutation]);

  // Marcar entrevista como realizada
  const markAsCompleted = useCallback((interviewId: string) => {
    updateMutation.mutate({
      id: interviewId,
      updates: {
        status: 'completed',
        completedAt: new Date().toISOString(),
      } as Partial<Interview>,
    });
  }, [updateMutation]);

  // Buscar entrevista por ID
  const getInterview = useCallback((interviewId: string) => {
    return interviews.find(i => i.id === interviewId);
  }, [interviews]);

  // Entrevistas por vaga
  const getInterviewsByJob = useCallback((jobId: string) => {
    return interviews.filter(i => i.jobId === jobId);
  }, [interviews]);

  // Entrevistas em um dia específico (para calendário)
  const getInterviewsByDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return interviews.filter(i => {
      if (i.confirmedDatetime) {
        return i.confirmedDatetime.startsWith(dateStr);
      }
      return false;
    });
  }, [interviews]);

  // Entrevistas em uma semana específica (para calendário semanal)
  const getInterviewsByWeek = useCallback((weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return confirmedInterviews.filter(i => {
      if (i.confirmedDatetime) {
        const interviewDate = new Date(i.confirmedDatetime);
        return interviewDate >= weekStart && interviewDate < weekEnd;
      }
      return false;
    });
  }, [confirmedInterviews]);

  // Datas que têm entrevistas confirmadas (para indicadores no calendário)
  const interviewDates = useMemo(() => {
    const dates = new Set<string>();
    interviews.forEach(interview => {
      if (interview.confirmedDatetime) {
        dates.add(interview.confirmedDatetime.split('T')[0]);
      }
      interview.proposedSlots?.forEach(slot => {
        dates.add(slot.datetime.split('T')[0]);
      });
    });
    return Array.from(dates);
  }, [interviews]);

  return {
    interviews,
    isLoading,
    pendingCandidateInterviews,
    pendingCompanyInterviews,
    waitingInterviews,
    confirmedInterviews,
    completedInterviews,
    pendingCount,
    createInterview,
    acceptSuggestedSlot,
    proposeNewSlots,
    cancelInterview,
    markAsCompleted,
    getInterview,
    getInterviewsByJob,
    getInterviewsByDate,
    getInterviewsByWeek,
    interviewDates,
  };
}
