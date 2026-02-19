/**
 * Types for Settings Configuration
 * PRD-045: Página de Configurações
 */

// Tipo de campo de configuração
export type ConfigFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'model-select'
  | 'color'
  | 'image'
  | 'password'
  | 'info-banner';

// Tipo de painel
export type ConfigPanel = 'admin' | 'company' | 'candidate';

// Validação de campo
export interface ConfigFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

// Opção para select/multiselect
export interface ConfigSelectOption {
  value: string;
  label: string;
}

// Campo de configuração
export interface ConfigField {
  id: string;
  key: string;
  name: string;
  description: string;
  type: ConfigFieldType;
  defaultValue: unknown;
  options?: ConfigSelectOption[];
  validation?: ConfigFieldValidation;
  sensitive?: boolean;
  order: number;
  link?: string;
  linkText?: string;
}

// Subcategoria de configuração
export interface ConfigSubcategory {
  id: string;
  key: string;
  name: string;
  description: string;
  fields: ConfigField[];
  order: number;
  customComponent?: string;
}

// Categoria de configuração
export interface ConfigCategory {
  id: string;
  key: string;
  name: string;
  icon: string;
  description: string;
  subcategories: ConfigSubcategory[];
  panel: ConfigPanel;
  order: number;
}

// Valor de configuração armazenado
export interface ConfigValue {
  fieldKey: string;
  value: unknown;
  updatedAt: string;
}

// Estado de configurações
export interface ConfigState {
  [categoryKey: string]: {
    [subcategoryKey: string]: {
      [fieldKey: string]: unknown;
    };
  };
}

// Entrada de histórico
export interface ConfigHistoryEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  categoryKey: string;
  categoryName: string;
  subcategoryKey: string;
  subcategoryName: string;
  fieldKey: string;
  fieldName: string;
  previousValue: unknown;
  newValue: unknown;
  panel: ConfigPanel;
  companyId?: string;
  candidateId?: string;
}

// Filtro de histórico
export interface ConfigHistoryFilter {
  categoryKey?: string;
  period?: 'day' | 'week' | 'month' | 'all';
  search?: string;
}

// Props do layout de configurações
export interface ConfigLayoutProps {
  title: string;
  subtitle: string;
  categories: ConfigCategory[];
  panel: ConfigPanel;
}

// Estado ativo de navegação
export interface ConfigActiveState {
  categoryKey: string;
  subcategoryKey: string;
}

// Resultado de busca
export interface ConfigSearchResult {
  categoryKey: string;
  subcategoryKey: string;
  fieldKey?: string;
  matchType: 'category' | 'subcategory' | 'field';
  matchText: string;
}
