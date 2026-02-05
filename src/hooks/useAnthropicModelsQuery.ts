/**
 * Hook para buscar modelos disponíveis da API Anthropic
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAnthropicModels } from '@/lib/aiAgent/modelsService';

export function useAnthropicModels() {
  return useQuery({
    queryKey: ['anthropic-models'],
    queryFn: fetchAnthropicModels,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}
