import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FunctionsHttpError } from '@supabase/supabase-js';

// Mock the Supabase client before importing the module under test.
const { invokeMock } = vi.hoisted(() => ({ invokeMock: vi.fn() }));
vi.mock('@/lib/supabase', () => ({
  supabase: { functions: { invoke: invokeMock } },
}));

import { lookupCNPJ, isValidCNPJ, formatCNPJ, maskCNPJInput } from '@/lib/cnpj';

// Valid check-digit CNPJ (SERPRO filial) — passes local validation.
const VALID_CNPJ = '33683111000280';

function httpError(status: number, body: unknown): FunctionsHttpError {
  const context = new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
  return new FunctionsHttpError(context);
}

describe('isValidCNPJ', () => {
  it('accepts a valid CNPJ', () => {
    expect(isValidCNPJ(VALID_CNPJ)).toBe(true);
  });
  it('rejects repeated digits and wrong check digits', () => {
    expect(isValidCNPJ('11111111111111')).toBe(false);
    expect(isValidCNPJ('33683111000281')).toBe(false);
  });
});

describe('formatCNPJ / maskCNPJInput', () => {
  it('formats 14 digits into the masked form', () => {
    expect(formatCNPJ(VALID_CNPJ)).toBe('33.683.111/0002-80');
  });
  it('applies progressive mask while typing', () => {
    expect(maskCNPJInput('33683111000280')).toBe('33.683.111/0002-80');
  });
});

describe('lookupCNPJ', () => {
  beforeEach(() => invokeMock.mockReset());

  it('rejects an invalid format locally without calling the Edge Function', async () => {
    const res = await lookupCNPJ('11111111111111');
    expect(res).toEqual({
      success: false,
      error: 'invalid_format',
      message: expect.any(String),
    });
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('recovers the specific code/message from a 404 FunctionsHttpError (not_found)', async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: httpError(404, {
        error: 'not_found',
        message: 'CNPJ nao encontrado na base da Receita Federal. Verifique o numero e tente novamente.',
      }),
    });

    const res = await lookupCNPJ(VALID_CNPJ);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe('not_found');
      expect(res.message).toContain('nao encontrado');
    }
  });

  it('maps a 409 FunctionsHttpError to cnpj_in_use', async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: httpError(409, { error: 'cnpj_in_use', message: 'Este CNPJ ja esta vinculado a uma conta existente.' }),
    });

    const res = await lookupCNPJ(VALID_CNPJ);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe('cnpj_in_use');
  });

  it('falls back to api_unavailable when the error body is not JSON', async () => {
    invokeMock.mockResolvedValue({ data: null, error: httpError(502, '<html>Bad Gateway</html>') });

    const res = await lookupCNPJ(VALID_CNPJ);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe('api_unavailable');
  });

  it('falls back to api_unavailable on a non-HTTP error (relay/network)', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('network down') });

    const res = await lookupCNPJ(VALID_CNPJ);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe('api_unavailable');
  });

  it('returns mapped data on a successful lookup', async () => {
    invokeMock.mockResolvedValue({
      data: { success: true, data: { cnpj: '33.683.111/0002-80', razaoSocial: 'SERPRO', codigoSituacaoCadastral: 2 } },
      error: null,
    });

    const res = await lookupCNPJ(VALID_CNPJ);
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.razaoSocial).toBe('SERPRO');
  });
});
