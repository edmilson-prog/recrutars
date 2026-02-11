// Utilitário para cálculo de completude do perfil profissional
//
// Calcula a completude baseado em 7 seções alinhadas com as tabs do ProfessionalProfile:
// 1. Informações pessoais (título, email, sobre)
// 2. Localização (cidade ou estado)
// 3. Disponibilidade e salário (disponibilidade, faixa salarial)
// 4. Interesses profissionais (setores, funções, modalidade ou contrato)
// 5. Experiência profissional (pelo menos 1)
// 6. Formação acadêmica (pelo menos 1)
// 7. Habilidades (pelo menos 3)

import type { Curriculum, CompletenessResult, CompletenessSection } from '@/types';

export function calculateCompleteness(curriculum: Curriculum): CompletenessResult {
  const sections: CompletenessSection[] = [];
  let completedCount = 0;

  // 1. Informações pessoais (tab: basic)
  const hasBasicInfo = Boolean(
    curriculum.title?.trim() &&
    curriculum.email?.trim() &&
    curriculum.about?.trim()
  );
  sections.push({
    name: 'Informações pessoais',
    key: 'basic',
    isComplete: hasBasicInfo,
    required: true,
  });
  if (hasBasicInfo) completedCount++;

  // 2. Localização (tab: location)
  const hasLocation = Boolean(
    curriculum.city?.trim() || curriculum.state?.trim() || curriculum.location?.trim()
  );
  sections.push({
    name: 'Localização',
    key: 'location',
    isComplete: hasLocation,
    required: true,
  });
  if (hasLocation) completedCount++;

  // 3. Disponibilidade e Salário (tabs: basic + salary)
  const hasSalaryInfo = Boolean(
    curriculum.availability?.trim() &&
    curriculum.salary?.min &&
    curriculum.salary?.max
  );
  sections.push({
    name: 'Disponibilidade e salário',
    key: 'salary',
    isComplete: hasSalaryInfo,
    required: true,
  });
  if (hasSalaryInfo) completedCount++;

  // 4. Interesses profissionais (tab: interests)
  const hasInterests = Boolean(
    (curriculum.preferredSectors?.length ?? 0) > 0 ||
    (curriculum.preferredRoles?.length ?? 0) > 0 ||
    (curriculum.workModel?.length ?? 0) > 0 ||
    (curriculum.contractType?.length ?? 0) > 0
  );
  sections.push({
    name: 'Interesses profissionais',
    key: 'interests',
    isComplete: hasInterests,
    required: false,
  });
  if (hasInterests) completedCount++;

  // 5. Experiência profissional (tab: experience)
  const hasExperience = (curriculum.experiences?.length ?? 0) > 0;
  sections.push({
    name: 'Experiência profissional',
    key: 'experience',
    isComplete: hasExperience,
    itemCount: curriculum.experiences?.length || 0,
    required: true,
  });
  if (hasExperience) completedCount++;

  // 6. Formação acadêmica (tab: education)
  const hasEducation = (curriculum.education?.length ?? 0) > 0;
  sections.push({
    name: 'Formação acadêmica',
    key: 'education',
    isComplete: hasEducation,
    itemCount: curriculum.education?.length || 0,
    required: true,
  });
  if (hasEducation) completedCount++;

  // 7. Habilidades (tab: skills)
  const hasSkills = (curriculum.skills?.length ?? 0) >= 3;
  sections.push({
    name: 'Habilidades',
    key: 'skills',
    isComplete: hasSkills,
    itemCount: curriculum.skills?.length || 0,
    required: true,
  });
  if (hasSkills) completedCount++;

  // Calcular porcentagem (7 seções)
  const percentage = Math.round((completedCount / sections.length) * 100);

  // Listar seções faltantes
  const missingSections = sections
    .filter(s => !s.isComplete)
    .map(s => s.name);

  return {
    percentage,
    sections,
    missingSections,
  };
}

/**
 * Retorna o ícone/emoji apropriado para o status de completude de uma seção
 */
export function getCompleteSectionIcon(isComplete: boolean, required: boolean): string {
  if (isComplete) return '✅';
  if (required) return '❌';
  return '⚠️';
}

/**
 * Retorna a cor CSS para a barra de progresso baseada na porcentagem
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 86) return 'bg-green-500';
  if (percentage >= 57) return 'bg-yellow-500';
  if (percentage >= 29) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Retorna uma mensagem motivacional baseada na completude
 */
export function getCompletenessMessage(percentage: number): string {
  if (percentage === 100) return 'Parabéns! Seu perfil está completo.';
  if (percentage >= 86) return 'Quase lá! Finalize as últimas seções.';
  if (percentage >= 57) return 'Bom progresso! Continue preenchendo.';
  if (percentage >= 29) return 'Perfis completos têm 3x mais visualizações.';
  return 'Complete seu perfil para aumentar suas chances.';
}

/**
 * Formata a data de atualização para exibição
 */
export function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Atualizado hoje';
  if (diffDays === 1) return 'Atualizado ontem';
  if (diffDays < 7) return `Atualizado há ${diffDays} dias`;
  if (diffDays < 30) return `Atualizado há ${Math.floor(diffDays / 7)} semanas`;

  return `Atualizado em ${date.toLocaleDateString('pt-BR')}`;
}
