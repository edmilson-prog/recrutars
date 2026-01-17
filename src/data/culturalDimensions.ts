/**
 * Cultural Dimensions Definitions
 * PRD-042: Fit Cultural
 */

import type {
  CulturalDimension,
  CulturalDimensionDefinition,
  DiscCultureMapping,
  CompanyCulturalProfile,
} from '@/types/culturalFit';

// Definições completas de cada dimensão cultural
export const culturalDimensions: CulturalDimensionDefinition[] = [
  {
    id: 'innovation',
    name: 'Inovação',
    description: 'O quanto a organização abraça mudanças e novas ideias',
    lowLabel: 'Estável',
    highLabel: 'Inovador',
    lowDescription: 'Prefere processos estabelecidos, mudanças graduais e estabilidade',
    highDescription: 'Busca constantemente novas formas de fazer as coisas, abraça experimentação',
  },
  {
    id: 'collaboration',
    name: 'Colaboração',
    description: 'Como o trabalho é organizado: individual ou em equipe',
    lowLabel: 'Individual',
    highLabel: 'Equipe',
    lowDescription: 'Valoriza autonomia individual, trabalho independente e foco pessoal',
    highDescription: 'Prioriza trabalho em grupo, decisões coletivas e sinergia de equipe',
  },
  {
    id: 'hierarchy',
    name: 'Estrutura',
    description: 'O nível de formalidade e hierarquia organizacional',
    lowLabel: 'Flat',
    highLabel: 'Hierárquico',
    lowDescription: 'Estrutura horizontal, acesso direto a líderes, poucos níveis',
    highDescription: 'Estrutura clara de reporte, níveis definidos, processos formais',
  },
  {
    id: 'pace',
    name: 'Ritmo',
    description: 'A velocidade e intensidade do ambiente de trabalho',
    lowLabel: 'Equilibrado',
    highLabel: 'Acelerado',
    lowDescription: 'Ritmo sustentável, equilíbrio vida-trabalho, prazos realistas',
    highDescription: 'Ambiente dinâmico, entregas rápidas, alta energia e agilidade',
  },
  {
    id: 'direction',
    name: 'Direcionamento',
    description: 'O quanto as tarefas são estruturadas ou abertas',
    lowLabel: 'Autônomo',
    highLabel: 'Direcionado',
    lowDescription: 'Liberdade para definir como trabalhar, metas amplas',
    highDescription: 'Orientações claras, processos definidos, supervisão próxima',
  },
];

// Mapeamento de perfis DISC para preferências culturais
export const discCultureMappings: DiscCultureMapping[] = [
  {
    dominantProfile: 'D',
    preferredValues: {
      innovation: 4,
      collaboration: 2,
      hierarchy: 2,
      pace: 5,
      direction: 1,
    },
    description: 'Perfis Dominantes preferem ambientes dinâmicos com autonomia para decisões rápidas',
  },
  {
    dominantProfile: 'I',
    preferredValues: {
      innovation: 4,
      collaboration: 5,
      hierarchy: 2,
      pace: 4,
      direction: 2,
    },
    description: 'Perfis Influentes prosperam em ambientes colaborativos e socialmente engajados',
  },
  {
    dominantProfile: 'S',
    preferredValues: {
      innovation: 2,
      collaboration: 4,
      hierarchy: 3,
      pace: 2,
      direction: 3,
    },
    description: 'Perfis Estáveis valorizam ambientes previsíveis com boas relações interpessoais',
  },
  {
    dominantProfile: 'C',
    preferredValues: {
      innovation: 3,
      collaboration: 2,
      hierarchy: 4,
      pace: 2,
      direction: 4,
    },
    description: 'Perfis Conformes preferem estrutura, processos claros e precisão',
  },
  {
    dominantProfile: 'DI',
    preferredValues: {
      innovation: 5,
      collaboration: 4,
      hierarchy: 2,
      pace: 5,
      direction: 1,
    },
    description: 'Perfis DI são empreendedores que buscam inovação com influência social',
  },
  {
    dominantProfile: 'DS',
    preferredValues: {
      innovation: 3,
      collaboration: 3,
      hierarchy: 3,
      pace: 4,
      direction: 2,
    },
    description: 'Perfis DS equilibram determinação com estabilidade relacional',
  },
  {
    dominantProfile: 'DC',
    preferredValues: {
      innovation: 3,
      collaboration: 2,
      hierarchy: 3,
      pace: 4,
      direction: 3,
    },
    description: 'Perfis DC combinam foco em resultados com atenção a detalhes',
  },
  {
    dominantProfile: 'IS',
    preferredValues: {
      innovation: 3,
      collaboration: 5,
      hierarchy: 2,
      pace: 3,
      direction: 2,
    },
    description: 'Perfis IS são comunicadores harmoniosos que valorizam relacionamentos',
  },
  {
    dominantProfile: 'IC',
    preferredValues: {
      innovation: 4,
      collaboration: 3,
      hierarchy: 3,
      pace: 3,
      direction: 3,
    },
    description: 'Perfis IC combinam criatividade com análise detalhada',
  },
  {
    dominantProfile: 'SC',
    preferredValues: {
      innovation: 2,
      collaboration: 3,
      hierarchy: 4,
      pace: 2,
      direction: 4,
    },
    description: 'Perfis SC são metódicos e confiáveis, preferem ambientes estáveis',
  },
];

// Perfis culturais mock para empresas
export const mockCompanyCulturalProfiles: CompanyCulturalProfile[] = [
  {
    companyId: 'company-1',
    innovation: 4,
    collaboration: 4,
    hierarchy: 2,
    pace: 4,
    direction: 2,
    description: 'Startup tech com cultura ágil e colaborativa',
    values: ['Inovação', 'Trabalho em equipe', 'Autonomia', 'Agilidade'],
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    companyId: 'company-2',
    innovation: 3,
    collaboration: 3,
    hierarchy: 4,
    pace: 3,
    direction: 4,
    description: 'Empresa estabelecida com processos estruturados',
    values: ['Qualidade', 'Processos', 'Confiabilidade', 'Profissionalismo'],
    updatedAt: '2025-01-10T10:00:00Z',
  },
];

// Obter definição de dimensão por ID
export function getDimensionDefinition(id: CulturalDimension): CulturalDimensionDefinition | undefined {
  return culturalDimensions.find(d => d.id === id);
}

// Obter mapeamento DISC por perfil
export function getDiscMapping(profile: string): DiscCultureMapping | undefined {
  // Tenta encontrar match exato primeiro
  const exactMatch = discCultureMappings.find(m => m.dominantProfile === profile);
  if (exactMatch) return exactMatch;

  // Se não encontrar, tenta com a primeira letra do perfil
  const firstLetter = profile.charAt(0).toUpperCase();
  return discCultureMappings.find(m => m.dominantProfile === firstLetter);
}
