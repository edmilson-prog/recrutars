/**
 * useInterviews hook
 * PRD-027: Agendamento de Entrevistas (Candidato)
 *
 * Delegates to useInterviewsQuery hooks (PRD-070 migration).
 */

import { useCallback, useMemo } from 'react';
import {
  useInterviewsByCandidate,
  useConfirmInterview,
  useUpdateInterview,
  useCancelInterview,
} from '@/hooks/useInterviewsQuery';
import type { Interview, CancellationReason } from '@/types/interview';

export function useInterviews(candidateId: string) {
  const {
    data: interviews = [],
    isLoading,
  } = useInterviewsByCandidate(candidateId);

  const confirmMutation = useConfirmInterview();
  const updateMutation = useUpdateInterview();
  const cancelMutation = useCancelInterview();

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
    _message?: string
  ) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (!interview?.proposedSlots?.[slotIndex]) return;
    const datetime = interview.proposedSlots[slotIndex].datetime;
    confirmMutation.mutate({ id: interviewId, datetime });
  }, [interviews, confirmMutation]);

  // Sugerir horários alternativos
  const suggestAlternative = useCallback((
    interviewId: string,
    slots: string[],
    reason?: string
  ) => {
    updateMutation.mutate({
      id: interviewId,
      updates: {
        status: 'pending_company',
        suggestedSlots: slots,
        suggestionReason: reason,
      } as Partial<Interview>,
    });
  }, [updateMutation]);

  // Cancelar entrevista
  const cancelInterview = useCallback((
    interviewId: string,
    reason: CancellationReason,
    details?: string
  ) => {
    cancelMutation.mutate({ id: interviewId, reason, details });
  }, [cancelMutation]);

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
    isLoading,
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
