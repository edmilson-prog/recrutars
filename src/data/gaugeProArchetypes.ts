/**
 * Gauge-Pro 16 Archetype Profiles
 * PRD-050: Behavioral profiles based on D1-D5 dimension combinations
 */

import type { ArchetypeProfile, DimensionScores, DimensionClassification } from '@/types/gaugePro';

export const ARCHETYPE_PROFILES: ArchetypeProfile[] = [
  {
    id: 'commander',
    name: 'O Comandante',
    description: 'Líder nato com foco em resultados e alta capacidade de execução. Prefere estrutura e controle sobre processos e pessoas.',
    strengths: ['Tomada de decisão rápida', 'Foco em resultados', 'Capacidade de liderança', 'Visão estratégica'],
    developmentAreas: ['Ouvir mais antes de agir', 'Desenvolver paciência com processos lentos', 'Considerar impacto emocional das decisões'],
    idealRoles: ['CEO', 'Diretor de Operações', 'Gerente de Projetos', 'Líder de Área'],
    workStyle: 'Direto, orientado a resultados, prefere autonomia e controle.',
    communicationStyle: 'Objetivo, conciso, focado em ação e soluções.',
  },
  {
    id: 'strategist',
    name: 'O Estrategista',
    description: 'Combina assertividade com pensamento analítico e metódico. Planeja com rigor e executa com determinação.',
    strengths: ['Planejamento estratégico', 'Análise detalhada', 'Execução disciplinada', 'Pensamento de longo prazo'],
    developmentAreas: ['Flexibilidade diante de mudanças', 'Delegação de tarefas', 'Conexão emocional com equipe'],
    idealRoles: ['Consultor Estratégico', 'Analista Sênior', 'Planejador Financeiro', 'Arquiteto de Soluções'],
    workStyle: 'Metódico, estruturado, combina visão macro com atenção a detalhes.',
    communicationStyle: 'Preciso, fundamentado em dados, prefere comunicação escrita.',
  },
  {
    id: 'innovator',
    name: 'O Inovador',
    description: 'Assertivo e criativo, desafia o status quo. Prefere liberdade para explorar novas ideias e abordagens.',
    strengths: ['Criatividade', 'Pensamento disruptivo', 'Coragem para inovar', 'Adaptabilidade'],
    developmentAreas: ['Seguir processos quando necessário', 'Concluir projetos antes de iniciar novos', 'Documentação'],
    idealRoles: ['Empreendedor', 'Diretor de Inovação', 'Product Owner', 'Designer Líder'],
    workStyle: 'Experimental, rápido, prefere autonomia e liberdade criativa.',
    communicationStyle: 'Entusiasmado, visionário, usa metáforas e storytelling.',
  },
  {
    id: 'agile_executor',
    name: 'O Executor Ágil',
    description: 'Combina assertividade com velocidade. Age rápido, adapta-se facilmente e mantém o foco na entrega.',
    strengths: ['Velocidade de execução', 'Adaptabilidade', 'Orientação a resultados', 'Resiliência'],
    developmentAreas: ['Paciência com detalhes', 'Planejamento de longo prazo', 'Cuidado com qualidade vs velocidade'],
    idealRoles: ['Gerente de Projetos Ágeis', 'Líder de Vendas', 'Startup Founder', 'Growth Hacker'],
    workStyle: 'Rápido, pragmático, prefere ação imediata a planejamento extenso.',
    communicationStyle: 'Direto, informal, focado no que precisa ser feito agora.',
  },
  {
    id: 'influencer',
    name: 'O Influenciador',
    description: 'Líder carismático que combina assertividade com habilidades sociais. Inspira e mobiliza pessoas.',
    strengths: ['Carisma', 'Persuasão', 'Networking', 'Motivação de equipes'],
    developmentAreas: ['Atenção a detalhes', 'Follow-through em projetos', 'Análise crítica'],
    idealRoles: ['Diretor Comercial', 'Relações Públicas', 'Líder de Transformação', 'Marketing'],
    workStyle: 'Sociável, energético, prefere trabalho em equipe e visibilidade.',
    communicationStyle: 'Entusiasmado, persuasivo, usa histórias e exemplos.',
  },
  {
    id: 'captain',
    name: 'O Capitão',
    description: 'Líder que combina assertividade, sociabilidade e cuidado com pessoas. Construtor de equipes fortes.',
    strengths: ['Liderança de equipes', 'Empatia com assertividade', 'Construção de cultura', 'Desenvolvimento de pessoas'],
    developmentAreas: ['Dizer não quando necessário', 'Foco em métricas objetivas', 'Gerenciar conflitos difíceis'],
    idealRoles: ['Líder de Equipes', 'Gerente de RH', 'Coach Executivo', 'Diretor de Pessoas'],
    workStyle: 'Colaborativo, acessível, equilibra resultados com bem-estar.',
    communicationStyle: 'Empático, motivador, sabe ouvir e direcionar.',
  },
  {
    id: 'promoter',
    name: 'O Promotor',
    description: 'Sociável e dinâmico, adora interagir e criar conexões. Traz energia e entusiasmo para qualquer ambiente.',
    strengths: ['Comunicação', 'Entusiasmo', 'Relacionamento interpessoal', 'Energia positiva'],
    developmentAreas: ['Foco em tarefas individuais', 'Organização', 'Profundidade analítica'],
    idealRoles: ['Vendas', 'Marketing', 'Eventos', 'Relações Corporativas', 'Atendimento'],
    workStyle: 'Energético, social, prefere ambiente colaborativo e dinâmico.',
    communicationStyle: 'Animado, expressivo, prefere conversas presenciais.',
  },
  {
    id: 'counselor',
    name: 'O Conselheiro',
    description: 'Sociável e empático, combina habilidades de comunicação com genuíno interesse pelas pessoas.',
    strengths: ['Escuta ativa', 'Aconselhamento', 'Empatia', 'Construção de confiança'],
    developmentAreas: ['Assertividade em situações difíceis', 'Tomada de decisão rápida', 'Objetividade'],
    idealRoles: ['Psicólogo Organizacional', 'Mediador', 'Atendimento VIP', 'Coaching'],
    workStyle: 'Acolhedor, paciente, prioriza qualidade das relações.',
    communicationStyle: 'Atencioso, gentil, faz perguntas profundas.',
  },
  {
    id: 'facilitator',
    name: 'O Facilitador',
    description: 'Conecta pessoas e processos com habilidade. Cria ambientes de colaboração e ajuda grupos a alcançar consenso.',
    strengths: ['Facilitação de grupos', 'Colaboração', 'Mediação', 'Organização colaborativa'],
    developmentAreas: ['Posicionamento firme', 'Liderança diretiva quando necessário', 'Gestão de conflitos'],
    idealRoles: ['Scrum Master', 'Coordenador de Equipes', 'Community Manager', 'Facilitador'],
    workStyle: 'Colaborativo, organizado, foca em processos participativos.',
    communicationStyle: 'Inclusivo, claro, busca garantir que todos sejam ouvidos.',
  },
  {
    id: 'specialist',
    name: 'O Especialista',
    description: 'Profundo conhecimento técnico com foco em qualidade e precisão. Prefere trabalho independente e analítico.',
    strengths: ['Expertise técnica', 'Atenção a detalhes', 'Precisão', 'Consistência'],
    developmentAreas: ['Comunicação interpessoal', 'Trabalho em equipe', 'Adaptação a mudanças rápidas'],
    idealRoles: ['Analista Técnico', 'Pesquisador', 'Controller Financeiro', 'Engenheiro de Dados'],
    workStyle: 'Independente, focado, prefere ambientes estruturados e previsíveis.',
    communicationStyle: 'Preciso, técnico, prefere documentação detalhada.',
  },
  {
    id: 'guardian',
    name: 'O Guardião',
    description: 'Foco em conformidade, qualidade e proteção. Garante que regras sejam seguidas e padrões mantidos.',
    strengths: ['Compliance', 'Controle de qualidade', 'Atenção a riscos', 'Confiabilidade'],
    developmentAreas: ['Flexibilidade', 'Inovação', 'Comunicação de decisões difíceis'],
    idealRoles: ['Auditor', 'Compliance', 'Analista de Qualidade', 'Controlador'],
    workStyle: 'Meticuloso, consistente, prioriza conformidade e segurança.',
    communicationStyle: 'Formal, documentado, baseado em políticas e procedimentos.',
  },
  {
    id: 'artisan',
    name: 'O Artesão',
    description: 'Combina habilidade técnica com paciência e meticulosidade. Produz trabalho de alta qualidade com dedicação.',
    strengths: ['Qualidade de entrega', 'Paciência', 'Expertise técnica', 'Perfeccionismo produtivo'],
    developmentAreas: ['Velocidade de entrega', 'Comunicação com stakeholders', 'Visão de negócio'],
    idealRoles: ['Designer Técnico', 'Desenvolvedor Backend', 'Arquiteto de Dados', 'Engenheiro de Software'],
    workStyle: 'Focado, meticuloso, prefere trabalho profundo sem interrupções.',
    communicationStyle: 'Reservado, técnico, comunica através do trabalho entregue.',
  },
  {
    id: 'supporter',
    name: 'O Apoiador',
    description: 'Paciente, prestativo e focado em ajudar outros. Pilar de estabilidade e suporte em qualquer equipe.',
    strengths: ['Suporte consistente', 'Paciência', 'Confiabilidade', 'Cuidado com outros'],
    developmentAreas: ['Assertividade', 'Iniciativa própria', 'Lidar com mudanças rápidas'],
    idealRoles: ['Assistente Executivo', 'Suporte ao Cliente', 'Professor', 'Enfermeiro'],
    workStyle: 'Estável, prestativo, prioriza ajudar e manter harmonia.',
    communicationStyle: 'Gentil, paciente, disponível e acolhedor.',
  },
  {
    id: 'mediator',
    name: 'O Mediador',
    description: 'Equilibra relações e processos com diplomacia. Busca harmonia e consenso em todas as situações.',
    strengths: ['Diplomacia', 'Mediação de conflitos', 'Equilíbrio', 'Imparcialidade'],
    developmentAreas: ['Tomada de decisão firme', 'Lidar com pressão', 'Posicionar-se em conflitos'],
    idealRoles: ['Recursos Humanos', 'Relações Trabalhistas', 'Ombudsman', 'Mediador'],
    workStyle: 'Equilibrado, diplomático, busca consenso e harmonia.',
    communicationStyle: 'Imparcial, ponderado, ouve todos os lados.',
  },
  {
    id: 'creative_analyst',
    name: 'O Analista Criativo',
    description: 'Combina pensamento analítico com criatividade. Encontra soluções originais para problemas complexos.',
    strengths: ['Resolução criativa de problemas', 'Análise + inovação', 'Pensamento lateral', 'Curiosidade'],
    developmentAreas: ['Comunicação de ideias', 'Trabalho em equipe', 'Execução consistente'],
    idealRoles: ['UX Designer', 'Arquiteto de Soluções', 'Cientista de Dados', 'Product Designer'],
    workStyle: 'Curioso, analítico, alterna entre análise profunda e experimentação.',
    communicationStyle: 'Reflexivo, faz perguntas inesperadas, apresenta ideias visualmente.',
  },
  {
    id: 'versatile',
    name: 'O Versátil',
    description: 'Perfil equilibrado em todas as dimensões. Adapta-se a diferentes contextos e papéis com facilidade.',
    strengths: ['Versatilidade', 'Adaptabilidade', 'Equilíbrio', 'Visão holística'],
    developmentAreas: ['Desenvolver especialização', 'Definir posicionamento claro', 'Aprofundar em uma área'],
    idealRoles: ['Gerente Geral', 'Consultor', 'Analista de Negócios', 'Project Manager'],
    workStyle: 'Flexível, equilibrado, adapta estilo conforme a situação.',
    communicationStyle: 'Versátil, ajusta tom e abordagem conforme o interlocutor.',
  },
];

/**
 * Determines the archetype based on final dimension scores
 */
export function determineArchetype(
  scores: DimensionScores,
  classifications: Record<string, DimensionClassification>
): ArchetypeProfile {
  const { D1, D2, D3, D4, D5 } = classifications;

  // Check for Versatile first (all medium)
  const allValues = Object.values(classifications);
  if (allValues.every(v => v === 'medium')) {
    return ARCHETYPE_PROFILES.find(p => p.id === 'versatile')!;
  }

  // Sort dimensions by score to find primary and secondary
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [string, number][];
  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  // D1-dominant profiles
  if (D1 === 'high') {
    if (D2 === 'low' && D4 === 'high') return ARCHETYPE_PROFILES.find(p => p.id === 'commander')!;
    if (D2 === 'low' && D4 === 'high' && D3 === 'high') return ARCHETYPE_PROFILES.find(p => p.id === 'strategist')!;
    if (D2 === 'low' && D4 === 'low') return ARCHETYPE_PROFILES.find(p => p.id === 'innovator')!;
    if (D2 === 'low' && D3 === 'low') return ARCHETYPE_PROFILES.find(p => p.id === 'agile_executor')!;
    if (D2 === 'high' && D4 === 'low') return ARCHETYPE_PROFILES.find(p => p.id === 'influencer')!;
    if (D2 === 'high' && D5 === 'high') return ARCHETYPE_PROFILES.find(p => p.id === 'captain')!;
  }

  // D2-dominant profiles
  if (D2 === 'high') {
    if (D1 === 'low' && D5 === 'high') return ARCHETYPE_PROFILES.find(p => p.id === 'counselor')!;
    if (D1 === 'low' && D4 !== 'low' && D5 === 'high') return ARCHETYPE_PROFILES.find(p => p.id === 'facilitator')!;
    if (D4 === 'low' && D3 === 'low') return ARCHETYPE_PROFILES.find(p => p.id === 'promoter')!;
  }

  // D4-dominant profiles
  if (D4 === 'high') {
    if (D1 === 'low' && D2 === 'low' && D3 === 'high') return ARCHETYPE_PROFILES.find(p => p.id === 'specialist')!;
    if (D1 === 'low' && D2 === 'low' && D5 !== 'low') return ARCHETYPE_PROFILES.find(p => p.id === 'guardian')!;
    if (D1 === 'low' && D2 === 'low') return ARCHETYPE_PROFILES.find(p => p.id === 'artisan')!;
  }

  // D5-dominant profiles
  if (D5 === 'high') {
    if (D1 === 'low' && D3 === 'high') return ARCHETYPE_PROFILES.find(p => p.id === 'supporter')!;
    if (D1 === 'low') return ARCHETYPE_PROFILES.find(p => p.id === 'mediator')!;
  }

  // D3-dominant or mixed
  if (primary === 'D1' && D2 === 'low') return ARCHETYPE_PROFILES.find(p => p.id === 'creative_analyst')!;

  // Fallback based on primary+secondary
  const fallbackMap: Record<string, string> = {
    'D1_D4': 'commander',
    'D1_D2': 'influencer',
    'D1_D3': 'agile_executor',
    'D1_D5': 'captain',
    'D2_D5': 'counselor',
    'D2_D1': 'influencer',
    'D2_D4': 'facilitator',
    'D2_D3': 'promoter',
    'D3_D4': 'specialist',
    'D3_D5': 'supporter',
    'D3_D1': 'strategist',
    'D3_D2': 'facilitator',
    'D4_D3': 'artisan',
    'D4_D1': 'strategist',
    'D4_D5': 'guardian',
    'D4_D2': 'specialist',
    'D5_D2': 'counselor',
    'D5_D3': 'supporter',
    'D5_D1': 'captain',
    'D5_D4': 'mediator',
  };

  const key = `${primary}_${secondary}`;
  const fallbackId = fallbackMap[key] || 'versatile';
  return ARCHETYPE_PROFILES.find(p => p.id === fallbackId)!;
}

/**
 * Resolve an archetype ID to its display name.
 * Returns the archetype name (e.g., "O Comandante") or the raw ID if not found.
 */
export function getArchetypeDisplayName(archetypeId: string): string {
  const profile = ARCHETYPE_PROFILES.find(p => p.id === archetypeId);
  return profile?.name ?? archetypeId;
}
