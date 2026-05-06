import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function AvailabilitySection({ data }: { data: PDFEmpresaData }) {
  if (!data.availability) return null;
  const a = data.availability;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Disponibilidade</Text>
      {a.workModel && <Text style={empresaStyles.paragraph}>Modelo de trabalho preferido: {a.workModel}</Text>}
      <Text style={empresaStyles.paragraph}>Disponível para mudança: {a.availableForRelocation ? 'Sim' : 'Não'}</Text>
      <Text style={empresaStyles.paragraph}>Início imediato: {a.immediateStart ? 'Sim' : 'Não'}</Text>
    </View>
  );
}
