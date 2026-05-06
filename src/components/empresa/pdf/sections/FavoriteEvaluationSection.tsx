import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function FavoriteEvaluationSection({ data }: { data: PDFEmpresaData }) {
  if (!data.favoriteEvaluation) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Avaliação Interna</Text>
      <Text style={empresaStyles.paragraph}>
        {data.favoriteEvaluation.isFavorite ? '★ Marcado como favorito pela equipe' : 'Não marcado como favorito'}
      </Text>
      {data.favoriteEvaluation.tags && data.favoriteEvaluation.tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {data.favoriteEvaluation.tags.map((t, i) => (
            <Text key={i} style={empresaStyles.badge}>{t}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
