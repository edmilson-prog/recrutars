/**
 * Profile Summaries for Behavioral Assessment
 * Maps DISC profile names to recruiter-facing summary paragraphs.
 */

export const PROFILE_SUMMARIES: Record<string, string> = {
  'Executor Analítico':
    'Profissional orientado a resultados com forte capacidade analítica. ' +
    'Combina a determinação para alcançar metas com rigor metódico na avaliação de dados, ' +
    'sendo ideal para posições que exigem tomada de decisão baseada em evidências.',

  'Influenciador Estratégico':
    'Comunicador persuasivo com visão de longo prazo. ' +
    'Utiliza habilidades interpessoais para engajar equipes e stakeholders, ' +
    'enquanto mantém o foco em objetivos estratégicos e planejamento.',

  'Analítico Metódico':
    'Profissional detalhista com abordagem sistemática para resolução de problemas. ' +
    'Prioriza qualidade e precisão, seguindo processos estruturados ' +
    'para garantir entregas consistentes e bem fundamentadas.',

  'Influenciador':
    'Comunicador nato com forte capacidade de mobilizar pessoas. ' +
    'Destaca-se em ambientes colaborativos onde pode utilizar seu carisma ' +
    'para construir relacionamentos e impulsionar resultados em equipe.',

  'Executor':
    'Profissional de alta performance focado em ação e entrega. ' +
    'Assume responsabilidades com determinação, busca autonomia ' +
    'e trabalha melhor quando tem metas claras e liberdade para executar.',

  'Cooperativo':
    'Profissional colaborativo que valoriza harmonia e trabalho em equipe. ' +
    'Constrói relações de confiança, oferece suporte consistente aos colegas ' +
    'e contribui para um ambiente de trabalho estável e produtivo.',

  'Executor Estratégico':
    'Líder orientado a resultados com visão estratégica. ' +
    'Combina a capacidade de execução rápida com planejamento cuidadoso, ' +
    'sendo eficaz tanto na definição de metas quanto na sua implementação.',

  'Analítico Cooperativo':
    'Profissional que alia pensamento analítico à colaboração. ' +
    'Contribui com análises fundamentadas em ambientes de equipe, ' +
    'equilibrando rigor técnico com sensibilidade interpessoal.',

  'Analítico':
    'Pensador crítico com forte atenção aos detalhes e dados. ' +
    'Prefere decisões embasadas em informações concretas ' +
    'e se destaca em funções que requerem precisão e análise aprofundada.',

  'Executor Influenciador':
    'Profissional de ação com forte habilidade de comunicação. ' +
    'Consegue tanto executar tarefas com determinação quanto engajar ' +
    'e motivar outros ao redor para alcançar objetivos compartilhados.',

  'Cooperativo Influenciador':
    'Profissional relacional que combina colaboração com persuasão. ' +
    'Facilita o trabalho em equipe através da comunicação empática, ' +
    'construindo pontes entre diferentes grupos e perspectivas.',

  'Executor Organizador':
    'Profissional que alia capacidade de execução à organização metódica. ' +
    'Estrutura processos e fluxos de trabalho de forma eficiente, ' +
    'garantindo que metas sejam alcançadas dentro de padrões de qualidade.',

  'Influenciador Executor':
    'Líder carismático com forte orientação para resultados. ' +
    'Inspira e mobiliza equipes enquanto mantém o foco na entrega, ' +
    'equilibrando habilidades interpessoais com pragmatismo.',

  'Influenciador Comunicador':
    'Comunicador excepcional com habilidade para conectar pessoas e ideias. ' +
    'Destaca-se em funções que exigem apresentação, negociação ' +
    'e construção de relacionamentos de longo prazo.',
};

/**
 * Returns the summary paragraph for a given profile name.
 * Falls back to a generic description if the profile is not mapped.
 */
export function getProfileSummary(profileName: string): string {
  return (
    PROFILE_SUMMARIES[profileName] ??
    'Perfil comportamental identificado através da avaliação Gauge-Pro DISC. ' +
      'Consulte os pontos fortes e de atenção para uma análise detalhada das características deste candidato.'
  );
}
