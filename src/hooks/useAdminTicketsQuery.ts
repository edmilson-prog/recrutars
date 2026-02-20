/**
 * Admin Tickets Query Hooks
 * PRD-082: Admin Helpdesk Intelligence
 *
 * React Query hooks for admin helpdesk operations.
 * Namespace: admin-tickets (separate from user ticket hooks).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TicketStatus,
  TicketPriority,
  AdminTicketFilters,
} from '@/types/help';
import { getTicketsService } from '@/services/tickets/ticketsService';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  all: ['admin-tickets'] as const,
  list: (filters: AdminTicketFilters) => ['admin-tickets', 'list', filters] as const,
  detail: (id: string) => ['admin-tickets', 'detail', id] as const,
  messages: (ticketId: string) => ['admin-tickets', 'messages', ticketId] as const,
  auditLog: (ticketId: string) => ['admin-tickets', 'audit', ticketId] as const,
  metrics: (period?: string) => ['admin-tickets', 'metrics', period] as const,
  requesterContext: (userId: string) => ['admin-tickets', 'requester', userId] as const,
  pendingCsat: (userId: string) => ['admin-tickets', 'pending-csat', userId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch admin ticket list with filters */
export function useAdminTickets(filters: AdminTicketFilters) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getAdminTickets(filters);
    },
  });
}

/** Fetch single admin ticket detail (with messages + audit log) */
export function useAdminTicket(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getAdminTicket(id);
    },
    enabled: !!id,
  });
}

/** Fetch ticket messages (admin view — includes internal notes) */
export function useAdminTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: KEYS.messages(ticketId),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getTicketMessages(ticketId);
    },
    enabled: !!ticketId,
  });
}

/** Fetch ticket audit log */
export function useTicketAuditLog(ticketId: string) {
  return useQuery({
    queryKey: KEYS.auditLog(ticketId),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getTicketAuditLog(ticketId);
    },
    enabled: !!ticketId,
  });
}

/** Fetch helpdesk dashboard metrics */
export function useHelpdeskMetrics(period?: 'today' | 'week' | 'month' | 'all') {
  return useQuery({
    queryKey: KEYS.metrics(period),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getHelpdeskMetrics(period);
    },
  });
}

/** Fetch requester context (user info + engagement) */
export function useRequesterContext(userId: string) {
  return useQuery({
    queryKey: KEYS.requesterContext(userId),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getRequesterContext(userId);
    },
    enabled: !!userId,
  });
}

/** Fetch pending CSAT for current user */
export function usePendingCSAT(userId: string) {
  return useQuery({
    queryKey: KEYS.pendingCsat(userId),
    queryFn: async () => {
      const service = await getTicketsService();
      return service.getPendingCSAT(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Update ticket status (admin) */
export function useUpdateTicketStatusAdmin() {
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

/** Update ticket priority (admin) */
export function useUpdateTicketPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: TicketPriority }) => {
      const service = await getTicketsService();
      await service.updateTicketPriority(id, priority);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Extend SLA deadline (admin) */
export function useExtendSLA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newDeadline, reason }: { id: string; newDeadline: string; reason: string }) => {
      const service = await getTicketsService();
      await service.extendSLA(id, newDeadline, reason);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Send admin reply */
export function useSendAdminReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, content, senderId }: { ticketId: string; content: string; senderId: string }) => {
      const service = await getTicketsService();
      return service.sendAdminReply(ticketId, content, senderId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: KEYS.messages(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Add internal note */
export function useAddInternalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, content, senderId }: { ticketId: string; content: string; senderId: string }) => {
      const service = await getTicketsService();
      return service.addInternalNote(ticketId, content, senderId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: KEYS.messages(variables.ticketId) });
    },
  });
}

/** Log ticket action (used internally by other mutations) */
export function useLogTicketAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Parameters<Awaited<ReturnType<typeof getTicketsService>>['logTicketAction']>[0]) => {
      const service = await getTicketsService();
      await service.logTicketAction(entry);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.auditLog(variables.ticketId) });
    },
  });
}

/** Submit CSAT rating */
export function useSubmitCSAT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, userId, rating, comment }: { ticketId: string; userId: string; rating: number; comment?: string }) => {
      const service = await getTicketsService();
      await service.submitCSAT(ticketId, userId, rating, comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.pendingCsat(variables.userId) });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
