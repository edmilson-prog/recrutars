/**
 * Chatbot Knowledge Base
 * PRD-040: Chatbot de Suporte
 */

import type { KnowledgeBaseItem, ChatbotSuggestion, UserContext } from '@/types/chatbot';

export const knowledgeBase: KnowledgeBaseItem[] = [
  // Geral
  {
    id: 'general-1',
    question: 'O que é o RecrutaRS?',
    keywords: ['o que é', 'sobre', 'plataforma', 'sistema', 'recruta', 'recrutamento'],
    answer: 'O RecrutaRS é uma plataforma inteligente de recrutamento que conecta empresas a candidatos qualificados. Utilizamos testes comportamentais DISC para garantir o melhor match entre perfil do candidato e cultura da empresa.',
    category: 'general',
    contexts: ['guest', 'candidate', 'company', 'admin'],
    priority: 10,
  },
  {
    id: 'general-2',
    question: 'Como funciona o RecrutaRS?',
    keywords: ['como funciona', 'funcionamento', 'processo', 'etapas'],
    answer: 'O RecrutaRS funciona em 3 passos simples:\n\n1. **Cadastre-se** como candidato ou empresa\n2. **Complete seu perfil** e realize o teste DISC (para candidatos)\n3. **Conecte-se** - candidatos encontram vagas alinhadas e empresas encontram talentos ideais\n\nNosso algoritmo de matching considera habilidades técnicas e perfil comportamental para as melhores conexões.',
    category: 'general',
    contexts: ['guest', 'candidate', 'company'],
    priority: 9,
  },
  {
    id: 'general-3',
    question: 'O RecrutaRS é gratuito?',
    keywords: ['gratuito', 'grátis', 'preço', 'custo', 'valor', 'pagar', 'plano'],
    answer: 'Para **candidatos**, o RecrutaRS é 100% gratuito - você pode criar perfil, fazer o teste DISC e se candidatar a vagas sem nenhum custo.\n\nPara **empresas**, oferecemos diferentes planos com funcionalidades variadas. Consulte nossa página de planos para mais detalhes.',
    category: 'general',
    contexts: ['guest', 'candidate', 'company'],
    priority: 8,
  },

  // Candidatos
  {
    id: 'candidate-1',
    question: 'Como me cadastrar como candidato?',
    keywords: ['cadastrar', 'registro', 'criar conta', 'candidato', 'inscrever'],
    answer: 'Para se cadastrar como candidato:\n\n1. Clique em "Cadastrar" no topo da página\n2. Selecione "Sou Candidato"\n3. Preencha seus dados básicos\n4. Confirme seu email\n5. Complete seu perfil e faça o teste DISC\n\nQuanto mais completo seu perfil, melhores serão suas chances de match com vagas ideais!',
    category: 'candidate',
    contexts: ['guest', 'candidate'],
    priority: 10,
  },
  {
    id: 'candidate-2',
    question: 'Como me candidatar a uma vaga?',
    keywords: ['candidatar', 'aplicar', 'vaga', 'candidatura', 'emprego'],
    answer: 'Para se candidatar a uma vaga:\n\n1. Navegue até a vaga desejada\n2. Clique em "Candidatar-se"\n3. Revise seu perfil (se necessário)\n4. Confirme a candidatura\n\n**Dica:** Complete seu teste DISC para aumentar suas chances de match!',
    category: 'candidate',
    contexts: ['candidate'],
    priority: 9,
  },
  {
    id: 'candidate-3',
    question: 'Como acompanhar minhas candidaturas?',
    keywords: ['acompanhar', 'status', 'candidaturas', 'andamento', 'situação'],
    answer: 'Para acompanhar suas candidaturas:\n\n1. Acesse seu painel clicando no seu avatar\n2. Vá em "Minhas Candidaturas"\n3. Você verá o status de cada candidatura: Enviada, Em análise, Aprovado ou Recusado\n\nVocê também receberá notificações por email quando houver atualizações.',
    category: 'candidate',
    contexts: ['candidate'],
    priority: 8,
  },

  // Testes DISC
  {
    id: 'disc-1',
    question: 'O que é o teste DISC?',
    keywords: ['disc', 'teste', 'comportamental', 'perfil', 'psicológico'],
    answer: 'O teste DISC é uma avaliação comportamental que identifica seu estilo de trabalho e comunicação. DISC significa:\n\n• **D**ominância - Como você lida com desafios\n• **I**nfluência - Como você influencia os outros\n• **E**stabilidade (S) - Como você lida com mudanças\n• **C**onformidade - Como você lida com regras\n\nO resultado ajuda a encontrar vagas alinhadas com seu perfil!',
    category: 'tests',
    contexts: ['guest', 'candidate', 'company'],
    priority: 10,
  },
  {
    id: 'disc-2',
    question: 'Quanto tempo demora o teste DISC?',
    keywords: ['tempo', 'duração', 'demora', 'teste', 'disc', 'minutos'],
    answer: 'O teste DISC leva em média **10 a 15 minutos** para ser completado. Não há respostas certas ou erradas - responda com sinceridade para obter resultados mais precisos.\n\n**Dica:** Faça o teste em um momento tranquilo, sem interrupções.',
    category: 'tests',
    contexts: ['guest', 'candidate'],
    priority: 9,
  },
  {
    id: 'disc-3',
    question: 'Posso refazer o teste DISC?',
    keywords: ['refazer', 'repetir', 'novamente', 'teste', 'disc', 'resetar'],
    answer: 'Em geral, você pode refazer o teste DISC após um período de 6 meses. Isso porque seu perfil comportamental tende a ser estável ao longo do tempo.\n\nSe acredita que houve algum erro ou mudança significativa, entre em contato com nosso suporte para avaliar seu caso.',
    category: 'tests',
    contexts: ['candidate'],
    priority: 8,
  },

  // Empresas
  {
    id: 'company-1',
    question: 'Como cadastrar minha empresa?',
    keywords: ['cadastrar', 'empresa', 'registro', 'criar conta', 'companhia'],
    answer: 'Para cadastrar sua empresa:\n\n1. Clique em "Cadastrar" no topo da página\n2. Selecione "Sou Empresa"\n3. Preencha os dados da empresa (CNPJ, nome, etc.)\n4. Confirme o email corporativo\n5. Complete o perfil da empresa\n\nApós o cadastro, você pode publicar vagas e buscar candidatos!',
    category: 'company',
    contexts: ['guest', 'company'],
    priority: 10,
  },
  {
    id: 'company-2',
    question: 'Como publicar uma vaga?',
    keywords: ['publicar', 'criar', 'vaga', 'emprego', 'posição'],
    answer: 'Para publicar uma vaga:\n\n1. Acesse o painel da empresa\n2. Clique em "Vagas" > "Nova Vaga"\n3. Preencha os detalhes: título, descrição, requisitos, benefícios\n4. Defina o perfil DISC ideal (opcional mas recomendado)\n5. Publique a vaga\n\nCandidatos compatíveis serão notificados automaticamente!',
    category: 'company',
    contexts: ['company'],
    priority: 9,
  },
  {
    id: 'company-3',
    question: 'Como ver candidatos de uma vaga?',
    keywords: ['candidatos', 'ver', 'visualizar', 'vaga', 'inscritos', 'aplicações'],
    answer: 'Para ver os candidatos de uma vaga:\n\n1. Acesse o painel da empresa\n2. Vá em "Vagas" e selecione a vaga desejada\n3. Na aba "Candidatos", você verá todos os inscritos\n4. Use os filtros para ordenar por match, experiência ou data\n\nClique em um candidato para ver seu perfil completo e resultado DISC.',
    category: 'company',
    contexts: ['company'],
    priority: 8,
  },

  // Conta
  {
    id: 'account-1',
    question: 'Esqueci minha senha',
    keywords: ['esqueci', 'senha', 'recuperar', 'redefinir', 'login', 'acesso'],
    answer: 'Para recuperar sua senha:\n\n1. Na página de login, clique em "Esqueci minha senha"\n2. Digite seu email cadastrado\n3. Você receberá um link para redefinir a senha\n4. Crie uma nova senha segura\n\nSe não receber o email, verifique sua pasta de spam.',
    category: 'account',
    contexts: ['guest', 'candidate', 'company'],
    priority: 10,
  },
  {
    id: 'account-2',
    question: 'Como editar meu perfil?',
    keywords: ['editar', 'alterar', 'atualizar', 'perfil', 'dados', 'informações'],
    answer: 'Para editar seu perfil:\n\n1. Faça login na sua conta\n2. Clique no seu avatar no canto superior direito\n3. Selecione "Meu Perfil" ou "Configurações"\n4. Faça as alterações desejadas\n5. Clique em "Salvar"\n\nManter seu perfil atualizado aumenta suas chances de sucesso!',
    category: 'account',
    contexts: ['candidate', 'company'],
    priority: 9,
  },
  {
    id: 'account-3',
    question: 'Como excluir minha conta?',
    keywords: ['excluir', 'deletar', 'apagar', 'conta', 'remover', 'cancelar'],
    answer: 'Para excluir sua conta:\n\n1. Acesse as Configurações\n2. Role até "Zona de Perigo"\n3. Clique em "Excluir conta"\n4. Confirme sua decisão\n\n**Atenção:** Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.',
    category: 'account',
    contexts: ['candidate', 'company'],
    priority: 7,
  },

  // Técnico
  {
    id: 'tech-1',
    question: 'A página não está carregando',
    keywords: ['não carrega', 'erro', 'página', 'lento', 'travando', 'problema'],
    answer: 'Se a página não está carregando, tente:\n\n1. Atualize a página (F5 ou Ctrl+R)\n2. Limpe o cache do navegador\n3. Tente outro navegador (Chrome, Firefox, Edge)\n4. Verifique sua conexão com a internet\n\nSe o problema persistir, entre em contato com nosso suporte.',
    category: 'technical',
    contexts: ['guest', 'candidate', 'company', 'admin'],
    priority: 8,
  },
  {
    id: 'tech-2',
    question: 'Não recebi o email de confirmação',
    keywords: ['email', 'confirmação', 'não recebi', 'verificação', 'spam'],
    answer: 'Se você não recebeu o email de confirmação:\n\n1. Verifique sua pasta de Spam/Lixo Eletrônico\n2. Adicione noreply@recrutars.com.br aos contatos\n3. Aguarde alguns minutos (pode haver atraso)\n4. Tente reenviar o email de confirmação\n\nSe ainda assim não receber, contate nosso suporte.',
    category: 'technical',
    contexts: ['guest', 'candidate', 'company'],
    priority: 9,
  },
];

// Sugestões iniciais por contexto
export const initialSuggestions: Record<UserContext, ChatbotSuggestion[]> = {
  guest: [
    { id: 'sug-1', type: 'quick_reply', label: 'O que é o RecrutaRS?', value: 'O que é o RecrutaRS?' },
    { id: 'sug-2', type: 'quick_reply', label: 'Como me cadastrar?', value: 'Como me cadastrar como candidato?' },
    { id: 'sug-3', type: 'quick_reply', label: 'Planos e preços', value: 'O RecrutaRS é gratuito?' },
  ],
  candidate: [
    { id: 'sug-4', type: 'quick_reply', label: 'Minhas candidaturas', value: 'Como acompanhar minhas candidaturas?' },
    { id: 'sug-5', type: 'quick_reply', label: 'Sobre o teste DISC', value: 'O que é o teste DISC?' },
    { id: 'sug-6', type: 'quick_reply', label: 'Editar meu perfil', value: 'Como editar meu perfil?' },
  ],
  company: [
    { id: 'sug-7', type: 'quick_reply', label: 'Publicar uma vaga', value: 'Como publicar uma vaga?' },
    { id: 'sug-8', type: 'quick_reply', label: 'Ver candidatos', value: 'Como ver candidatos de uma vaga?' },
    { id: 'sug-9', type: 'quick_reply', label: 'Sobre o teste DISC', value: 'O que é o teste DISC?' },
  ],
  admin: [
    { id: 'sug-10', type: 'quick_reply', label: 'Problemas técnicos', value: 'A página não está carregando' },
    { id: 'sug-11', type: 'quick_reply', label: 'Gerenciar usuários', value: 'Como gerenciar usuários?' },
  ],
};

// Mensagem de boas-vindas por contexto
export const welcomeMessages: Record<UserContext, string> = {
  guest: 'Olá! Bem-vindo ao RecrutaRS. Como posso ajudar você hoje?',
  candidate: 'Olá! Sou o assistente do RecrutaRS. Como posso ajudar você com sua busca de emprego?',
  company: 'Olá! Sou o assistente do RecrutaRS. Como posso ajudar você a encontrar os melhores talentos?',
  admin: 'Olá! Como posso ajudar você hoje?',
};

// Mensagens quando não encontra resposta
export const fallbackMessages = [
  'Hmm, não encontrei uma resposta específica para isso. Posso ajudar com outra coisa?',
  'Desculpe, não tenho certeza sobre essa pergunta. Que tal tentar reformular ou escolher uma das sugestões?',
  'Não consegui entender exatamente o que você precisa. Quer falar com um atendente humano?',
];

// Obter item da base por ID
export function getKnowledgeItem(id: string): KnowledgeBaseItem | undefined {
  return knowledgeBase.find(item => item.id === id);
}

// Filtrar itens por contexto
export function getItemsByContext(context: UserContext): KnowledgeBaseItem[] {
  return knowledgeBase.filter(item => item.contexts.includes(context));
}

// Filtrar itens por categoria
export function getItemsByCategory(category: string): KnowledgeBaseItem[] {
  return knowledgeBase.filter(item => item.category === category);
}
