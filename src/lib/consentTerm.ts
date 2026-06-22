/**
 * Canonical LGPD data-sharing consent term + SHA-256 hashing helper.
 * Pure module — safe to import on client and inside Edge Functions.
 */

export const CONSENT_TERM_VERSION = '1.0';

/**
 * Canonical term text. Any change to this text MUST bump CONSENT_TERM_VERSION,
 * because the stored term_hash binds an acceptance to this exact wording.
 */
export const CONSENT_TERM_TEXT = `TERMO DE CONSENTIMENTO PARA COMPARTILHAMENTO DE DADOS PESSOAIS

Nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD), você, candidato(a), autoriza o compartilhamento dos seus dados pessoais sensíveis com a empresa responsável por esta vaga, exclusivamente para fins de condução do processo seletivo e eventual contratação.

DADOS COMPARTILHADOS
Mediante este consentimento, a empresa passará a ter acesso aos seguintes dados: CPF, e-mail, telefone, data de nascimento e endereço (cidade e estado já são públicos no processo).

FINALIDADE
Os dados serão utilizados unicamente para contato, verificação de identidade, elaboração de proposta e formalização de eventual contratação relacionada a esta candidatura específica.

SEUS DIREITOS
Você pode, a qualquer momento, revogar este consentimento, solicitar a confirmação do tratamento, o acesso, a correção ou a eliminação dos seus dados, conforme os artigos 9º e 18 da LGPD. A revogação não compromete a legalidade do tratamento realizado enquanto o consentimento esteve vigente.

VALIDADE
Este consentimento é específico para esta candidatura e empresa, sendo registrado de forma auditável (data, hora, versão do termo e identificação técnica da sessão).`;

/**
 * Compute the SHA-256 hex digest of a string using Web Crypto (crypto.subtle).
 * Returns a 64-char lowercase hex string. Works in browser and Node 20+.
 */
export async function computeTermHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
