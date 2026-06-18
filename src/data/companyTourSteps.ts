/**
 * Company guided tour steps (Fase 4).
 * A step with `tourId` is anchored to the nav item carrying data-tour="<tourId>";
 * a step without `tourId` renders as a centered card (no spotlight).
 */

export interface CompanyTourStep {
  /** data-tour value of the target nav item; omit for a centered card. */
  tourId?: string;
  title: string;
  body: string;
}

export const COMPANY_TOUR_STEPS: CompanyTourStep[] = [
  {
    title: 'Bem-vindo(a) ao RecrutaRS!',
    body: 'Este é o seu painel. Vamos dar uma volta rápida pelas principais áreas — leva menos de um minuto. Você pode pular quando quiser.',
  },
  {
    tourId: 'vagas',
    title: 'Minhas Vagas',
    body: 'Crie e gerencie suas vagas aqui: abra novas posições, edite e acompanhe o status de cada uma.',
  },
  {
    tourId: 'candidatos',
    title: 'Banco de Talentos',
    body: 'Explore os candidatos disponíveis, filtre por perfil comportamental e encontre os talentos certos para suas vagas.',
  },
  {
    tourId: 'testes',
    title: 'Testes Gauge-Pro',
    body: 'Envie o teste comportamental Gauge-Pro para candidatos e colaboradores e acompanhe os resultados.',
  },
  {
    tourId: 'equipes',
    title: 'Gestão de Equipes',
    body: 'Monte e analise suas equipes, veja o mapa comportamental e a compatibilidade entre as pessoas.',
  },
  {
    tourId: 'mensagens',
    title: 'Mensagens',
    body: 'Converse com os candidatos diretamente pela plataforma, sem perder nenhum contato.',
  },
  {
    tourId: 'configuracoes',
    title: 'Configurações',
    body: 'Ajuste o perfil da empresa, gerencie a equipe e as suas preferências de conta por aqui.',
  },
  {
    title: 'Tudo pronto!',
    body: 'Você já conhece o essencial. Para rever este tour quando quiser, use o botão "Refazer tour guiado" no painel. Bom recrutamento!',
  },
];
