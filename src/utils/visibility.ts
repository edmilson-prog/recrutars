/**
 * Visibility Helpers
 * PRD-026: Visibilidade do Perfil do Candidato
 */

import type { Candidate, VisibilitySettings, VisibilityMode, AnonymousProfile } from '@/types/candidate';
import { getCandidateDisplayName } from '@/lib/candidateDisplayName';

/**
 * Gera um anonymousId baseado no ID do candidato
 * O ID é consistente para o mesmo candidato
 */
export function generateAnonymousId(candidateId: string): string {
  // Usar hash simples baseado no ID para gerar número de 4 dígitos
  let hash = 0;
  for (let i = 0; i < candidateId.length; i++) {
    const char = candidateId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Garantir que seja positivo e tenha 4 dígitos
  const positiveHash = Math.abs(hash);
  return String(positiveHash % 9000 + 1000);
}

/**
 * Obtém as configurações de visibilidade do candidato
 * Retorna valores padrão se não existir
 */
export function getVisibilitySettings(candidate: Candidate): VisibilitySettings {
  if (candidate.visibility) {
    return candidate.visibility;
  }
  // Valor padrão: público
  return {
    mode: 'public',
    anonymousId: generateAnonymousId(candidate.id),
  };
}

/**
 * Verifica se o candidato deve aparecer nas buscas
 */
export function isVisibleInSearch(candidate: Candidate): boolean {
  const visibility = getVisibilitySettings(candidate);
  // Candidatos em modo privado não aparecem nas buscas
  return visibility.mode !== 'private';
}

/**
 * Cria um perfil anônimo para exibição no modo parcial
 */
export function createAnonymousProfile(candidate: Candidate): AnonymousProfile {
  const visibility = getVisibilitySettings(candidate);

  return {
    displayName: `Perfil Anônimo #${visibility.anonymousId}`,
    title: candidate.title,
    location: candidate.location, // Apenas cidade/estado
    skills: candidate.skills,
    experienceYears: candidate.experience,
    experienceAreas: [], // Sem nomes de empresas (seria extraído de experiences)
    education: candidate.education,
    behavioralProfile: candidate.testResult?.result.profile,
    hasTest: candidate.hasTest,
  };
}

/**
 * Verifica se o candidato está em modo anônimo
 */
export function isAnonymous(candidate: Candidate): boolean {
  const visibility = getVisibilitySettings(candidate);
  return visibility.mode === 'partial';
}

/**
 * Obtém o nome de exibição do candidato
 * Retorna nome anônimo se estiver em modo parcial
 */
export function getDisplayName(candidate: Candidate): string {
  const visibility = getVisibilitySettings(candidate);
  if (visibility.mode === 'partial') {
    return `Perfil Anônimo #${visibility.anonymousId}`;
  }
  return getCandidateDisplayName(candidate);
}

/**
 * Obtém o avatar do candidato (null se anônimo)
 */
export function getDisplayAvatar(candidate: Candidate): string | null {
  const visibility = getVisibilitySettings(candidate);
  if (visibility.mode === 'partial') {
    return null; // Sem foto no modo anônimo
  }
  return candidate.avatar || null;
}

/**
 * Labels para os modos de visibilidade
 */
export const visibilityModeLabels: Record<VisibilityMode, string> = {
  public: 'Público',
  partial: 'Anônimo',
  private: 'Privado',
};

/**
 * Descrições para os modos de visibilidade
 */
export const visibilityModeDescriptions: Record<VisibilityMode, string> = {
  public: 'Perfil totalmente visível para empresas',
  partial: 'Aparece como anônimo nas buscas',
  private: 'Não aparece em buscas',
};
