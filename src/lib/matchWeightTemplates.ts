/**
 * Templates de pesos pré-definidos para vagas.
 * Cada template é um atalho que preenche os 5 sliders no formulário de criação.
 *
 * Para evolução futura (CRUD por empresa): ver PRD-092.
 */
import type { MatchWeights } from '@/types/matchWeights';

export interface MatchWeightTemplate {
  id: string;
  name: string;
  description: string;
  examples: string;
  weights: MatchWeights;
  sortOrder: number;
}

export const MATCH_WEIGHT_TEMPLATES: readonly MatchWeightTemplate[] = [
  {
    id: 'operacional',
    name: 'Operacional',
    description: 'Comportamental e localização pesam mais; técnica importa pouco. Vagas que dependem de presença, atitude e disposição.',
    examples: 'Caixa, Estoquista, Operador, Auxiliar de loja',
    weights: { skillsTechnical: 10, skillsBehavioral: 30, experience: 15, gaugePro: 25, location: 20 },
    sortOrder: 1,
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Domínio de máquina e tempo de casa pesam; cliente final ausente reduz comportamental.',
    examples: 'Op. de Balancim, Costureira, Soldador, Produção',
    weights: { skillsTechnical: 25, skillsBehavioral: 15, experience: 30, gaugePro: 15, location: 15 },
    sortOrder: 2,
  },
  {
    id: 'administrativo',
    name: 'Administrativo',
    description: 'Distribuição equilibrada com leve viés para Gauge-Pro. Atendimento interno e externo.',
    examples: 'Aux. Administrativo, Recepcionista, Secretária',
    weights: { skillsTechnical: 20, skillsBehavioral: 20, experience: 20, gaugePro: 25, location: 15 },
    sortOrder: 3,
  },
  {
    id: 'tecnico',
    name: 'Técnico',
    description: 'Skills técnicas e experiência dominam; localização pouco relevante (remoto/híbrido).',
    examples: 'Dev, Analista, Designer, Engenheiro',
    weights: { skillsTechnical: 45, skillsBehavioral: 10, experience: 25, gaugePro: 15, location: 5 },
    sortOrder: 4,
  },
  {
    id: 'lideranca',
    name: 'Liderança',
    description: 'Experiência e perfil de gestão são críticos; técnica e comportamental balanceadas.',
    examples: 'Gerente, Coordenador, Supervisor',
    weights: { skillsTechnical: 20, skillsBehavioral: 20, experience: 30, gaugePro: 25, location: 5 },
    sortOrder: 5,
  },
  {
    id: 'comercial',
    name: 'Comercial',
    description: 'Perfil Gauge-Pro e comportamental dominam — vender é mais sobre pessoa do que técnica.',
    examples: 'Vendedor, SDR, Atendimento, Caixa+vendas',
    weights: { skillsTechnical: 15, skillsBehavioral: 25, experience: 15, gaugePro: 30, location: 15 },
    sortOrder: 6,
  },
] as const;

/**
 * Procura um template que bata exatamente com os pesos atuais.
 * Útil para destacar o template ativo na UI.
 */
export function matchTemplate(weights: MatchWeights): MatchWeightTemplate | null {
  return (
    MATCH_WEIGHT_TEMPLATES.find(
      (t) =>
        t.weights.skillsTechnical === weights.skillsTechnical &&
        t.weights.skillsBehavioral === weights.skillsBehavioral &&
        t.weights.experience === weights.experience &&
        t.weights.gaugePro === weights.gaugePro &&
        t.weights.location === weights.location,
    ) ?? null
  );
}
