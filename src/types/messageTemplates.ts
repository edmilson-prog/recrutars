/**
 * Types for Message Templates
 * PRD-041: Mensagens Personalizadas
 */

// Categorias de templates disponíveis
export type TemplateCategory =
  | 'invitation'      // Convite para entrevista
  | 'feedback'        // Feedback sobre processo
  | 'rejection'       // Recusa/não aprovação
  | 'followup'        // Acompanhamento
  | 'welcome'         // Boas-vindas
  | 'custom';         // Personalizado

// Tom da mensagem
export type MessageTone = 'formal' | 'neutral' | 'informal';

// Variáveis disponíveis para templates
export type TemplateVariable =
  | 'nome'           // Nome do candidato
  | 'vaga'           // Título da vaga
  | 'empresa'        // Nome da empresa
  | 'skills'         // Skills do candidato
  | 'experiencia'    // Anos de experiência
  | 'disc_perfil'    // Perfil DISC dominante
  | 'data'           // Data (ex: entrevista)
  | 'horario'        // Horário (ex: entrevista)
  | 'local';         // Local (ex: entrevista)

// Estrutura de um template
export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  subject?: string;           // Assunto (opcional)
  content: {
    formal: string;
    neutral: string;
    informal: string;
  };
  variables: TemplateVariable[];
  isCustom: boolean;
  createdAt?: string;
  createdBy?: string;
}

// Dados do candidato para substituição de variáveis
export interface TemplateVariableData {
  nome: string;
  vaga: string;
  empresa: string;
  skills?: string[];
  experiencia?: number;
  disc_perfil?: string;
  data?: string;
  horario?: string;
  local?: string;
}

// Template personalizado (salvo pelo usuário)
export interface CustomTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  content: string;
  tone: MessageTone;
  createdAt: string;
  companyId: string;
}

// Estado do hook useMessageTemplates
export interface MessageTemplatesState {
  templates: MessageTemplate[];
  customTemplates: CustomTemplate[];
  selectedTemplate: MessageTemplate | null;
  selectedTone: MessageTone;
  previewContent: string;
  isLoading: boolean;
}

// Labels para exibição
export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  invitation: 'Convite para Entrevista',
  feedback: 'Feedback',
  rejection: 'Não Aprovação',
  followup: 'Acompanhamento',
  welcome: 'Boas-vindas',
  custom: 'Personalizado',
};

export const TONE_LABELS: Record<MessageTone, string> = {
  formal: 'Formal',
  neutral: 'Neutro',
  informal: 'Informal',
};

export const VARIABLE_LABELS: Record<TemplateVariable, string> = {
  nome: 'Nome do candidato',
  vaga: 'Título da vaga',
  empresa: 'Nome da empresa',
  skills: 'Skills do candidato',
  experiencia: 'Anos de experiência',
  disc_perfil: 'Perfil DISC',
  data: 'Data',
  horario: 'Horário',
  local: 'Local',
};
