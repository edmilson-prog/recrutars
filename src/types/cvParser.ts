// Tipos para o Parser Inteligente de Currículo (PRD-038)

export interface ParsedPersonalData {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  confidence: number;
}

export interface ParsedExperience {
  id: string;
  company: string | null;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  confidence: number;
}

export interface ParsedEducation {
  id: string;
  institution: string | null;
  degree: string | null;
  field: string | null;
  startYear: string | null;
  endYear: string | null;
  confidence: number;
}

export type SkillType = 'technical' | 'behavioral' | 'tool' | 'language';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ParsedSkill {
  id: string;
  name: string;
  normalizedName: string;
  level: SkillLevel | null;
  type: SkillType;
  confidence: number;
}

export interface ParsedCV {
  personalData: ParsedPersonalData;
  objective: string | null;
  experiences: ParsedExperience[];
  education: ParsedEducation[];
  skills: ParsedSkill[];
  courses: string[];
  rawText: string;
  parseDate: Date;
}

export type CVParserStage =
  | 'idle'
  | 'reading'
  | 'extracting'
  | 'identifying_sections'
  | 'parsing_personal'
  | 'parsing_experience'
  | 'parsing_education'
  | 'parsing_skills'
  | 'normalizing'
  | 'complete'
  | 'error';

export interface CVParserProgress {
  stage: CVParserStage;
  progress: number; // 0-100
  message: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}

export const VALID_CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const MAX_CV_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface CVUploadValidation {
  isValid: boolean;
  error?: string;
}

export function validateCVFile(file: File): CVUploadValidation {
  if (!VALID_CV_MIME_TYPES.includes(file.type as typeof VALID_CV_MIME_TYPES[number])) {
    return {
      isValid: false,
      error: 'Formato inválido. Apenas PDF, DOC e DOCX são aceitos.',
    };
  }

  if (file.size > MAX_CV_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Arquivo muito grande. O tamanho máximo é 5MB.',
    };
  }

  return { isValid: true };
}
