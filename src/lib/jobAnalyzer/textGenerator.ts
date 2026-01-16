/**
 * Text Generator for Job Descriptions
 * PRD-039: Templates and generators for improved job descriptions
 */

import { JobFormData } from '@/types/jobAnalyzer';

interface DescriptionTemplate {
  intro: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  closing: string;
}

// Level-specific intro templates
const LEVEL_INTROS: Record<string, string> = {
  'Estágio': 'Estamos em busca de um(a) estagiário(a) motivado(a) para integrar nossa equipe de {area}.',
  'Junior': 'Estamos em busca de um(a) profissional em início de carreira para atuar como {title}.',
  'Pleno': 'Buscamos um(a) profissional com experiência sólida para a posição de {title}.',
  'Senior': 'Estamos em busca de um(a) profissional experiente para atuar como {title} em nosso time.',
  'Especialista': 'Procuramos um(a) especialista para liderar iniciativas estratégicas como {title}.',
  'Gerente': 'Buscamos um(a) líder para assumir a posição de {title} e gerenciar nossa equipe.',
};

// Default intro for when level is not specified
const DEFAULT_INTRO = 'Estamos em busca de um(a) profissional talentoso(a) para a posição de {title}.';

// Work type descriptions
const WORK_TYPE_DESCRIPTIONS: Record<string, string> = {
  'remote': 'A posição é 100% remota, permitindo flexibilidade de localização.',
  'hybrid': 'Atuação em modelo híbrido, combinando trabalho presencial e remoto.',
  'onsite': 'Atuação presencial em nosso escritório localizado em {location}.',
};

// Responsibility templates by area
const RESPONSIBILITY_TEMPLATES: Record<string, string[]> = {
  'desenvolvimento': [
    'Desenvolver e manter aplicações web/mobile de alta qualidade',
    'Participar de code reviews e contribuir para a melhoria contínua do código',
    'Colaborar com o time de produto para definir soluções técnicas',
    'Garantir a performance e escalabilidade das aplicações',
  ],
  'design': [
    'Criar interfaces intuitivas e visualmente atraentes',
    'Conduzir pesquisas de usuário e testes de usabilidade',
    'Desenvolver e manter o design system da empresa',
    'Colaborar com desenvolvedores na implementação das soluções',
  ],
  'marketing': [
    'Planejar e executar campanhas de marketing digital',
    'Analisar métricas e otimizar estratégias de aquisição',
    'Criar conteúdo relevante para diferentes canais',
    'Gerenciar relacionamento com parceiros e fornecedores',
  ],
  'vendas': [
    'Prospectar e qualificar novos leads',
    'Conduzir apresentações e negociações comerciais',
    'Gerenciar pipeline e atingir metas de vendas',
    'Construir relacionamentos duradouros com clientes',
  ],
  'default': [
    'Executar as atividades da área com excelência',
    'Colaborar com outras equipes para atingir objetivos comuns',
    'Propor melhorias nos processos existentes',
    'Participar ativamente de reuniões e iniciativas do time',
  ],
};

// Benefit phrases
const BENEFIT_PHRASES: Record<string, string> = {
  'Vale Refeição': 'Vale Refeição para suas refeições diárias',
  'Plano de Saúde': 'Plano de Saúde completo para você e dependentes',
  'Vale Transporte': 'Vale Transporte para deslocamento',
  'Home Office': 'Auxílio Home Office para equipamentos',
  'PLR': 'Participação nos Lucros e Resultados (PLR)',
  'Gym Pass': 'Gym Pass para cuidar da sua saúde',
  'Auxílio Creche': 'Auxílio Creche para quem tem filhos',
  'Seguro de Vida': 'Seguro de Vida para sua tranquilidade',
};

export function generateDescription(formData: JobFormData): string {
  const parts: string[] = [];

  // 1. Intro
  const introTemplate = formData.level ? (LEVEL_INTROS[formData.level] || DEFAULT_INTRO) : DEFAULT_INTRO;
  const intro = introTemplate
    .replace('{title}', formData.title || 'esta posição')
    .replace('{area}', formData.area || 'nossa equipe');
  parts.push(intro);

  // 2. Work type
  if (formData.type) {
    const workTypeDesc = WORK_TYPE_DESCRIPTIONS[formData.type].replace('{location}', formData.location || 'nossa sede');
    parts.push(workTypeDesc);
  }

  // 3. Responsibilities section
  parts.push('\n\n**Principais Responsabilidades:**');
  const area = detectArea(formData.title, formData.area);
  const responsibilities = RESPONSIBILITY_TEMPLATES[area] || RESPONSIBILITY_TEMPLATES['default'];
  responsibilities.forEach(resp => {
    parts.push(`• ${resp}`);
  });

  // 4. What we offer section
  if (formData.benefits.length > 0) {
    parts.push('\n\n**O que oferecemos:**');
    formData.benefits.forEach(benefit => {
      const phrase = BENEFIT_PHRASES[benefit] || benefit;
      parts.push(`• ${phrase}`);
    });

    // Add salary info if available
    if (!formData.salaryNegotiable && formData.salaryMin && formData.salaryMax) {
      const min = parseInt(formData.salaryMin);
      const max = parseInt(formData.salaryMax);
      if (min > 0 && max > 0) {
        parts.push(`• Faixa salarial: R$ ${min.toLocaleString('pt-BR')} a R$ ${max.toLocaleString('pt-BR')}`);
      }
    }
  }

  // 5. Closing
  parts.push('\n\nSe você se identifica com esta oportunidade e busca um ambiente de crescimento profissional, queremos conhecer você!');

  return parts.join('\n');
}

export function generateSalaryRange(level: string, area: string): { min: number; max: number } {
  // Base salary ranges by level (approximate market values)
  const baseSalaries: Record<string, { min: number; max: number }> = {
    'Estágio': { min: 1500, max: 2500 },
    'Junior': { min: 3000, max: 5000 },
    'Pleno': { min: 5000, max: 9000 },
    'Senior': { min: 9000, max: 15000 },
    'Especialista': { min: 12000, max: 20000 },
    'Gerente': { min: 15000, max: 25000 },
  };

  // Area multipliers
  const areaMultipliers: Record<string, number> = {
    'desenvolvimento': 1.2,
    'design': 1.0,
    'marketing': 0.9,
    'vendas': 0.95,
    'default': 1.0,
  };

  const base = baseSalaries[level] || baseSalaries['Pleno'];
  const detectedArea = detectArea('', area);
  const multiplier = areaMultipliers[detectedArea] || 1.0;

  return {
    min: Math.round(base.min * multiplier),
    max: Math.round(base.max * multiplier),
  };
}

export function suggestTitle(currentTitle: string, level: string): string {
  if (!currentTitle) return '';

  // Clean up title
  let improved = currentTitle.trim();

  // Add level if not present
  const levelKeywords = ['junior', 'júnior', 'jr', 'pleno', 'mid', 'senior', 'sênior', 'sr', 'estágio', 'estagiário'];
  const hasLevel = levelKeywords.some(kw => improved.toLowerCase().includes(kw));

  if (!hasLevel && level) {
    // Find where to insert level (usually after the role name)
    const words = improved.split(' ');
    if (words.length > 0) {
      // Insert level after first word or two
      const insertPosition = words.length > 2 ? 2 : 1;
      words.splice(insertPosition, 0, level);
      improved = words.join(' ');
    }
  }

  return improved;
}

export function suggestBenefits(currentBenefits: string[]): string[] {
  const essentialBenefits = ['Vale Refeição', 'Plano de Saúde', 'Vale Transporte'];
  const valuableBenefits = ['PLR', 'Gym Pass', 'Home Office'];

  const suggestions: string[] = [];

  // Suggest essential benefits first
  for (const benefit of essentialBenefits) {
    if (!currentBenefits.includes(benefit)) {
      suggestions.push(benefit);
    }
  }

  // Then valuable benefits
  for (const benefit of valuableBenefits) {
    if (!currentBenefits.includes(benefit)) {
      suggestions.push(benefit);
    }
  }

  return suggestions;
}

function detectArea(title: string, area: string): string {
  const text = `${title} ${area}`.toLowerCase();

  if (text.includes('desenvolvedor') || text.includes('developer') || text.includes('engenheiro') || text.includes('programador')) {
    return 'desenvolvimento';
  }
  if (text.includes('design') || text.includes('ux') || text.includes('ui')) {
    return 'design';
  }
  if (text.includes('marketing') || text.includes('growth') || text.includes('conteúdo')) {
    return 'marketing';
  }
  if (text.includes('vendas') || text.includes('comercial') || text.includes('sales')) {
    return 'vendas';
  }

  return 'default';
}

export function expandDescription(currentDescription: string, formData: JobFormData): string {
  // If description is very short, generate a full one
  const wordCount = currentDescription.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 30) {
    return generateDescription(formData);
  }

  // Otherwise, enhance the existing description
  let enhanced = currentDescription;

  // Add responsibilities section if missing
  if (!enhanced.toLowerCase().includes('responsabilidade') && !enhanced.includes('•')) {
    const area = detectArea(formData.title, formData.area);
    const responsibilities = RESPONSIBILITY_TEMPLATES[area] || RESPONSIBILITY_TEMPLATES['default'];
    enhanced += '\n\n**Principais Responsabilidades:**\n';
    responsibilities.forEach(resp => {
      enhanced += `• ${resp}\n`;
    });
  }

  // Add closing if missing
  if (!enhanced.toLowerCase().includes('queremos conhecer') && !enhanced.toLowerCase().includes('candidate-se')) {
    enhanced += '\n\nSe você se identifica com esta oportunidade, queremos conhecer você!';
  }

  return enhanced;
}
