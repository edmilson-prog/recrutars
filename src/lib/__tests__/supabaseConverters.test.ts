import { describe, it, expect } from 'vitest';
import { candidateRowToCandidate } from '@/lib/supabaseConverters';

// Minimal masked row as the company-facing view returns it:
// sensitive columns come back as null when there is no accepted disclosure.
const maskedRow = {
  id: 'cand-1',
  profile_id: 'prof-1',
  name: 'MARIA OLIVEIRA',
  email: null,
  avatar_url: null,
  title: 'Desenvolvedora',
  location: 'São Paulo, SP',
  experience_years: 5,
  education: 'Superior',
  skills: ['react'],
  salary_min: 3000,
  salary_max: 6000,
  availability: 'imediata',
  profile_completion: 80,
  has_test: false,
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  deactivated_at: null,
  phone: null,
  cpf: null,
  linkedin: null,
  about: null,
  plan: null,
  date_of_birth: null,
  visibility_mode: null,
  anonymous_id: null,
  display_name: null,
  city: 'São Paulo',
  state: 'SP',
  open_to_relocation: null,
} as never;

describe('candidateRowToCandidate — masked (no consent) row', () => {
  const c = candidateRowToCandidate(maskedRow);

  it('keeps name and city/state visible', () => {
    expect(c.name).toBe('MARIA OLIVEIRA');
    expect(c.city).toBe('São Paulo');
    expect(c.state).toBe('SP');
    expect(c.location).toBe('São Paulo, SP');
  });

  it('maps masked sensitive columns to undefined (not null)', () => {
    expect(c.email).toBeUndefined();
    expect(c.phone).toBeUndefined();
    expect(c.cpf).toBeUndefined();
    expect(c.dateOfBirth).toBeUndefined();
  });

  it('never yields the literal null for email/phone', () => {
    expect(c.email).not.toBeNull();
    expect(c.phone).not.toBeNull();
  });
});

describe('candidateRowToCandidate — full (consented) row', () => {
  it('passes through revealed sensitive fields', () => {
    const full = candidateRowToCandidate({
      ...(maskedRow as object),
      email: 'maria@email.com',
      phone: '11999998888',
      cpf: '09374042924',
      date_of_birth: '1990-05-10',
    } as never);
    expect(full.email).toBe('maria@email.com');
    expect(full.phone).toBe('11999998888');
    expect(full.cpf).toBe('09374042924');
    expect(full.dateOfBirth).toBe('1990-05-10');
  });
});
