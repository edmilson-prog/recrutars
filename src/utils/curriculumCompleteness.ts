// PRD-022: Utilitário para cálculo de completude de currículo

import type { Curriculum, CompletenessResult, CompletenessSection } from '@/types';

/**
 * Calcula a completude de um currículo baseado em 5 seções principais.
 * Cada seção vale 20% (5 seções = 100%).
 *
 * Seções:
 * 1. Informações básicas (título, localização, email, sobre, disponibilidade, salário)
 * 2. Experiência profissional (pelo menos 1)
 * 3. Formação acadêmica (pelo menos 1)
 * 4. Habilidades (pelo menos 3)
 * 5. Cursos/Certificações (pelo menos 1)
 */
export function calculateCompleteness(curriculum: Curriculum): CompletenessResult {
  const sections: CompletenessSection[] = [];
  let completedCount = 0;

  // 1. Informações básicas
  const hasBasicInfo = Boolean(
    curriculum.title?.trim() &&
    curriculum.location?.trim() &&
    curriculum.email?.trim() &&
    curriculum.about?.trim() &&
    curriculum.availability?.trim() &&
    curriculum.salary?.min &&
    curriculum.salary?.max
  );
  sections.push({
    name: 'Informações básicas',
    key: 'basic',
    isComplete: hasBasicInfo,
    required: true,
  });
  if (hasBasicInfo) completedCount++;

  // 2. Experiência profissional
  const hasExperience = curriculum.experiences?.length > 0;
  sections.push({
    name: 'Experiência profissional',
    key: 'experience',
    isComplete: hasExperience,
    itemCount: curriculum.experiences?.length || 0,
    required: true,
  });
  if (hasExperience) completedCount++;

  // 3. Formação acadêmica
  const hasEducation = curriculum.education?.length > 0;
  sections.push({
    name: 'Formação acadêmica',
    key: 'education',
    isComplete: hasEducation,
    itemCount: curriculum.education?.length || 0,
    required: true,
  });
  if (hasEducation) completedCount++;

  // 4. Habilidades (mínimo 3 para considerar completo)
  const hasSkills = curriculum.skills?.length >= 3;
  sections.push({
    name: 'Habilidades',
    key: 'skills',
    isComplete: hasSkills,
    itemCount: curriculum.skills?.length || 0,
    required: true,
  });
  if (hasSkills) completedCount++;

  // 5. Cursos/Certificações (opcional mas conta na completude)
  const hasCourses = curriculum.courses?.length > 0;
  sections.push({
    name: 'Cursos e certificações',
    key: 'courses',
    isComplete: hasCourses,
    itemCount: curriculum.courses?.length || 0,
    required: false,
  });
  if (hasCourses) completedCount++;

  // Calcular porcentagem (cada seção vale 20%)
  const percentage = Math.round((completedCount / 5) * 100);

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
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  if (percentage >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Retorna uma mensagem motivacional baseada na completude
 */
export function getCompletenessMessage(percentage: number): string {
  if (percentage === 100) return 'Parabéns! Seu currículo está completo.';
  if (percentage >= 80) return 'Quase lá! Finalize as últimas seções.';
  if (percentage >= 60) return 'Bom progresso! Continue preenchendo.';
  if (percentage >= 40) return 'Currículos completos têm 3x mais visualizações.';
  return 'Complete seu currículo para aumentar suas chances.';
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
