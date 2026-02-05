/**
 * Tickets Service — Interface + Factory
 * PRD-067: Service Layer — Specialized Modules
 *
 * Manages support tickets and ticket messages.
 */

import type { Ticket, TicketMessage, TicketCategory, TicketStatus } from '@/types/help';

export interface CreateTicketData {
  userId: string;
  category: TicketCategory;
  subject: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ITicketsService {
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
