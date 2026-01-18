/**
 * Data Extractors - PRD-038
 * Extrai dados específicos de cada seção do currículo
 */

import {
  ParsedPersonalData,
  ParsedExperience,
  ParsedEducation,
  ParsedSkill,
} from '@/types/cvParser';
import {
  normalizeSkillName,
  classifySkillType,
  extractSkillLevel,
  isValidSkill,
  calculateSkillConfidence,
} from './skillNormalizer';

/**
 * Gera um ID único simples
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// ============ EXTRAÇÃO DE DADOS PESSOAIS ============

// Regex para email
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// Regex para telefone (BR e internacional)
const PHONE_REGEX = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-.\s]?\d{4}/;

// Regex para LinkedIn
const LINKEDIN_REGEX = /(?:linkedin\.com\/in\/|linkedin:?\s*)([a-zA-Z0-9-]+)/i;

// Cidades brasileiras comuns (para detecção de localização)
const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

/**
 * Extrai dados pessoais do texto
 */
export function extractPersonalData(section: string): ParsedPersonalData {
  const lines = section.split('\n').filter((line) => line.trim());
  let confidence = 0;
  let foundFields = 0;

  // Nome - geralmente a primeira linha não vazia
  const name = extractName(lines);
  if (name) foundFields++;

  // Email
  const emailMatch = section.match(EMAIL_REGEX);
  const email = emailMatch ? emailMatch[0] : null;
  if (email) foundFields++;

  // Telefone
  const phoneMatch = section.match(PHONE_REGEX);
  const phone = phoneMatch ? formatPhone(phoneMatch[0]) : null;
  if (phone) foundFields++;

  // LinkedIn
  const linkedinMatch = section.match(LINKEDIN_REGEX);
  const linkedin = linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : null;
  if (linkedin) foundFields++;

  // Localização
  const location = extractLocation(section);
  if (location) foundFields++;

  // Calcular confiança baseado nos campos encontrados
  confidence = Math.min(foundFields / 3, 1); // 3 campos = confiança máxima

  return {
    name,
    email,
    phone,
    location,
    linkedin,
    confidence,
  };
}

/**
 * Extrai nome do candidato
 */
function extractName(lines: string[]): string | null {
  if (lines.length === 0) return null;

  // Primeira linha geralmente é o nome
  const firstLine = lines[0].trim();

  // Verificar se parece um nome (não é email, telefone, etc.)
  if (
    !firstLine.includes('@') &&
    !firstLine.match(/^\d/) &&
    !firstLine.toLowerCase().includes('curriculum') &&
    !firstLine.toLowerCase().includes('currículo') &&
    firstLine.length > 2 &&
    firstLine.length < 60
  ) {
    return firstLine;
  }

  // Tentar segunda linha se a primeira não for válida
  if (lines.length > 1) {
    const secondLine = lines[1].trim();
    if (
      !secondLine.includes('@') &&
      !secondLine.match(/^\d/) &&
      secondLine.length > 2 &&
      secondLine.length < 60
    ) {
      return secondLine;
    }
  }

  return null;
}

/**
 * Formata número de telefone
 */
function formatPhone(phone: string): string {
  // Remove caracteres não numéricos
  const digits = phone.replace(/\D/g, '');

  // Formatar para padrão brasileiro
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone.trim();
}

/**
 * Extrai localização do texto
 */
function extractLocation(text: string): string | null {
  // Procurar por padrão "Cidade - UF" ou "Cidade/UF" ou "Cidade, UF"
  for (const state of BRAZILIAN_STATES) {
    const patterns = [
      new RegExp(`([A-Za-zÀ-ÿ\\s]+)\\s*[-/,]\\s*${state}\\b`, 'i'),
      new RegExp(`${state}\\s*[-/,]\\s*([A-Za-zÀ-ÿ\\s]+)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const city = match[1].trim();
        if (city.length > 2 && city.length < 30) {
          return `${city} - ${state}`;
        }
      }
    }
  }

  return null;
}

// ============ EXTRAÇÃO DE EXPERIÊNCIAS ============

// Regex para datas de emprego
const DATE_PATTERNS = [
  // "jan/2020 - dez/2022" ou "janeiro 2020 a dezembro 2022"
  /(?:jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)[/\s]*(\d{4})\s*[-–aà]\s*(?:(?:jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)[/\s]*(\d{4})|(?:atual|presente|current))/gi,
  // "2020 - 2022" ou "2020 - atual"
  /(\d{4})\s*[-–]\s*(?:(\d{4})|(?:atual|presente|current))/gi,
  // "MM/YYYY - MM/YYYY"
  /(\d{1,2}\/\d{4})\s*[-–]\s*(?:(\d{1,2}\/\d{4})|(?:atual|presente|current))/gi,
];

/**
 * Extrai experiências profissionais do texto
 */
export function extractExperiences(section: string): ParsedExperience[] {
  const experiences: ParsedExperience[] = [];
  const lines = section.split('\n').filter((line) => line.trim());

  if (lines.length === 0) return [];

  // Estratégia: dividir por possíveis entradas de experiência
  const entries = splitExperienceEntries(lines);

  for (const entry of entries) {
    const experience = parseExperienceEntry(entry);
    if (experience) {
      experiences.push(experience);
    }
  }

  return experiences;
}

/**
 * Divide o texto em entradas individuais de experiência
 */
function splitExperienceEntries(lines: string[]): string[][] {
  const entries: string[][] = [];
  let currentEntry: string[] = [];

  for (const line of lines) {
    // Nova entrada se a linha parece ser um cabeçalho de experiência
    // (contém data ou é toda em maiúsculas)
    if (looksLikeExperienceHeader(line) && currentEntry.length > 0) {
      entries.push([...currentEntry]);
      currentEntry = [];
    }
    currentEntry.push(line);
  }

  if (currentEntry.length > 0) {
    entries.push(currentEntry);
  }

  return entries;
}

/**
 * Verifica se uma linha parece ser o início de uma nova experiência
 */
function looksLikeExperienceHeader(line: string): boolean {
  // Contém data
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex state
    if (pattern.test(line)) return true;
  }

  // Linha curta toda em maiúsculas (possível nome de empresa)
  if (line.length < 50 && line === line.toUpperCase() && line.length > 3) {
    return true;
  }

  return false;
}

/**
 * Parseia uma entrada de experiência
 */
function parseExperienceEntry(lines: string[]): ParsedExperience | null {
  if (lines.length === 0) return null;

  const fullText = lines.join(' ');
  let confidence = 0.3;

  // Extrair datas
  const dates = extractDates(fullText);
  if (dates.start) confidence += 0.2;

  // Extrair empresa e cargo
  const { company, role } = extractCompanyAndRole(lines);
  if (company) confidence += 0.2;
  if (role) confidence += 0.2;

  // Extrair descrição (linhas após empresa/cargo)
  const description = extractDescription(lines, 2);
  if (description && description.length > 20) confidence += 0.1;

  return {
    id: generateId(),
    company,
    role,
    startDate: dates.start,
    endDate: dates.end,
    isCurrent: dates.isCurrent,
    description,
    confidence: Math.min(confidence, 1),
  };
}

/**
 * Extrai datas de início e fim
 */
function extractDates(text: string): { start: string | null; end: string | null; isCurrent: boolean } {
  const lower = text.toLowerCase();
  const isCurrent = lower.includes('atual') || lower.includes('presente') || lower.includes('current');

  // Tentar cada padrão de data
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) {
      return {
        start: match[1] || null,
        end: isCurrent ? null : match[2] || null,
        isCurrent,
      };
    }
  }

  return { start: null, end: null, isCurrent };
}

/**
 * Extrai empresa e cargo das primeiras linhas
 */
function extractCompanyAndRole(lines: string[]): { company: string | null; role: string | null } {
  if (lines.length === 0) return { company: null, role: null };

  let company: string | null = null;
  let role: string | null = null;

  // Primeira linha geralmente contém empresa ou cargo
  const firstLine = cleanExperienceLine(lines[0]);
  const secondLine = lines.length > 1 ? cleanExperienceLine(lines[1]) : null;

  // Heurísticas para distinguir empresa de cargo
  if (firstLine) {
    if (looksLikeCompanyName(firstLine)) {
      company = firstLine;
      if (secondLine && !looksLikeCompanyName(secondLine)) {
        role = secondLine;
      }
    } else {
      role = firstLine;
      if (secondLine && looksLikeCompanyName(secondLine)) {
        company = secondLine;
      }
    }
  }

  return { company, role };
}

/**
 * Limpa uma linha de experiência removendo datas e separadores
 */
function cleanExperienceLine(line: string): string | null {
  let cleaned = line;

  // Remover datas
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    cleaned = cleaned.replace(pattern, '');
  }

  // Remover separadores comuns
  cleaned = cleaned.replace(/[-–|•]/g, ' ').trim();

  if (cleaned.length < 3) return null;
  return cleaned;
}

/**
 * Verifica se o texto parece ser nome de empresa
 */
function looksLikeCompanyName(text: string): boolean {
  const lower = text.toLowerCase();

  // Sufixos comuns de empresas
  const companySuffixes = ['ltda', 'sa', 's.a.', 'inc', 'corp', 'eireli', 'me', 'epp'];
  for (const suffix of companySuffixes) {
    if (lower.includes(suffix)) return true;
  }

  // Toda em maiúsculas sugere nome de empresa
  if (text === text.toUpperCase() && text.length > 3 && text.length < 50) {
    return true;
  }

  return false;
}

/**
 * Extrai descrição das linhas restantes
 */
function extractDescription(lines: string[], skipLines: number): string | null {
  if (lines.length <= skipLines) return null;

  const descriptionLines = lines.slice(skipLines);
  const description = descriptionLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(' ');

  return description.length > 10 ? description : null;
}

// ============ EXTRAÇÃO DE EDUCAÇÃO ============

// Padrões de graus acadêmicos
const DEGREE_PATTERNS = [
  // Graduação
  /(?:bacharel(?:ado)?|licenciatura|tecnólogo|tecnologo|graduação|graduation|bachelor)/i,
  // Pós-graduação
  /(?:pós[-\s]?gradua[çc][aã]o|especializa[çc][aã]o|mba|lato\s*sensu)/i,
  // Mestrado
  /(?:mestrado|master|msc|m\.sc)/i,
  // Doutorado
  /(?:doutorado|phd|ph\.d|doctorate)/i,
  // Técnico
  /(?:t[ée]cnico|technical)/i,
];

/**
 * Extrai formação acadêmica do texto
 */
export function extractEducation(section: string): ParsedEducation[] {
  const education: ParsedEducation[] = [];
  const lines = section.split('\n').filter((line) => line.trim());

  if (lines.length === 0) return [];

  // Dividir em entradas
  const entries = splitEducationEntries(lines);

  for (const entry of entries) {
    const edu = parseEducationEntry(entry);
    if (edu) {
      education.push(edu);
    }
  }

  return education;
}

/**
 * Divide em entradas de educação
 */
function splitEducationEntries(lines: string[]): string[][] {
  const entries: string[][] = [];
  let currentEntry: string[] = [];

  for (const line of lines) {
    // Nova entrada se a linha contém um grau acadêmico
    if (containsDegree(line) && currentEntry.length > 0) {
      entries.push([...currentEntry]);
      currentEntry = [];
    }
    currentEntry.push(line);
  }

  if (currentEntry.length > 0) {
    entries.push(currentEntry);
  }

  // Se não dividiu, tratar tudo como uma entrada
  if (entries.length === 0 && lines.length > 0) {
    entries.push(lines);
  }

  return entries;
}

/**
 * Verifica se a linha contém menção a grau acadêmico
 */
function containsDegree(line: string): boolean {
  for (const pattern of DEGREE_PATTERNS) {
    if (pattern.test(line)) return true;
  }
  return false;
}

/**
 * Parseia uma entrada de educação
 */
function parseEducationEntry(lines: string[]): ParsedEducation | null {
  if (lines.length === 0) return null;

  const fullText = lines.join(' ');
  let confidence = 0.3;

  // Extrair grau
  const degree = extractDegree(fullText);
  if (degree) confidence += 0.2;

  // Extrair instituição
  const institution = extractInstitution(lines);
  if (institution) confidence += 0.2;

  // Extrair área de estudo
  const field = extractField(fullText);
  if (field) confidence += 0.15;

  // Extrair anos
  const years = extractYears(fullText);
  if (years.start) confidence += 0.15;

  return {
    id: generateId(),
    institution,
    degree,
    field,
    startYear: years.start,
    endYear: years.end,
    confidence: Math.min(confidence, 1),
  };
}

/**
 * Extrai o grau acadêmico
 */
function extractDegree(text: string): string | null {
  const lower = text.toLowerCase();

  if (lower.includes('doutorado') || lower.includes('phd')) return 'Doutorado';
  if (lower.includes('mestrado') || lower.includes('master')) return 'Mestrado';
  if (lower.includes('mba')) return 'MBA';
  if (lower.includes('pós-graduação') || lower.includes('pos-graduacao') || lower.includes('especialização')) {
    return 'Pós-Graduação';
  }
  if (lower.includes('bacharelado') || lower.includes('bacharel')) return 'Bacharelado';
  if (lower.includes('licenciatura')) return 'Licenciatura';
  if (lower.includes('tecnólogo') || lower.includes('tecnologo')) return 'Tecnólogo';
  if (lower.includes('técnico') || lower.includes('tecnico')) return 'Técnico';

  return null;
}

/**
 * Extrai instituição de ensino
 */
function extractInstitution(lines: string[]): string | null {
  // Siglas comuns de instituições
  const institutionPatterns = [
    /\b(USP|UNICAMP|UFRJ|UFMG|UFRGS|UFSC|UFPR|UNB|UFC|UFPE|UFBA|PUC|MACKENZIE|FGV|SENAC|SENAI|FATEC|ETEC|IF[A-Z]{2})\b/i,
    /\b(universidade|faculdade|instituto|centro\s+universit[áa]rio|university|college)\s+[a-zA-ZÀ-ÿ\s]+/i,
  ];

  for (const line of lines) {
    for (const pattern of institutionPatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
  }

  // Primeira linha pode ser a instituição
  if (lines.length > 0 && lines[0].length < 80) {
    return lines[0].trim();
  }

  return null;
}

/**
 * Extrai área de estudo
 */
function extractField(text: string): string | null {
  // Padrões para áreas de estudo
  const fieldPatterns = [
    /(?:em|in|curso\s+de)\s+([A-Za-zÀ-ÿ\s]+?)(?:\s*[-–]|\s*\d|$)/i,
    /([A-Za-zÀ-ÿ\s]+?)\s*(?:bacharel|licenciatura|tecnólogo)/i,
  ];

  for (const pattern of fieldPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const field = match[1].trim();
      if (field.length > 3 && field.length < 50) {
        return field;
      }
    }
  }

  return null;
}

/**
 * Extrai anos de início e conclusão
 */
function extractYears(text: string): { start: string | null; end: string | null } {
  // Procurar por padrão "YYYY - YYYY" ou "YYYY"
  const yearMatch = text.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (yearMatch) {
    return { start: yearMatch[1], end: yearMatch[2] };
  }

  // Anos isolados
  const years = text.match(/\b(20\d{2}|19\d{2})\b/g);
  if (years && years.length >= 2) {
    return { start: years[0], end: years[1] };
  }
  if (years && years.length === 1) {
    return { start: null, end: years[0] };
  }

  return { start: null, end: null };
}

// ============ EXTRAÇÃO DE HABILIDADES ============

/**
 * Extrai habilidades do texto
 */
export function extractSkills(section: string): ParsedSkill[] {
  const skills: ParsedSkill[] = [];
  const seenSkills = new Set<string>();

  // Separar por delimitadores comuns
  const parts = section.split(/[,;•|/\n]+/);

  for (const part of parts) {
    const trimmed = part.trim();

    // Pular se já vimos ou é muito curto/longo
    if (!isValidSkill(trimmed)) continue;

    const normalizedName = normalizeSkillName(trimmed);
    const lowerNormalized = normalizedName.toLowerCase();

    if (seenSkills.has(lowerNormalized)) continue;
    seenSkills.add(lowerNormalized);

    const skill: ParsedSkill = {
      id: generateId(),
      name: trimmed,
      normalizedName,
      level: extractSkillLevel(trimmed),
      type: classifySkillType(normalizedName),
      confidence: calculateSkillConfidence(normalizedName, trimmed),
    };

    skills.push(skill);
  }

  return skills;
}

/**
 * Extrai cursos do texto
 */
export function extractCourses(section: string): string[] {
  const lines = section.split('\n').filter((line) => line.trim());
  const courses: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Filtrar linhas muito curtas ou que parecem cabeçalhos
    if (trimmed.length > 5 && trimmed.length < 200 && !trimmed.endsWith(':')) {
      courses.push(trimmed);
    }
  }

  return courses;
}
