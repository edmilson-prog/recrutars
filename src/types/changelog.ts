/**
 * Changelog Types
 * PRD-044: Pagina "Sobre" e Tooltip de Versao no Footer
 */

export type ChangeType = 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';

export interface ChangeCategory {
  type: ChangeType;
  items: string[];
}

export type ReleaseType = 'major' | 'minor' | 'patch';

export interface Version {
  version: string;
  codename: string;
  type: ReleaseType;
  releaseDate: string;
  prd?: string;
  description: string;
  isCurrent: boolean;
  changes: ChangeCategory[];
}

export type ReleaseFilter = 'all' | 'major' | 'minor' | 'patch';
export type DateFilter = 'all' | 'week' | 'month' | '3months' | 'year';

export interface ChangelogFilters {
  releaseType: ReleaseFilter;
  dateRange: DateFilter;
  search: string;
}
