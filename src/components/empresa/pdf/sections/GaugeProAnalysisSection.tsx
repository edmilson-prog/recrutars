import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';

export function GaugeProAnalysisSection({ data }: { data: PDFEmpresaData }) {
  if (!data.gaugeProResult) return null;
  const g = data.gaugeProResult;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Análise Comportamental (Gauge-Pro)</Text>
      {g.archetype && (
        <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', color: empresaColors.accentDark, fontSize: 12 }]}>
          Arquétipo: {g.archetype}
        </Text>
      )}
      {g.archetypeDescription && (
        <Text style={empresaStyles.paragraph}>{g.archetypeDescription}</Text>
      )}
      {g.dimensions && g.dimensions.length > 0 && (
        <View style={{ marginTop: 8, gap: 4 }}>
          {g.dimensions.map((d, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ width: 100, fontSize: 9 }}>{d.name}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: empresaColors.bgSubtle, borderRadius: 4 }}>
                <View style={{
                  width: `${Math.min(100, Math.max(0, d.score))}%`,
                  height: 8,
                  backgroundColor: empresaColors.accent,
                  borderRadius: 4,
                }} />
              </View>
              <Text style={{ width: 30, fontSize: 9, textAlign: 'right' }}>{d.score}%</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
