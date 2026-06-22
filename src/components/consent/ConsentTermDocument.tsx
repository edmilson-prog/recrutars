// src/components/consent/ConsentTermDocument.tsx
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '@/components/empresa/pdf/styles';
import { Header } from '@/components/empresa/pdf/sections/Header';
import { Footer } from '@/components/empresa/pdf/sections/Footer';
import { maskCpfPartial, maskIpPartial } from '@/lib/piiMask';
import { CONSENT_TERM_VERSION } from '@/lib/consentTerm';
import type { ConsentTermData } from './consentTermHtml';

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

export function ConsentTermDocument({ disclosure, parties }: ConsentTermData) {
  const accepted = disclosure.status === 'accepted' && !!disclosure.acceptedAt;
  const docNumber = `TC-${disclosure.id.slice(0, 8).toUpperCase()}`;
  const cpf = parties.candidateCpf ? maskCpfPartial(parties.candidateCpf) : '—';
  const ip = disclosure.ip ? maskIpPartial(disclosure.ip) : '—';
  const generatedAt = new Date().toLocaleString('pt-BR');

  return (
    <Document
      title={`Termo de Consentimento ${docNumber}`}
      author={parties.operatorName}
      subject="Termo de Consentimento LGPD"
    >
      <Page size="A4" style={empresaStyles.page}>
        <Header
          companyName={parties.companyName}
          companyLogo={parties.companyLogo ?? null}
          candidateName={parties.candidateName}
        />

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.coverTitle}>Termo de Consentimento</Text>
          <Text style={empresaStyles.paragraph}>
            Documento nº {docNumber} · Versão {CONSENT_TERM_VERSION}
          </Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>1. Partes</Text>
          <Text style={empresaStyles.paragraph}>
            Titular dos dados: {parties.candidateName} (CPF {cpf})
          </Text>
          <Text style={empresaStyles.paragraph}>
            Controladora: {parties.companyName} — vaga "{parties.jobTitle}"
          </Text>
          <Text style={empresaStyles.paragraph}>Operadora: {parties.operatorName}</Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>2. Objeto</Text>
          <Text style={empresaStyles.paragraph}>
            Autorização para que a Controladora acesse os dados pessoais do Titular, no âmbito do
            processo seletivo da vaga indicada, após aprovação da candidatura.
          </Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>3. Dados compartilhados</Text>
          {SHARED_DATA.map((d) => (
            <Text key={d} style={empresaStyles.bullet}>• {d}</Text>
          ))}
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>4. Finalidade e base legal</Text>
          <Text style={empresaStyles.paragraph}>
            Finalidade: condução do processo de contratação (contato, verificação de identidade e
            formalização). Base legal: consentimento do titular (Art. 7º, I, da Lei nº 13.709/2018 —
            LGPD).
          </Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>5. Direitos do titular</Text>
          <Text style={empresaStyles.paragraph}>
            O Titular pode revogar este consentimento a qualquer momento, hipótese em que os dados
            sensíveis voltam a ser ocultados para a Controladora. Artefatos já exportados (PDF/Excel)
            podem não ser recolhíveis.
          </Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>6. Auditoria do aceite</Text>
          {accepted ? (
            <>
              <Text style={empresaStyles.paragraph}>
                Liberado em: {formatDateBR(disclosure.acceptedAt)}
              </Text>
              <Text style={empresaStyles.paragraph}>IP de origem: {ip}</Text>
              <Text style={empresaStyles.paragraph}>
                Navegador: {disclosure.userAgent ?? '—'}
              </Text>
            </>
          ) : (
            <Text style={{ ...empresaStyles.paragraph, color: empresaColors.warning }}>
              Status: Aguardando aceite do titular.
            </Text>
          )}
          <Text style={empresaStyles.paragraph}>
            Versão do termo: {disclosure.termVersion ?? CONSENT_TERM_VERSION}
          </Text>
          <Text style={empresaStyles.paragraph}>
            Hash do conteúdo (SHA-256): {disclosure.termHash ?? '—'}
          </Text>
        </View>

        <Footer companyName={parties.companyName} generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}
