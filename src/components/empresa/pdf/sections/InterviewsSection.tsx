import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function InterviewsSection({ data }: { data: PDFEmpresaData }) {
  if (!data.interviews || data.interviews.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Entrevistas</Text>
      {data.interviews.map(iv => (
        <View key={iv.id} style={{ marginBottom: 6 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold' }]}>
            {format(new Date(iv.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            {' — '}
            <Text style={{ color: empresaColors.accentDark }}>{iv.status}</Text>
          </Text>
          {iv.feedback && <Text style={empresaStyles.paragraph}>{iv.feedback}</Text>}
        </View>
      ))}
    </View>
  );
}
