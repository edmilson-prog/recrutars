/**
 * Settings Service — Supabase Implementation
 * Persistência de configurações com mascaramento de campos sensíveis
 */

import { supabase } from '@/lib/supabase';
import type {
  ConfigState,
  ConfigHistoryEntry,
  ConfigPanel,
} from '@/types/settings';
import type {
  ISettingsService,
  SettingsFilter,
  SaveSectionParams,
} from './settingsService';

/** Field keys that contain sensitive data — masked on read */
const SENSITIVE_KEYS = new Set([
  'apiKey',
  'linkedinApiKey',
  'webhookSecret',
  'stripeTestPublishableKey',
  'stripeTestSecretKey',
  'stripeTestWebhookSecret',
  'stripeLivePublishableKey',
  'stripeLiveSecretKey',
  'stripeLiveWebhookSecret',
  'anthropicApiKey',
  'openaiApiKey',
]);
const MASK_PLACEHOLDER = '••••';

function maskSensitiveFields(state: ConfigState): ConfigState {
  const masked = structuredClone(state);
  for (const catKey of Object.keys(masked)) {
    const cat = masked[catKey];
    if (!cat || typeof cat !== 'object') continue;
    for (const subKey of Object.keys(cat)) {
      const sub = cat[subKey];
      if (!sub || typeof sub !== 'object') continue;
      for (const fieldKey of Object.keys(sub)) {
        if (SENSITIVE_KEYS.has(fieldKey)) {
          const raw = sub[fieldKey];
          if (raw && typeof raw === 'string' && raw.length > 0) {
            sub[fieldKey] =
              raw.length > 10
                ? raw.slice(0, 6) + MASK_PLACEHOLDER + raw.slice(-4)
                : MASK_PLACEHOLDER;
          }
        }
      }
    }
  }
  return masked;
}

function isMaskedValue(val: unknown): boolean {
  return typeof val === 'string' && val.includes(MASK_PLACEHOLDER);
}

type CategoryValues = Record<string, Record<string, unknown>>;

export class SettingsServiceSupabase implements ISettingsService {
  async getSettings(filter: SettingsFilter): Promise<ConfigState> {
    let query = supabase
      .from('system_settings')
      .select('category, values')
      .eq('panel', filter.panel);

    if (filter.entityId) {
      query = query.eq('entity_id', filter.entityId);
    } else {
      query = query.is('entity_id', null);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch settings: ${error.message}`);

    const state: ConfigState = {};
    for (const row of data ?? []) {
      state[row.category] = row.values as CategoryValues;
    }

    return maskSensitiveFields(state);
  }

  /**
   * Get unmasked settings for a specific category (used by AI agent loader).
   * Protected by RLS — only admins can read admin panel settings.
   */
  async getSettingsRaw(
    panel: ConfigPanel,
    category: string,
  ): Promise<CategoryValues | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('values')
      .eq('panel', panel)
      .eq('category', category)
      .is('entity_id', null)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch raw settings: ${error.message}`);
    return (data?.values as CategoryValues) ?? null;
  }

  async getHistory(
    filter: SettingsFilter,
    limit = 100,
  ): Promise<ConfigHistoryEntry[]> {
    let query = supabase
      .from('settings_history')
      .select('*')
      .eq('panel', filter.panel)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filter.entityId) {
      query = query.eq('entity_id', filter.entityId);
    } else {
      query = query.is('entity_id', null);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch history: ${error.message}`);

    return (data ?? []).map((row) => ({
      id: row.id,
      timestamp: row.created_at,
      userId: row.changed_by ?? '',
      userName: row.changed_by_name ?? '',
      categoryKey: row.category_key,
      categoryName: row.category_key,
      subcategoryKey: row.subcategory_key,
      subcategoryName: row.subcategory_key,
      fieldKey: row.field_key,
      fieldName: row.field_name,
      previousValue: row.previous_value,
      newValue: row.new_value,
      panel: row.panel as ConfigPanel,
    }));
  }

  async saveSection(params: SaveSectionParams): Promise<void> {
    const {
      panel,
      categoryKey,
      subcategoryKey,
      values,
      categories,
      userId,
      userName,
      entityId,
    } = params;

    // 1. Fetch current stored values for this category (unmasked, for diff)
    let fetchQuery = supabase
      .from('system_settings')
      .select('id, values')
      .eq('panel', panel)
      .eq('category', categoryKey);

    if (entityId) {
      fetchQuery = fetchQuery.eq('entity_id', entityId);
    } else {
      fetchQuery = fetchQuery.is('entity_id', null);
    }

    const { data: existing } = await fetchQuery.maybeSingle();
    const previousCatValues = (existing?.values ?? {}) as CategoryValues;
    const previousSubValues = previousCatValues[subcategoryKey] ?? {};

    // 2. Build new subcategory values, preserving sensitive fields if masked
    const newSubValues = {
      ...(values[categoryKey]?.[subcategoryKey] ?? {}),
    };
    for (const key of Object.keys(newSubValues)) {
      if (SENSITIVE_KEYS.has(key) && isMaskedValue(newSubValues[key])) {
        newSubValues[key] = previousSubValues[key] ?? '';
      }
    }

    const newCatValues: CategoryValues = {
      ...previousCatValues,
      [subcategoryKey]: newSubValues,
    };

    // 3. Upsert the settings row
    if (existing?.id) {
      // UPDATE existing row
      const { error } = await supabase
        .from('system_settings')
        .update({
          values: newCatValues,
          updated_by: userId,
        })
        .eq('id', existing.id);

      if (error) throw new Error(`Failed to update settings: ${error.message}`);
    } else {
      // INSERT new row
      const { error } = await supabase.from('system_settings').insert({
        panel,
        category: categoryKey,
        entity_id: entityId ?? null,
        values: newCatValues,
        updated_by: userId,
      });

      if (error) throw new Error(`Failed to insert settings: ${error.message}`);
    }

    // 4. Record history for changed fields
    const category = categories.find((c) => c.key === categoryKey);
    const subcategory = category?.subcategories.find(
      (s) => s.key === subcategoryKey,
    );
    if (!subcategory) return;

    const historyRows: Array<{
      panel: string;
      category_key: string;
      subcategory_key: string;
      field_key: string;
      field_name: string;
      previous_value: unknown;
      new_value: unknown;
      entity_id: string | null;
      changed_by: string;
      changed_by_name: string;
    }> = [];

    for (const field of subcategory.fields) {
      const prev = previousSubValues[field.key] ?? field.defaultValue;
      const next = newSubValues[field.key] ?? field.defaultValue;

      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        const isSensitive = SENSITIVE_KEYS.has(field.key);
        historyRows.push({
          panel,
          category_key: categoryKey,
          subcategory_key: subcategoryKey,
          field_key: field.key,
          field_name: field.name,
          previous_value: isSensitive ? MASK_PLACEHOLDER : prev,
          new_value: isSensitive ? MASK_PLACEHOLDER : next,
          entity_id: entityId ?? null,
          changed_by: userId,
          changed_by_name: userName,
        });
      }
    }

    if (historyRows.length > 0) {
      await supabase.from('settings_history').insert(historyRows);
    }
  }

  async migrateFromLocalStorage(
    panel: ConfigPanel,
    values: ConfigState,
    entityId?: string,
    userId?: string,
  ): Promise<void> {
    const entries = Object.entries(values);
    if (entries.length === 0) return;

    for (const [categoryKey, catValues] of entries) {
      // Check if row already exists
      let checkQuery = supabase
        .from('system_settings')
        .select('id')
        .eq('panel', panel)
        .eq('category', categoryKey);

      if (entityId) {
        checkQuery = checkQuery.eq('entity_id', entityId);
      } else {
        checkQuery = checkQuery.is('entity_id', null);
      }

      const { data: existing } = await checkQuery.maybeSingle();

      if (existing?.id) {
        await supabase
          .from('system_settings')
          .update({
            values: catValues,
            updated_by: userId ?? null,
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('system_settings').insert({
          panel,
          category: categoryKey,
          entity_id: entityId ?? null,
          values: catValues,
          updated_by: userId ?? null,
        });
      }
    }
  }
}
