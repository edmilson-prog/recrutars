/**
 * Types for Job Analyzer AI Assistant
 * PRD-039: Assistente Inteligente de Redação de Vagas
 */

export type SuggestionSeverity = 'critical' | 'important' | 'ok';

export type SuggestionCategory =
  | 'salary'
  | 'description'
  | 'benefits'
  | 'title'
  | 'requirements'
  | 'softSkills'
  | 'workType'
  | 'location'
  | 'bias';

export interface JobFormData {
  title: string;
  description: string;
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  level: string;
  area: string;
  salaryMin: string;
  salaryMax: string;
  salaryNegotiable: boolean;
  requirements: string;
  benefits: string[];
  skills: string[];
}

export interface JobSuggestion {
  id: string;
  category: SuggestionCategory;
  severity: SuggestionSeverity;
  title: string;
  description: string;
  impact: number; // Points that can be gained by fixing
  currentValue?: string;
  suggestedValue?: string;
  action?: 'add' | 'edit' | 'remove';
}

export interface BiasDetection {
  term: string;
  position: number;
  suggestion: string;
  context: string;
}

export interface JobAnalysis {
  score: number;
  maxScore: number;
  suggestions: JobSuggestion[];
  biasDetections: BiasDetection[];
  categoryScores: Record<SuggestionCategory, number>;
  platformAverage: number;
}

export interface CriteriaWeight {
  category: SuggestionCategory;
  weight: number;
  maxPoints: number;
  label: string;
}

// Helper functions

export function getJobScoreLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 40) return 'low';
  if (score <= 70) return 'medium';
  return 'high';
}

export function getJobScoreColor(score: number): string {
  const level = getJobScoreLevel(score);
  switch (level) {
    case 'low':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'high':
      return 'text-green-500';
  }
}

export function getJobScoreBgColor(score: number): string {
  const level = getJobScoreLevel(score);
  switch (level) {
    case 'low':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-green-500';
  }
}

export function getJobScoreStrokeColor(score: number): string {
  const level = getJobScoreLevel(score);
  switch (level) {
    case 'low':
      return 'stroke-red-500';
    case 'medium':
      return 'stroke-yellow-500';
    case 'high':
      return 'stroke-green-500';
  }
}

export function getSeverityIcon(severity: SuggestionSeverity): string {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'important':
      return '🟡';
    case 'ok':
      return '🟢';
  }
}

export function getSeverityLabel(severity: SuggestionSeverity): string {
  switch (severity) {
    case 'critical':
      return 'Crítico';
    case 'important':
      return 'Importante';
    case 'ok':
      return 'OK';
  }
}
