/**
 * DISC to Cultural Profile Mapping
 * PRD-042: Fit Cultural
 */

import type {
  CulturalProfile,
  CandidateCulturalProfile,
  DimensionValue,
} from '@/types/culturalFit';
import { getDiscMapping } from '@/data/culturalDimensions';

/**
 * Deriva um perfil cultural a partir do perfil DISC do candidato
 */
export function deriveCulturalProfileFromDisc(
  discProfile: string,
  candidateId: string
): CandidateCulturalProfile {
  const mapping = getDiscMapping(discProfile);

  // Valores padrão (neutros) se não encontrar mapeamento
  const defaultProfile: CulturalProfile = {
    innovation: 3,
    collaboration: 3,
    hierarchy: 3,
    pace: 3,
    direction: 3,
  };

  if (!mapping) {
    return {
      ...defaultProfile,
      candidateId,
      discProfile,
      derivedAt: new Date().toISOString(),
    };
  }

  // Mescla valores do mapeamento com defaults
  const profile: CulturalProfile = {
    innovation: (mapping.preferredValues.innovation || 3) as DimensionValue,
    collaboration: (mapping.preferredValues.collaboration || 3) as DimensionValue,
    hierarchy: (mapping.preferredValues.hierarchy || 3) as DimensionValue,
    pace: (mapping.preferredValues.pace || 3) as DimensionValue,
    direction: (mapping.preferredValues.direction || 3) as DimensionValue,
  };

  return {
    ...profile,
    candidateId,
    discProfile,
    derivedAt: new Date().toISOString(),
  };
}

/**
 * Extrai a letra dominante do perfil DISC
 */
export function getDominantDiscLetter(discProfile: string): string {
  // Formatos possíveis: "D", "DI", "Dominante (D)", "DI - Executor"
  const match = discProfile.match(/^([DISC]{1,2})/i);
  if (match) return match[1].toUpperCase();

  // Tenta extrair de formato por extenso
  if (discProfile.toLowerCase().includes('dominan')) return 'D';
  if (discProfile.toLowerCase().includes('influen')) return 'I';
  if (discProfile.toLowerCase().includes('estab') || discProfile.toLowerCase().includes('steady')) return 'S';
  if (discProfile.toLowerCase().includes('conform') || discProfile.toLowerCase().includes('complian')) return 'C';

  return 'S'; // Default para Estável se não conseguir identificar
}

/**
 * Retorna descrição do perfil cultural baseado no DISC
 */
export function getDiscCultureDescription(discProfile: string): string {
  const mapping = getDiscMapping(discProfile);
  return mapping?.description || 'Perfil balanceado com preferências equilibradas entre as dimensões culturais';
}

/**
 * Retorna pontos fortes culturais baseados no DISC
 */
export function getDiscCultureStrengths(discProfile: string): string[] {
  const dominant = getDominantDiscLetter(discProfile);

  switch (dominant) {
    case 'D':
      return [
        'Liderança em ambientes de alta pressão',
        'Tomada de decisão rápida',
        'Foco em resultados',
        'Iniciativa para mudanças',
      ];
    case 'I':
      return [
        'Construção de relacionamentos',
        'Comunicação persuasiva',
        'Energia positiva para a equipe',
        'Criatividade e entusiasmo',
      ];
    case 'S':
      return [
        'Consistência e confiabilidade',
        'Suporte à equipe',
        'Paciência e persistência',
        'Harmonia no ambiente',
      ];
    case 'C':
      return [
        'Atenção a detalhes',
        'Qualidade e precisão',
        'Análise sistemática',
        'Cumprimento de padrões',
      ];
    default:
      return [
        'Adaptabilidade',
        'Equilíbrio de habilidades',
        'Flexibilidade de atuação',
      ];
  }
}
