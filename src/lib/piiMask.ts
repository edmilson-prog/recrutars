/**
 * Partial PII masking helpers for LGPD consent display.
 * Pure functions — no Supabase, no side effects.
 */

/**
 * Mask a CPF showing only the middle blocks: '093.740.429-24' -> '***.740.429-**'.
 * Accepts formatted or raw (11-digit) input. Returns a full placeholder when
 * the input does not contain 11 digits.
 */
export function maskCpfPartial(cpf: string): string {
  const digits = (cpf ?? '').replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  const b2 = digits.slice(3, 6);
  const b3 = digits.slice(6, 9);
  return `***.${b2}.${b3}-**`;
}

/**
 * Mask an IPv4 address keeping the first two octets:
 * '187.61.10.20' -> '187.61.xx.xx'. Returns a full placeholder when the input
 * is not a 4-octet IPv4 string.
 */
export function maskIpPartial(ip: string): string {
  const parts = (ip ?? '').trim().split('.');
  if (parts.length !== 4 || parts.some((p) => p === '' || !/^\d{1,3}$/.test(p))) {
    return 'xxx.xxx.xx.xx';
  }
  return `${parts[0]}.${parts[1]}.xx.xx`;
}
