/**
 * DISC and Match Types
 * PRD-002-dgn: Visualização DISC e Match Score
 */

export interface DISCProfile {
  d: number; // Dominância (0-100)
  i: number; // Influência (0-100)
  s: number; // Estabilidade (0-100)
  c: number; // Conformidade (0-100)
}

export type DISCDimension = "d" | "i" | "s" | "c";

export interface DISCDimensionInfo {
  key: DISCDimension;
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
  score: number; // Score nesta categoria (0-100)
  description: string;
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

export interface MatchResult {
  totalScore: number;
  categories: MatchCategory[];
  strengths: MatchStrength[];
  opportunities: MatchOpportunity[];
  candidateProfile: DISCProfile;
  idealProfile?: DISCProfile;
}

export interface CandidateForComparison {
  id: string;
  name: string;
  avatar?: string;
  matchScore: number;
  discProfile: DISCProfile;
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
