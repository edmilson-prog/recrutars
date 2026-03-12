/**
 * Job Analyzer - Main Analysis Function
 * PRD-039: Analyzes job postings and provides improvement suggestions
 */

import {
  JobFormData,
  JobAnalysis,
  JobSuggestion,
  SuggestionCategory,
  SuggestionSeverity,
} from '@/types/jobAnalyzer';
import {
  CRITERIA_WEIGHTS,
  DESCRIPTION_OPTIMAL_MIN,
  DESCRIPTION_OPTIMAL_MAX,
  DESCRIPTION_MIN,
  MIN_BENEFITS,
  OPTIMAL_BENEFITS,
  MIN_REQUIREMENTS,
  OPTIMAL_REQUIREMENTS,
  PLATFORM_AVERAGE_SCORE,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  CLEAR_TITLE_KEYWORDS,
  MIN_COMPETENCIES_PER_TYPE,
  calculateCategoryScore,
} from './criteriaConfig';
import { analyzeBias } from './biasAnalyzer';
import { generateDescription, generateSalaryRange, suggestBenefits, expandDescription } from './textGenerator';

let suggestionIdCounter = 0;

function createSuggestion(
  category: SuggestionCategory,
  severity: SuggestionSeverity,
  title: string,
  description: string,
  impact: number,
  currentValue?: string,
  suggestedValue?: string,
  action?: 'add' | 'edit' | 'remove'
): JobSuggestion {
  return {
    id: `suggestion-${++suggestionIdCounter}`,
    category,
    severity,
    title,
    description,
    impact,
    currentValue,
    suggestedValue,
    action,
  };
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function analyzeSalary(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  // Salary not provided and not marked as negotiable
  if (formData.salaryNegotiable) {
    // Negotiable salary is acceptable but not ideal
    return {
      score: 0.6,
      suggestion: createSuggestion(
        'salary',
        'important',
        'Considere informar faixa salarial',
        'Vagas com faixa salarial definida recebem 42% mais candidaturas qualificadas.',
        10,
        'A combinar',
        undefined,
        'edit'
      ),
    };
  }

  const min = parseInt(formData.salaryMin) || 0;
  const max = parseInt(formData.salaryMax) || 0;

  if (min === 0 && max === 0) {
    const suggested = generateSalaryRange(formData.level, formData.area);
    return {
      score: 0,
      suggestion: createSuggestion(
        'salary',
        'critical',
        'Adicione faixa salarial',
        'Vagas sem faixa salarial têm 67% menos candidaturas. Este é o critério mais impactante.',
        20,
        undefined,
        `R$ ${suggested.min.toLocaleString('pt-BR')} - R$ ${suggested.max.toLocaleString('pt-BR')}`,
        'add'
      ),
    };
  }

  // Has salary range
  if (max > 0 && min > 0 && max >= min) {
    // Check if range is reasonable (not too wide)
    const rangePercent = ((max - min) / min) * 100;
    if (rangePercent > 100) {
      return {
        score: 0.7,
        suggestion: createSuggestion(
          'salary',
          'important',
          'Faixa salarial muito ampla',
          'Uma faixa mais precisa (diferença de até 50%) atrai candidatos mais alinhados.',
          7,
          `R$ ${min.toLocaleString('pt-BR')} - R$ ${max.toLocaleString('pt-BR')}`,
          undefined,
          'edit'
        ),
      };
    }
    return { score: 1 };
  }

  return { score: 0.5 };
}

function analyzeDescription(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  const wordCount = countWords(formData.description);

  if (wordCount < DESCRIPTION_MIN) {
    const generated = expandDescription(formData.description, formData);
    return {
      score: 0,
      suggestion: createSuggestion(
        'description',
        'critical',
        'Descrição muito curta',
        `A descrição tem apenas ${wordCount} palavras. O ideal é entre ${DESCRIPTION_OPTIMAL_MIN} e ${DESCRIPTION_OPTIMAL_MAX} palavras.`,
        20,
        formData.description || undefined,
        generated,
        'edit'
      ),
    };
  }

  if (wordCount < DESCRIPTION_OPTIMAL_MIN) {
    const generated = expandDescription(formData.description, formData);
    return {
      score: 0.5,
      suggestion: createSuggestion(
        'description',
        'important',
        'Descrição pode ser melhorada',
        `A descrição tem ${wordCount} palavras. Adicione mais detalhes sobre responsabilidades e cultura para chegar a ${DESCRIPTION_OPTIMAL_MIN}+ palavras.`,
        10,
        undefined,
        generated,
        'edit'
      ),
    };
  }

  if (wordCount > DESCRIPTION_OPTIMAL_MAX) {
    return {
      score: 0.8,
      suggestion: createSuggestion(
        'description',
        'ok',
        'Descrição longa',
        `A descrição tem ${wordCount} palavras. Considere ser mais conciso para manter o interesse do candidato.`,
        4,
        undefined,
        undefined,
        'edit'
      ),
    };
  }

  return { score: 1 };
}

function analyzeBenefits(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  const count = formData.benefits.length;

  if (count === 0) {
    const suggested = suggestBenefits([]);
    return {
      score: 0,
      suggestion: createSuggestion(
        'benefits',
        'critical',
        'Adicione benefícios',
        'Vagas sem benefícios listados perdem candidatos para concorrentes. Adicione pelo menos 3 benefícios.',
        15,
        undefined,
        suggested.slice(0, 5).join(', '),
        'add'
      ),
    };
  }

  if (count < MIN_BENEFITS) {
    const suggested = suggestBenefits(formData.benefits);
    return {
      score: 0.4,
      suggestion: createSuggestion(
        'benefits',
        'important',
        'Adicione mais benefícios',
        `Você listou apenas ${count} benefício(s). O ideal é ter pelo menos ${MIN_BENEFITS}.`,
        9,
        formData.benefits.join(', '),
        suggested.slice(0, 3).join(', '),
        'add'
      ),
    };
  }

  if (count < OPTIMAL_BENEFITS) {
    return {
      score: 0.7,
      suggestion: createSuggestion(
        'benefits',
        'ok',
        'Considere mais benefícios',
        `Você tem ${count} benefícios. Adicionar mais alguns pode aumentar a atratividade.`,
        4,
        undefined,
        undefined,
        'add'
      ),
    };
  }

  return { score: 1 };
}

function analyzeTitle(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  const title = formData.title.trim();

  if (!title || title.length < TITLE_MIN_LENGTH) {
    return {
      score: 0,
      suggestion: createSuggestion(
        'title',
        'critical',
        'Título muito curto',
        'Um título claro e descritivo ajuda candidatos a encontrar sua vaga. Inclua cargo, nível e tecnologia principal.',
        10,
        title || undefined,
        undefined,
        'edit'
      ),
    };
  }

  if (title.length > TITLE_MAX_LENGTH) {
    return {
      score: 0.6,
      suggestion: createSuggestion(
        'title',
        'important',
        'Título muito longo',
        'Títulos concisos (até 80 caracteres) são mais fáceis de ler e compartilhar.',
        4,
        title,
        undefined,
        'edit'
      ),
    };
  }

  // Check for clarity keywords
  const lowerTitle = title.toLowerCase();
  const hasLevelKeyword = CLEAR_TITLE_KEYWORDS.some(kw => lowerTitle.includes(kw));

  if (!hasLevelKeyword && formData.level) {
    return {
      score: 0.7,
      suggestion: createSuggestion(
        'title',
        'ok',
        'Adicione o nível no título',
        `Incluir "${formData.level}" no título ajuda candidatos a identificar se a vaga é adequada para eles.`,
        3,
        title,
        `${title} ${formData.level}`,
        'edit'
      ),
    };
  }

  return { score: 1 };
}

function analyzeRequirements(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  const requirements = formData.requirements.split('\n').filter(r => r.trim().length > 0);
  const count = requirements.length;

  if (count === 0) {
    return {
      score: 0,
      suggestion: createSuggestion(
        'requirements',
        'critical',
        'Adicione requisitos',
        'Lista os requisitos técnicos para que candidatos qualificados se identifiquem com a vaga.',
        10,
        undefined,
        undefined,
        'add'
      ),
    };
  }

  if (count < MIN_REQUIREMENTS) {
    return {
      score: 0.5,
      suggestion: createSuggestion(
        'requirements',
        'important',
        'Adicione mais requisitos',
        `Você listou apenas ${count} requisito(s). Detalhe melhor o que espera do candidato.`,
        5,
        undefined,
        undefined,
        'add'
      ),
    };
  }

  if (count > 10) {
    return {
      score: 0.8,
      suggestion: createSuggestion(
        'requirements',
        'ok',
        'Muitos requisitos',
        `Você listou ${count} requisitos. Muitos requisitos podem afastar bons candidatos. Considere priorizar os essenciais.`,
        2,
        undefined,
        undefined,
        'edit'
      ),
    };
  }

  return { score: 1 };
}

function analyzeCompetencies(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  const { technicalSkillCount, behavioralSkillCount } = formData;
  const total = technicalSkillCount + behavioralSkillCount;

  if (total === 0) {
    return {
      score: 0,
      suggestion: createSuggestion(
        'competencies',
        'critical',
        'Selecione competências',
        'Adicione competências técnicas e comportamentais na aba "Competências" para melhorar o match com candidatos.',
        10,
        undefined,
        undefined,
        'add'
      ),
    };
  }

  if (technicalSkillCount === 0 || behavioralSkillCount === 0) {
    const missing = technicalSkillCount === 0 ? 'técnicas' : 'comportamentais';
    return {
      score: 0.4,
      suggestion: createSuggestion(
        'competencies',
        'important',
        `Adicione competências ${missing}`,
        `Selecione competências ${missing} na aba "Competências" para um match mais preciso.`,
        6,
        undefined,
        undefined,
        'add'
      ),
    };
  }

  if (technicalSkillCount < MIN_COMPETENCIES_PER_TYPE || behavioralSkillCount < MIN_COMPETENCIES_PER_TYPE) {
    return {
      score: 0.7,
      suggestion: createSuggestion(
        'competencies',
        'ok',
        'Adicione mais competências',
        `Você selecionou ${technicalSkillCount} técnica(s) e ${behavioralSkillCount} comportamental(is). Selecione pelo menos ${MIN_COMPETENCIES_PER_TYPE} de cada tipo para melhor precisão no match.`,
        3,
        undefined,
        undefined,
        'add'
      ),
    };
  }

  return { score: 1 };
}

function analyzeWorkType(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  if (!formData.type) {
    return {
      score: 0,
      suggestion: createSuggestion(
        'workType',
        'important',
        'Defina a modalidade de trabalho',
        'Informar se a vaga é remota, híbrida ou presencial é essencial para candidatos planejarem sua candidatura.',
        5,
        undefined,
        undefined,
        'add'
      ),
    };
  }

  return { score: 1 };
}

function analyzeLocation(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  if (!formData.location || formData.location.trim().length < 3) {
    return {
      score: 0,
      suggestion: createSuggestion(
        'location',
        'important',
        'Informe a localização',
        'Mesmo para vagas remotas, informar a região da empresa ajuda candidatos.',
        5,
        undefined,
        undefined,
        'add'
      ),
    };
  }

  return { score: 1 };
}

function analyzeBiasInText(formData: JobFormData): { score: number; suggestion?: JobSuggestion } {
  const fullText = `${formData.title} ${formData.description} ${formData.requirements}`;
  const biasDetections = analyzeBias(fullText);

  if (biasDetections.length === 0) {
    return { score: 1 };
  }

  const firstBias = biasDetections[0];
  return {
    score: 0,
    suggestion: createSuggestion(
      'bias',
      'critical',
      'Linguagem potencialmente enviesada',
      `O termo "${firstBias.term}" pode ser considerado discriminatório. ${biasDetections.length > 1 ? `Encontramos ${biasDetections.length} ocorrências.` : ''}`,
      5,
      firstBias.term,
      firstBias.suggestion,
      'edit'
    ),
  };
}

export function analyzeJob(formData: JobFormData): JobAnalysis {
  // Reset counter for consistent IDs
  suggestionIdCounter = 0;

  const suggestions: JobSuggestion[] = [];
  const categoryScores: Record<SuggestionCategory, number> = {
    salary: 0,
    description: 0,
    benefits: 0,
    title: 0,
    requirements: 0,
    competencies: 0,
    workType: 0,
    location: 0,
    bias: 0,
  };

  // Run all analyzers
  const analyzers: Array<{ category: SuggestionCategory; analyze: () => { score: number; suggestion?: JobSuggestion } }> = [
    { category: 'salary', analyze: () => analyzeSalary(formData) },
    { category: 'description', analyze: () => analyzeDescription(formData) },
    { category: 'benefits', analyze: () => analyzeBenefits(formData) },
    { category: 'title', analyze: () => analyzeTitle(formData) },
    { category: 'requirements', analyze: () => analyzeRequirements(formData) },
    { category: 'competencies', analyze: () => analyzeCompetencies(formData) },
    { category: 'workType', analyze: () => analyzeWorkType(formData) },
    { category: 'location', analyze: () => analyzeLocation(formData) },
    { category: 'bias', analyze: () => analyzeBiasInText(formData) },
  ];

  for (const { category, analyze } of analyzers) {
    const result = analyze();
    categoryScores[category] = calculateCategoryScore(category, result.score);
    if (result.suggestion) {
      suggestions.push(result.suggestion);
    }
  }

  // Calculate total score
  const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
  const maxScore = CRITERIA_WEIGHTS.reduce((sum, c) => sum + c.maxPoints, 0);

  // Get bias detections for detailed view
  const fullText = `${formData.title} ${formData.description} ${formData.requirements}`;
  const biasDetections = analyzeBias(fullText);

  // Sort suggestions by impact (highest first)
  suggestions.sort((a, b) => b.impact - a.impact);

  return {
    score: totalScore,
    maxScore,
    suggestions,
    biasDetections,
    categoryScores,
    platformAverage: PLATFORM_AVERAGE_SCORE,
  };
}

// Re-export utilities for external use
export { generateDescription, expandDescription, generateSalaryRange, suggestBenefits } from './textGenerator';
export { analyzeBias, replaceBias } from './biasAnalyzer';
export { PLATFORM_AVERAGE_SCORE, CRITERIA_WEIGHTS } from './criteriaConfig';
