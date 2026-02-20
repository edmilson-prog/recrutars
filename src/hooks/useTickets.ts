/**
 * useTickets Hook (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates to useTicketsQuery service hooks.
 * Preserves the same API: tickets list, create, add message, mark resolved.
 *
 * Data now flows through the service layer instead of importing mockTickets.
 */

import { useCallback, useMemo } from 'react';
import type { Ticket, TicketMessage, TicketCategory, TicketStatus } from '@/types/help';
import {
  useTickets as useTicketsQuery,
  useTicket,
  useCreateTicket,
  useSendTicketMessage,
  useUpdateTicketStatus,
} from './useTicketsQuery';

export function useTickets(userId: string) {
  const { data: tickets = [], isLoading: loading, error } = useTicketsQuery(userId);
  const createTicketMutation = useCreateTicket();
  const sendMessageMutation = useSendTicketMessage();
  const updateStatusMutation = useUpdateTicketStatus();

  // Criar novo ticket
  const createTicket = useCallback(
    async (
      category: TicketCategory,
      subject: string,
      description: string,
      attachment?: { url: string; name: string }
    ): Promise<Ticket> => {
      const result = await createTicketMutation.mutateAsync({
        userId,
        category,
        subject,
        content: description,
        attachmentUrl: attachment?.url,
        attachmentName: attachment?.name,
      });
      return result;
    },
    [userId, createTicketMutation]
  );

  // Adicionar mensagem ao ticket
  const addMessage = useCallback(
    (
      ticketId: string,
      content: string,
      attachment?: { url: string; name: string },
      _sender: 'user' | 'admin' | 'system' = 'user'
    ) => {
      sendMessageMutation.mutate({
        ticketId,
        content,
        attachmentUrl: attachment?.url,
        attachmentName: attachment?.name,
      });
    },
    [sendMessageMutation]
  );

  // Marcar ticket como resolvido
  const markAsResolved = useCallback((ticketId: string) => {
    updateStatusMutation.mutate({ id: ticketId, status: 'resolved' as TicketStatus });
  }, [updateStatusMutation]);

  // Obter ticket por ID
  const getTicketById = useCallback(
    (ticketId: string): Ticket | undefined => {
      return tickets.find((t) => t.id === ticketId);
    },
    [tickets]
  );

  // Filtrar tickets por status
  const getTicketsByStatus = useCallback(
    (status: TicketStatus | 'all'): Ticket[] => {
      if (status === 'all') {
        return tickets;
      }
      return tickets.filter((t) => t.status === status);
    },
    [tickets]
  );

  return {
    tickets,
    loading,
    createTicket,
    addMessage,
    markAsResolved,
    getTicketById,
    getTicketsByStatus,
    error,
  };
}
