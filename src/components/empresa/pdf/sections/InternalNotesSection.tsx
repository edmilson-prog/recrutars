import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function InternalNotesSection({ data }: { data: PDFEmpresaData }) {
  const candidateNotes = (data.candidateNotes ?? []).filter(n => !n.isDeleted);
  const appNotes = (data.applicationNotes ?? []).filter(n => !n.isDeleted);
  if (candidateNotes.length === 0 && appNotes.length === 0) return null;

  const renderNote = (n: { id: string; authorName?: string; content: string; createdAt: string }) => (
    <View key={n.id} style={{ marginBottom: 6, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: empresaColors.accent }}>
      <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', fontSize: 9 }]}>
        {n.authorName ?? 'Recrutador'} · {format(new Date(n.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
      </Text>
      <Text style={empresaStyles.paragraph}>{n.content}</Text>
    </View>
  );

  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Notas Internas</Text>
      {candidateNotes.length > 0 && (
        <>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', marginTop: 4, color: empresaColors.muted }]}>
            Sobre o Candidato (perenes)
          </Text>
          {candidateNotes.map(renderNote)}
        </>
      )}
      {appNotes.length > 0 && (
        <>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', marginTop: 8, color: empresaColors.muted }]}>
            Sobre esta Candidatura
          </Text>
          {appNotes.map(renderNote)}
        </>
      )}
    </View>
  );
}
