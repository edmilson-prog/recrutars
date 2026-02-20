/**
 * LLM API Service (PRD-051 + PRD-080)
 * Suporte multi-provider: Anthropic, OpenAI, OpenRouter
 */

import type { ClaudeApiRequest, ClaudeApiResponse } from '@/types/aiAnalysis';
import type { LLMProvider } from '@/types/aiAnalysis';

// --- Constants ---

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;

// --- Provider Configuration Map ---

interface ProviderConfig {
  url: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
  buildBody: (request: ClaudeApiRequest) => Record<string, unknown>;
  normalizeResponse: (raw: unknown) => ClaudeApiResponse;
}

const PROVIDER_CONFIGS: Record<LLMProvider, ProviderConfig> = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    buildHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    buildBody: (request: ClaudeApiRequest) => request,
    normalizeResponse: (raw: unknown) => raw as ClaudeApiResponse,
  },

  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    buildHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (request: ClaudeApiRequest) => ({
      model: request.model,
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      messages: [
        { role: 'system', content: request.system },
        ...request.messages,
      ],
    }),
    normalizeResponse: (raw: unknown) => {
      const r = raw as {
        id: string;
        choices: Array<{ message: { content: string } }>;
        model: string;
        usage: { prompt_tokens: number; completion_tokens: number };
      };
      return {
        id: r.id,
        type: 'message' as const,
        role: 'assistant' as const,
        content: [{ type: 'text' as const, text: r.choices[0]?.message?.content ?? '' }],
        model: r.model,
        usage: {
          input_tokens: r.usage.prompt_tokens,
          output_tokens: r.usage.completion_tokens,
        },
      };
    },
  },

  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    buildHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'RecrutaRS',
    }),
    buildBody: (request: ClaudeApiRequest) => ({
      model: request.model,
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      messages: [
        { role: 'system', content: request.system },
        ...request.messages,
      ],
    }),
    normalizeResponse: (raw: unknown) => {
      const r = raw as {
        id: string;
        choices: Array<{ message: { content: string } }>;
        model: string;
        usage: { prompt_tokens: number; completion_tokens: number };
      };
      return {
        id: r.id,
        type: 'message' as const,
        role: 'assistant' as const,
        content: [{ type: 'text' as const, text: r.choices[0]?.message?.content ?? '' }],
        model: r.model,
        usage: {
          input_tokens: r.usage.prompt_tokens,
          output_tokens: r.usage.completion_tokens,
        },
      };
    },
  },
};

// --- Error Class ---

export class LLMApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorType?: string,
  ) {
    super(message);
    this.name = 'LLMApiError';
  }
}

// --- Utilities ---

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function isRetryableError(statusCode: number): boolean {
  return statusCode === 429 || statusCode >= 500;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Main Function ---

export async function callLLMApi(
  request: ClaudeApiRequest,
  apiKey: string,
  provider: LLMProvider = 'anthropic',
): Promise<ClaudeApiResponse> {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) {
    throw new LLMApiError(`Provedor não suportado: ${provider}`, 0, 'invalid_provider');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
      await sleep(backoffMs);
    }

    try {
      const response = await fetchWithTimeout(
        config.url,
        {
          method: 'POST',
          headers: config.buildHeaders(apiKey),
          body: JSON.stringify(config.buildBody(request)),
        },
        TIMEOUT_MS,
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errorMessage =
          errorBody?.error?.message || `API returned ${response.status}`;
        const errorType = errorBody?.error?.type || 'unknown';

        if (isRetryableError(response.status) && attempt < MAX_RETRIES) {
          lastError = new LLMApiError(
            errorMessage,
            response.status,
            errorType,
          );
          continue;
        }

        throw new LLMApiError(errorMessage, response.status, errorType);
      }

      const data = await response.json();
      return config.normalizeResponse(data);
    } catch (error) {
      if (error instanceof LLMApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = new LLMApiError('Timeout após 30 segundos', 0, 'timeout');
      } else {
        lastError = new LLMApiError(
          error instanceof Error ? error.message : 'Erro de rede',
          0,
          'network_error',
        );
      }

      if (attempt < MAX_RETRIES) continue;
    }
  }

  throw lastError || new LLMApiError('Falha após múltiplas tentativas');
}

/** @deprecated Use callLLMApi */
export const callClaudeApi = callLLMApi;
