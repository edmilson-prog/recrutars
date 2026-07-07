/**
 * Tickets Service — Supabase Implementation
 * PRD-067: Service Layer — Specialized Modules
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Queries tickets, ticket_messages, ticket_csat, ticket_audit_log tables.
 */

import type {
  Ticket,
  TicketMessage,
  TicketStatus,
  TicketPriority,
  AdminTicket,
  AdminTicketDetail,
  AdminTicketFilters,
  TicketAuditEntry,
  HelpdeskMetrics,
  RequesterContext,
  SLAStatus,
} from '@/types/help';
import type { PaginatedResult } from '@/services/types';
import { supabase } from '@/lib/supabase';
import type { ITicketsService, CreateTicketData } from './ticketsService';

export class TicketsServiceSupabase implements ITicketsService {
  // ===========================================================================
  // User-facing methods (existing, fixed mappers)
  // ===========================================================================

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

    return (data ?? []).map((row) => this.mapTicket(row));
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

    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticket.id,
        sender_id: data.userId,
        sender_type: 'user',
        content: data.content,
        attachment_url: data.attachmentUrl ?? null,
        attachment_name: data.attachmentName ?? null,
        is_internal_note: false,
      });

    if (msgError) throw msgError;

    const result = await this.getTicket(ticket.id);
    if (!result) throw new Error('Failed to fetch created ticket');
    return result;
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
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

    return (data ?? []).map((row) => this.mapTicketMessage(row));
  }

  async sendTicketMessage(
    ticketId: string,
    content: string,
    attachmentUrl?: string,
    attachmentName?: string,
  ): Promise<TicketMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_type: 'user',
        content,
        attachment_url: attachmentUrl ?? null,
        attachment_name: attachmentName ?? null,
        is_internal_note: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Re-open ticket if it was resolved/waiting
    await supabase
      .from('tickets')
      .update({ status: 'open' })
      .eq('id', ticketId)
      .in('status', ['resolved', 'waiting_user']);

    return this.mapTicketMessage(data);
  }

  // ===========================================================================
  // Admin Helpdesk methods (PRD-082)
  // ===========================================================================

  async getAdminTickets(filters: AdminTicketFilters): Promise<PaginatedResult<AdminTicket>> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('tickets')
      .select(`
        *,
        requester:profiles!tickets_user_id_fkey(id, name, email, avatar_url, type),
        assignee:profiles!tickets_assigned_to_fkey(id, name),
        ticket_messages(id, content, created_at, sender_type, is_internal_note)
      `, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to);

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }
    if (filters.requesterType && filters.requesterType !== 'all') {
      query = query.eq('requester_type', filters.requesterType);
    }
    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters.search) {
      query = query.textSearch('subject', filters.search, { type: 'websearch', config: 'portuguese' });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const items = (data ?? []).map((row) => this.mapAdminTicket(row));

    // Post-filter SLA status (can't do in Supabase query easily)
    const filtered = filters.slaStatus && filters.slaStatus !== 'all'
      ? items.filter((t) => this.getSLAStatus(t.slaDeadline, t.resolvedAt) === filters.slaStatus)
      : items;

    return {
      data: filtered,
      total: count ?? 0,
      page,
      pageSize,
      hasMore: page * pageSize < (count ?? 0),
    };
  }

  async getAdminTicket(id: string): Promise<AdminTicketDetail | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        requester:profiles!tickets_user_id_fkey(id, name, email, avatar_url, type),
        assignee:profiles!tickets_assigned_to_fkey(id, name),
        ticket_messages(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    const auditLog = await this.getTicketAuditLog(id);
    const adminTicket = this.mapAdminTicket(data);

    const messages = Array.isArray(data.ticket_messages)
      ? data.ticket_messages
        .map((m: Record<string, unknown>) => this.mapTicketMessage(m))
        .sort((a: TicketMessage, b: TicketMessage) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
      : [];

    return {
      ...adminTicket,
      messages,
      auditLog,
    };
  }

  async updateTicketPriority(id: string, priority: TicketPriority): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .update({ priority })
      .eq('id', id);

    if (error) throw error;
  }

  async extendSLA(id: string, newDeadline: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .update({ sla_deadline: newDeadline })
      .eq('id', id);

    if (error) throw error;

    // Log the extension
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await this.logTicketAction({
        ticketId: id,
        action: 'sla_extended',
        performedBy: user.id,
        performedByName: undefined,
        newValue: newDeadline,
        details: { reason },
      });
    }
  }

  async sendAdminReply(ticketId: string, content: string, senderId: string): Promise<TicketMessage> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_type: 'admin',
        content,
        is_internal_note: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Update ticket status to waiting_user and timestamp
    await supabase
      .from('tickets')
      .update({ status: 'waiting_user' })
      .eq('id', ticketId)
      .in('status', ['open', 'in_progress']);

    return this.mapTicketMessage(data);
  }

  async addInternalNote(ticketId: string, content: string, senderId: string): Promise<TicketMessage> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_type: 'admin',
        content,
        is_internal_note: true,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapTicketMessage(data);
  }

  async getTicketAuditLog(ticketId: string): Promise<TicketAuditEntry[]> {
    const { data, error } = await supabase
      .from('ticket_audit_log')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => this.mapAuditEntry(row));
  }

  async logTicketAction(entry: Omit<TicketAuditEntry, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await supabase
      .from('ticket_audit_log')
      .insert({
        ticket_id: entry.ticketId,
        action: entry.action,
        performed_by: entry.performedBy,
        performed_by_name: entry.performedByName ?? null,
        old_value: entry.oldValue ?? null,
        new_value: entry.newValue ?? null,
        details: entry.details ?? null,
      });

    if (error) {
      console.error('Failed to log ticket action:', error);
    }
  }

  async getHelpdeskMetrics(period?: 'today' | 'week' | 'month' | 'all'): Promise<HelpdeskMetrics> {
    // Get ticket counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('tickets')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        const counts = {
          open: 0,
          in_progress: 0,
          waiting_user: 0,
          resolved: 0,
          closed: 0,
        };
        (data ?? []).forEach((t: { status: string }) => {
          if (t.status in counts) {
            counts[t.status as keyof typeof counts]++;
          }
        });
        return { data: counts, error: null };
      });

    if (statusError) throw statusError;

    // Get SLA breached count
    const { count: slaBreached } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .lt('sla_deadline', new Date().toISOString())
      .is('resolved_at', null)
      .not('status', 'in', '("resolved","closed")');

    // Get avg CSAT
    const { data: csatData } = await supabase
      .from('ticket_csat')
      .select('rating');

    const avgCsat = csatData && csatData.length > 0
      ? csatData.reduce((sum, c) => sum + c.rating, 0) / csatData.length
      : 0;

    // Get tickets today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: ticketsToday } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // Get tickets this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const { count: ticketsThisWeek } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString());

    // Avg resolution time (from resolved tickets)
    const { data: resolvedTickets } = await supabase
      .from('tickets')
      .select('created_at, resolved_at')
      .not('resolved_at', 'is', null);

    let avgResolutionTimeHours = 0;
    if (resolvedTickets && resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        const created = new Date(t.created_at).getTime();
        const resolved = new Date(t.resolved_at!).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionTimeHours = totalHours / resolvedTickets.length;
    }

    return {
      totalOpen: statusCounts?.open ?? 0,
      totalInProgress: statusCounts?.in_progress ?? 0,
      totalWaitingUser: statusCounts?.waiting_user ?? 0,
      totalResolved: statusCounts?.resolved ?? 0,
      totalClosed: statusCounts?.closed ?? 0,
      avgResolutionTimeHours: Math.round(avgResolutionTimeHours * 10) / 10,
      slaBreachedCount: slaBreached ?? 0,
      avgCsatRating: Math.round(avgCsat * 10) / 10,
      ticketsToday: ticketsToday ?? 0,
      ticketsThisWeek: ticketsThisWeek ?? 0,
    };
  }

  async getRequesterContext(userId: string): Promise<RequesterContext | null> {
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) return null;

    // Get ticket stats
    const { count: totalTickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: openTickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('status', 'in', '("resolved","closed")');

    // Get company info if company user
    let companyName: string | undefined;
    let companyId: string | undefined;
    let planName: string | undefined;
    let planStatus: string | undefined;
    let isTrial = false;

    if (profile.type === 'company') {
      const { data: company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('profile_id', userId)
        .maybeSingle();

      if (company) {
        companyName = company.name;
        companyId = company.id;
      }

      // Get subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_id, status, is_trial')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (sub) {
        planStatus = sub.status;
        isTrial = sub.is_trial ?? false;
        // Get plan name
        if (sub.plan_id) {
          const { data: plan } = await supabase
            .from('plans')
            .select('name')
            .eq('id', sub.plan_id)
            .maybeSingle();
          planName = plan?.name;
        }
      }
    }

    if (profile.type === 'candidate') {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();

      if (candidate) {
        // Get application count
        const { count: totalApplications } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', candidate.id);

        return {
          userId: profile.id,
          name: profile.name ?? '',
          email: profile.email ?? '',
          avatar: profile.avatar_url ?? undefined,
          userType: profile.type as 'candidate',
          planName,
          planStatus,
          isTrial,
          createdAt: profile.created_at,
          lastLoginAt: profile.last_access_at ?? undefined,
          totalTickets: totalTickets ?? 0,
          openTickets: openTickets ?? 0,
          totalApplications: totalApplications ?? 0,
        };
      }
    }

    return {
      userId: profile.id,
      name: profile.name ?? '',
      email: profile.email ?? '',
      avatar: profile.avatar_url ?? undefined,
      userType: profile.type as RequesterContext['userType'],
      planName,
      planStatus,
      isTrial,
      companyName,
      companyId,
      createdAt: profile.created_at,
      lastLoginAt: profile.last_access_at ?? undefined,
      totalTickets: totalTickets ?? 0,
      openTickets: openTickets ?? 0,
    };
  }

  async submitCSAT(ticketId: string, userId: string, rating: number, comment?: string): Promise<void> {
    const { error } = await supabase
      .from('ticket_csat')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        rating,
        comment: comment ?? null,
      });

    // 23505 = unique_violation (ticket_csat_unique_ticket). A rating for this
    // ticket already exists — treat as success instead of surfacing a 409,
    // since the desired end state (ticket rated) is already satisfied.
    if (error && error.code !== '23505') throw error;
  }

  async getPendingCSAT(userId: string): Promise<{ ticketId: string; subject: string; resolvedAt: string } | null> {
    // Find resolved tickets for this user that don't have a CSAT rating yet
    const { data, error } = await supabase
      .from('tickets')
      .select('id, subject, resolved_at')
      .eq('user_id', userId)
      .in('status', ['resolved', 'closed'])
      .not('resolved_at', 'is', null)
      .order('resolved_at', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) return null;

    // Check which ones already have CSAT
    const ticketIds = data.map((t) => t.id);
    const { data: existingCsat } = await supabase
      .from('ticket_csat')
      .select('ticket_id')
      .in('ticket_id', ticketIds);

    const ratedIds = new Set((existingCsat ?? []).map((c) => c.ticket_id));

    const pending = data.find((t) => !ratedIds.has(t.id));
    if (!pending) return null;

    return {
      ticketId: pending.id,
      subject: pending.subject,
      resolvedAt: pending.resolved_at!,
    };
  }

  // ===========================================================================
  // Private mappers
  // ===========================================================================

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapTicketMessage(row: any): TicketMessage {
    return {
      id: row.id,
      senderId: row.sender_id,
      senderType: row.sender_type ?? 'user',
      content: row.content,
      isInternalNote: row.is_internal_note ?? false,
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
      number: row.number ?? 0,
      userId: row.user_id,
      category: row.category,
      priority: row.priority ?? 'medium',
      subject: row.subject,
      status: row.status,
      requesterType: row.requester_type ?? undefined,
      assignedTo: row.assigned_to ?? undefined,
      slaDeadline: row.sla_deadline ?? undefined,
      resolvedAt: row.resolved_at ?? undefined,
      messages,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapAdminTicket(row: any): AdminTicket {
    const ticket = this.mapTicket(row);

    const messages = Array.isArray(row.ticket_messages)
      ? row.ticket_messages.sort((a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      : [];

    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const requester = row.requester;
    const assignee = row.assignee;

    return {
      ...ticket,
      requesterName: requester?.name ?? undefined,
      requesterEmail: requester?.email ?? undefined,
      requesterAvatar: requester?.avatar_url ?? undefined,
      assignedToName: assignee?.name ?? undefined,
      lastMessagePreview: lastMsg?.content?.substring(0, 120) ?? undefined,
      lastMessageAt: lastMsg?.created_at ?? undefined,
      messageCount: messages.length,
      aiSuggestedCategory: row.ai_suggested_category ?? undefined,
      aiSuggestedPriority: row.ai_suggested_priority ?? undefined,
      aiSummary: row.ai_summary ?? undefined,
      aiTriageStatus: row.ai_triage_status ?? undefined,
    };
  }

  private mapAuditEntry(row: any): TicketAuditEntry {
    return {
      id: row.id,
      ticketId: row.ticket_id,
      action: row.action,
      performedBy: row.performed_by,
      performedByName: row.performed_by_name ?? undefined,
      oldValue: row.old_value ?? undefined,
      newValue: row.new_value ?? undefined,
      details: row.details ?? undefined,
      createdAt: row.created_at,
    };
  }

  private getSLAStatus(slaDeadline?: string, resolvedAt?: string): SLAStatus {
    if (!slaDeadline) return 'on_track';
    if (resolvedAt) return 'on_track';

    const now = new Date().getTime();
    const deadline = new Date(slaDeadline).getTime();
    const timeLeft = deadline - now;

    if (timeLeft <= 0) return 'breached';
    // Warning if less than 25% of SLA time remaining
    const totalTime = deadline - now;
    if (totalTime < 30 * 60 * 1000) return 'warning'; // Less than 30 min
    return 'on_track';
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
