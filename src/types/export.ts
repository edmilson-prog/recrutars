/**
 * Export Types
 * PRD-032: Exportar Candidatos (Empresa)
 */

export type ExportFormat = 'xlsx' | 'pdf';

export type ExportSection =
  | 'basicInfo'
  | 'experience'
  | 'education'
  | 'skills'
  | 'disc'
  | 'match'
  | 'salary'
  | 'aiAnalysis';

export type ExportOrder =
  | 'match_desc'
  | 'match_asc'
  | 'name_asc'
  | 'experience_desc'
  | 'recent';

export interface ExportConfig {
  format: ExportFormat;
  sections: ExportSection[];
  orderBy: ExportOrder;
}

export interface ExportContext {
  source: 'talent_bank' | 'saved_candidates' | 'job_applications';
  jobId?: string;
  jobTitle?: string;
  candidateCount: number;
  companyName?: string;
}

export interface ExportSectionOption {
  key: ExportSection;
  label: string;
  description: string;
  defaultChecked: boolean;
}

export const EXPORT_SECTION_OPTIONS: ExportSectionOption[] = [
  {
    key: 'basicInfo',
    label: 'Informações Básicas',
    description: 'Nome, Localização, Contato',
    defaultChecked: true,
  },
  {
    key: 'experience',
    label: 'Experiência Profissional',
    description: 'Cargo atual, Empresa, Anos de experiência',
    defaultChecked: true,
  },
  {
    key: 'education',
    label: 'Formação',
    description: 'Graduação, Instituição',
    defaultChecked: true,
  },
  {
    key: 'skills',
    label: 'Habilidades',
    description: 'Top 5 habilidades',
    defaultChecked: true,
  },
  {
    key: 'disc',
    label: 'Perfil Comportamental',
    description: 'Perfil primário e características',
    defaultChecked: true,
  },
  {
    key: 'match',
    label: 'Match',
    description: 'Percentual de compatibilidade',
    defaultChecked: true,
  },
  {
    key: 'salary',
    label: 'Pretensão Salarial',
    description: 'Valor pretendido',
    defaultChecked: false,
  },
  {
    key: 'aiAnalysis',
    label: 'Análise IA',
    description: 'Análise comportamental gerada por IA',
    defaultChecked: false,
  },
];

export interface ExportOrderOption {
  value: ExportOrder;
  label: string;
}

export const EXPORT_ORDER_OPTIONS: ExportOrderOption[] = [
  { value: 'match_desc', label: 'Match (maior primeiro)' },
  { value: 'match_asc', label: 'Match (menor primeiro)' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
  { value: 'experience_desc', label: 'Experiência (maior primeiro)' },
  { value: 'recent', label: 'Mais recentes' },
];

export function getSourceLabel(source: ExportContext['source']): string {
  switch (source) {
    case 'talent_bank':
      return 'Banco de Talentos';
    case 'saved_candidates':
      return 'Candidatos Salvos';
    case 'job_applications':
      return 'Candidaturas';
    default:
      return 'Candidatos';
  }
}

export function generateFileName(
  source: ExportContext['source'],
  format: ExportFormat,
  jobTitle?: string
): string {
  const date = new Date().toISOString().split('T')[0];
  let prefix: string;

  switch (source) {
    case 'talent_bank':
      prefix = 'BancoTalentos';
      break;
    case 'saved_candidates':
      prefix = 'CandidatosSalvos';
      break;
    case 'job_applications':
      prefix = jobTitle
        ? `Candidaturas_${jobTitle.replace(/[^a-zA-Z0-9]/g, '')}`
        : 'Candidaturas';
      break;
    default:
      prefix = 'Candidatos';
  }

  return `${prefix}_${date}.${format}`;
}
