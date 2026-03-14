// Utilitário para cálculo de completude do perfil profissional
//
// Sistema de pesos (100 pontos) alinhado com as 9 tabs do ProfessionalProfile:
// 1. Informações pessoais — 30pts (título 8, email 5, sobre 10, telefone 4, linkedin 3)
// 2. Localização — 5pts (cidade ou estado)
// 3. Disponibilidade e salário — 10pts (disponibilidade 5, faixa salarial 5)
// 4. Interesses profissionais — 5pts (opcional, setores/funções/modelo/contrato)
// 5. Experiência profissional — 15pts (progressivo: 1+ exp, 2+ exp, descrições)
// 6. Formação acadêmica — 10pts (nível educacional 5, formação detalhada 5)
// 7. Habilidades — 15pts (progressivo: 3+, 5+, 8+ skills)
// 8. Cursos e certificações — 5pts (opcional, pelo menos 1)
// 9. Documentos — 5pts (opcional, currículo PDF anexado)

import type { Curriculum, CompletenessResult, CompletenessSection } from '@/types';

export function calculateCompleteness(curriculum: Curriculum): CompletenessResult {
  const sections: CompletenessSection[] = [];
  let totalPoints = 0;

  // ---------------------------------------------------------------------------
  // 1. Informações pessoais (tab: basic) — 30pts
  // ---------------------------------------------------------------------------
  let basicPoints = 0;
  if (curriculum.title?.trim()) basicPoints += 8;
  if (curriculum.email?.trim()) basicPoints += 5;
  if ((curriculum.about?.trim()?.length ?? 0) >= 50) basicPoints += 10;
  if (curriculum.phone?.trim()) basicPoints += 4;
  if (curriculum.linkedin?.trim()) basicPoints += 3;
  totalPoints += basicPoints;

  const hasBasicInfo = Boolean(
    curriculum.title?.trim() &&
    curriculum.email?.trim() &&
    (curriculum.about?.trim()?.length ?? 0) >= 50
  );
  sections.push({
    name: 'Informações pessoais',
    key: 'basic',
    isComplete: hasBasicInfo,
    required: true,
  });

  // ---------------------------------------------------------------------------
  // 2. Localização (tab: location) — 5pts
  // ---------------------------------------------------------------------------
  const hasLocation = Boolean(
    curriculum.city?.trim() || curriculum.state?.trim() || curriculum.location?.trim()
  );
  if (hasLocation) totalPoints += 5;
  sections.push({
    name: 'Localização',
    key: 'location',
    isComplete: hasLocation,
    required: true,
  });

  // ---------------------------------------------------------------------------
  // 3. Disponibilidade e Salário (tab: salary) — 10pts
  // ---------------------------------------------------------------------------
  let salaryPoints = 0;
  if (curriculum.availability?.trim()) salaryPoints += 5;
  if (curriculum.salary?.min && curriculum.salary?.max) salaryPoints += 5;
  totalPoints += salaryPoints;

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

  // ---------------------------------------------------------------------------
  // 4. Interesses profissionais (tab: interests) — 5pts (opcional)
  // ---------------------------------------------------------------------------
  const hasInterests = Boolean(
    (curriculum.preferredSectors?.length ?? 0) > 0 ||
    (curriculum.preferredRoles?.length ?? 0) > 0 ||
    (curriculum.workModel?.length ?? 0) > 0 ||
    (curriculum.contractType?.length ?? 0) > 0
  );
  if (hasInterests) totalPoints += 5;
  sections.push({
    name: 'Interesses profissionais',
    key: 'interests',
    isComplete: hasInterests,
    required: false,
  });

  // ---------------------------------------------------------------------------
  // 5. Experiência profissional (tab: experience) — 15pts (progressivo)
  // ---------------------------------------------------------------------------
  const expCount = curriculum.experiences?.length ?? 0;
  const hasExperience = curriculum.isFirstJob || expCount > 0;
  let expPoints = 0;
  if (curriculum.isFirstJob) {
    expPoints = 15; // Primeiro emprego = seção completa
  } else {
    if (expCount >= 1) expPoints += 5;
    if (expCount >= 2) expPoints += 5;
    // Bônus: todas as experiências têm descrição
    if (expCount > 0 && curriculum.experiences.every(e => e.description?.trim())) {
      expPoints += 5;
    }
  }
  totalPoints += expPoints;
  sections.push({
    name: 'Experiência profissional',
    key: 'experience',
    isComplete: hasExperience,
    itemCount: expCount,
    required: true,
  });

  // ---------------------------------------------------------------------------
  // 6. Formação acadêmica (tab: education) — 10pts
  // ---------------------------------------------------------------------------
  let eduPoints = 0;
  if (curriculum.educationLevel) eduPoints += 5;
  if ((curriculum.education?.length ?? 0) > 0) eduPoints += 5;
  totalPoints += eduPoints;

  const hasEducation = Boolean(curriculum.educationLevel) || (curriculum.education?.length ?? 0) > 0;
  sections.push({
    name: 'Formação acadêmica',
    key: 'education',
    isComplete: hasEducation,
    itemCount: curriculum.education?.length || 0,
    required: true,
  });

  // ---------------------------------------------------------------------------
  // 7. Habilidades (tab: skills) — 15pts (progressivo)
  // ---------------------------------------------------------------------------
  const skillCount = curriculum.skills?.length ?? 0;
  let skillPoints = 0;
  if (skillCount >= 3) skillPoints += 5;
  if (skillCount >= 5) skillPoints += 5;
  if (skillCount >= 8) skillPoints += 5;
  totalPoints += skillPoints;

  const hasSkills = skillCount >= 5;
  sections.push({
    name: 'Habilidades',
    key: 'skills',
    isComplete: hasSkills,
    itemCount: skillCount,
    required: true,
  });

  // ---------------------------------------------------------------------------
  // 8. Cursos e certificações (tab: courses) — 5pts (opcional)
  // ---------------------------------------------------------------------------
  const courseCount = curriculum.courses?.length ?? 0;
  const hasCourses = courseCount > 0;
  if (hasCourses) totalPoints += 5;
  sections.push({
    name: 'Cursos e certificações',
    key: 'courses',
    isComplete: hasCourses,
    itemCount: courseCount,
    required: false,
  });

  // ---------------------------------------------------------------------------
  // 9. Documentos (tab: documents) — 5pts (opcional)
  // ---------------------------------------------------------------------------
  const hasDocuments = Boolean(curriculum.resumePdfUrl);
  if (hasDocuments) totalPoints += 5;
  sections.push({
    name: 'Documentos',
    key: 'documents',
    isComplete: hasDocuments,
    required: false,
  });

  // ---------------------------------------------------------------------------
  // Resultado final
  // ---------------------------------------------------------------------------
  const percentage = Math.min(totalPoints, 100);

  // Listar seções obrigatórias faltantes
  const missingSections = sections
    .filter(s => s.required && !s.isComplete)
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
