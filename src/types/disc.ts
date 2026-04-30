/**
 * Behavioral and Match Types
 * PRD-002-dgn: Visualização Comportamental e Match Score
 */

export interface BehavioralProfile {
  d: number; // Dominância (0-100)
  i: number; // Influência (0-100)
  s: number; // Estabilidade (0-100)
  c: number; // Conformidade (0-100)
}

export type BehavioralDimension = "d" | "i" | "s" | "c";

export interface BehavioralDimensionInfo {
  key: BehavioralDimension;
  name: string;
  fullName: string;
  description: string;
  color: string;
  bgColor: string;
  traits: string[];
}

export interface MatchCategory {
  id: string;
  name: string;
  weight: number; // Peso no cálculo total (0-100, soma=100)
  /** Peso após redistribuição quando outra categoria foi removida (Q4 caso 2). Quando ausente = weight. */
  effectiveWeight?: number;
  score: number; // Score nesta categoria (0-100)
  description: string;
  /** Sinaliza ausência de dado para tratamento na UI:
   * - 'job-side': vaga não cadastrou (peso é redistribuído entre as outras categorias)
   * - 'candidate-side': candidato não tem dado (score = 0, card mostra flag)
   */
  dataMissing?: 'job-side' | 'candidate-side' | null;
}

export interface MatchStrength {
  id: string;
  text: string;
  category: string;
  impact: "high" | "medium" | "low";
}

export interface MatchOpportunity {
  id: string;
  text: string;
  category: string;
  potentialIncrease: number; // Aumento potencial no match %
  actionable: boolean;
}

/**
 * Entrada de skills padronizadas para o cálculo de match.
 * Quando passado, substitui completamente o caminho legado tokenizado.
 */
export interface MatchSkillsInput {
  /** IDs de skills técnicas do candidato, ordenados por priority (1 = mais prioritária) */
  candidateTechnical: string[];
  /** IDs de skills comportamentais do candidato, ordenados por priority */
  candidateBehavioral: string[];
  /** IDs de skills técnicas requeridas pela vaga, ordenados por priority */
  jobTechnical: string[];
  /** IDs de skills comportamentais requeridas pela vaga, ordenados por priority */
  jobBehavioral: string[];
}

export interface MatchResult {
  totalScore: number;
  categories: MatchCategory[];
  strengths: MatchStrength[];
  opportunities: MatchOpportunity[];
  candidateProfile: BehavioralProfile;
  idealProfile?: BehavioralProfile;
}

export interface CandidateForComparison {
  id: string;
  name: string;
  avatar?: string;
  matchScore: number;
  behavioralProfile?: BehavioralProfile;
  metrics: Record<string, string | number | boolean>;
  // PRD-031: Campos adicionais para comparação
  experienceYears?: number;
  currentRole?: string;
  education?: string;
  skills?: string[];
  salary?: { min: number; max: number };
  availability?: string;
  location?: string;
}

export type MatchScoreLevel = "high" | "medium" | "low";

export function getMatchScoreLevel(score: number): MatchScoreLevel {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function getMatchScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  const level = getMatchScoreLevel(score);
  const colors = {
    high: {
      text: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-500",
    },
    medium: {
      text: "text-yellow-600",
      bg: "bg-yellow-100",
      border: "border-yellow-500",
    },
    low: {
      text: "text-red-600",
      bg: "bg-red-100",
      border: "border-red-500",
    },
  };
  return colors[level];
}
