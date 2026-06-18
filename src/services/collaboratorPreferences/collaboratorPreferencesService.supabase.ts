/**
 * Collaborator Preferences Service — Supabase Implementation
 * Table: collaborator_preferences(id, company_id, profile_id, email_opt_in,
 *        whatsapp_opt_in, created_at, updated_at) UNIQUE(company_id, profile_id)
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import {
  type CollaboratorPreferences,
  DEFAULT_COLLABORATOR_PREFERENCES,
} from '@/types/collaboratorPreferences';
import type {
  ICollaboratorPreferencesService,
  SaveCollaboratorPreferencesParams,
} from './collaboratorPreferencesService';

type Row = Database['public']['Tables']['collaborator_preferences']['Row'];

export class CollaboratorPreferencesServiceSupabase
  implements ICollaboratorPreferencesService
{
  async getPreferences(
    companyId: string,
    profileId: string,
  ): Promise<CollaboratorPreferences> {
    const { data, error } = await supabase
      .from('collaborator_preferences')
      .select('*')
      .eq('company_id', companyId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // No row yet — return defaults without persisting.
      return {
        id: '',
        companyId,
        profileId,
        emailOptIn: DEFAULT_COLLABORATOR_PREFERENCES.emailOptIn,
        whatsappOptIn: DEFAULT_COLLABORATOR_PREFERENCES.whatsappOptIn,
        createdAt: '',
        updatedAt: '',
      };
    }

    return this.mapRow(data);
  }

  async savePreferences(
    params: SaveCollaboratorPreferencesParams,
  ): Promise<CollaboratorPreferences> {
    const { data, error } = await supabase
      .from('collaborator_preferences')
      .upsert(
        {
          company_id: params.companyId,
          profile_id: params.profileId,
          email_opt_in: params.emailOptIn,
          whatsapp_opt_in: params.whatsappOptIn,
        },
        { onConflict: 'company_id,profile_id' },
      )
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      // RLS can block silently (0 rows) without an error object.
      throw new Error('Não foi possível salvar as preferências.');
    }

    return this.mapRow(data);
  }

  async getChannelConsent(
    companyId: string,
    profileId: string,
  ): Promise<{ email: boolean; whatsapp: boolean }> {
    const prefs = await this.getPreferences(companyId, profileId);
    return { email: prefs.emailOptIn, whatsapp: prefs.whatsappOptIn };
  }

  // -------------------------------------------------------------------------
  // Mapper (snake_case DB -> camelCase TS)
  // -------------------------------------------------------------------------

  private mapRow(row: Row): CollaboratorPreferences {
    return {
      id: row.id,
      companyId: row.company_id,
      profileId: row.profile_id,
      emailOptIn: row.email_opt_in,
      whatsappOptIn: row.whatsapp_opt_in,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
