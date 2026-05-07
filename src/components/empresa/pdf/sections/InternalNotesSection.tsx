import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  data: PDFEmpresaData;
  kind: 'candidate' | 'application';
}

const TITLES: Record<Props['kind'], string> = {
  candidate: 'Notas sobre o Candidato',
  application: 'Notas desta Candidatura',
};

export function InternalNotesSection({ data, kind }: Props) {
  const source = kind === 'candidate' ? data.candidateNotes : data.applicationNotes;
  const notes = (source ?? []).filter(n => !n.isDeleted);
  if (notes.length === 0) return null;

  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>{TITLES[kind]}</Text>
      {notes.map(n => (
        <View
          key={n.id}
          style={{
            marginBottom: 6,
            paddingLeft: 8,
            borderLeftWidth: 2,
            borderLeftColor: empresaColors.accent,
          }}
        >
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', fontSize: 9 }]}>
            {n.authorName ?? 'Recrutador'} ·{' '}
            {format(new Date(n.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
          </Text>
          <Text style={empresaStyles.paragraph}>{n.content}</Text>
        </View>
      ))}
    </View>
  );
}
