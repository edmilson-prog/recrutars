import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ActivityLogSection({ data }: { data: PDFEmpresaData }) {
  if (!data.activityLog || data.activityLog.length === 0) return null;
  const events = data.activityLog.slice(0, 20);
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Histórico de Atividade</Text>
      {events.map(ev => (
        <View key={ev.id} style={{ flexDirection: 'row', marginBottom: 3 }}>
          <Text style={{ width: 80, fontSize: 9, color: empresaColors.muted }}>
            {format(new Date(ev.createdAt), 'dd/MM/yy HH:mm', { locale: ptBR })}
          </Text>
          <Text style={[empresaStyles.paragraph, { flex: 1, fontSize: 9 }]}>
            {ev.description ?? ev.action}
          </Text>
        </View>
      ))}
    </View>
  );
}
