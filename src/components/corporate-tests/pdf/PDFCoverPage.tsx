/**
 * PDF Cover Page
 * PRD-054: Capa do relatório
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#1e293b',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  testName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 8,
    textAlign: 'center',
  },
  candidateName: {
    fontSize: 18,
    color: '#e2e8f0',
    marginBottom: 4,
    textAlign: 'center',
  },
  meta: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    fontSize: 9,
    color: '#475569',
  },
  confidential: {
    position: 'absolute',
    top: 40,
    right: 40,
    fontSize: 10,
    color: '#ef4444',
    fontWeight: 'bold',
  },
});

interface PDFCoverPageProps {
  testName: string;
  candidateName?: string;
  companyName?: string;
  date: string;
  type: 'individual' | 'comparative';
}

export function PDFCoverPage({ testName, candidateName, companyName, date, type }: PDFCoverPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.confidential}>CONFIDENCIAL</Text>
      <View style={styles.container}>
        <Text style={styles.title}>RecrutaRS</Text>
        <Text style={styles.subtitle}>
          {type === 'individual' ? 'Relatório Individual' : 'Relatório Comparativo'}
        </Text>
        <Text style={styles.testName}>{testName}</Text>
        {candidateName && <Text style={styles.candidateName}>{candidateName}</Text>}
        {companyName && <Text style={styles.meta}>{companyName}</Text>}
        <Text style={styles.meta}>Gerado em {date}</Text>
      </View>
      <Text style={styles.watermark}>
        Gerado por RecrutaRS · Documento confidencial
      </Text>
    </Page>
  );
}
