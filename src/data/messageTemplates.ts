/**
 * Default Message Templates
 * PRD-041: Mensagens Personalizadas
 */

import type { MessageTemplate } from '@/types/messageTemplates';

export const defaultMessageTemplates: MessageTemplate[] = [
  // Convites para Entrevista
  {
    id: 'template-invitation-1',
    name: 'Convite para Entrevista',
    category: 'invitation',
    description: 'Convite padrão para agendar uma entrevista',
    subject: 'Convite para Entrevista - {{vaga}}',
    content: {
      formal: `Prezado(a) {{nome}},

É com grande satisfação que entramos em contato para convidá-lo(a) a participar de uma entrevista para a posição de {{vaga}} em nossa empresa, {{empresa}}.

Seu perfil demonstrou alinhamento significativo com os requisitos da vaga, e gostaríamos de conhecê-lo(a) melhor.

A entrevista está prevista para {{data}} às {{horario}}, no {{local}}.

Por favor, confirme sua disponibilidade respondendo a esta mensagem.

Atenciosamente,
Equipe de Recrutamento
{{empresa}}`,
      neutral: `Olá {{nome}},

Gostaríamos de convidá-lo(a) para uma entrevista para a vaga de {{vaga}} na {{empresa}}.

Ficamos interessados no seu perfil e queremos conhecer você melhor.

Data: {{data}}
Horário: {{horario}}
Local: {{local}}

Por favor, confirme se essa data funciona para você.

Obrigado,
Equipe {{empresa}}`,
      informal: `Oi {{nome}}, tudo bem?

Gostamos muito do seu perfil e queremos te convidar para uma conversa sobre a vaga de {{vaga}} aqui na {{empresa}}!

Que tal {{data}} às {{horario}}? A gente pode fazer {{local}}.

Me conta se funciona pra você!

Abraços,
Time de RH da {{empresa}}`,
    },
    variables: ['nome', 'vaga', 'empresa', 'data', 'horario', 'local'],
    isCustom: false,
  },
  {
    id: 'template-invitation-2',
    name: 'Convite para Entrevista Técnica',
    category: 'invitation',
    description: 'Convite específico para entrevista técnica',
    subject: 'Próxima Etapa - Entrevista Técnica {{vaga}}',
    content: {
      formal: `Prezado(a) {{nome}},

Parabéns por avançar em nosso processo seletivo para a posição de {{vaga}}!

Gostaríamos de convidá-lo(a) para a próxima etapa: uma entrevista técnica onde poderemos avaliar suas habilidades em {{skills}}.

Data: {{data}}
Horário: {{horario}}
Local: {{local}}

Aguardamos sua confirmação.

Atenciosamente,
Equipe de Recrutamento
{{empresa}}`,
      neutral: `Olá {{nome}},

Parabéns por passar para a próxima fase do processo de {{vaga}}!

Agora teremos uma entrevista técnica para avaliar suas skills em {{skills}}.

Data: {{data}}
Horário: {{horario}}
Local: {{local}}

Confirma pra gente?

Obrigado,
{{empresa}}`,
      informal: `E aí {{nome}}!

Você passou pra próxima fase! Agora vamos ter um papo técnico sobre {{skills}}.

Seria {{data}} às {{horario}}, {{local}}.

Bora? Me confirma!

Abraço,
{{empresa}}`,
    },
    variables: ['nome', 'vaga', 'empresa', 'skills', 'data', 'horario', 'local'],
    isCustom: false,
  },

  // Feedback
  {
    id: 'template-feedback-1',
    name: 'Feedback Positivo - Em Análise',
    category: 'feedback',
    description: 'Informar que o candidato está em análise positiva',
    content: {
      formal: `Prezado(a) {{nome}},

Gostaríamos de informá-lo(a) que sua candidatura para a vaga de {{vaga}} está sendo analisada com muito interesse por nossa equipe.

Seu perfil, especialmente sua experiência de {{experiencia}} anos e conhecimentos em {{skills}}, demonstrou forte alinhamento com o que buscamos.

Retornaremos em breve com novidades sobre os próximos passos.

Atenciosamente,
{{empresa}}`,
      neutral: `Olá {{nome}},

Queremos te contar que sua candidatura para {{vaga}} está em análise e estamos bem interessados no seu perfil!

Sua experiência de {{experiencia}} anos e conhecimentos em {{skills}} chamaram nossa atenção.

Em breve teremos novidades!

Obrigado,
{{empresa}}`,
      informal: `Oi {{nome}}!

Só passando pra dizer que vimos sua candidatura pra {{vaga}} e gostamos muito!

Sua experiência com {{skills}} é bem legal pro que a gente tá buscando.

Logo logo a gente te conta os próximos passos, tá?

Abraços!
{{empresa}}`,
    },
    variables: ['nome', 'vaga', 'empresa', 'experiencia', 'skills'],
    isCustom: false,
  },
  {
    id: 'template-feedback-2',
    name: 'Feedback Pós-Entrevista',
    category: 'feedback',
    description: 'Agradecer pela participação na entrevista',
    content: {
      formal: `Prezado(a) {{nome}},

Agradecemos sua participação na entrevista para a posição de {{vaga}}.

Foi um prazer conhecê-lo(a) e discutir suas experiências e aspirações profissionais. Estamos avaliando todos os candidatos e retornaremos em breve com o resultado.

Obrigado pelo seu interesse na {{empresa}}.

Atenciosamente,
Equipe de Recrutamento`,
      neutral: `Olá {{nome}},

Obrigado por participar da entrevista para {{vaga}}!

Foi muito bom te conhecer. Estamos avaliando os candidatos e logo te damos um retorno.

Obrigado pelo interesse na {{empresa}}!

Abraços,
Equipe de RH`,
      informal: `Oi {{nome}}!

Valeu demais pela entrevista! Foi muito legal te conhecer.

A gente tá finalizando as conversas com todos os candidatos e logo logo te conta como foi.

Até mais!
{{empresa}}`,
    },
    variables: ['nome', 'vaga', 'empresa'],
    isCustom: false,
  },

  // Não Aprovação
  {
    id: 'template-rejection-1',
    name: 'Não Aprovação - Padrão',
    category: 'rejection',
    description: 'Comunicar que o candidato não foi selecionado',
    content: {
      formal: `Prezado(a) {{nome}},

Agradecemos seu interesse na vaga de {{vaga}} e o tempo dedicado ao nosso processo seletivo.

Após análise cuidadosa de todas as candidaturas, informamos que não seguiremos com seu perfil para esta posição específica.

Esta decisão não diminui suas qualificações. Manteremos seu currículo em nosso banco de talentos para futuras oportunidades que possam estar mais alinhadas com seu perfil.

Desejamos sucesso em sua jornada profissional.

Atenciosamente,
{{empresa}}`,
      neutral: `Olá {{nome}},

Obrigado por se candidatar para {{vaga}} na {{empresa}}.

Após avaliar todos os candidatos, decidimos seguir com outros perfis para esta vaga.

Isso não significa que você não é qualificado! Vamos manter seu currículo para futuras vagas.

Boa sorte na sua busca!

Abraços,
{{empresa}}`,
      informal: `Oi {{nome}},

Primeiro, muito obrigado por ter participado do processo pra {{vaga}}!

Infelizmente dessa vez não vai rolar, mas isso não tem nada a ver com você não ser bom. É que outros perfis estavam mais alinhados com o momento.

A gente vai guardar seu contato pra futuras vagas, tá?

Boa sorte e até uma próxima!
{{empresa}}`,
    },
    variables: ['nome', 'vaga', 'empresa'],
    isCustom: false,
  },

  // Acompanhamento
  {
    id: 'template-followup-1',
    name: 'Acompanhamento - Status do Processo',
    category: 'followup',
    description: 'Atualizar candidato sobre status do processo',
    content: {
      formal: `Prezado(a) {{nome}},

Entramos em contato para atualizá-lo(a) sobre sua candidatura para a vaga de {{vaga}}.

Seu processo está em andamento e você permanece entre os candidatos que estamos considerando. Nossa equipe ainda está realizando as avaliações finais.

Agradecemos sua paciência e retornaremos em breve com uma definição.

Atenciosamente,
{{empresa}}`,
      neutral: `Olá {{nome}},

Passando pra te contar como tá seu processo pra vaga de {{vaga}}.

Você continua no páreo! Estamos finalizando as avaliações e logo teremos uma resposta.

Obrigado pela paciência!

Abraços,
{{empresa}}`,
      informal: `E aí {{nome}}!

Só passando pra te dar um oi e contar que seu processo pra {{vaga}} tá rolando!

Você ainda tá na disputa. A gente tá finalizando tudo e logo te conta.

Valeu a paciência!
{{empresa}}`,
    },
    variables: ['nome', 'vaga', 'empresa'],
    isCustom: false,
  },

  // Boas-vindas
  {
    id: 'template-welcome-1',
    name: 'Boas-vindas - Aprovação',
    category: 'welcome',
    description: 'Comunicar aprovação e dar boas-vindas',
    content: {
      formal: `Prezado(a) {{nome}},

Temos a satisfação de comunicar que você foi aprovado(a) para a vaga de {{vaga}} na {{empresa}}!

Seu perfil {{disc_perfil}}, aliado à sua experiência de {{experiencia}} anos e competências em {{skills}}, demonstrou excelente alinhamento com nossa equipe.

Em breve entraremos em contato para discutir os próximos passos e formalidades de contratação.

Seja bem-vindo(a) à {{empresa}}!

Atenciosamente,
Equipe de Recrutamento`,
      neutral: `Olá {{nome}},

Temos uma ótima notícia: você foi aprovado(a) para a vaga de {{vaga}}! Parabéns!

Seu perfil {{disc_perfil}} e experiência com {{skills}} são exatamente o que estávamos buscando.

Vamos entrar em contato pra combinar os próximos passos.

Bem-vindo(a) à {{empresa}}!

Abraços,
Equipe de RH`,
      informal: `Oi {{nome}}!

Tenho uma novidade incrível: você passou! Parabéns!

Estamos muito felizes em ter você no time de {{vaga}}. Seu perfil {{disc_perfil}} e tudo que você sabe de {{skills}} vão agregar demais aqui.

Vamos combinar os próximos passos!

Seja muito bem-vindo(a) à {{empresa}}!
Time de RH`,
    },
    variables: ['nome', 'vaga', 'empresa', 'disc_perfil', 'experiencia', 'skills'],
    isCustom: false,
  },
];
