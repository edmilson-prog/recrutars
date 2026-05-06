import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function LanguagesSection({ data }: { data: PDFEmpresaData }) {
  if (!data.languages || data.languages.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Idiomas</Text>
      {data.languages.map((l, i) => (
        <Text key={i} style={empresaStyles.bullet}>• {l.name} — {l.level}</Text>
      ))}
    </View>
  );
}
