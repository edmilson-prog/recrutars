// WhatsApp Integration Types

export type WhatsAppMessageStatus = 'queued' | 'sent' | 'failed';
export type WhatsAppTemplateCategory = 'convite' | 'lembrete' | 'informativo' | 'operacional';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  description: string | null;
  messageText: string;
  category: WhatsAppTemplateCategory;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  notificationSendId: string | null;
  campaignId: string | null;
  recipientPhone: string;
  recipientName: string | null;
  recipientType: 'candidate' | 'company' | null;
  recipientId: string | null;
  messageText: string;
  templateId: string | null;
  whatsappMessageId: string | null;
  status: WhatsAppMessageStatus;
  errorMessage: string | null;
  sentBy: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface WhatsAppBulkRecipient {
  phone: string;
  name: string;
  id: string;
  type: 'candidate' | 'company';
}

export interface PendingGaugeProCandidate {
  id: string;
  profileId: string;
  name: string;
  phone: string;
  email: string;
  onboardingStep: string;
  createdAt: string;
}

export interface WhatsAppMessagesFilters {
  search?: string;
  status?: WhatsAppMessageStatus | '';
  campaignId?: string;
}

export interface WhatsAppMessageStats {
  total: number;
  sent: number;
  failed: number;
  campaigns: number;
}

export interface CreateWhatsAppTemplateParams {
  name: string;
  description?: string;
  messageText: string;
  category: WhatsAppTemplateCategory;
}

// Labels
export const whatsAppStatusLabels: Record<WhatsAppMessageStatus, string> = {
  queued: 'Na Fila',
  sent: 'Enviada',
  failed: 'Falha',
};

export const whatsAppCategoryLabels: Record<WhatsAppTemplateCategory, string> = {
  convite: 'Convite',
  lembrete: 'Lembrete',
  informativo: 'Informativo',
  operacional: 'Operacional',
};

// Badge colors
export const whatsAppStatusColors: Record<WhatsAppMessageStatus, string> = {
  queued: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  sent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const whatsAppCategoryColors: Record<WhatsAppTemplateCategory, string> = {
  convite: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  lembrete: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  informativo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  operacional: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};
