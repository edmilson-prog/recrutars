/**
 * Evolution PDF Report
 * PRD-057: Relatório PDF de evolucao comportamental de um colaborador.
 */

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';

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
  // Table styles
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
    paddingVertical: 3,
  },
  tableCellDate: {
    width: 80,
    fontSize: 8,
    color: '#374151',
  },
  tableCellScore: {
    width: 50,
    fontSize: 9,
    textAlign: 'center',
  },
  tableCellArchetype: {
    flex: 1,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'right',
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  // Evolution analysis
  evolutionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  evolutionDimension: {
    width: 100,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  evolutionScore: {
    width: 50,
    fontSize: 9,
    textAlign: 'center',
  },
  evolutionDelta: {
    width: 50,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  evolutionTrend: {
    flex: 1,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'right',
  },
  // Annotations
  annotationItem: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#0891b2',
  },
  annotationDate: {
    fontSize: 8,
    color: '#9ca3af',
    marginBottom: 1,
  },
  annotationType: {
    fontSize: 8,
    color: '#0891b2',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  annotationText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
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

interface EvolutionPDFReportProps {
  member: { name: string; department: string; position: string };
  history: Array<{ completedAt: string; scores: DimensionScores; archetype: string }>;
  annotations: Array<{ text: string; type: string; date: string }>;
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

function getTrendText(delta: number): string {
  if (delta > 5) return 'Evolucao significativa';
  if (delta > 0) return 'Leve melhora';
  if (delta === 0) return 'Estavel';
  if (delta > -5) return 'Leve reducao';
  return 'Reducao significativa';
}

function formatAnnotationType(type: string): string {
  const labels: Record<string, string> = {
    training: 'Treinamento',
    coaching: 'Coaching',
    feedback: 'Feedback',
    promotion: 'Promocao',
    other: 'Outro',
  };
  return labels[type] || type;
}

export function EvolutionPDFReport({ member, history, annotations }: EvolutionPDFReportProps) {
  const date = new Date().toLocaleDateString('pt-BR');
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );

  const firstEntry = sortedHistory[0];
  const lastEntry = sortedHistory[sortedHistory.length - 1];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>CONFIDENCIAL</Text>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatorio de Evolucao Comportamental</Text>
          <Text style={styles.subtitle}>{member.name}</Text>
          <Text style={styles.meta}>
            {member.department} - {member.position} | Gerado em {date}
          </Text>
        </View>

        {/* Section: Test History Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historico de Testes</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellDate, styles.tableCellHeader, { textAlign: 'left' }]}>Data</Text>
            {DIMENSIONS.map((dim) => (
              <Text key={dim} style={[styles.tableCellScore, styles.tableCellHeader]}>
                {DIMENSION_SHORT_NAMES[dim]}
              </Text>
            ))}
            <Text style={[styles.tableCellArchetype, styles.tableCellHeader, { textAlign: 'right' }]}>
              Arquetipo
            </Text>
          </View>

          {/* Table Rows */}
          {sortedHistory.map((entry, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCellDate}>
                {new Date(entry.completedAt).toLocaleDateString('pt-BR')}
              </Text>
              {DIMENSIONS.map((dim) => (
                <Text
                  key={dim}
                  style={[styles.tableCellScore, { color: getScoreColor(entry.scores[dim]) }]}
                >
                  {entry.scores[dim]}
                </Text>
              ))}
              <Text style={styles.tableCellArchetype}>{entry.archetype}</Text>
            </View>
          ))}
        </View>

        {/* Section: Evolution Analysis */}
        {firstEntry && lastEntry && sortedHistory.length >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analise de Evolucao</Text>

            {/* Column headers */}
            <View style={[styles.evolutionRow, { borderBottomWidth: 1, borderBottomColor: '#0891b2' }]}>
              <Text style={[styles.evolutionDimension, { fontSize: 8, fontWeight: 'bold' }]}>
                Dimensao
              </Text>
              <Text style={[styles.evolutionScore, { fontSize: 8, fontWeight: 'bold' }]}>
                Primeiro
              </Text>
              <Text style={[styles.evolutionScore, { fontSize: 8, fontWeight: 'bold' }]}>
                Ultimo
              </Text>
              <Text style={[styles.evolutionDelta, { fontSize: 8 }]}>Delta</Text>
              <Text style={[styles.evolutionTrend, { fontSize: 8, fontWeight: 'bold' }]}>
                Tendencia
              </Text>
            </View>

            {DIMENSIONS.map((dim) => {
              const first = firstEntry.scores[dim];
              const last = lastEntry.scores[dim];
              const delta = last - first;
              return (
                <View key={dim} style={styles.evolutionRow}>
                  <Text style={styles.evolutionDimension}>
                    {dim} - {DIMENSION_SHORT_NAMES[dim]}
                  </Text>
                  <Text style={[styles.evolutionScore, { color: getScoreColor(first) }]}>
                    {first}
                  </Text>
                  <Text style={[styles.evolutionScore, { color: getScoreColor(last) }]}>
                    {last}
                  </Text>
                  <Text style={[styles.evolutionDelta, { color: getDeltaColor(delta) }]}>
                    {delta > 0 ? `+${delta}` : delta}
                  </Text>
                  <Text style={styles.evolutionTrend}>{getTrendText(delta)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Section: Annotations */}
        {annotations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anotacoes</Text>
            {annotations.map((annot, idx) => (
              <View key={idx} style={styles.annotationItem}>
                <Text style={styles.annotationDate}>
                  {new Date(annot.date).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.annotationType}>
                  {formatAnnotationType(annot.type)}
                </Text>
                <Text style={styles.annotationText}>{annot.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>RecrutaRS - Gestao de Equipes | Gerado em {date}</Text>
          <Text>Pagina 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
}
