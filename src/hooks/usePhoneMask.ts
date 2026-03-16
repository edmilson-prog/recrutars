/**
 * Phone Mask Hook
 * Pure formatting logic for Brazilian phone numbers.
 * Works with raw digit strings — no state management.
 */

// Strip everything except digits
export function stripToDigits(input: string): string {
  return input.replace(/\D/g, '');
}

// Format raw national digits with Brazilian mask
// Mobile (11 digits, 3rd digit is 9): (XX) XXXXX-XXXX
// Landline (10 digits): (XX) XXXX-XXXX
export function formatBrazilianPhone(nationalDigits: string): string {
  const d = nationalDigits.slice(0, 11); // max 11 national digits
  if (d.length <= 2) return d.length > 0 ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  // Check if mobile (3rd digit is 9 and total >= 11)
  if (d.length >= 7 && d[2] === '9') {
    // Mobile: (XX) XXXXX-XXXX
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  // Landline: (XX) XXXX-XXXX
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

// Check if phone number has enough digits to be complete
export function isPhoneComplete(rawDigits: string, countryCode: string): boolean {
  if (countryCode === '55') {
    // Remove country code if present at start
    const national = rawDigits.startsWith('55') ? rawDigits.slice(2) : rawDigits;
    return national.length >= 10 && national.length <= 11;
  }
  // Generic: at least 7 digits for international
  const national = rawDigits.startsWith(countryCode) ? rawDigits.slice(countryCode.length) : rawDigits;
  return national.length >= 7;
}

// Extract national digits (without country code)
export function getNationalDigits(rawDigits: string, countryCode: string): string {
  if (rawDigits.startsWith(countryCode)) {
    return rawDigits.slice(countryCode.length);
  }
  return rawDigits;
}

// Build full international number from parts
export function buildFullNumber(nationalDigits: string, countryCode: string): string {
  return countryCode + nationalDigits;
}
