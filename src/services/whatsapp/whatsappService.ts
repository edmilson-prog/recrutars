/**
 * WhatsApp Service — Interface + Factory
 *
 * Manages WhatsApp messaging via Evolution API.
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

export interface IWhatsAppService {
  /** Send individual WhatsApp message */
  sendMessage(phone: string, text: string, recipientInfo?: {
    recipientId?: string;
    recipientType?: 'candidate' | 'company';
    templateId?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;

  /** Send bulk WhatsApp messages */
  sendBulk(recipients: WhatsAppBulkRecipient[], text: string, templateId?: string): Promise<{
    success: boolean;
    total: number;
    sent: number;
    failed: number;
    campaignId: string;
  }>;

  /** Check which numbers are on WhatsApp */
  checkNumbers(phones: string[]): Promise<{ number: string; exists: boolean; jid?: string }[]>;

  /** Get Evolution API connection status */
  getConnectionStatus(): Promise<{ connected: boolean; state: string }>;

  /** List sent WhatsApp messages with optional filters */
  getMessages(filters?: WhatsAppMessagesFilters): Promise<WhatsAppMessage[]>;

  /** Get message stats */
  getMessageStats(): Promise<WhatsAppMessageStats>;

  /** List active WhatsApp templates */
  getTemplates(): Promise<WhatsAppTemplate[]>;

  /** Create a new template */
  createTemplate(params: CreateWhatsAppTemplateParams): Promise<WhatsAppTemplate>;

  /** Update an existing template */
  updateTemplate(id: string, params: Partial<CreateWhatsAppTemplateParams & { isActive: boolean }>): Promise<void>;

  /** Delete a template */
  deleteTemplate(id: string): Promise<void>;

  /** Get candidates who haven't completed Gauge-Pro test */
  getPendingGaugeProCandidates(): Promise<PendingGaugeProCandidate[]>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: IWhatsAppService | null = null;

export async function getWhatsAppService(): Promise<IWhatsAppService> {
  if (_instance) return _instance;

  const { WhatsAppServiceSupabase } = await import('./whatsappService.supabase');
  _instance = new WhatsAppServiceSupabase();
  return _instance;
}

export function resetWhatsAppService(): void {
  _instance = null;
}
