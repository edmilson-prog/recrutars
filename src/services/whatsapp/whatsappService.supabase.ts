/**
 * WhatsApp Service — Supabase Implementation
 *
 * Sends messages via the `send-whatsapp` Edge Function and queries
 * whatsapp_messages / whatsapp_templates tables for history and template CRUD.
 *
 * Table schemas:
 *   whatsapp_messages(id, notification_send_id, campaign_id, recipient_phone,
 *     recipient_name, recipient_type, recipient_id, message_text, template_id,
 *     whatsapp_message_id, status, error_message, sent_by, sent_at, created_at)
 *
 *   whatsapp_templates(id, name, description, message_text, category,
 *     is_active, created_by, created_at, updated_at)
 */

import type {
  WhatsAppMessage,
  WhatsAppTemplate,
  WhatsAppMessageStats,
  WhatsAppMessagesFilters,
  CreateWhatsAppTemplateParams,
  WhatsAppBulkRecipient,
  PendingGaugeProCandidate,
} from '@/types/whatsapp';
import { supabase } from '@/lib/supabase';
import type { IWhatsAppService } from './whatsappService';

export class WhatsAppServiceSupabase implements IWhatsAppService {
  // ---------------------------------------------------------------------------
  // Edge Function calls
  // ---------------------------------------------------------------------------

  async sendMessage(
    phone: string,
    text: string,
    recipientInfo?: {
      recipientId?: string;
      recipientType?: 'candidate' | 'company';
      templateId?: string;
    },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sentBy = await this.getCurrentUserId();

    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        action: 'send_text',
        phone,
        text,
        recipientId: recipientInfo?.recipientId ?? null,
        recipientType: recipientInfo?.recipientType ?? null,
        templateId: recipientInfo?.templateId ?? null,
        sentBy,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: data?.success ?? false,
      messageId: data?.messageId ?? undefined,
      error: data?.error ?? undefined,
    };
  }

  async sendBulk(
    recipients: WhatsAppBulkRecipient[],
    text: string,
    templateId?: string,
  ): Promise<{
    success: boolean;
    total: number;
    sent: number;
    failed: number;
    campaignId: string;
  }> {
    const sentBy = await this.getCurrentUserId();
    const campaignId = crypto.randomUUID();

    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        action: 'send_bulk',
        recipients,
        text,
        templateId: templateId ?? null,
        campaignId,
        sentBy,
      },
    });

    if (error) {
      return { success: false, total: recipients.length, sent: 0, failed: recipients.length, campaignId };
    }

    return {
      success: data?.success ?? false,
      total: data?.total ?? recipients.length,
      sent: data?.sent ?? 0,
      failed: data?.failed ?? recipients.length,
      campaignId,
    };
  }

  async checkNumbers(phones: string[]): Promise<{ number: string; exists: boolean; jid?: string }[]> {
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        action: 'check_numbers',
        numbers: phones,
      },
    });

    if (error) throw error;

    return data?.results ?? [];
  }

  async getConnectionStatus(): Promise<{ connected: boolean; state: string }> {
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        action: 'get_connection_status',
      },
    });

    if (error) {
      return { connected: false, state: 'error' };
    }

    return {
      connected: data?.connected ?? false,
      state: data?.state ?? 'unknown',
    };
  }

  // ---------------------------------------------------------------------------
  // Direct table queries
  // ---------------------------------------------------------------------------

  async getMessages(filters?: WhatsAppMessagesFilters): Promise<WhatsAppMessage[]> {
    let query = supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(
        `recipient_phone.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`,
      );
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data ?? []).map(this.mapWhatsAppMessage);
  }

  async getMessageStats(): Promise<WhatsAppMessageStats> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('status, campaign_id');

    if (error) throw error;

    const rows = data ?? [];
    const uniqueCampaigns = new Set(rows.filter((r) => r.campaign_id).map((r) => r.campaign_id));

    return {
      total: rows.length,
      sent: rows.filter((r) => r.status === 'sent').length,
      failed: rows.filter((r) => r.status === 'failed').length,
      campaigns: uniqueCampaigns.size,
    };
  }

  // ---------------------------------------------------------------------------
  // Template CRUD
  // ---------------------------------------------------------------------------

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(this.mapWhatsAppTemplate);
  }

  async createTemplate(params: CreateWhatsAppTemplateParams): Promise<WhatsAppTemplate> {
    const userId = await this.getCurrentUserId();

    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert({
        name: params.name,
        description: params.description ?? null,
        message_text: params.messageText,
        category: params.category,
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapWhatsAppTemplate(data);
  }

  async updateTemplate(
    id: string,
    params: Partial<CreateWhatsAppTemplateParams & { isActive: boolean }>,
  ): Promise<void> {
    const updatePayload: Record<string, unknown> = {};

    if (params.name !== undefined) updatePayload.name = params.name;
    if (params.description !== undefined) updatePayload.description = params.description;
    if (params.messageText !== undefined) updatePayload.message_text = params.messageText;
    if (params.category !== undefined) updatePayload.category = params.category;
    if (params.isActive !== undefined) updatePayload.is_active = params.isActive;

    const { error } = await supabase
      .from('whatsapp_templates')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_templates')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
  }

  // ---------------------------------------------------------------------------
  // RPC
  // ---------------------------------------------------------------------------

  async getPendingGaugeProCandidates(): Promise<PendingGaugeProCandidate[]> {
    const { data, error } = await supabase.rpc('get_pending_gauge_pro_candidates');

    if (error) throw error;

    return (data ?? []).map(this.mapPendingCandidate);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? '';
  }

  // ---------------------------------------------------------------------------
  // Mappers (snake_case DB -> camelCase TS)
  // ---------------------------------------------------------------------------

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapWhatsAppMessage(row: any): WhatsAppMessage {
    return {
      id: row.id,
      notificationSendId: row.notification_send_id ?? null,
      campaignId: row.campaign_id ?? null,
      recipientPhone: row.recipient_phone,
      recipientName: row.recipient_name ?? null,
      recipientType: row.recipient_type ?? null,
      recipientId: row.recipient_id ?? null,
      messageText: row.message_text,
      templateId: row.template_id ?? null,
      whatsappMessageId: row.whatsapp_message_id ?? null,
      status: row.status,
      errorMessage: row.error_message ?? null,
      sentBy: row.sent_by ?? null,
      sentAt: row.sent_at ?? null,
      createdAt: row.created_at,
    };
  }

  private mapWhatsAppTemplate(row: any): WhatsAppTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      messageText: row.message_text,
      category: row.category,
      isActive: row.is_active,
      createdBy: row.created_by ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapPendingCandidate(row: any): PendingGaugeProCandidate {
    return {
      id: row.id,
      profileId: row.profile_id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      onboardingStep: row.onboarding_step,
      createdAt: row.created_at,
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
