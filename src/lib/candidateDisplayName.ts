/**
 * Utilitários para nome de exibição de candidatos
 * v1.13.8: Prioriza displayName, fallback para primeiro+último nome
 */

/**
 * Formata nome completo como "Primeiro Último"
 * Ex: "Jorge Perim dos Santos Neto" → "Jorge Neto"
 */
export function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName.trim();
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

/**
 * Retorna o nome de exibição do candidato:
 * 1. displayName (definido pelo candidato no perfil)
 * 2. Fallback: primeiro nome + último sobrenome
 */
export function getCandidateDisplayName(
  candidate: { name: string; displayName?: string }
): string {
  if (candidate.displayName?.trim()) return candidate.displayName.trim();
  return formatShortName(candidate.name);
}

/**
 * Retorna as iniciais (max 2 chars) do nome de exibição
 * Aceita string direta ou objeto candidato
 */
export function getCandidateInitials(
  nameOrCandidate: string | { name: string; displayName?: string }
): string {
  const displayName =
    typeof nameOrCandidate === 'string'
      ? nameOrCandidate
      : getCandidateDisplayName(nameOrCandidate);
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
