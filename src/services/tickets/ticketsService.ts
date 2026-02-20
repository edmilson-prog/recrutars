/**
 * Tickets Service — Interface + Factory
 * PRD-067: Service Layer — Specialized Modules
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Manages support tickets and ticket messages.
 */

import type {
  Ticket,
  TicketMessage,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  AdminTicket,
  AdminTicketDetail,
  AdminTicketFilters,
  TicketAuditEntry,
  HelpdeskMetrics,
  RequesterContext,
  TicketCSAT,
} from '@/types/help';
import type { PaginatedResult } from '@/services/types';

export interface CreateTicketData {
  userId: string;
  category: TicketCategory;
  subject: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ITicketsService {
  // ---------------------------------------------------------------------------
  // User-facing (existing)
  // ---------------------------------------------------------------------------

  /** Get all tickets, optionally filtered by userId */
  getTickets(userId?: string): Promise<Ticket[]>;

  /** Get a single ticket by ID */
  getTicket(id: string): Promise<Ticket | null>;

  /** Create a new ticket */
  createTicket(data: CreateTicketData): Promise<Ticket>;

  /** Update ticket status */
  updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket>;

  /** Get messages for a ticket */
  getTicketMessages(ticketId: string): Promise<TicketMessage[]>;

  /** Send a new message in a ticket */
  sendTicketMessage(ticketId: string, content: string, attachmentUrl?: string, attachmentName?: string): Promise<TicketMessage>;

  // ---------------------------------------------------------------------------
  // Admin Helpdesk (PRD-082)
  // ---------------------------------------------------------------------------

  /** Get admin ticket list with filters and pagination */
  getAdminTickets(filters: AdminTicketFilters): Promise<PaginatedResult<AdminTicket>>;

  /** Get admin ticket detail with messages and audit log */
  getAdminTicket(id: string): Promise<AdminTicketDetail | null>;

  /** Update ticket priority (admin) */
  updateTicketPriority(id: string, priority: TicketPriority): Promise<void>;

  /** Extend SLA deadline (admin) */
  extendSLA(id: string, newDeadline: string, reason: string): Promise<void>;

  /** Send admin reply to a ticket */
  sendAdminReply(ticketId: string, content: string, senderId: string): Promise<TicketMessage>;

  /** Add internal note to a ticket (admin only) */
  addInternalNote(ticketId: string, content: string, senderId: string): Promise<TicketMessage>;

  /** Get audit log for a ticket */
  getTicketAuditLog(ticketId: string): Promise<TicketAuditEntry[]>;

  /** Log a ticket action to the audit log */
  logTicketAction(entry: Omit<TicketAuditEntry, 'id' | 'createdAt'>): Promise<void>;

  /** Get helpdesk metrics for dashboard */
  getHelpdeskMetrics(period?: 'today' | 'week' | 'month' | 'all'): Promise<HelpdeskMetrics>;

  /** Get requester context (user info + engagement) */
  getRequesterContext(userId: string): Promise<RequesterContext | null>;

  /** Submit CSAT rating for a resolved ticket */
  submitCSAT(ticketId: string, userId: string, rating: number, comment?: string): Promise<void>;

  /** Get pending CSAT (resolved tickets without rating for this user) */
  getPendingCSAT(userId: string): Promise<{ ticketId: string; subject: string; resolvedAt: string } | null>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: ITicketsService | null = null;

export async function getTicketsService(): Promise<ITicketsService> {
  if (_instance) return _instance;

  const { TicketsServiceSupabase } = await import('./ticketsService.supabase');
  _instance = new TicketsServiceSupabase();
  return _instance;
}

export function resetTicketsService(): void {
  _instance = null;
}
