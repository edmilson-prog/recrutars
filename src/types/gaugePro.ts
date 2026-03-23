/**
 * Gauge-Pro Assessment Types
 * PRD-049: Seleção de Palavras (10 etapas: 5 dimensões × 2 perspectivas)
 * PRD-050: Cenários Situacionais
 */

export type GaugeProDimension = 'D1' | 'D2' | 'D3' | 'D4' | 'D5';

export const DIMENSION_NAMES: Record<GaugeProDimension, string> = {
  D1: 'Dominância/Assertividade',
  D2: 'Sociabilidade/Extroversão',
  D3: 'Ritmo/Paciência',
  D4: 'Conformidade/Estrutura',
  D5: 'Orientação Relacional',
};

export const DIMENSION_SHORT_NAMES: Record<GaugeProDimension, string> = {
  D1: 'Dominância',
  D2: 'Sociabilidade',
  D3: 'Ritmo',
  D4: 'Conformidade',
  D5: 'Relacional',
};

export const DIMENSION_DESCRIPTIONS: Record<GaugeProDimension, string> = {
  D1: 'Mede o grau de assertividade e iniciativa. Pessoas com alta dominância tendem a assumir o controle, tomar decisões rápidas e buscar resultados de forma direta. Baixa dominância indica preferência por colaboração e consenso.',
  D2: 'Mede a facilidade de interação social e comunicação. Alta sociabilidade indica pessoas comunicativas, persuasivas e que energizam ambientes. Baixa sociabilidade indica preferência por trabalho focado e independente.',
  D3: 'Mede a constância no ritmo de trabalho e tolerância a rotinas. Alta paciência indica pessoas metódicas, persistentes e que preferem ambientes estáveis. Baixa paciência indica preferência por variedade e mudanças frequentes.',
  D4: 'Mede a adesão a regras, processos e padrões de qualidade. Alta conformidade indica pessoas detalhistas, analíticas e que valorizam precisão. Baixa conformidade indica preferência por flexibilidade e abordagens informais.',
  D5: 'Mede a sensibilidade interpessoal e empatia no ambiente de trabalho. Alta orientação relacional indica pessoas acolhedoras, que priorizam harmonia e bem-estar da equipe. Baixa indica foco em objetividade e resultados.',
};

// --- Word Selection (PRD-049) ---

export interface AdjectiveWord {
  id: number;
  text: string;
  dimension: GaugeProDimension;
  polarity: 'high' | 'low'; // high = +2, low = -2
  isActive?: boolean; // Added for admin
  sortOrder?: number;
}

export type WordOrderMode = 'random' | 'fixed' | 'alternating' | 'grouped' | 'alphabetical';

export type Perspective = 'self' | 'others';

export interface WordStepResponse {
  dimension: GaugeProDimension;
  perspective: Perspective;
  selectedWordIds: number[];
  completedAt?: string;
}

// --- Scenarios (PRD-050) ---

export interface DimensionMapping {
  dimension: GaugeProDimension;
  direction: '+' | '-'; // + adds, - subtracts
}

export interface ScenarioOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  mappings: DimensionMapping[];
}

export interface Scenario {
  id: number;
  order: number;
  title: string;
  situation: string;
  options: ScenarioOption[];
  isActive?: boolean; // Added for admin
}

export interface ScenarioResponse {
  scenarioId: number;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  answeredAt: string;
}

// --- Scores ---

export type DimensionScores = Record<GaugeProDimension, number>;

export type DimensionClassification = 'low' | 'medium' | 'high';

// --- Archetype ---

export interface ArchetypeProfile {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  developmentAreas: string[];
  idealRoles: string[];
  workStyle: string;
  communicationStyle: string;
  isActive?: boolean; // Added for admin
}

// --- Assessment Session ---

export type GaugeProPhase =
  | 'intro'
  | 'part1_words'
  | 'part1_block_transition'
  | 'part1_complete'
  | 'part2_intro'
  | 'part2_scenarios'
  | 'analyzing'
  | 'completed';

export interface GaugeProAssessment {
  id: string;
  candidateId?: string;
  teamMemberId?: string;
  phase: GaugeProPhase;
  startedAt: string;

  // Part 1 — 10 steps (5 dimensions × 2 perspectives)
  part1StartedAt?: string;
  part1CompletedAt?: string;
  wordStepResponses: WordStepResponse[];
  shuffledWordOrders: Partial<Record<GaugeProDimension, number[]>>;
  currentWordStep: number; // 0-9

  // Part 2
  part2StartedAt?: string;
  part2CompletedAt?: string;
  scenarioResponses: ScenarioResponse[];
  currentScenarioIndex: number;

  // Completion
  completedAt?: string;
}

// --- Result ---

export interface GaugeProResult {
  id: string;
  assessmentId: string;
  candidateId?: string;
  teamMemberId?: string;

  part1Scores: DimensionScores;
  part2Scores: DimensionScores;
  finalScores: DimensionScores;
  classifications: Record<GaugeProDimension, DimensionClassification>;

  archetype: ArchetypeProfile;
  primaryDimension: GaugeProDimension;
  secondaryDimension: GaugeProDimension;

  strengths: string[];
  developmentAreas: string[];
  careerRecommendations: string[];

  xpAwarded: number;
  badgeAwarded: string;
  generatedAt: string;
}
