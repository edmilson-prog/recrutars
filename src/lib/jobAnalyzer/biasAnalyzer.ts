/**
 * Bias Analyzer for Job Descriptions
 * PRD-039: Detects biased language and suggests inclusive alternatives
 */

import { BiasDetection } from '@/types/jobAnalyzer';

interface BiasPattern {
  pattern: RegExp;
  term: string;
  suggestion: string;
  category: 'age' | 'gender' | 'appearance' | 'ability' | 'other';
}

// Bias patterns with inclusive alternatives
const BIAS_PATTERNS: BiasPattern[] = [
  // Age-related bias
  {
    pattern: /\bjovem\b/gi,
    term: 'jovem',
    suggestion: 'profissional dinâmico',
    category: 'age',
  },
  {
    pattern: /\bjovens\b/gi,
    term: 'jovens',
    suggestion: 'profissionais dinâmicos',
    category: 'age',
  },
  {
    pattern: /\brecém[- ]formado\b/gi,
    term: 'recém-formado',
    suggestion: 'em início de carreira',
    category: 'age',
  },
  {
    pattern: /\bidade máxima\b/gi,
    term: 'idade máxima',
    suggestion: '(remover requisito de idade)',
    category: 'age',
  },
  {
    pattern: /\baté \d+ anos\b/gi,
    term: 'até X anos',
    suggestion: '(remover requisito de idade)',
    category: 'age',
  },
  {
    pattern: /\bentre \d+ e \d+ anos\b/gi,
    term: 'entre X e Y anos',
    suggestion: '(remover requisito de idade)',
    category: 'age',
  },
  {
    pattern: /\bsangue novo\b/gi,
    term: 'sangue novo',
    suggestion: 'novas perspectivas',
    category: 'age',
  },

  // Gender-related bias
  {
    pattern: /\bsexo masculino\b/gi,
    term: 'sexo masculino',
    suggestion: 'qualquer gênero',
    category: 'gender',
  },
  {
    pattern: /\bsexo feminino\b/gi,
    term: 'sexo feminino',
    suggestion: 'qualquer gênero',
    category: 'gender',
  },
  {
    pattern: /\bapenas homens\b/gi,
    term: 'apenas homens',
    suggestion: '(remover requisito de gênero)',
    category: 'gender',
  },
  {
    pattern: /\bapenas mulheres\b/gi,
    term: 'apenas mulheres',
    suggestion: '(remover requisito de gênero)',
    category: 'gender',
  },
  {
    pattern: /\bpara homens\b/gi,
    term: 'para homens',
    suggestion: 'para profissionais',
    category: 'gender',
  },
  {
    pattern: /\bpara mulheres\b/gi,
    term: 'para mulheres',
    suggestion: 'para profissionais',
    category: 'gender',
  },

  // Appearance-related bias
  {
    pattern: /\bboa aparência\b/gi,
    term: 'boa aparência',
    suggestion: 'apresentação profissional',
    category: 'appearance',
  },
  {
    pattern: /\bexcelente aparência\b/gi,
    term: 'excelente aparência',
    suggestion: 'apresentação profissional',
    category: 'appearance',
  },
  {
    pattern: /\baparência impecável\b/gi,
    term: 'aparência impecável',
    suggestion: 'apresentação profissional',
    category: 'appearance',
  },
  {
    pattern: /\bboa apresentação\b/gi,
    term: 'boa apresentação',
    suggestion: 'postura profissional',
    category: 'appearance',
  },
  {
    pattern: /\bfoto no currículo\b/gi,
    term: 'foto no currículo',
    suggestion: '(remover requisito de foto)',
    category: 'appearance',
  },

  // Ability-related bias
  {
    pattern: /\bsem deficiência\b/gi,
    term: 'sem deficiência',
    suggestion: '(remover - discriminatório)',
    category: 'ability',
  },
  {
    pattern: /\bportador de deficiência\b/gi,
    term: 'portador de deficiência',
    suggestion: 'pessoa com deficiência (PcD)',
    category: 'ability',
  },
  {
    pattern: /\bdeficiente\b/gi,
    term: 'deficiente',
    suggestion: 'pessoa com deficiência (PcD)',
    category: 'ability',
  },

  // Other potentially exclusive language
  {
    pattern: /\bnativo\b(?!.*digital)/gi,
    term: 'nativo',
    suggestion: 'fluente',
    category: 'other',
  },
  {
    pattern: /\bginástica laboral obrigatória\b/gi,
    term: 'ginástica laboral obrigatória',
    suggestion: 'ginástica laboral disponível',
    category: 'ability',
  },
  {
    pattern: /\bdisponibilidade total\b/gi,
    term: 'disponibilidade total',
    suggestion: 'disponibilidade para horas extras ocasionais',
    category: 'other',
  },
  {
    pattern: /\bsem filhos\b/gi,
    term: 'sem filhos',
    suggestion: '(remover - discriminatório)',
    category: 'other',
  },
  {
    pattern: /\bestado civil\b/gi,
    term: 'estado civil',
    suggestion: '(remover - discriminatório)',
    category: 'other',
  },
];

export function analyzeBias(text: string): BiasDetection[] {
  const detections: BiasDetection[] = [];

  for (const biasPattern of BIAS_PATTERNS) {
    let match;
    // Reset regex lastIndex
    biasPattern.pattern.lastIndex = 0;

    while ((match = biasPattern.pattern.exec(text)) !== null) {
      // Get context around the match (50 chars before and after)
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + match[0].length + 50);
      const context = text.slice(start, end);

      detections.push({
        term: match[0],
        position: match.index,
        suggestion: biasPattern.suggestion,
        context: (start > 0 ? '...' : '') + context + (end < text.length ? '...' : ''),
      });
    }
  }

  // Sort by position in text
  return detections.sort((a, b) => a.position - b.position);
}

export function countBiasDetections(text: string): number {
  return analyzeBias(text).length;
}

export function hasBias(text: string): boolean {
  return countBiasDetections(text) > 0;
}

export function replaceBias(text: string, detection: BiasDetection): string {
  // If suggestion starts with "(", it's a removal instruction
  if (detection.suggestion.startsWith('(')) {
    // Remove the biased term
    return text.slice(0, detection.position) + text.slice(detection.position + detection.term.length);
  }

  // Replace the term with the suggestion, preserving case
  const replacement = matchCase(detection.suggestion, detection.term);
  return text.slice(0, detection.position) + replacement + text.slice(detection.position + detection.term.length);
}

function matchCase(suggestion: string, original: string): string {
  if (original === original.toUpperCase()) {
    return suggestion.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
  }
  return suggestion;
}
