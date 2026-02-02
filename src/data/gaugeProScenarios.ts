/**
 * Gauge-Pro Situational Scenarios - 15 Scenarios
 * PRD-050: Each with 4 options mapping to D1-D5 dimensions
 */

import type { Scenario } from '@/types/gaugePro';

export const GAUGE_PRO_SCENARIOS: Scenario[] = [
  {
    id: 1,
    order: 1,
    title: 'Priorização de Urgência',
    situation: 'Seu gerente solicita um projeto urgente que precisa ser entregue até o fim do dia, mas você já tem outras prioridades programadas.',
    options: [
      { key: 'A', text: 'Reorganizo imediatamente minhas prioridades e foco totalmente no urgente', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D3', direction: '-' }] },
      { key: 'B', text: 'Converso com o gerente para entender se há flexibilidade ou posso delegar algo', mappings: [{ dimension: 'D1', direction: '-' }, { dimension: 'D5', direction: '+' }] },
      { key: 'C', text: 'Peço ajuda aos colegas para dividir as tarefas e cumprir tudo', mappings: [{ dimension: 'D2', direction: '+' }, { dimension: 'D5', direction: '+' }] },
      { key: 'D', text: 'Analiso tecnicamente o que é viável fazer com qualidade no prazo', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D3', direction: '+' }] },
    ],
  },
  {
    id: 2,
    order: 2,
    title: 'Discordância em Reunião',
    situation: 'Durante uma reunião, você percebe que a equipe está indo em uma direção que você considera equivocada.',
    options: [
      { key: 'A', text: 'Interrompo educadamente e apresento minha perspectiva com argumentos', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D2', direction: '+' }] },
      { key: 'B', text: 'Anoto minhas preocupações e abordo o líder em particular depois', mappings: [{ dimension: 'D1', direction: '-' }, { dimension: 'D4', direction: '+' }] },
      { key: 'C', text: 'Faço perguntas para levar o grupo a refletir sobre outras possibilidades', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D2', direction: '+' }] },
      { key: 'D', text: 'Aguardo o momento certo e apresento dados que fundamentem outra direção', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D3', direction: '+' }] },
    ],
  },
  {
    id: 3,
    order: 3,
    title: 'Apresentação de Resultados Negativos',
    situation: 'Você precisa apresentar resultados negativos do trimestre para a diretoria.',
    options: [
      { key: 'A', text: 'Apresento os números objetivamente e as ações corretivas já planejadas', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D4', direction: '+' }] },
      { key: 'B', text: 'Contextualizo os desafios enfrentados e proponho soluções colaborativas', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D2', direction: '+' }] },
      { key: 'C', text: 'Preparo uma análise detalhada das causas com evidências e plano estruturado', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D3', direction: '+' }] },
      { key: 'D', text: 'Assumo a responsabilidade e demonstro comprometimento com a reversão', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D5', direction: '+' }] },
    ],
  },
  {
    id: 4,
    order: 4,
    title: 'Colega com Dificuldades',
    situation: 'Um novo colega de equipe tem dificuldades para se adaptar aos processos da empresa.',
    options: [
      { key: 'A', text: 'Ofereço ajuda e dedico tempo para ensiná-lo com paciência', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D3', direction: '+' }] },
      { key: 'B', text: 'Indico os manuais e recursos disponíveis para que ele estude', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D1', direction: '-' }] },
      { key: 'C', text: 'Apresento-o a outros colegas que podem ajudar e integro-o socialmente', mappings: [{ dimension: 'D2', direction: '+' }, { dimension: 'D5', direction: '+' }] },
      { key: 'D', text: 'Dou feedback direto sobre o que precisa melhorar para acompanhar o ritmo', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D3', direction: '-' }] },
    ],
  },
  {
    id: 5,
    order: 5,
    title: 'Liberdade de Execução',
    situation: 'Você tem liberdade para escolher como executar um novo projeto importante.',
    options: [
      { key: 'A', text: 'Crio um plano estruturado com etapas, prazos e métricas claras', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D3', direction: '+' }] },
      { key: 'B', text: 'Reúno a equipe para definir colaborativamente a melhor abordagem', mappings: [{ dimension: 'D2', direction: '+' }, { dimension: 'D5', direction: '+' }] },
      { key: 'C', text: 'Busco referências externas e adapto criativamente para nossa realidade', mappings: [{ dimension: 'D4', direction: '-' }, { dimension: 'D1', direction: '+' }] },
      { key: 'D', text: 'Defino as diretrizes principais e executo com agilidade ajustando no caminho', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D3', direction: '-' }] },
    ],
  },
  {
    id: 6,
    order: 6,
    title: 'Conflito na Equipe',
    situation: 'Há um conflito entre dois membros da sua equipe que está impactando o clima.',
    options: [
      { key: 'A', text: 'Chamo ambos para uma conversa e medio até chegarem a um acordo', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D2', direction: '+' }] },
      { key: 'B', text: 'Defino claramente as expectativas e responsabilidades de cada um', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D4', direction: '+' }] },
      { key: 'C', text: 'Escuto individualmente cada lado e busco entender as causas profundas', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D3', direction: '+' }] },
      { key: 'D', text: 'Estabeleço regras de convivência e monitoro o cumprimento', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D1', direction: '+' }] },
    ],
  },
  {
    id: 7,
    order: 7,
    title: 'Projeto sob Pressão',
    situation: 'Você precisa trabalhar em um projeto com prazo apertado e muita pressão.',
    options: [
      { key: 'A', text: 'Prospero sob pressão, me mantenho focado e entrego no prazo', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D3', direction: '-' }] },
      { key: 'B', text: 'Mantenho a calma, organizo as etapas e trabalho metodicamente', mappings: [{ dimension: 'D3', direction: '+' }, { dimension: 'D4', direction: '+' }] },
      { key: 'C', text: 'Mobilizo a equipe, delego e mantenho todos motivados e alinhados', mappings: [{ dimension: 'D2', direction: '+' }, { dimension: 'D5', direction: '+' }] },
      { key: 'D', text: 'Reviso prioridades, negocio prazos realistas se necessário', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D1', direction: '-' }] },
    ],
  },
  {
    id: 8,
    order: 8,
    title: 'Feedback Negativo em Público',
    situation: 'Você recebe feedback negativo sobre seu trabalho em público.',
    options: [
      { key: 'A', text: 'Agradeço o feedback e busco entender especificamente o que melhorar', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D4', direction: '+' }] },
      { key: 'B', text: 'Defendo meu ponto de vista se acredito que o feedback não é justo', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D4', direction: '-' }] },
      { key: 'C', text: 'Fico incomodado mas não demonstro, reflito depois sozinho', mappings: [{ dimension: 'D2', direction: '-' }, { dimension: 'D3', direction: '+' }] },
      { key: 'D', text: 'Peço para conversarmos em particular para entender melhor o contexto', mappings: [{ dimension: 'D1', direction: '-' }, { dimension: 'D5', direction: '+' }] },
    ],
  },
  {
    id: 9,
    order: 9,
    title: 'Mudanças Organizacionais',
    situation: 'Sua empresa está passando por mudanças organizacionais significativas.',
    options: [
      { key: 'A', text: 'Adapto-me rapidamente e busco oportunidades nas mudanças', mappings: [{ dimension: 'D3', direction: '-' }, { dimension: 'D1', direction: '+' }] },
      { key: 'B', text: 'Procuro entender o racional das mudanças antes de me posicionar', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D3', direction: '+' }] },
      { key: 'C', text: 'Preocupo-me com o impacto nas pessoas e ofereço suporte aos colegas', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D2', direction: '+' }] },
      { key: 'D', text: 'Questiono aspectos que não fazem sentido e proponho alternativas', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D4', direction: '-' }] },
    ],
  },
  {
    id: 10,
    order: 10,
    title: 'Membro Não Performando',
    situation: 'Você está liderando um projeto e um membro da equipe não está entregando conforme o esperado.',
    options: [
      { key: 'A', text: 'Converso individualmente para entender se há algum problema pessoal ou profissional', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D2', direction: '+' }] },
      { key: 'B', text: 'Estabeleço metas claras e prazos específicos para correção', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D4', direction: '+' }] },
      { key: 'C', text: 'Ofereço treinamento ou recursos adicionais para apoiar o desenvolvimento', mappings: [{ dimension: 'D3', direction: '+' }, { dimension: 'D5', direction: '+' }] },
      { key: 'D', text: 'Redireciono as tarefas e ajusto a distribuição da carga de trabalho', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D3', direction: '-' }] },
    ],
  },
  {
    id: 11,
    order: 11,
    title: 'Ideia Contra Processos',
    situation: 'Você tem uma ideia inovadora que vai contra os processos estabelecidos da empresa.',
    options: [
      { key: 'A', text: 'Apresento a ideia para liderança com dados e argumentos sólidos', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D4', direction: '-' }] },
      { key: 'B', text: 'Testo a ideia informalmente primeiro para validar antes de propor oficialmente', mappings: [{ dimension: 'D3', direction: '+' }, { dimension: 'D4', direction: '-' }] },
      { key: 'C', text: 'Busco aliados que apoiem a ideia e construo consenso gradualmente', mappings: [{ dimension: 'D2', direction: '+' }, { dimension: 'D5', direction: '+' }] },
      { key: 'D', text: 'Respeito os processos atuais e busco inovar dentro das estruturas existentes', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D1', direction: '-' }] },
    ],
  },
  {
    id: 12,
    order: 12,
    title: 'Promoção vs Equilíbrio',
    situation: 'Você precisa escolher entre uma promoção que exige mais horas de trabalho ou manter seu equilíbrio atual.',
    options: [
      { key: 'A', text: 'Aceito o desafio, sei que posso me adaptar e crescer', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D3', direction: '-' }] },
      { key: 'B', text: 'Analiso cuidadosamente prós e contras antes de decidir', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D3', direction: '+' }] },
      { key: 'C', text: 'Converso com pessoas próximas para considerar o impacto na vida pessoal', mappings: [{ dimension: 'D5', direction: '+' }, { dimension: 'D2', direction: '+' }] },
      { key: 'D', text: 'Negocio condições que permitam aceitar mantendo qualidade de vida', mappings: [{ dimension: 'D1', direction: '-' }, { dimension: 'D5', direction: '+' }] },
    ],
  },
  {
    id: 13,
    order: 13,
    title: 'Evento de Networking',
    situation: 'Em um evento de networking profissional, você:',
    options: [
      { key: 'A', text: 'Circulo ativamente, conheço muitas pessoas e troco contatos', mappings: [{ dimension: 'D2', direction: '+' }, { dimension: 'D3', direction: '-' }] },
      { key: 'B', text: 'Foco em conversas profundas com poucas pessoas estratégicas', mappings: [{ dimension: 'D2', direction: '-' }, { dimension: 'D4', direction: '+' }] },
      { key: 'C', text: 'Apresento-me quando abordado e mantenho conversas educadas', mappings: [{ dimension: 'D1', direction: '-' }, { dimension: 'D2', direction: '-' }] },
      { key: 'D', text: 'Busco pessoas que possam gerar oportunidades de negócio concretas', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D5', direction: '-' }] },
    ],
  },
  {
    id: 14,
    order: 14,
    title: 'Erro em Processo',
    situation: 'Você identifica um erro em um processo que pode causar problemas futuros, mas corrigir dará trabalho extra.',
    options: [
      { key: 'A', text: 'Corrijo imediatamente, não deixo para depois', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D1', direction: '+' }] },
      { key: 'B', text: 'Documento o erro e proponho uma solução estruturada', mappings: [{ dimension: 'D4', direction: '+' }, { dimension: 'D3', direction: '+' }] },
      { key: 'C', text: 'Avalio a criticidade e priorizo conforme o risco real', mappings: [{ dimension: 'D1', direction: '+' }, { dimension: 'D3', direction: '+' }] },
      { key: 'D', text: 'Comunico a equipe e delego a correção para quem tem mais expertise', mappings: [{ dimension: 'D2', direction: '+' }, { dimension: 'D1', direction: '-' }] },
    ],
  },
  {
    id: 15,
    order: 15,
    title: 'Tarefa Repetitiva',
    situation: 'Você está trabalhando em uma tarefa repetitiva e monótona que precisa ser concluída.',
    options: [
      { key: 'A', text: 'Foco e concluo com consistência, sem pressa', mappings: [{ dimension: 'D3', direction: '+' }, { dimension: 'D4', direction: '+' }] },
      { key: 'B', text: 'Busco formas criativas de automatizar ou otimizar o processo', mappings: [{ dimension: 'D4', direction: '-' }, { dimension: 'D1', direction: '+' }] },
      { key: 'C', text: 'Divido em blocos menores e faço pausas para manter energia', mappings: [{ dimension: 'D3', direction: '-' }, { dimension: 'D2', direction: '+' }] },
      { key: 'D', text: 'Convido colegas para fazer juntos e tornar mais agradável', mappings: [{ dimension: 'D2', direction: '+' }, { dimension: 'D5', direction: '+' }] },
    ],
  },
];
