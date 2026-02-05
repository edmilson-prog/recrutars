/**
 * Settings Service — Interface + Factory
 * Persistência de configurações do sistema via Supabase
 */

import type {
  ConfigCategory,
  ConfigState,
  ConfigHistoryEntry,
  ConfigPanel,
} from '@/types/settings';

export interface SettingsFilter {
  panel: ConfigPanel;
  entityId?: string;
}

export interface SaveSectionParams {
  panel: ConfigPanel;
  categoryKey: string;
  subcategoryKey: string;
  values: ConfigState;
  categories: ConfigCategory[];
  userId: string;
  userName: string;
  entityId?: string;
}

export interface ISettingsService {
  getSettings(filter: SettingsFilter): Promise<ConfigState>;
  getHistory(filter: SettingsFilter, limit?: number): Promise<ConfigHistoryEntry[]>;
  saveSection(params: SaveSectionParams): Promise<void>;
  migrateFromLocalStorage(
    panel: ConfigPanel,
    values: ConfigState,
    entityId?: string,
    userId?: string,
  ): Promise<void>;
}

let _instance: ISettingsService | null = null;

export async function getSettingsService(): Promise<ISettingsService> {
  if (_instance) return _instance;

  const { SettingsServiceSupabase } = await import('./settingsService.supabase');
  _instance = new SettingsServiceSupabase();
  return _instance;
}

export function resetSettingsService(): void {
  _instance = null;
}
