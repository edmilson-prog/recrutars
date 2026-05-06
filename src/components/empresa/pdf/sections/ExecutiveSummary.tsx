// src/components/empresa/pdf/sections/ExecutiveSummary.tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors, getScoreColor } from '../styles';
import type { PDFEmpresaData } from '../types';

interface ExecutiveSummaryProps {
  data: PDFEmpresaData;
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const score = data.matchResult?.overallScore;
  const about = data.curriculum?.about;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Sumário Executivo</Text>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
        {typeof score === 'number' ? (
          <View
            style={{
              backgroundColor: getScoreColor(score),
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              width: 90,
            }}
          >
            <Text style={{ color: empresaColors.white, fontSize: 28, fontWeight: 'bold' }}>
              {score}%
            </Text>
            <Text style={{ color: empresaColors.white, fontSize: 8, marginTop: 2 }}>
              MATCH
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold' }]}>
            {data.candidate.name}
          </Text>
          {data.candidate.city || data.candidate.state ? (
            <Text style={[empresaStyles.paragraph, { color: empresaColors.muted }]}>
              {[data.candidate.city, data.candidate.state].filter(Boolean).join(' / ')}
            </Text>
          ) : null}
          {about ? (
            <Text style={empresaStyles.paragraph}>
              {about.slice(0, 400)}
              {about.length > 400 ? '…' : ''}
            </Text>
          ) : null}
          {data.gaugeProResult?.archetype ? (
            <Text
              style={[
                empresaStyles.paragraph,
                { fontStyle: 'italic', color: empresaColors.accentDark, marginTop: 4 },
              ]}
            >
              Perfil comportamental: {data.gaugeProResult.archetype}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
