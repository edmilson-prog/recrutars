/**
 * Tone Generator for Message Templates
 * PRD-041: Mensagens Personalizadas
 *
 * Handles tone adjustments for custom messages
 */

import type { MessageTone } from '@/types/messageTemplates';

// Mapeamento de palavras e expressões por tom
const TONE_MAPPINGS: Record<MessageTone, {
  greetings: string[];
  closings: string[];
  connectors: string[];
  exclamations: boolean;
}> = {
  formal: {
    greetings: ['Prezado(a)', 'Caro(a)', 'Estimado(a)'],
    closings: ['Atenciosamente', 'Cordialmente', 'Respeitosamente'],
    connectors: ['Ademais', 'Outrossim', 'Por conseguinte', 'Dessa forma'],
    exclamations: false,
  },
  neutral: {
    greetings: ['Olá', 'Bom dia', 'Boa tarde'],
    closings: ['Obrigado', 'Abraços', 'Até logo'],
    connectors: ['Além disso', 'Também', 'Por isso'],
    exclamations: true,
  },
  informal: {
    greetings: ['Oi', 'E aí', 'Fala'],
    closings: ['Valeu', 'Falou', 'Até mais', 'Abraço'],
    connectors: ['Daí', 'Aí', 'Tipo'],
    exclamations: true,
  },
};

/**
 * Ajusta o tom de uma mensagem customizada
 * Faz substituições básicas de saudações e fechamentos
 */
export function adjustTone(content: string, targetTone: MessageTone): string {
  let adjustedContent = content;
  const targetMappings = TONE_MAPPINGS[targetTone];

  // Substitui saudações comuns
  const greetingPatterns = [
    /^Prezado\(a\)/i,
    /^Caro\(a\)/i,
    /^Estimado\(a\)/i,
    /^Olá/i,
    /^Bom dia/i,
    /^Boa tarde/i,
    /^Oi/i,
    /^E aí/i,
    /^Fala/i,
  ];

  for (const pattern of greetingPatterns) {
    if (pattern.test(adjustedContent)) {
      adjustedContent = adjustedContent.replace(
        pattern,
        targetMappings.greetings[0]
      );
      break;
    }
  }

  // Substitui fechamentos comuns
  const closingPatterns = [
    /Atenciosamente[,.]?$/im,
    /Cordialmente[,.]?$/im,
    /Respeitosamente[,.]?$/im,
    /Obrigado[,.]?$/im,
    /Abraços[,.]?$/im,
    /Até logo[,.]?$/im,
    /Valeu[,.]?$/im,
    /Falou[,.]?$/im,
    /Até mais[,.]?$/im,
  ];

  for (const pattern of closingPatterns) {
    if (pattern.test(adjustedContent)) {
      adjustedContent = adjustedContent.replace(
        pattern,
        `${targetMappings.closings[0]},`
      );
      break;
    }
  }

  // Ajusta pontuação baseado no tom
  if (!targetMappings.exclamations) {
    // Remove exclamações excessivas para tom formal
    adjustedContent = adjustedContent.replace(/!+/g, '.');
  }

  return adjustedContent;
}

/**
 * Gera sugestões de melhorias baseadas no tom
 */
export function getToneSuggestions(
  content: string,
  targetTone: MessageTone
): string[] {
  const suggestions: string[] = [];
  const mappings = TONE_MAPPINGS[targetTone];

  // Verifica saudação
  const hasProperGreeting = mappings.greetings.some(g =>
    content.toLowerCase().includes(g.toLowerCase())
  );
  if (!hasProperGreeting) {
    suggestions.push(
      `Considere usar uma saudação ${targetTone === 'formal' ? 'formal' : targetTone === 'informal' ? 'informal' : 'neutra'} como "${mappings.greetings[0]}"`
    );
  }

  // Verifica fechamento
  const hasProperClosing = mappings.closings.some(c =>
    content.toLowerCase().includes(c.toLowerCase())
  );
  if (!hasProperClosing) {
    suggestions.push(
      `Considere usar um fechamento como "${mappings.closings[0]}"`
    );
  }

  // Verifica pontuação para tom formal
  if (targetTone === 'formal' && content.includes('!')) {
    suggestions.push(
      'Para um tom mais formal, evite usar pontos de exclamação'
    );
  }

  // Verifica formalidade excessiva para tom informal
  if (targetTone === 'informal') {
    const formalTerms = ['prezado', 'estimado', 'atenciosamente', 'cordialmente'];
    const hasFormalTerms = formalTerms.some(t =>
      content.toLowerCase().includes(t)
    );
    if (hasFormalTerms) {
      suggestions.push(
        'Para um tom mais informal, use expressões mais descontraídas'
      );
    }
  }

  return suggestions;
}

/**
 * Retorna características esperadas para cada tom
 */
export function getToneCharacteristics(tone: MessageTone): string[] {
  switch (tone) {
    case 'formal':
      return [
        'Tratamento respeitoso (você, senhor/a)',
        'Linguagem técnica e precisa',
        'Sem gírias ou abreviações',
        'Pontuação tradicional',
        'Estrutura bem definida',
      ];
    case 'neutral':
      return [
        'Tratamento cordial',
        'Linguagem clara e direta',
        'Equilíbrio entre profissional e acessível',
        'Uso moderado de pontuação expressiva',
      ];
    case 'informal':
      return [
        'Tratamento descontraído (você, tu)',
        'Linguagem do dia a dia',
        'Expressões coloquiais permitidas',
        'Uso de emojis opcional',
        'Tom amigável e próximo',
      ];
  }
}
