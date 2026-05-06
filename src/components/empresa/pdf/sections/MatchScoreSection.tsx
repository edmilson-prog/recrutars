import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors, getScoreColor } from '../styles';
import type { PDFEmpresaData } from '../types';

export function MatchScoreSection({ data }: { data: PDFEmpresaData }) {
  if (!data.matchResult || !data.application) return null;
  const m = data.matchResult;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Match Score — {data.application.jobTitle}</Text>
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
        <View style={{
          backgroundColor: getScoreColor(m.overallScore),
          padding: 10, borderRadius: 6, width: 70, alignItems: 'center',
        }}>
          <Text style={{ color: empresaColors.white, fontSize: 22, fontWeight: 'bold' }}>{m.overallScore}%</Text>
          <Text style={{ color: empresaColors.white, fontSize: 7 }}>GERAL</Text>
        </View>
        <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
          {typeof m.technicalScore === 'number' && (
            <Text style={empresaStyles.paragraph}>Técnico: <Text style={{ fontWeight: 'bold' }}>{m.technicalScore}%</Text></Text>
          )}
          {typeof m.experienceScore === 'number' && (
            <Text style={empresaStyles.paragraph}>Experiência: <Text style={{ fontWeight: 'bold' }}>{m.experienceScore}%</Text></Text>
          )}
          {typeof m.behavioralScore === 'number' && (
            <Text style={empresaStyles.paragraph}>Comportamental: <Text style={{ fontWeight: 'bold' }}>{m.behavioralScore}%</Text></Text>
          )}
        </View>
      </View>

      {m.strengths && m.strengths.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', color: empresaColors.success }]}>Pontos Fortes</Text>
          {m.strengths.map((s, i) => <Text key={i} style={empresaStyles.bullet}>✓ {s}</Text>)}
        </View>
      )}
      {m.opportunities && m.opportunities.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', color: empresaColors.warning }]}>Oportunidades</Text>
          {m.opportunities.map((o, i) => <Text key={i} style={empresaStyles.bullet}>↗ {o}</Text>)}
        </View>
      )}
    </View>
  );
}
