// PRD-022: Tipos para sistema de currículos avançados

// Níveis de proficiência para habilidades
export type SkillLevel = 'basic' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Labels em português para níveis de habilidade
export const skillLevelLabels: Record<SkillLevel, string> = {
  basic: 'Básico',
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

// Ordem numérica dos níveis (para exibição visual)
export const skillLevelOrder: Record<SkillLevel, number> = {
  basic: 1,
  beginner: 2,
  intermediate: 3,
  advanced: 4,
  expert: 5,
};

// Status de formação acadêmica
export type EducationStatus = 'completed' | 'in_progress' | 'suspended' | 'incomplete';

// Labels em português para status de formação
export const educationStatusLabels: Record<EducationStatus, string> = {
  completed: 'Completo',
  in_progress: 'Cursando',
  suspended: 'Trancado',
  incomplete: 'Incompleto',
};

// Ícones/badges para status de formação
export const educationStatusIcons: Record<EducationStatus, string> = {
  completed: '✅',
  in_progress: '🔄',
  suspended: '⏸️',
  incomplete: '❌',
};

// Tipo de habilidade
export type SkillType = 'technical' | 'behavioral';

// Labels para tipo de habilidade
export const skillTypeLabels: Record<SkillType, string> = {
  technical: 'Técnica',
  behavioral: 'Comportamental',
};

// Habilidade com nível de proficiência
export interface SkillWithLevel {
  id: string;
  name: string;
  level: SkillLevel;
  type: SkillType;
}

// Tipo de certificado
export type CertificateType = 'file' | 'link';

// Curso/Certificação
export interface Course {
  id: string;
  name: string;
  institution: string;
  year: number;
  hours?: number;
  certificateType?: CertificateType;
  certificateUrl?: string; // base64 para arquivo ou URL para link
  certificateFileName?: string;
}

// Experiência profissional (expandida)
export interface ExperienceWithCurrent {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

// Formação acadêmica com status
export interface EducationWithStatus {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear?: string;
  status: EducationStatus;
}

// Faixa salarial
export interface SalaryRange {
  min: number;
  max: number;
}

// Currículo completo
export interface Curriculum {
  id: string;
  candidateId: string;
  name: string; // Nome do currículo: "Meu Currículo", "Currículo Tech", etc.
  isDefault: boolean;
  isArchived: boolean;

  // Informações pessoais
  title: string; // Título profissional
  location: string;
  phone?: string;
  email: string;
  linkedin?: string;

  // Resumo
  about?: string;

  // Preferências
  availability: string;
  salary: SalaryRange;

  // Seções do currículo
  experiences: ExperienceWithCurrent[];
  education: EducationWithStatus[];
  skills: SkillWithLevel[];
  courses: Course[];

  // Metadados
  createdAt: string;
  updatedAt: string;
}

// Seção de completude
export interface CompletenessSection {
  name: string;
  key: string;
  isComplete: boolean;
  itemCount?: number;
  required: boolean;
}

// Resultado do cálculo de completude
export interface CompletenessResult {
  percentage: number;
  sections: CompletenessSection[];
  missingSections: string[];
}
