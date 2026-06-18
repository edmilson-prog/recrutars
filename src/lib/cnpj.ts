/**
 * CNPJ Utilities
 * PRD-078: Cadastro de Empresa com CNPJ via Minha Receita (v1.16.0)
 */

import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

// ── Types ──

export interface CnpjLookupData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  displayName: string;
  situacaoCadastral: string;
  codigoSituacaoCadastral: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  city: string;
  state: string;
  address: string;
  industry: string;
  size: string;
  porte: string;
}

export interface CnpjLookupSuccess {
  success: true;
  data: CnpjLookupData;
}

export interface CnpjLookupError {
  success: false;
  error: 'invalid_format' | 'cnpj_in_use' | 'not_found' | 'api_unavailable' | 'internal_error' | 'missing_cnpj';
  message: string;
}

export type CnpjLookupResult = CnpjLookupSuccess | CnpjLookupError;

// ── Format / Strip ──

/**
 * Format raw digits into CNPJ display format: XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length !== 14) return value;
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5',
  );
}

/**
 * Strip formatting, keeping only digits.
 */
export function stripCNPJ(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Progressive input mask — applies dots/slash/dash as user types.
 */
export function maskCNPJInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  let masked = digits;
  if (digits.length > 2) masked = digits.slice(0, 2) + '.' + digits.slice(2);
  if (digits.length > 5) masked = masked.slice(0, 6) + '.' + digits.slice(5);
  if (digits.length > 8) masked = masked.slice(0, 10) + '/' + digits.slice(8);
  if (digits.length > 12) masked = masked.slice(0, 15) + '-' + digits.slice(12);
  return masked;
}

// ── Validation ──

/**
 * Validate CNPJ format + check digits (no API call).
 */
export function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[12]) !== digit1) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[13]) !== digit2) return false;

  return true;
}

// ── API Lookup ──

/**
 * Call the cnpj-lookup Edge Function.
 * Handles: validation, uniqueness check, API call, mapping.
 */
export async function lookupCNPJ(cnpj: string): Promise<CnpjLookupResult> {
  const digits = stripCNPJ(cnpj);

  // Local validation first (avoid unnecessary API call)
  if (!isValidCNPJ(digits)) {
    return {
      success: false,
      error: 'invalid_format',
      message: 'CNPJ com formato invalido. Verifique os digitos.',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('cnpj-lookup', {
      body: { cnpj: digits },
    });

    if (error) {
      // The Edge Function signals business errors (not_found, cnpj_in_use,
      // invalid_format, api_unavailable) via non-2xx HTTP status. supabase-js
      // surfaces those as FunctionsHttpError carrying the original Response in
      // `context`, leaving `data` null — so the specific code/message must be
      // recovered from the response body here, otherwise every error collapses
      // into a generic "tente novamente" message.
      if (error instanceof FunctionsHttpError) {
        try {
          const body = await error.context.json();
          if (body?.error) {
            return {
              success: false,
              error: body.error as CnpjLookupError['error'],
              message: body.message || 'Erro ao consultar o CNPJ. Tente novamente.',
            };
          }
        } catch {
          // Body was not JSON — fall through to the generic message below
        }
      }

      return {
        success: false,
        error: 'api_unavailable',
        message: 'Erro ao consultar o CNPJ. Tente novamente.',
      };
    }

    // Success
    if (data?.success && data?.data) {
      return {
        success: true,
        data: data.data as CnpjLookupData,
      };
    }

    return {
      success: false,
      error: 'internal_error',
      message: 'Resposta inesperada do servico de consulta.',
    };
  } catch {
    return {
      success: false,
      error: 'api_unavailable',
      message: 'Erro de conexao ao consultar o CNPJ. Tente novamente.',
    };
  }
}
