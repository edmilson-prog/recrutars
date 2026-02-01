/**
 * Individual PDF Report
 * PRD-054: Relatório PDF individual (3 páginas)
 */

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFCoverPage } from './PDFCoverPage';
import { PDFDimensionBars } from './PDFDimensionBars';
import { PDFRadarImage } from './PDFRadarImage';
import type { CompanyTestResult, CompanyTest } from '@/types/companyTest';
import { getFitScoreLabel } from '@/utils/fitScore';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937' },
  header: { marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#0891b2', marginBottom: 2 },
  meta: { fontSize: 9, color: '#9ca3af' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 20 },
  col: { flex: 1 },
  text: { fontSize: 10, lineHeight: 1.5, color: '#374151' },
  badge: { fontSize: 9, color: '#0891b2', fontWeight: 'bold' },
  fitScore: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  fitLabel: { fontSize: 10, textAlign: 'center', color: '#6b7280' },
  listItem: { fontSize: 10, marginBottom: 3, paddingLeft: 10 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#9ca3af' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  aiBadge: { fontSize: 8, color: '#7c3aed', backgroundColor: '#ede9fe', padding: '2 4', borderRadius: 3 },
  watermark: { position: 'absolute', top: 15, right: 30, fontSize: 8, color: '#ef4444' },
});

interface IndividualPDFReportProps {
  result: CompanyTestResult;
  test: CompanyTest;
}

export function IndividualPDFReport({ result, test }: IndividualPDFReportProps) {
  const date = new Date().toLocaleDateString('pt-BR');

  return (
    <Document>
      {/* Page 1: Cover */}
      <PDFCoverPage
        testName={test.name}
        candidateName={result.candidateName}
        date={date}
        type="individual"
      />

      {/* Page 2: Overview - Radar + Bars + Fit Score */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>CONFIDENCIAL</Text>
        <View style={styles.header}>
          <Text style={styles.title}>{result.candidateName}</Text>
          <Text style={styles.subtitle}>{test.name}</Text>
          <Text style={styles.meta}>Arquétipo: {result.archetype.name} · Concluído em {new Date(result.completedAt).toLocaleDateString('pt-BR')}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Perfil Gauge-Pro</Text>
            <PDFRadarImage scores={result.scores} idealWeights={test.weights} size={180} />
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Scores por Dimensão</Text>
            <PDFDimensionBars scores={result.scores} />
            {result.fitScore !== undefined && result.fitClassification && (
              <View style={{ marginTop: 15 }}>
                <Text style={styles.sectionTitle}>Score de Fit</Text>
                <Text style={[styles.fitScore, { color: result.fitScore >= 60 ? '#16a34a' : '#ca8a04' }]}>
                  {result.fitScore.toFixed(1)}%
                </Text>
                <Text style={styles.fitLabel}>
                  {getFitScoreLabel(result.fitClassification)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Arquétipo: {result.archetype.name}</Text>
          <Text style={styles.text}>{result.archetype.description}</Text>
        </View>

        <View style={styles.footer}>
          <Text>RecrutaRS · Gerado em {date}</Text>
          <Text>Página 2 de 3</Text>
        </View>
      </Page>

      {/* Page 3: Detailed Analysis */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>CONFIDENCIAL</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Principais Forças</Text>
            {result.strengths.map((s, i) => (
              <Text key={i} style={styles.listItem}>• {s}</Text>
            ))}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Áreas de Desenvolvimento</Text>
            {result.developmentAreas.map((d, i) => (
              <Text key={i} style={styles.listItem}>• {d}</Text>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Estilo de Trabalho</Text>
          <Text style={styles.text}>{result.archetype.workStyle}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Estilo de Comunicação</Text>
          <Text style={styles.text}>{result.archetype.communicationStyle}</Text>
        </View>

        {result.aiAnalysis && (
          <View style={{ marginTop: 15 }}>
            <View style={styles.aiHeader}>
              <Text style={styles.sectionTitle}>Análise Inteligente</Text>
              <Text style={styles.aiBadge}>Gerado por IA</Text>
            </View>
            <Text style={styles.text}>{result.aiAnalysis}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>RecrutaRS · Documento confidencial · Gerado em {date}</Text>
          <Text>Página 3 de 3</Text>
        </View>
      </Page>
    </Document>
  );
}
