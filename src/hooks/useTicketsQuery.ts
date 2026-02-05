/**
 * Tickets Query Hooks
 * PRD-067: Service Layer — Specialized Modules
 *
 * React Query hooks for support tickets.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TicketStatus } from '@/types/help';
import {
  getTicketsService,
  type CreateTicketData,
} from '@/services/tickets/ticketsService';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  all: ['tickets'] as const,
  list: (userId?: string) => ['tickets', 'list', userId] as const,
  detail: (id: string) => ['tickets', 'detail', id] as const,
  messages: (ticketId: string) => ['tickets', 'messages', ticketId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch tickets, optionally filtered by userId */
export function useTickets(userId?: string) {
  return useQuery({
    queryKey: KEYS.list(userId),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getTickets(userId);
    },
  });
}

/** Fetch a single ticket by ID */
export function useTicket(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getTicket(id);
    },
    enabled: !!id,
  });
}

/** Fetch messages for a ticket */
export function useTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: KEYS.messages(ticketId),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getTicketMessages(ticketId);
    },
    enabled: !!ticketId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new ticket */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketData) => {
      const service = await getTicketsService();
      return service.createTicket(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Update ticket status */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const service = await getTicketsService();
      return service.updateTicketStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Send a message in a ticket */
export function useSendTicketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      content,
      attachmentUrl,
      attachmentName,
    }: {
      ticketId: string;
      content: string;
      attachmentUrl?: string;
      attachmentName?: string;
    }) => {
      const service = await getTicketsService();
      return service.sendTicketMessage(ticketId, content, attachmentUrl, attachmentName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: KEYS.messages(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: KEYS.detail(variables.ticketId),
      });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
