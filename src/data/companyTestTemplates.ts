/**
 * Company Test Templates
 * PRD-052: 7 templates com pesos por dimensão Gauge-Pro D1-D5
 */

import type { TestTemplate } from '@/types/companyTest';

export const COMPANY_TEST_TEMPLATES: TestTemplate[] = [
  {
    id: 'standard',
    name: 'Padrão',
    description: 'Perfil equilibrado para avaliação geral. Ideal para posições que exigem versatilidade.',
    icon: 'Target',
    weights: { D1: 1.0, D2: 1.0, D3: 1.0, D4: 1.0, D5: 1.0 },
  },
  {
    id: 'leadership',
    name: 'Liderança',
    description: 'Foco em assertividade, sociabilidade e orientação relacional. Ideal para cargos de gestão.',
    icon: 'Crown',
    weights: { D1: 1.8, D2: 1.5, D3: 0.8, D4: 1.0, D5: 1.5 },
  },
  {
    id: 'operational',
    name: 'Operacional',
    description: 'Ênfase em ritmo, conformidade e consistência. Ideal para funções operacionais e processuais.',
    icon: 'Settings',
    weights: { D1: 0.8, D2: 0.8, D3: 1.8, D4: 1.5, D5: 1.0 },
  },
  {
    id: 'sales',
    name: 'Vendas',
    description: 'Prioriza sociabilidade, assertividade e orientação relacional. Ideal para times comerciais.',
    icon: 'TrendingUp',
    weights: { D1: 1.5, D2: 2.0, D3: 0.7, D4: 0.7, D5: 1.5 },
  },
  {
    id: 'technical',
    name: 'Técnico',
    description: 'Valoriza conformidade, ritmo e análise. Ideal para engenheiros, analistas e desenvolvedores.',
    icon: 'Code',
    weights: { D1: 0.8, D2: 0.7, D3: 1.5, D4: 2.0, D5: 0.8 },
  },
  {
    id: 'creative',
    name: 'Criativo',
    description: 'Enfatiza assertividade e sociabilidade com menor conformidade. Ideal para áreas criativas.',
    icon: 'Palette',
    weights: { D1: 1.5, D2: 1.5, D3: 0.7, D4: 0.5, D5: 1.2 },
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Defina seus próprios pesos para cada dimensão. Máxima flexibilidade para necessidades específicas.',
    icon: 'SlidersHorizontal',
    weights: { D1: 1.0, D2: 1.0, D3: 1.0, D4: 1.0, D5: 1.0 },
    isCustom: true,
  },
];
