/**
 * Standardized Skills Types
 * Sistema padronizado de habilidades/competencias (40+40)
 */

export interface StandardizedSkill {
  id: string;
  name: string;
  slug: string;
  type: 'technical' | 'behavioral';
  category: string;
  sortOrder: number;
}

export interface CandidateStandardizedSkill {
  id: string;
  candidateId: string;
  skillId: string;
  priority: number;
  skill?: StandardizedSkill;
}

export interface JobStandardizedSkill {
  id: string;
  jobId: string;
  skillId: string;
  priority: number;
  skill?: StandardizedSkill;
}

export interface SkillCategory {
  name: string;
  skills: StandardizedSkill[];
}

/** Category labels in Portuguese for UI display */
export const skillCategoryLabels: Record<string, string> = {
  // Behavioral categories
  'Liderança e Influência': 'Liderança e Influência',
  'Comunicação e Relacionamento': 'Comunicação e Relacionamento',
  'Organização e Execução': 'Organização e Execução',
  'Pensamento e Resolução': 'Pensamento e Resolução',
  'Adaptabilidade e Crescimento': 'Adaptabilidade e Crescimento',
  'Colaboração e Serviço': 'Colaboração e Serviço',
  // Technical categories
  'Tecnologia e Digital': 'Tecnologia e Digital',
  'Gestão e Processos': 'Gestão e Processos',
  'Comercial e Atendimento': 'Comercial e Atendimento',
  'Financeiro e Administrativo': 'Financeiro e Administrativo',
  'Saúde e Regulatório': 'Saúde e Regulatório',
  'Pessoas e Desenvolvimento': 'Pessoas e Desenvolvimento',
};

/** Group flat skill array into categories */
export function groupSkillsByCategory(skills: StandardizedSkill[]): SkillCategory[] {
  const grouped = new Map<string, StandardizedSkill[]>();

  for (const skill of skills) {
    const existing = grouped.get(skill.category) || [];
    existing.push(skill);
    grouped.set(skill.category, existing);
  }

  return Array.from(grouped.entries()).map(([name, categorySkills]) => ({
    name,
    skills: categorySkills.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}
