/**
 * PDF Dimension Bars
 * PRD-054: Barras para PDF (primitivos react-pdf)
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { width: 120, fontSize: 9, color: '#374151' },
  barBg: { flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5 },
  barFill: { height: 10, borderRadius: 5 },
  score: { width: 30, fontSize: 9, fontWeight: 'bold', textAlign: 'right', marginLeft: 6 },
});

const DIMENSIONS: { key: GaugeProDimension; label: string }[] = [
  { key: 'D1', label: 'Dominância' },
  { key: 'D2', label: 'Sociabilidade' },
  { key: 'D3', label: 'Ritmo' },
  { key: 'D4', label: 'Conformidade' },
  { key: 'D5', label: 'Relacional' },
];

function getColor(score: number): string {
  if (score >= 67) return '#22c55e';
  if (score >= 34) return '#f59e0b';
  return '#ef4444';
}

interface PDFDimensionBarsProps {
  scores: DimensionScores;
}

export function PDFDimensionBars({ scores }: PDFDimensionBarsProps) {
  return (
    <View style={styles.container}>
      {DIMENSIONS.map(({ key, label }) => {
        const score = scores[key];
        return (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{key} - {label}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${score}%`, backgroundColor: getColor(score) }]} />
            </View>
            <Text style={[styles.score, { color: getColor(score) }]}>{score}</Text>
          </View>
        );
      })}
    </View>
  );
}
