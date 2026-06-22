// src/components/consent/consentTermHtml.test.ts
import { describe, it, expect } from 'vitest';
import { buildConsentTermHtml, type ConsentTermData } from './consentTermHtml';
import { CONSENT_TERM_VERSION } from '@/lib/consentTerm';

const base: ConsentTermData = {
  disclosure: {
    id: 'd1',
    applicationId: 'app1',
    candidateId: 'cand1',
    companyId: 'comp1',
    status: 'accepted',
    termVersion: CONSENT_TERM_VERSION,
    termHash: 'abc123hashvalue',
    acceptedAt: '2026-06-21T13:45:00.000Z',
    ip: '187.61.10.20',
    createdAt: '2026-06-20T10:00:00.000Z',
  } as ConsentTermData['disclosure'],
  parties: {
    candidateName: 'João Santos',
    candidateCpf: '093.740.429-24',
    companyName: 'Tech Solutions',
    companyLogo: null,
    jobTitle: 'Desenvolvedor Backend',
    operatorName: 'RecrutaRS',
  },
};

describe('buildConsentTermHtml', () => {
  it('inclui a versão do termo', () => {
    const html = buildConsentTermHtml(base);
    expect(html).toContain(`data-testid="term-version"`);
    expect(html).toContain(CONSENT_TERM_VERSION);
  });

  it('mascara o IP e mostra "Liberado em" quando aceito', () => {
    const html = buildConsentTermHtml(base);
    expect(html).toContain('187.61.xx.xx');
    expect(html).toContain('Liberado em');
  });

  it('mascara o CPF de forma parcial', () => {
    const html = buildConsentTermHtml(base);
    expect(html).toContain('***.740.429-**');
    expect(html).not.toContain('093.740.429-24');
  });

  it('mostra "Aguardando aceite" quando pendente', () => {
    const pending: ConsentTermData = {
      ...base,
      disclosure: { ...base.disclosure, status: 'pending', acceptedAt: undefined, ip: undefined },
    };
    const html = buildConsentTermHtml(pending);
    expect(html).toContain('Aguardando aceite');
    expect(html).not.toContain('Liberado em');
  });
});
