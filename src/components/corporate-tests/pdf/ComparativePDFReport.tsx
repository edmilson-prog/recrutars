/**
 * Comparative PDF Report
 * PRD-054: Relatório PDF comparativo
 */

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFCoverPage } from './PDFCoverPage';
import { PDFRadarImage } from './PDFRadarImage';
import type { CompanyTestResult, CompanyTest } from '@/types/companyTest';
import { getFitScoreLabel } from '@/utils/fitScore';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937' },
  header: { marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#0891b2' },
  meta: { fontSize: 9, color: '#9ca3af' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  // Table styles
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', paddingVertical: 4 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#0891b2', paddingBottom: 6, marginBottom: 4 },
  tableCellDim: { width: 100, fontSize: 9, fontWeight: 'bold', color: '#374151' },
  tableCellScore: { flex: 1, fontSize: 9, textAlign: 'center' },
  // Ranking
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb' },
  rankNumber: { width: 25, fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: '#0891b2' },
  rankName: { flex: 1, fontSize: 10, fontWeight: 'bold' },
  rankArchetype: { width: 100, fontSize: 9, color: '#6b7280' },
  rankScore: { width: 60, fontSize: 11, fontWeight: 'bold', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#9ca3af' },
  watermark: { position: 'absolute', top: 15, right: 30, fontSize: 8, color: '#ef4444' },
});

const DIMENSIONS = ['D1', 'D2', 'D3', 'D4', 'D5'] as const;
const DIM_LABELS = { D1: 'Dominância', D2: 'Sociabilidade', D3: 'Ritmo', D4: 'Conformidade', D5: 'Relacional' };

interface ComparativePDFReportProps {
  results: CompanyTestResult[];
  test: CompanyTest;
}

function getScoreColor(score: number): string {
  if (score >= 67) return '#16a34a';
  if (score >= 34) return '#ca8a04';
  return '#dc2626';
}

export function ComparativePDFReport({ results, test }: ComparativePDFReportProps) {
  const date = new Date().toLocaleDateString('pt-BR');
  const ranked = [...results].sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));

  return (
    <Document>
      {/* Cover */}
      <PDFCoverPage testName={test.name} date={date} type="comparative" />

      {/* Page 2: Table + Ranking */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>CONFIDENCIAL</Text>
        <View style={styles.header}>
          <Text style={styles.title}>Comparativo de Candidatos</Text>
          <Text style={styles.subtitle}>{test.name}</Text>
          <Text style={styles.meta}>{results.length} candidatos · Gerado em {date}</Text>
        </View>

        {/* Score Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores por Dimensão</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellDim}>Dimensão</Text>
            {results.map(r => (
              <Text key={r.id} style={[styles.tableCellScore, { fontWeight: 'bold' }]}>
                {r.candidateName.split(' ')[0]}
              </Text>
            ))}
          </View>
          {DIMENSIONS.map(dim => (
            <View key={dim} style={styles.tableRow}>
              <Text style={styles.tableCellDim}>{dim} - {DIM_LABELS[dim]}</Text>
              {results.map(r => (
                <Text key={r.id} style={[styles.tableCellScore, { color: getScoreColor(r.scores[dim]) }]}>
                  {r.scores[dim]}
                </Text>
              ))}
            </View>
          ))}
          {/* Fit Score Row */}
          <View style={[styles.tableRow, { borderBottomWidth: 0, marginTop: 4 }]}>
            <Text style={[styles.tableCellDim, { fontWeight: 'bold' }]}>Fit Score</Text>
            {results.map(r => (
              <Text key={r.id} style={[styles.tableCellScore, { fontWeight: 'bold', fontSize: 11 }]}>
                {r.fitScore?.toFixed(1) || '—'}%
              </Text>
            ))}
          </View>
        </View>

        {/* Ranking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ranking de Compatibilidade</Text>
          {ranked.map((r, i) => (
            <View key={r.id} style={styles.rankRow}>
              <Text style={styles.rankNumber}>#{i + 1}</Text>
              <Text style={styles.rankName}>{r.candidateName}</Text>
              <Text style={styles.rankArchetype}>{r.archetype.name}</Text>
              <Text style={[styles.rankScore, { color: getScoreColor(r.fitScore || 0) }]}>
                {r.fitScore?.toFixed(1) || '—'}%
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>RecrutaRS · Documento confidencial · Gerado em {date}</Text>
          <Text>Página 2 de 2</Text>
        </View>
      </Page>
    </Document>
  );
}
