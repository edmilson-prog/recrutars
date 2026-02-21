/**
 * CPF Utilities
 * PRD-083: Candidate Registration with CPF validation (v1.27.0)
 * Mirrors the pattern from src/lib/cnpj.ts
 */

import { supabase } from '@/lib/supabase';

// ── Format / Strip ──

/**
 * Strip formatting, keeping only digits.
 */
export function stripCPF(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Format raw digits into CPF display format: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const digits = stripCPF(value).slice(0, 11);
  if (digits.length !== 11) return value;
  return digits.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4',
  );
}

/**
 * Progressive input mask — applies dots/dash as user types.
 */
export function maskCPFInput(value: string): string {
  const digits = stripCPF(value).slice(0, 11);
  let masked = digits;
  if (digits.length > 3) masked = digits.slice(0, 3) + '.' + digits.slice(3);
  if (digits.length > 6) masked = masked.slice(0, 7) + '.' + digits.slice(6);
  if (digits.length > 9) masked = masked.slice(0, 11) + '-' + digits.slice(9);
  return masked;
}

// ── Validation ──

/**
 * Validate CPF format + check digits (no API call).
 */
export function isValidCPF(cpf: string): boolean {
  const digits = stripCPF(cpf);
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (parseInt(digits[9]) !== remainder) return false;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (parseInt(digits[10]) !== remainder) return false;

  return true;
}

// ── Uniqueness Check ──

/**
 * Check if a CPF already exists in the database via RPC.
 * Uses SECURITY DEFINER function that bypasses RLS.
 */
export async function checkCPFExists(cpf: string): Promise<boolean> {
  const digits = stripCPF(cpf);
  const { data, error } = await supabase.rpc('check_cpf_exists', { p_cpf: digits });

  if (error) {
    console.error('Error checking CPF:', error.message);
    return false;
  }

  return data === true;
}
