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

// --- Word Selection (PRD-049) ---

export interface AdjectiveWord {
  id: number;
  text: string;
  dimension: GaugeProDimension;
  polarity: 'high' | 'low'; // high = +2, low = -2
}

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
  candidateId: string;
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
  candidateId: string;

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
