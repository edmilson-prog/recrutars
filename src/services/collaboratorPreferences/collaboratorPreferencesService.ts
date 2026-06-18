/**
 * Collaborator Preferences Service — Interface + Factory
 * Fase 3: per-collaborator notification channel opt-in (email/WhatsApp).
 */

import type { CollaboratorPreferences } from '@/types/collaboratorPreferences';

export interface SaveCollaboratorPreferencesParams {
  companyId: string;
  profileId: string;
  emailOptIn: boolean;
  whatsappOptIn: boolean;
}

export interface ICollaboratorPreferencesService {
  /** Returns the collaborator's row; if none exists, returns defaults (does NOT create). */
  getPreferences(companyId: string, profileId: string): Promise<CollaboratorPreferences>;

  /** Upsert by (company_id, profile_id); returns the persisted row. */
  savePreferences(params: SaveCollaboratorPreferencesParams): Promise<CollaboratorPreferences>;

  /**
   * Consent check helper for future senders. Returns the two channel flags.
   * No current consumer (no sender targets logged-in collaborators yet).
   */
  getChannelConsent(
    companyId: string,
    profileId: string,
  ): Promise<{ email: boolean; whatsapp: boolean }>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: ICollaboratorPreferencesService | null = null;

export async function getCollaboratorPreferencesService(): Promise<ICollaboratorPreferencesService> {
  if (_instance) return _instance;

  const { CollaboratorPreferencesServiceSupabase } = await import(
    './collaboratorPreferencesService.supabase'
  );
  _instance = new CollaboratorPreferencesServiceSupabase();
  return _instance;
}

export function resetCollaboratorPreferencesService(): void {
  _instance = null;
}
