/**
 * Claude API Service (PRD-051)
 * Comunicação com a API Anthropic via proxy Vite
 */

import type { ClaudeApiRequest, ClaudeApiResponse } from '@/types/aiAnalysis';

const API_URL = '/api/anthropic/v1/messages';
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;

class ClaudeApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorType?: string,
  ) {
    super(message);
    this.name = 'ClaudeApiError';
  }
}

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

export async function callClaudeApi(
  request: ClaudeApiRequest,
): Promise<ClaudeApiResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
      await sleep(backoffMs);
    }

    try {
      const response = await fetchWithTimeout(
        API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(request),
        },
        TIMEOUT_MS,
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errorMessage =
          errorBody?.error?.message || `API returned ${response.status}`;
        const errorType = errorBody?.error?.type || 'unknown';

        if (isRetryableError(response.status) && attempt < MAX_RETRIES) {
          lastError = new ClaudeApiError(
            errorMessage,
            response.status,
            errorType,
          );
          continue;
        }

        throw new ClaudeApiError(errorMessage, response.status, errorType);
      }

      const data: ClaudeApiResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ClaudeApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = new ClaudeApiError('Timeout após 30 segundos', 0, 'timeout');
      } else {
        lastError = new ClaudeApiError(
          error instanceof Error ? error.message : 'Erro de rede',
          0,
          'network_error',
        );
      }

      if (attempt < MAX_RETRIES) continue;
    }
  }

  throw lastError || new ClaudeApiError('Falha após múltiplas tentativas');
}
