/**
 * CV Parser - PRD-038
 * Orquestra a extração e parsing de dados de currículos
 */

import { ParsedCV, CVParserProgress, validateCVFile } from '@/types/cvParser';
import { extractText } from './textExtractor';
import { identifySections } from './sectionParser';
import {
  extractPersonalData,
  extractExperiences,
  extractEducation,
  extractSkills,
  extractCourses,
} from './dataExtractors';

export type ProgressCallback = (progress: CVParserProgress) => void;

/**
 * Faz o parsing completo de um arquivo de currículo
 */
export async function parseCV(
  file: File,
  onProgress?: ProgressCallback
): Promise<ParsedCV> {
  // Validar arquivo
  const validation = validateCVFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Etapa 1: Lendo arquivo
  onProgress?.({
    stage: 'reading',
    progress: 10,
    message: 'Lendo arquivo...',
  });

  await delay(200); // Pequeno delay para UX

  // Etapa 2: Extraindo texto
  onProgress?.({
    stage: 'extracting',
    progress: 20,
    message: 'Extraindo texto do documento...',
  });

  let rawText: string;
  try {
    rawText = await extractText(file);
  } catch (error) {
    throw new Error('Não foi possível extrair o texto do documento. Verifique se o arquivo não está corrompido.');
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new Error('O documento parece estar vazio ou com pouco conteúdo.');
  }

  await delay(300);

  // Etapa 3: Identificando seções
  onProgress?.({
    stage: 'identifying_sections',
    progress: 30,
    message: 'Identificando seções do currículo...',
  });

  const sections = identifySections(rawText);

  await delay(200);

  // Etapa 4: Extraindo dados pessoais
  onProgress?.({
    stage: 'parsing_personal',
    progress: 40,
    message: 'Extraindo dados pessoais...',
  });

  const personalData = extractPersonalData(sections.personal || rawText.substring(0, 500));

  await delay(200);

  // Etapa 5: Extraindo experiências
  onProgress?.({
    stage: 'parsing_experience',
    progress: 55,
    message: 'Extraindo experiências profissionais...',
  });

  const experiences = extractExperiences(sections.experience);

  await delay(200);

  // Etapa 6: Extraindo educação
  onProgress?.({
    stage: 'parsing_education',
    progress: 70,
    message: 'Extraindo formação acadêmica...',
  });

  const education = extractEducation(sections.education);

  await delay(200);

  // Etapa 7: Extraindo habilidades
  onProgress?.({
    stage: 'parsing_skills',
    progress: 85,
    message: 'Extraindo habilidades...',
  });

  const skills = extractSkills(sections.skills);

  // Etapa 8: Extraindo cursos
  const courses = extractCourses(sections.courses);

  await delay(200);

  // Etapa 9: Normalizando dados
  onProgress?.({
    stage: 'normalizing',
    progress: 95,
    message: 'Finalizando análise...',
  });

  await delay(300);

  // Etapa 10: Completo
  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'Análise concluída!',
  });

  return {
    personalData,
    objective: sections.objective || null,
    experiences,
    education,
    skills,
    courses,
    rawText,
    parseDate: new Date(),
  };
}

/**
 * Helper para adicionar delays (melhora UX do progresso)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Re-exportar tipos e utilitários úteis
export { validateCVFile } from '@/types/cvParser';
export { extractText } from './textExtractor';
export { identifySections } from './sectionParser';
export {
  extractPersonalData,
  extractExperiences,
  extractEducation,
  extractSkills,
} from './dataExtractors';
export {
  normalizeSkillName,
  classifySkillType,
} from './skillNormalizer';
