import { describe, it, expect } from 'vitest';
import { computeTermHash, CONSENT_TERM_VERSION, CONSENT_TERM_TEXT } from '@/lib/consentTerm';

describe('CONSENT_TERM_VERSION', () => {
  it('is the canonical version 1.0', () => {
    expect(CONSENT_TERM_VERSION).toBe('1.0');
  });
});

describe('CONSENT_TERM_TEXT', () => {
  it('is a non-empty Portuguese term mentioning the sensitive data and LGPD', () => {
    expect(CONSENT_TERM_TEXT.length).toBeGreaterThan(100);
    expect(CONSENT_TERM_TEXT).toContain('CPF');
    expect(CONSENT_TERM_TEXT).toMatch(/LGPD|consentimento/i);
  });
});

describe('computeTermHash', () => {
  it('returns a 64-char lowercase hex SHA-256 digest', async () => {
    const hash = await computeTermHash('hello');
    // Known SHA-256 of 'hello'
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('is deterministic for the same input', async () => {
    const a = await computeTermHash(CONSENT_TERM_TEXT);
    const b = await computeTermHash(CONSENT_TERM_TEXT);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs for different inputs', async () => {
    const a = await computeTermHash('a');
    const b = await computeTermHash('b');
    expect(a).not.toBe(b);
  });
});
