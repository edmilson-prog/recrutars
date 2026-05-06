import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function PracticalAnalysisSection({ data }: { data: PDFEmpresaData }) {
  if (!data.practicalAnalysis) return null;
  const a = data.practicalAnalysis;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Análise Prática</Text>
      {a.summary && <Text style={empresaStyles.paragraph}>{a.summary}</Text>}
      {a.points && a.points.map((p, i) => <Text key={i} style={empresaStyles.bullet}>• {p}</Text>)}
    </View>
  );
}
