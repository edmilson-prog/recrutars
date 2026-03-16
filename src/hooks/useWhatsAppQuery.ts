/**
 * WhatsApp Query Hooks
 *
 * React Query hooks for WhatsApp messaging via Evolution API.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getWhatsAppService } from '@/services/whatsapp/whatsappService';
import type { WhatsAppMessagesFilters, CreateWhatsAppTemplateParams, WhatsAppBulkRecipient } from '@/types/whatsapp';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  all: ['whatsapp'] as const,
  messages: (filters?: WhatsAppMessagesFilters) => ['whatsapp', 'messages', filters] as const,
  stats: ['whatsapp', 'stats'] as const,
  templates: ['whatsapp', 'templates'] as const,
  connectionStatus: ['whatsapp', 'connection-status'] as const,
  pendingCandidates: ['whatsapp', 'pending-candidates'] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch WhatsApp messages with optional filters */
export function useWhatsAppMessages(filters?: WhatsAppMessagesFilters) {
  return useQuery({
    queryKey: KEYS.messages(filters),
    queryFn: async () => {
      const service = await getWhatsAppService();
      return service.getMessages(filters);
    },
  });
}

/** Get WhatsApp message stats (total, sent, failed, campaigns) */
export function useWhatsAppMessageStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: async () => {
      const service = await getWhatsAppService();
      return service.getMessageStats();
    },
  });
}

/** List active WhatsApp templates */
export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: KEYS.templates,
    queryFn: async () => {
      const service = await getWhatsAppService();
      return service.getTemplates();
    },
  });
}

/** Get Evolution API connection status (auto-refreshes every 30s) */
export function useWhatsAppConnectionStatus() {
  return useQuery({
    queryKey: KEYS.connectionStatus,
    queryFn: async () => {
      const service = await getWhatsAppService();
      return service.getConnectionStatus();
    },
    refetchInterval: 30000,
  });
}

/** Get candidates who haven't completed Gauge-Pro test */
export function usePendingGaugeProCandidates() {
  return useQuery({
    queryKey: KEYS.pendingCandidates,
    queryFn: async () => {
      const service = await getWhatsAppService();
      return service.getPendingGaugeProCandidates();
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Send an individual WhatsApp message */
export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      phone: string;
      text: string;
      recipientId?: string;
      recipientType?: 'candidate' | 'company';
      templateId?: string;
    }) => {
      const service = await getWhatsAppService();
      return service.sendMessage(params.phone, params.text, {
        recipientId: params.recipientId,
        recipientType: params.recipientType,
        templateId: params.templateId,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Mensagem WhatsApp enviada com sucesso');
      } else {
        toast.error('Erro ao enviar mensagem WhatsApp', {
          description: result.error,
        });
      }
      queryClient.invalidateQueries({ queryKey: KEYS.messages() });
      queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
    onError: (error: Error) => {
      const msg = error.message?.includes('non-2xx')
        ? 'A Evolution API não respondeu. Verifique as configurações de conexão.'
        : error.message;
      toast.error('Erro ao enviar mensagem WhatsApp', {
        description: msg,
      });
    },
  });
}

/** Send bulk WhatsApp messages to multiple recipients */
export function useSendWhatsAppBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      recipients: WhatsAppBulkRecipient[];
      text: string;
      templateId?: string;
    }) => {
      const service = await getWhatsAppService();
      return service.sendBulk(params.recipients, params.text, params.templateId);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Mensagens WhatsApp enviadas com sucesso', {
          description: `${result.sent} de ${result.total} mensagens enviadas`,
        });
      } else {
        toast.error('Erro ao enviar mensagens em lote');
      }
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar mensagens em lote', {
        description: error.message,
      });
    },
  });
}

/** Check which phone numbers are registered on WhatsApp */
export function useCheckWhatsAppNumbers() {
  return useMutation({
    mutationFn: async (phones: string[]) => {
      const service = await getWhatsAppService();
      return service.checkNumbers(phones);
    },
  });
}

/** Create a new WhatsApp template */
export function useCreateWhatsAppTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateWhatsAppTemplateParams) => {
      const service = await getWhatsAppService();
      return service.createTemplate(params);
    },
    onSuccess: () => {
      toast.success('Template criado com sucesso');
      queryClient.invalidateQueries({ queryKey: KEYS.templates });
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar template', {
        description: error.message,
      });
    },
  });
}

/** Update an existing WhatsApp template */
export function useUpdateWhatsAppTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      data: Partial<CreateWhatsAppTemplateParams & { isActive: boolean }>;
    }) => {
      const service = await getWhatsAppService();
      return service.updateTemplate(params.id, params.data);
    },
    onSuccess: () => {
      toast.success('Template atualizado');
      queryClient.invalidateQueries({ queryKey: KEYS.templates });
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar template', {
        description: error.message,
      });
    },
  });
}

/** Delete a WhatsApp template */
export function useDeleteWhatsAppTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const service = await getWhatsAppService();
      return service.deleteTemplate(id);
    },
    onSuccess: () => {
      toast.success('Template removido');
      queryClient.invalidateQueries({ queryKey: KEYS.templates });
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover template', {
        description: error.message,
      });
    },
  });
}
