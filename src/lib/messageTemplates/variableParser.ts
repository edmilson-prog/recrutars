/**
 * Variable Parser for Message Templates
 * PRD-041: Mensagens Personalizadas
 *
 * Handles {{variable}} substitution in template content
 */

import type { TemplateVariable, TemplateVariableData } from '@/types/messageTemplates';

// Regex para encontrar variáveis no formato {{variavel}}
const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

/**
 * Substitui todas as variáveis no conteúdo pelos valores fornecidos
 */
export function parseVariables(
  content: string,
  data: Partial<TemplateVariableData>
): string {
  return content.replace(VARIABLE_REGEX, (match, variable) => {
    const key = variable as TemplateVariable;
    const value = data[key as keyof TemplateVariableData];

    if (value === undefined || value === null) {
      // Mantém a variável original se não houver valor
      return match;
    }

    // Tratamento especial para arrays (skills)
    if (Array.isArray(value)) {
      if (value.length === 0) return match;
      if (value.length === 1) return value[0];
      if (value.length === 2) return `${value[0]} e ${value[1]}`;
      return `${value.slice(0, -1).join(', ')} e ${value[value.length - 1]}`;
    }

    return String(value);
  });
}

/**
 * Extrai todas as variáveis presentes em um conteúdo
 */
export function extractVariables(content: string): TemplateVariable[] {
  const variables: TemplateVariable[] = [];
  let match;

  while ((match = VARIABLE_REGEX.exec(content)) !== null) {
    const variable = match[1] as TemplateVariable;
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }

  // Reset regex lastIndex
  VARIABLE_REGEX.lastIndex = 0;

  return variables;
}

/**
 * Verifica se todas as variáveis necessárias foram preenchidas
 */
export function validateVariables(
  content: string,
  data: Partial<TemplateVariableData>
): { isValid: boolean; missingVariables: TemplateVariable[] } {
  const requiredVariables = extractVariables(content);
  const missingVariables: TemplateVariable[] = [];

  for (const variable of requiredVariables) {
    const value = data[variable as keyof TemplateVariableData];
    if (value === undefined || value === null || value === '') {
      missingVariables.push(variable);
    }
  }

  return {
    isValid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * Destaca variáveis no conteúdo para preview (adiciona marcação visual)
 */
export function highlightVariables(content: string): string {
  return content.replace(VARIABLE_REGEX, (match) => {
    return `<span class="bg-secondary/20 text-secondary px-1 rounded">${match}</span>`;
  });
}

/**
 * Gera dados de exemplo para preview
 */
export function getExampleData(): TemplateVariableData {
  return {
    nome: 'João Silva',
    vaga: 'Desenvolvedor Full Stack',
    empresa: 'TechCorp',
    skills: ['React', 'Node.js', 'TypeScript'],
    experiencia: 5,
    disc_perfil: 'Influente (I)',
    data: '15/02/2025',
    horario: '14:00',
    local: 'Online (Google Meet)',
  };
}
