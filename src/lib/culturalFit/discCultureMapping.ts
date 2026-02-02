/**
 * Behavioral to Cultural Profile Mapping
 * PRD-042: Fit Cultural
 */

import type {
  CulturalProfile,
  CandidateCulturalProfile,
  DimensionValue,
} from '@/types/culturalFit';
import { getCultureMapping } from '@/data/culturalDimensions';

/**
 * Deriva um perfil cultural a partir do perfil comportamental do candidato
 */
export function deriveCulturalProfileFromBehavioral(
  behavioralProfile: string,
  candidateId: string
): CandidateCulturalProfile {
  const mapping = getCultureMapping(behavioralProfile);

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
      behavioralProfile,
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
    behavioralProfile,
    derivedAt: new Date().toISOString(),
  };
}

/**
 * Extrai a letra dominante do perfil comportamental
 */
export function getDominantProfileLetter(behavioralProfile: string): string {
  // Formatos possíveis: "D", "DI", "Dominante (D)", "DI - Executor"
  const match = behavioralProfile.match(/^([DISC]{1,2})/i);
  if (match) return match[1].toUpperCase();

  // Tenta extrair de formato por extenso
  if (behavioralProfile.toLowerCase().includes('dominan')) return 'D';
  if (behavioralProfile.toLowerCase().includes('influen')) return 'I';
  if (behavioralProfile.toLowerCase().includes('estab') || behavioralProfile.toLowerCase().includes('steady')) return 'S';
  if (behavioralProfile.toLowerCase().includes('conform') || behavioralProfile.toLowerCase().includes('complian')) return 'C';

  return 'S'; // Default para Estável se não conseguir identificar
}

/**
 * Retorna descrição do perfil cultural baseado no perfil comportamental
 */
export function getBehavioralCultureDescription(behavioralProfile: string): string {
  const mapping = getCultureMapping(behavioralProfile);
  return mapping?.description || 'Perfil balanceado com preferências equilibradas entre as dimensões culturais';
}

/**
 * Retorna pontos fortes culturais baseados no perfil comportamental
 */
export function getBehavioralCultureStrengths(behavioralProfile: string): string[] {
  const dominant = getDominantProfileLetter(behavioralProfile);

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
