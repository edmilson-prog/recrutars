/**
 * Culture PDF Report
 * PRD-057: Relatório PDF de cultura organizacional.
 */

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';
import { DIMENSION_NAMES } from '@/types/gaugePro';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#0891b2',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#0891b2',
    marginBottom: 2,
  },
  meta: {
    fontSize: 9,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  // DNA Table
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#0891b2',
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
  },
  tableCellDim: {
    width: 60,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  tableCellName: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
  tableCellScore: {
    width: 60,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  // Manifesto
  manifestoText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
    textAlign: 'justify',
  },
  // Evolution
  evolutionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  evolutionDim: {
    width: 100,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  evolutionScore: {
    width: 60,
    fontSize: 9,
    textAlign: 'center',
  },
  evolutionDelta: {
    width: 60,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Coverage
  coverageRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  coverageBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    alignItems: 'center',
  },
  coverageLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 4,
  },
  coverageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  coverageSubvalue: {
    fontSize: 10,
    color: '#0891b2',
    fontWeight: 'bold',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
  watermark: {
    position: 'absolute',
    top: 15,
    right: 30,
    fontSize: 8,
    color: '#ef4444',
  },
});

interface CulturePDFReportProps {
  companyName: string;
  dnaScores: DimensionScores;
  manifesto: string;
  snapshots: Array<{
    date: string;
    dnaScores: DimensionScores;
    totalMembers: number;
    mappedMembers: number;
  }>;
  totalMembers: number;
  mappedMembers: number;
}

function getScoreColor(score: number): string {
  if (score >= 67) return '#16a34a';
  if (score >= 34) return '#ca8a04';
  return '#dc2626';
}

function getDeltaColor(delta: number): string {
  if (delta > 0) return '#16a34a';
  if (delta < 0) return '#dc2626';
  return '#6b7280';
}

export function CulturePDFReport({
  companyName,
  dnaScores,
  manifesto,
  snapshots,
  totalMembers,
  mappedMembers,
}: CulturePDFReportProps) {
  const date = new Date().toLocaleDateString('pt-BR');
  const coveragePercent = totalMembers > 0 ? ((mappedMembers / totalMembers) * 100).toFixed(1) : '0';

  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const oldest = sortedSnapshots[0];
  const newest = sortedSnapshots[sortedSnapshots.length - 1];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>CONFIDENCIAL</Text>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatorio de Cultura Organizacional</Text>
          <Text style={styles.subtitle}>{companyName}</Text>
          <Text style={styles.meta}>Gerado em {date}</Text>
        </View>

        {/* Section: DNA Cultural */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DNA Cultural</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellDim, styles.tableCellHeader]}>Dim.</Text>
            <Text style={[styles.tableCellName, styles.tableCellHeader]}>Dimensao</Text>
            <Text style={[styles.tableCellScore, styles.tableCellHeader]}>Score</Text>
          </View>

          {DIMENSIONS.map((dim) => (
            <View key={dim} style={styles.tableRow}>
              <Text style={styles.tableCellDim}>{dim}</Text>
              <Text style={styles.tableCellName}>{DIMENSION_NAMES[dim]}</Text>
              <Text style={[styles.tableCellScore, { color: getScoreColor(dnaScores[dim]) }]}>
                {dnaScores[dim]}
              </Text>
            </View>
          ))}
        </View>

        {/* Section: Manifesto Cultural */}
        {manifesto && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manifesto Cultural</Text>
            <Text style={styles.manifestoText}>{manifesto}</Text>
          </View>
        )}

        {/* Section: Evolution */}
        {oldest && newest && sortedSnapshots.length >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evolucao Cultural</Text>
            <Text style={[styles.meta, { marginBottom: 6 }]}>
              Comparacao: {new Date(oldest.date).toLocaleDateString('pt-BR')} vs{' '}
              {new Date(newest.date).toLocaleDateString('pt-BR')}
            </Text>

            {/* Column headers */}
            <View style={[styles.evolutionRow, { borderBottomWidth: 1, borderBottomColor: '#0891b2' }]}>
              <Text style={[styles.evolutionDim, { fontSize: 8, fontWeight: 'bold' }]}>Dimensao</Text>
              <Text style={[styles.evolutionScore, { fontSize: 8, fontWeight: 'bold' }]}>Anterior</Text>
              <Text style={[styles.evolutionScore, { fontSize: 8, fontWeight: 'bold' }]}>Atual</Text>
              <Text style={[styles.evolutionDelta, { fontSize: 8 }]}>Delta</Text>
            </View>

            {DIMENSIONS.map((dim) => {
              const oldScore = oldest.dnaScores[dim];
              const newScore = newest.dnaScores[dim];
              const delta = newScore - oldScore;
              return (
                <View key={dim} style={styles.evolutionRow}>
                  <Text style={styles.evolutionDim}>
                    {dim} - {DIMENSION_NAMES[dim]}
                  </Text>
                  <Text style={[styles.evolutionScore, { color: getScoreColor(oldScore) }]}>
                    {oldScore}
                  </Text>
                  <Text style={[styles.evolutionScore, { color: getScoreColor(newScore) }]}>
                    {newScore}
                  </Text>
                  <Text style={[styles.evolutionDelta, { color: getDeltaColor(delta) }]}>
                    {delta > 0 ? `+${delta}` : delta}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Section: Coverage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cobertura</Text>
          <View style={styles.coverageRow}>
            <View style={styles.coverageBox}>
              <Text style={styles.coverageLabel}>Total de Colaboradores</Text>
              <Text style={styles.coverageValue}>{totalMembers}</Text>
            </View>
            <View style={styles.coverageBox}>
              <Text style={styles.coverageLabel}>Mapeados</Text>
              <Text style={styles.coverageValue}>{mappedMembers}</Text>
            </View>
            <View style={styles.coverageBox}>
              <Text style={styles.coverageLabel}>Cobertura</Text>
              <Text style={styles.coverageSubvalue}>{coveragePercent}%</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>RecrutaRS - Gestao de Equipes | Gerado em {date}</Text>
          <Text>Pagina 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
}
