/**
 * Cultural Profiles Service — Interface & Factory
 * PRD-042: Cultural Fit — Supabase Migration
 *
 * Provides CRUD operations for company cultural profiles,
 * backed by Supabase.
 */

import type { CompanyCulturalProfile, CulturalProfile } from '@/types/culturalFit';

// ---------------------------------------------------------------------------
// Upsert Payload
// ---------------------------------------------------------------------------

export interface UpsertCulturalProfilePayload {
  companyId: string;
  innovation: number;
  collaboration: number;
  hierarchy: number;
  pace: number;
  direction: number;
  description?: string;
  values?: string[];
}

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface ICulturalProfilesService {
  getCulturalProfile(companyId: string): Promise<CompanyCulturalProfile | null>;
  upsertCulturalProfile(payload: UpsertCulturalProfilePayload): Promise<CompanyCulturalProfile>;
}

// ---------------------------------------------------------------------------
// Singleton Factory
// ---------------------------------------------------------------------------

let _instance: ICulturalProfilesService | null = null;

export async function getCulturalProfilesService(): Promise<ICulturalProfilesService> {
  if (_instance) return _instance;

  const { CulturalProfilesServiceSupabase } = await import(
    './culturalProfilesService.supabase'
  );
  _instance = new CulturalProfilesServiceSupabase();
  return _instance;
}

export function resetCulturalProfilesService(): void {
  _instance = null;
}
