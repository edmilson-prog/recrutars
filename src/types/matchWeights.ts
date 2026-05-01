/**
 * Pesos das categorias do match para uma vaga.
 * Soma deve ser exatamente 100. Cada peso entre 0 e 70.
 */
export interface MatchWeights {
  skillsTechnical: number;
  skillsBehavioral: number;
  experience: number;
  gaugePro: number;
  location: number;
}

/**
 * Defaults aplicados a vagas que não têm pesos próprios definidos.
 * Preserva a proporção do antigo 40/30/20/10 redistribuída em 5 categorias.
 */
export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  skillsTechnical: 25,
  skillsBehavioral: 15,
  experience: 30,
  gaugePro: 20,
  location: 10,
};

/**
 * Soma os 5 pesos. Útil para validação em tempo real na UI.
 */
export function sumWeights(w: MatchWeights): number {
  return w.skillsTechnical + w.skillsBehavioral + w.experience + w.gaugePro + w.location;
}

/**
 * Valida se os pesos estão dentro das regras (range 0-70 e soma=100).
 */
export function validateWeights(w: MatchWeights): { valid: boolean; error?: string } {
  const values = [w.skillsTechnical, w.skillsBehavioral, w.experience, w.gaugePro, w.location];
  for (const v of values) {
    if (v < 0 || v > 70) {
      return { valid: false, error: 'Cada peso deve estar entre 0 e 70%' };
    }
  }
  const sum = sumWeights(w);
  if (sum !== 100) {
    return { valid: false, error: sum < 100 ? `Faltam ${100 - sum}% para distribuir` : `Excedeu em ${sum - 100}%` };
  }
  return { valid: true };
}
