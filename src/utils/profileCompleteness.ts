/**
 * Profile Completeness Utility
 * Calcula completude baseada apenas em campos pessoais (perfil da plataforma).
 * Dados profissionais (experiencia, formacao, skills) sao gerenciados em curriculos.
 */

export interface PersonalProfile {
  name?: string;
  email?: string;
  title?: string;
  location?: string;
  phone?: string;
  linkedin?: string;
  about?: string;
}

export function calculateProfileCompletion(profile: PersonalProfile): number {
  let total = 0;
  if (profile.name?.trim()) total += 15;
  if (profile.email?.trim()) total += 15;
  if (profile.title?.trim()) total += 15;
  if (profile.location?.trim()) total += 15;
  if (profile.phone?.trim()) total += 10;
  if (profile.linkedin?.trim()) total += 10;
  if (profile.about?.trim()) total += 20;
  return total;
}
