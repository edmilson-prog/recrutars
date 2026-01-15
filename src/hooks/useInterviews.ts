/**
 * useInterviews hook
 * PRD-027: Agendamento de Entrevistas (Candidato)
 */

import { useState, useCallback, useMemo } from 'react';
import { mockInterviews } from '@/data/mockData';
import type { Interview, InterviewStatus, CancellationReason } from '@/types/interview';

export function useInterviews(candidateId: string) {
  const [interviews, setInterviews] = useState<Interview[]>(() =>
    mockInterviews.filter(interview => interview.candidateId === candidateId)
  );

  // Entrevistas por status
  const pendingInterviews = useMemo(() =>
    interviews.filter(i => i.status === 'pending_candidate' || i.status === 'pending_company'),
    [interviews]
  );

  const confirmedInterviews = useMemo(() =>
    interviews.filter(i => i.status === 'confirmed'),
    [interviews]
  );

  const completedInterviews = useMemo(() =>
    interviews.filter(i =>
      i.status === 'completed' ||
      i.status === 'cancelled_by_candidate' ||
      i.status === 'cancelled_by_company'
    ),
    [interviews]
  );

  // Contador de pendentes que requerem ação do candidato
  const pendingCount = useMemo(() =>
    interviews.filter(i => i.status === 'pending_candidate').length,
    [interviews]
  );

  // Aceitar um horário proposto
  const acceptInterview = useCallback((
    interviewId: string,
    slotIndex: number,
    message?: string
  ) => {
    setInterviews(prev =>
      prev.map(interview => {
        if (interview.id !== interviewId) return interview;
        if (!interview.proposedSlots?.[slotIndex]) return interview;

        const confirmedDatetime = interview.proposedSlots[slotIndex].datetime;

        return {
          ...interview,
          status: 'confirmed' as InterviewStatus,
          confirmedDatetime,
          confirmedAt: new Date().toISOString(),
          proposedSlots: interview.proposedSlots.map((slot, idx) => ({
            ...slot,
            selected: idx === slotIndex,
          })),
        };
      })
    );

    // Atualizar no mock também
    const idx = mockInterviews.findIndex(i => i.id === interviewId);
    if (idx !== -1 && mockInterviews[idx].proposedSlots?.[slotIndex]) {
      mockInterviews[idx].status = 'confirmed';
      mockInterviews[idx].confirmedDatetime = mockInterviews[idx].proposedSlots![slotIndex].datetime;
      mockInterviews[idx].confirmedAt = new Date().toISOString();
    }

    // TODO: Em produção, enviar notificação para empresa
    console.log('Entrevista aceita:', { interviewId, slotIndex, message });
  }, []);

  // Sugerir horários alternativos
  const suggestAlternative = useCallback((
    interviewId: string,
    slots: string[],
    reason?: string
  ) => {
    setInterviews(prev =>
      prev.map(interview => {
        if (interview.id !== interviewId) return interview;

        return {
          ...interview,
          status: 'pending_company' as InterviewStatus,
          suggestedSlots: slots,
          suggestionReason: reason,
        };
      })
    );

    // Atualizar no mock também
    const idx = mockInterviews.findIndex(i => i.id === interviewId);
    if (idx !== -1) {
      mockInterviews[idx].status = 'pending_company';
      mockInterviews[idx].suggestedSlots = slots;
      mockInterviews[idx].suggestionReason = reason;
    }

    // TODO: Em produção, enviar notificação para empresa
    console.log('Sugestão enviada:', { interviewId, slots, reason });
  }, []);

  // Cancelar entrevista
  const cancelInterview = useCallback((
    interviewId: string,
    reason: CancellationReason,
    details?: string
  ) => {
    setInterviews(prev =>
      prev.map(interview => {
        if (interview.id !== interviewId) return interview;

        return {
          ...interview,
          status: 'cancelled_by_candidate' as InterviewStatus,
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason,
          cancellationDetails: details,
        };
      })
    );

    // Atualizar no mock também
    const idx = mockInterviews.findIndex(i => i.id === interviewId);
    if (idx !== -1) {
      mockInterviews[idx].status = 'cancelled_by_candidate';
      mockInterviews[idx].cancelledAt = new Date().toISOString();
      mockInterviews[idx].cancellationReason = reason;
      mockInterviews[idx].cancellationDetails = details;
    }

    // TODO: Em produção, enviar notificação para empresa
    console.log('Entrevista cancelada:', { interviewId, reason, details });
  }, []);

  // Buscar entrevista por ID
  const getInterview = useCallback((interviewId: string) => {
    return interviews.find(i => i.id === interviewId);
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

  // Datas que têm entrevistas (para indicadores no calendário)
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
    pendingInterviews,
    confirmedInterviews,
    completedInterviews,
    pendingCount,
    acceptInterview,
    suggestAlternative,
    cancelInterview,
    getInterview,
    getInterviewsByDate,
    interviewDates,
  };
}
