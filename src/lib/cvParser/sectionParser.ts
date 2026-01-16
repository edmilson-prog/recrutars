/**
 * Section Parser - PRD-038
 * Identifica e separa seções do currículo
 */

export interface CVSections {
  personal: string;
  objective: string;
  experience: string;
  education: string;
  skills: string;
  courses: string;
  other: string;
}

// Padrões de cabeçalhos em PT-BR e EN
const SECTION_PATTERNS: Record<keyof Omit<CVSections, 'personal' | 'other'>, RegExp[]> = {
  objective: [
    /^(?:objetivo|objetivos?(?:\s+profissionai?s)?|objetivo\s+de\s+carreira|resumo|perfil|summary|profile|career\s+objective)/im,
  ],
  experience: [
    /^(?:experi[êe]ncia(?:s)?(?:\s+profissionai?s)?|hist[oó]rico(?:\s+profissional)?|trabalho|empregos?|work\s+experience|professional\s+experience|employment(?:\s+history)?)/im,
  ],
  education: [
    /^(?:forma[çc][aã]o(?:\s+acad[êe]mica)?|educa[çc][aã]o|estudos?|escolaridade|education|academic\s+background|qualifications?)/im,
  ],
  skills: [
    /^(?:habilidades?|compet[êe]ncias?|conhecimentos?(?:\s+t[ée]cnicos)?|skills?|technical\s+skills?|core\s+competencies|tecnologias?)/im,
  ],
  courses: [
    /^(?:cursos?|certifica[çc][õo]es?|treinamentos?|courses?|certifications?|training|professional\s+development)/im,
  ],
};

/**
 * Normaliza o texto para facilitar a identificação de seções
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Encontra a posição de um cabeçalho de seção no texto
 */
function findSectionStart(text: string, patterns: RegExp[]): number {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      return match.index;
    }
  }
  return -1;
}

/**
 * Identifica todas as seções do currículo
 */
export function identifySections(rawText: string): CVSections {
  const text = normalizeText(rawText);

  // Encontrar posições de cada seção
  const sectionPositions: { key: keyof CVSections; start: number }[] = [];

  for (const [key, patterns] of Object.entries(SECTION_PATTERNS)) {
    const start = findSectionStart(text, patterns);
    if (start !== -1) {
      sectionPositions.push({ key: key as keyof CVSections, start });
    }
  }

  // Ordenar por posição
  sectionPositions.sort((a, b) => a.start - b.start);

  // Inicializar seções vazias
  const sections: CVSections = {
    personal: '',
    objective: '',
    experience: '',
    education: '',
    skills: '',
    courses: '',
    other: '',
  };

  // Se não encontrou nenhuma seção, considerar tudo como "other"
  if (sectionPositions.length === 0) {
    sections.other = text;
    return sections;
  }

  // Extrair texto inicial (dados pessoais geralmente no topo)
  const firstSectionStart = sectionPositions[0].start;
  if (firstSectionStart > 0) {
    sections.personal = text.substring(0, firstSectionStart).trim();
  }

  // Extrair cada seção
  for (let i = 0; i < sectionPositions.length; i++) {
    const current = sectionPositions[i];
    const next = sectionPositions[i + 1];

    const sectionEnd = next ? next.start : text.length;
    const sectionText = text.substring(current.start, sectionEnd).trim();

    // Remover o cabeçalho da seção do texto
    const lines = sectionText.split('\n');
    const contentLines = lines.slice(1).join('\n').trim();

    sections[current.key] = contentLines;
  }

  return sections;
}

/**
 * Extrai linhas não vazias de uma seção
 */
export function extractNonEmptyLines(section: string): string[] {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Detecta se uma linha parece ser um cabeçalho de subseção
 */
export function isSubsectionHeader(line: string): boolean {
  // Linhas curtas, toda em maiúsculas, ou que terminam com ":"
  if (line.length < 50 && line === line.toUpperCase()) return true;
  if (line.endsWith(':')) return true;
  return false;
}
