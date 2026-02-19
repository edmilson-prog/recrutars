/**
 * useLLMConnectionTest Hook (PRD-080)
 * Mutation para testar conexão com provedores LLM via Edge Function
 */

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LLMProvider, ConnectionTestResult } from '@/types/aiAnalysis';

interface TestConnectionParams {
  provider: LLMProvider;
  apiKey: string;
  model: string;
}

async function testConnection(params: TestConnectionParams): Promise<ConnectionTestResult> {
  const { data, error } = await supabase.functions.invoke('test-llm-connection', {
    body: params,
  });

  if (error) {
    throw new Error(error.message || 'Erro ao testar conexão');
  }

  return data as ConnectionTestResult;
}

export function useLLMConnectionTest() {
  return useMutation({
    mutationFn: testConnection,
  });
}
