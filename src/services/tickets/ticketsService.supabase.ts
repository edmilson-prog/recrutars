/**
 * Tickets Service — Supabase Implementation
 * PRD-067: Service Layer — Specialized Modules
 *
 * Queries tickets and ticket_messages tables.
 * Tables:
 *   tickets(id, number, user_id, category, subject, status, created_at, updated_at, resolved_at)
 *   ticket_messages(id, ticket_id, sender, content, attachment_url, attachment_name, created_at)
 */

import type { Ticket, TicketMessage, TicketStatus } from '@/types/help';
import { supabase } from '@/lib/supabase';
import type { ITicketsService, CreateTicketData } from './ticketsService';

export class TicketsServiceSupabase implements ITicketsService {
  async getTickets(userId?: string): Promise<Ticket[]> {
    let query = supabase
      .from('tickets')
      .select('*, ticket_messages(*)')
      .order('updated_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data ?? []).map(this.mapTicket);
  }

  async getTicket(id: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, ticket_messages(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? this.mapTicket(data) : null;
  }

  async createTicket(data: CreateTicketData): Promise<Ticket> {
    // Create the ticket first
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        user_id: data.userId,
        category: data.category,
        subject: data.subject,
        status: 'open',
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Then create the first message
    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticket.id,
        sender: 'user',
        content: data.content,
        attachment_url: data.attachmentUrl ?? null,
        attachment_name: data.attachmentName ?? null,
      });

    if (msgError) throw msgError;

    // Re-fetch the complete ticket with messages
    const result = await this.getTicket(ticket.id);
    if (!result) throw new Error('Failed to fetch created ticket');
    return result;
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'resolved') {
      updates.resolved_at = updates.updated_at;
    }

    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    const result = await this.getTicket(id);
    if (!result) throw new Error(`Ticket not found: ${id}`);
    return result;
  }

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(this.mapTicketMessage);
  }

  async sendTicketMessage(
    ticketId: string,
    content: string,
    attachmentUrl?: string,
    attachmentName?: string,
  ): Promise<TicketMessage> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender: 'user',
        content,
        attachment_url: attachmentUrl ?? null,
        attachment_name: attachmentName ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update ticket timestamp and re-open if resolved
    await supabase
      .from('tickets')
      .update({
        updated_at: new Date().toISOString(),
        status: 'open',
      })
      .eq('id', ticketId)
      .eq('status', 'resolved');

    // Also update timestamp for non-resolved tickets
    await supabase
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return this.mapTicketMessage(data);
  }

  // ---------------------------------------------------------------------------
  // Mappers (snake_case DB -> camelCase TS)
  // ---------------------------------------------------------------------------

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapTicketMessage(row: any): TicketMessage {
    return {
      id: row.id,
      sender: row.sender,
      content: row.content,
      attachmentUrl: row.attachment_url ?? undefined,
      attachmentName: row.attachment_name ?? undefined,
      createdAt: row.created_at,
    };
  }

  private mapTicket(row: any): Ticket {
    const messages = Array.isArray(row.ticket_messages)
      ? row.ticket_messages
          .map((m: any) => this.mapTicketMessage(m))
          .sort((a: TicketMessage, b: TicketMessage) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
      : [];

    return {
      id: row.id,
      number: row.number,
      userId: row.user_id,
      category: row.category,
      subject: row.subject,
      status: row.status,
      messages,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resolvedAt: row.resolved_at ?? undefined,
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
