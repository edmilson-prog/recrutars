/**
 * useCompanyInterviews hook
 * PRD-034: Agendamento de Entrevistas (Empresa)
 */

import { useState, useCallback, useMemo } from 'react';
import { mockInterviews } from '@/data/mockData';
import type { Interview, InterviewStatus, InterviewType, ProposedSlot } from '@/types/interview';

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
  const [interviews, setInterviews] = useState<Interview[]>(() =>
    mockInterviews.filter(interview => interview.companyId === companyId)
  );

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
    const newInterview: Interview = {
      id: `interview-${Date.now()}`,
      applicationId: data.applicationId,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      companyId,
      companyName: 'Tech Solutions', // TODO: Obter do contexto
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
      createdAt: new Date().toISOString(),
    };

    setInterviews(prev => [...prev, newInterview]);

    // Adicionar ao mock também
    mockInterviews.push(newInterview);

    console.log('Entrevista criada:', newInterview);

    return newInterview;
  }, [companyId]);

  // Aceitar sugestão de horário do candidato
  const acceptSuggestedSlot = useCallback((
    interviewId: string,
    slotIndex: number
  ) => {
    setInterviews(prev =>
      prev.map(interview => {
        if (interview.id !== interviewId) return interview;
        if (!interview.suggestedSlots?.[slotIndex]) return interview;

        const confirmedDatetime = interview.suggestedSlots[slotIndex];

        return {
          ...interview,
          status: 'confirmed' as InterviewStatus,
          confirmedDatetime,
          confirmedAt: new Date().toISOString(),
        };
      })
    );

    // Atualizar no mock também
    const idx = mockInterviews.findIndex(i => i.id === interviewId);
    if (idx !== -1 && mockInterviews[idx].suggestedSlots?.[slotIndex]) {
      mockInterviews[idx].status = 'confirmed';
      mockInterviews[idx].confirmedDatetime = mockInterviews[idx].suggestedSlots![slotIndex];
      mockInterviews[idx].confirmedAt = new Date().toISOString();
    }

    console.log('Sugestão aceita:', { interviewId, slotIndex });
  }, []);

  // Propor novos horários (quando candidato sugere e empresa não aceita)
  const proposeNewSlots = useCallback((
    interviewId: string,
    newSlots: ProposedSlot[],
    newDeadline?: string
  ) => {
    setInterviews(prev =>
      prev.map(interview => {
        if (interview.id !== interviewId) return interview;

        return {
          ...interview,
          status: 'pending_candidate' as InterviewStatus,
          proposedSlots: newSlots,
          suggestedSlots: undefined,
          suggestionReason: undefined,
          responseDeadline: newDeadline,
        };
      })
    );

    // Atualizar no mock também
    const idx = mockInterviews.findIndex(i => i.id === interviewId);
    if (idx !== -1) {
      mockInterviews[idx].status = 'pending_candidate';
      mockInterviews[idx].proposedSlots = newSlots;
      mockInterviews[idx].suggestedSlots = undefined;
      mockInterviews[idx].suggestionReason = undefined;
      mockInterviews[idx].responseDeadline = newDeadline;
    }

    console.log('Novos horários propostos:', { interviewId, newSlots });
  }, []);

  // Cancelar entrevista
  const cancelInterview = useCallback((
    interviewId: string,
    reason: CompanyCancellationReason,
    details?: string
  ) => {
    setInterviews(prev =>
      prev.map(interview => {
        if (interview.id !== interviewId) return interview;

        return {
          ...interview,
          status: 'cancelled_by_company' as InterviewStatus,
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason,
          cancellationDetails: details,
        };
      })
    );

    // Atualizar no mock também
    const idx = mockInterviews.findIndex(i => i.id === interviewId);
    if (idx !== -1) {
      mockInterviews[idx].status = 'cancelled_by_company';
      mockInterviews[idx].cancelledAt = new Date().toISOString();
      mockInterviews[idx].cancellationReason = reason;
      mockInterviews[idx].cancellationDetails = details;
    }

    console.log('Entrevista cancelada:', { interviewId, reason, details });
  }, []);

  // Marcar entrevista como realizada
  const markAsCompleted = useCallback((interviewId: string) => {
    setInterviews(prev =>
      prev.map(interview => {
        if (interview.id !== interviewId) return interview;

        return {
          ...interview,
          status: 'completed' as InterviewStatus,
          completedAt: new Date().toISOString(),
        };
      })
    );

    // Atualizar no mock também
    const idx = mockInterviews.findIndex(i => i.id === interviewId);
    if (idx !== -1) {
      mockInterviews[idx].status = 'completed';
      mockInterviews[idx].completedAt = new Date().toISOString();
    }

    console.log('Entrevista marcada como realizada:', interviewId);
  }, []);

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
