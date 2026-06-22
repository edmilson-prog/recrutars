// src/components/consent/consentTermHtml.ts
import { maskCpfPartial, maskIpPartial } from '@/lib/piiMask';
import { CONSENT_TERM_VERSION } from '@/lib/consentTerm';
import type { DataDisclosure } from '@/types/consent';

export interface ConsentTermParties {
  candidateName: string;
  candidateCpf?: string;
  companyName: string;
  companyLogo?: string | null;
  jobTitle: string;
  operatorName: string;
}

export interface ConsentTermData {
  disclosure: DataDisclosure;
  parties: ConsentTermParties;
}

const SHARED_DATA = ['CPF', 'E-mail', 'Telefone', 'Data de nascimento', 'Endereço'];

function formatDateBR(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildConsentTermHtml(data: ConsentTermData): string {
  const { disclosure, parties } = data;
  const accepted = disclosure.status === 'accepted' && !!disclosure.acceptedAt;
  const docNumber = `TC-${disclosure.id.slice(0, 8).toUpperCase()}`;
  const cpf = parties.candidateCpf ? maskCpfPartial(parties.candidateCpf) : '—';
  const ip = disclosure.ip ? maskIpPartial(disclosure.ip) : '—';
  const userAgent = disclosure.userAgent ?? '—';

  const auditBlock = accepted
    ? `
      <p><strong>Liberado em:</strong> ${escapeHtml(formatDateBR(disclosure.acceptedAt))}</p>
      <p><strong>IP de origem:</strong> ${escapeHtml(ip)}</p>
      <p><strong>Navegador:</strong> ${escapeHtml(userAgent)}</p>
    `
    : `<p><strong>Status:</strong> Aguardando aceite do titular.</p>`;

  const dataItems = SHARED_DATA.map((d) => `<li>${escapeHtml(d)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<title>Termo de Consentimento ${escapeHtml(docNumber)}</title>
<style>
  body { font-family: 'Roboto Mono', monospace; color: #1E293B; max-width: 720px; margin: 32px auto; padding: 0 24px; line-height: 1.6; }
  h1 { font-size: 20px; color: #0F172A; }
  h2 { font-size: 14px; color: #0F172A; border-bottom: 2px solid #06B6D4; padding-bottom: 4px; margin-top: 24px; }
  .muted { color: #64748B; font-size: 12px; }
  .badge { display: inline-block; background: #F1F5F9; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  @media print { body { margin: 0; } }
</style></head>
<body>
  <h1>Termo de Consentimento para Compartilhamento de Dados Pessoais</h1>
  <p class="muted">Documento nº <strong>${escapeHtml(docNumber)}</strong> ·
     Versão <span data-testid="term-version" class="badge">${escapeHtml(CONSENT_TERM_VERSION)}</span></p>

  <h2>1. Partes</h2>
  <p><strong>Titular dos dados:</strong> ${escapeHtml(parties.candidateName)} (CPF ${escapeHtml(cpf)})</p>
  <p><strong>Controladora:</strong> ${escapeHtml(parties.companyName)} — vaga "${escapeHtml(parties.jobTitle)}"</p>
  <p><strong>Operadora:</strong> ${escapeHtml(parties.operatorName)}</p>

  <h2>2. Objeto</h2>
  <p>Autorização para que a Controladora acesse os dados pessoais do Titular,
     no âmbito do processo seletivo da vaga indicada, após aprovação da candidatura.</p>

  <h2>3. Dados compartilhados</h2>
  <ul>${dataItems}</ul>

  <h2>4. Finalidade e base legal</h2>
  <p>Finalidade: condução do processo de contratação (contato, verificação de identidade e formalização).
     Base legal: consentimento do titular (Art. 7º, I, da Lei nº 13.709/2018 — LGPD).</p>

  <h2>5. Direitos do titular</h2>
  <p>O Titular pode revogar este consentimento a qualquer momento, hipótese em que os dados sensíveis
     voltam a ser ocultados para a Controladora. Artefatos já exportados (PDF/Excel) podem não ser
     recolhíveis. O Titular pode solicitar a impressão deste termo a qualquer tempo.</p>

  <h2>6. Auditoria do aceite</h2>
  ${auditBlock}
  <p><strong>Versão do termo:</strong> ${escapeHtml(disclosure.termVersion ?? CONSENT_TERM_VERSION)}</p>
  <p><strong>Hash do conteúdo (SHA-256):</strong> ${escapeHtml(disclosure.termHash ?? '—')}</p>

  <p class="muted">Gerado em ${escapeHtml(formatDateBR(new Date().toISOString()))}.</p>
</body></html>`;
}

export function printConsentTermHtml(data: ConsentTermData): void {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
  if (!win) return;
  win.document.open();
  win.document.write(buildConsentTermHtml(data));
  win.document.close();
  win.focus();
  win.print();
}
