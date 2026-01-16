/**
 * Criteria Configuration for Job Analysis
 * PRD-039: Weights and scoring rules for each criterion
 */

import { CriteriaWeight, SuggestionCategory } from '@/types/jobAnalyzer';

export const CRITERIA_WEIGHTS: CriteriaWeight[] = [
  {
    category: 'salary',
    weight: 0.25,
    maxPoints: 25,
    label: 'Faixa Salarial',
  },
  {
    category: 'description',
    weight: 0.20,
    maxPoints: 20,
    label: 'Descrição',
  },
  {
    category: 'benefits',
    weight: 0.15,
    maxPoints: 15,
    label: 'Benefícios',
  },
  {
    category: 'title',
    weight: 0.10,
    maxPoints: 10,
    label: 'Título',
  },
  {
    category: 'requirements',
    weight: 0.10,
    maxPoints: 10,
    label: 'Requisitos Técnicos',
  },
  {
    category: 'softSkills',
    weight: 0.05,
    maxPoints: 5,
    label: 'Soft Skills',
  },
  {
    category: 'workType',
    weight: 0.05,
    maxPoints: 5,
    label: 'Modalidade',
  },
  {
    category: 'location',
    weight: 0.05,
    maxPoints: 5,
    label: 'Localização',
  },
  {
    category: 'bias',
    weight: 0.05,
    maxPoints: 5,
    label: 'Linguagem Inclusiva',
  },
];

// Description optimal range (in words)
export const DESCRIPTION_OPTIMAL_MIN = 150;
export const DESCRIPTION_OPTIMAL_MAX = 300;
export const DESCRIPTION_MIN = 50;

// Minimum benefits for good score
export const MIN_BENEFITS = 3;
export const OPTIMAL_BENEFITS = 5;

// Minimum requirements for good score
export const MIN_REQUIREMENTS = 3;
export const OPTIMAL_REQUIREMENTS = 5;

// Platform average score for comparison
export const PLATFORM_AVERAGE_SCORE = 62;

// Title validation
export const TITLE_MIN_LENGTH = 10;
export const TITLE_MAX_LENGTH = 80;

// Good title keywords (indicates clarity)
export const CLEAR_TITLE_KEYWORDS = [
  'junior', 'júnior', 'jr',
  'pleno', 'mid',
  'senior', 'sênior', 'sr',
  'estágio', 'estagiário',
  'especialista', 'coordenador', 'gerente', 'diretor',
  'desenvolvedor', 'analista', 'engenheiro', 'designer',
  'fullstack', 'full-stack', 'frontend', 'front-end', 'backend', 'back-end',
];

// Soft skills keywords to look for in description/requirements
export const SOFT_SKILLS_KEYWORDS = [
  'comunicação', 'trabalho em equipe', 'liderança', 'proatividade',
  'organização', 'adaptabilidade', 'criatividade', 'resolução de problemas',
  'pensamento crítico', 'empatia', 'colaboração', 'gestão de tempo',
  'flexibilidade', 'autonomia', 'iniciativa', 'resiliência',
];

export function getCriteriaWeight(category: SuggestionCategory): CriteriaWeight | undefined {
  return CRITERIA_WEIGHTS.find(c => c.category === category);
}

export function calculateCategoryScore(
  category: SuggestionCategory,
  percentage: number
): number {
  const weight = getCriteriaWeight(category);
  if (!weight) return 0;
  return Math.round(weight.maxPoints * Math.min(1, Math.max(0, percentage)));
}
