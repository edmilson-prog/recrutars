/**
 * Cultural Profiles Service — Supabase Implementation
 * PRD-042: Cultural Fit — Supabase Migration
 */

import { supabase } from '@/lib/supabase';
import type { CompanyCulturalProfile, DimensionValue } from '@/types/culturalFit';
import type {
  ICulturalProfilesService,
  UpsertCulturalProfilePayload,
} from './culturalProfilesService';

// ---------------------------------------------------------------------------
// DB Row Type (snake_case)
// ---------------------------------------------------------------------------

interface CulturalProfileRow {
  id: string;
  company_id: string;
  innovation: number;
  collaboration: number;
  hierarchy: number;
  pace: number;
  direction: number;
  description: string | null;
  values: string[] | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Converter
// ---------------------------------------------------------------------------

function rowToProfile(row: CulturalProfileRow): CompanyCulturalProfile {
  return {
    companyId: row.company_id,
    innovation: row.innovation as DimensionValue,
    collaboration: row.collaboration as DimensionValue,
    hierarchy: row.hierarchy as DimensionValue,
    pace: row.pace as DimensionValue,
    direction: row.direction as DimensionValue,
    description: row.description ?? undefined,
    values: row.values ?? undefined,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class CulturalProfilesServiceSupabase implements ICulturalProfilesService {
  async getCulturalProfile(companyId: string): Promise<CompanyCulturalProfile | null> {
    const { data, error } = await supabase
      .from('company_cultural_profiles')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch cultural profile: ${error.message}`);
    }

    return data ? rowToProfile(data as CulturalProfileRow) : null;
  }

  async upsertCulturalProfile(
    payload: UpsertCulturalProfilePayload,
  ): Promise<CompanyCulturalProfile> {
    const dbPayload = {
      company_id: payload.companyId,
      innovation: payload.innovation,
      collaboration: payload.collaboration,
      hierarchy: payload.hierarchy,
      pace: payload.pace,
      direction: payload.direction,
      description: payload.description ?? null,
      values: payload.values ?? [],
    };

    const { data, error } = await supabase
      .from('company_cultural_profiles')
      .upsert(dbPayload, { onConflict: 'company_id' })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to upsert cultural profile: ${error.message}`);
    }

    return rowToProfile(data as CulturalProfileRow);
  }
}
