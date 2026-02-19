/**
 * useLLMModels Hook (PRD-080)
 * Query para listar modelos disponíveis de provedores LLM via Edge Function
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LLMProvider, LLMModelInfo } from '@/types/aiAnalysis';

interface ListModelsResponse {
  models: LLMModelInfo[];
  error?: string;
}

async function fetchModels(provider: LLMProvider, apiKey: string): Promise<LLMModelInfo[]> {
  if (!apiKey) return [];

  const { data, error } = await supabase.functions.invoke('list-llm-models', {
    body: { provider, apiKey },
  });

  if (error) {
    throw new Error(error.message || 'Erro ao listar modelos');
  }

  const response = data as ListModelsResponse;
  if (response.error) {
    throw new Error(response.error);
  }

  return response.models;
}

export function useLLMModels(provider: LLMProvider, apiKey: string) {
  const queryClient = useQueryClient();
  const queryKey = ['llm-models', provider, apiKey?.slice(0, 10)] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchModels(provider, apiKey),
    enabled: !!apiKey && !apiKey.includes('••••'),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return { ...query, refresh };
}
