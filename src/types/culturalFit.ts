/**
 * Types for Cultural Fit
 * PRD-042: Fit Cultural
 */

// Dimensões culturais (escala 1-5)
export type CulturalDimension =
  | 'innovation'      // Estável (1) <-> Inovador (5)
  | 'collaboration'   // Individual (1) <-> Equipe (5)
  | 'hierarchy'       // Flat (1) <-> Hierárquico (5)
  | 'pace'            // Calmo (1) <-> Acelerado (5)
  | 'direction';      // Autônomo (1) <-> Direcionado (5)

// Valor de uma dimensão (1-5)
export type DimensionValue = 1 | 2 | 3 | 4 | 5;

// Perfil cultural completo
export interface CulturalProfile {
  innovation: DimensionValue;
  collaboration: DimensionValue;
  hierarchy: DimensionValue;
  pace: DimensionValue;
  direction: DimensionValue;
}

// Perfil cultural de uma empresa
export interface CompanyCulturalProfile extends CulturalProfile {
  companyId: string;
  description?: string;
  values?: string[];
  updatedAt: string;
}

// Perfil cultural derivado do DISC de um candidato
export interface CandidateCulturalProfile extends CulturalProfile {
  candidateId: string;
  discProfile?: string;
  derivedAt: string;
}

// Resultado de compatibilidade
export interface CulturalCompatibility {
  overallScore: number; // 0-100
  dimensionScores: Record<CulturalDimension, number>; // 0-100 por dimensão
  strengths: CulturalDimension[]; // Dimensões com alta compatibilidade
  watchPoints: CulturalDimension[]; // Dimensões com baixa compatibilidade
  insights: CulturalInsight[];
}

// Insight de compatibilidade
export interface CulturalInsight {
  type: 'strength' | 'watch' | 'neutral';
  dimension: CulturalDimension;
  message: string;
}

// Definição de uma dimensão cultural
export interface CulturalDimensionDefinition {
  id: CulturalDimension;
  name: string;
  description: string;
  lowLabel: string;    // Label para valor 1
  highLabel: string;   // Label para valor 5
  lowDescription: string;
  highDescription: string;
}

// Labels para exibição
export const DIMENSION_LABELS: Record<CulturalDimension, string> = {
  innovation: 'Inovação',
  collaboration: 'Colaboração',
  hierarchy: 'Estrutura',
  pace: 'Ritmo',
  direction: 'Direcionamento',
};

export const DIMENSION_ICONS: Record<CulturalDimension, string> = {
  innovation: '💡',
  collaboration: '🤝',
  hierarchy: '📊',
  pace: '⚡',
  direction: '🎯',
};

// Mapeamento DISC -> Preferências culturais
export interface DiscCultureMapping {
  dominantProfile: string;
  preferredValues: Partial<CulturalProfile>;
  description: string;
}
