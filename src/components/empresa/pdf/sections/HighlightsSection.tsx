import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function HighlightsSection({ data }: { data: PDFEmpresaData }) {
  if (!data.highlights || data.highlights.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Destaques da Candidatura</Text>
      {data.highlights.map(h => (
        <Text key={h.id} style={empresaStyles.bullet}>★ {h.section}: {h.label}</Text>
      ))}
    </View>
  );
}
