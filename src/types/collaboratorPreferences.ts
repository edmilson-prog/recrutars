/**
 * Collaborator notification preferences (Fase 3).
 * Per-collaborator (company_users) channel opt-in for external notifications.
 */

export type NotificationChannel = 'email' | 'whatsapp';

export interface CollaboratorPreferences {
  id: string;
  companyId: string;
  profileId: string;
  emailOptIn: boolean;
  whatsappOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Default preferences when a collaborator has no saved row yet. */
export const DEFAULT_COLLABORATOR_PREFERENCES: Pick<
  CollaboratorPreferences,
  'emailOptIn' | 'whatsappOptIn'
> = {
  emailOptIn: true,
  whatsappOptIn: false,
};
