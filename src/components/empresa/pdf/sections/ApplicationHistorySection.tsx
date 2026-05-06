import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ApplicationHistorySection({ data }: { data: PDFEmpresaData }) {
  if (!data.applicationHistory || data.applicationHistory.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Histórico de Candidaturas</Text>
      {data.applicationHistory.map(app => (
        <View key={app.id} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={{ width: 80, fontSize: 9, color: empresaColors.muted }}>
            {format(new Date(app.appliedAt), 'dd/MM/yy', { locale: ptBR })}
          </Text>
          <Text style={[empresaStyles.paragraph, { flex: 1 }]}>{app.jobTitle}</Text>
          <Text style={empresaStyles.badge}>{app.status}</Text>
        </View>
      ))}
    </View>
  );
}
