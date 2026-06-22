// src/components/corporate-tests/LGPDReportPdf.tsx
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '@/components/empresa/pdf/styles';
import { Footer } from '@/components/empresa/pdf/sections/Footer';
import { getActionLabel } from '@/utils/auditLog';
import type { AuditLog } from '@/types/companyTest';

interface LGPDReportPdfProps {
  companyName: string;
  companyLogo: string | null;
  candidateName: string;
  logs: AuditLog[];
  generatedAt: string;
}

export function LGPDReportPdf({
  companyName,
  companyLogo,
  candidateName,
  logs,
  generatedAt,
}: LGPDReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={empresaStyles.page}>
        <View style={{ marginBottom: 16 }}>
          {companyLogo ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
              {companyName}
            </Text>
          ) : (
            <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
              {companyName}
            </Text>
          )}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
            Relatório de Conformidade LGPD
          </Text>
          <Text style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>
            Candidato consultado: {candidateName}
          </Text>
          <Text style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
            {logs.length} registro(s) de acesso a dados
          </Text>
        </View>

        <View style={{ borderTop: '1pt solid #e2e8f0', paddingTop: 8 }}>
          {logs.length === 0 ? (
            <Text style={{ fontSize: 10, color: '#64748b' }}>
              Nenhum registro encontrado.
            </Text>
          ) : (
            logs.map((log) => (
              <View
                key={log.id}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 6,
                  borderBottom: '0.5pt solid #f1f5f9',
                }}
              >
                <Text style={{ width: '28%', fontSize: 9, color: '#475569' }}>
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </Text>
                <Text style={{ width: '24%', fontSize: 9, color: '#0f172a' }}>
                  {getActionLabel(log.action)}
                </Text>
                <Text style={{ width: '22%', fontSize: 9, color: '#334155' }}>
                  {log.userName || '—'}
                </Text>
                <Text style={{ width: '26%', fontSize: 9, color: '#64748b' }}>
                  {log.details || '—'}
                </Text>
              </View>
            ))
          )}
        </View>

        <Footer companyName={companyName} generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}
