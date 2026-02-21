/**
 * Hook to read chatbot enablement config
 * Uses a SECURITY DEFINER Postgres function so non-admin users
 * can read the chatbot toggle settings without full system_settings access.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ChatbotConfig {
  chatbotEnabledCandidates: boolean;
  chatbotEnabledCompanies: boolean;
}

export const chatbotConfigKeys = {
  all: ['chatbot-config'] as const,
};

export function useChatbotConfig() {
  return useQuery({
    queryKey: chatbotConfigKeys.all,
    queryFn: async (): Promise<ChatbotConfig> => {
      const { data, error } = await supabase.rpc('get_chatbot_config');
      if (error) throw error;
      return {
        chatbotEnabledCandidates: data?.chatbotEnabledCandidates ?? true,
        chatbotEnabledCompanies: data?.chatbotEnabledCompanies ?? true,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
