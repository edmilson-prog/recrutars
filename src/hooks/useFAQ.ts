/**
 * useFAQ Hook
 * PRD-028: Central de Ajuda - FAQ Management
 *
 * NOTE: FAQ data is reference/static data. Once a FAQ service is created
 * (e.g. useFAQsQuery), replace `faqItems` with the service hook data.
 */

import { useState, useMemo } from 'react';
import type { FAQItem, UserArea } from '@/types/help';

/** Reference data: will be replaced by a service hook in a future PRD */
const faqItems: FAQItem[] = [
  // GERAL - Todos veem
  {
    id: 'faq-g-1',
    question: 'Como altero minha senha?',
    answer: 'Para alterar sua senha:\n\n1. Acesse "Configurações" no menu lateral\n2. Clique em "Alterar Senha"\n3. Digite sua senha atual\n4. Digite a nova senha\n5. Confirme a nova senha\n6. Clique em "Salvar"\n\n💡 Dica: Use uma senha forte com letras, números e símbolos.',
    category: 'Conta',
    area: 'general',
  },
  {
    id: 'faq-g-2',
    question: 'Como atualizo meu email?',
    answer: 'Para atualizar seu email:\n\n1. Acesse "Configurações"\n2. Clique em "Alterar Email"\n3. Digite o novo email\n4. Você receberá um código de verificação no novo email\n5. Digite o código para confirmar\n\n⚠️ Importante: Você usará o novo email para fazer login.',
    category: 'Conta',
    area: 'general',
  },
  {
    id: 'faq-g-3',
    question: 'Como excluo minha conta?',
    answer: 'Para excluir sua conta:\n\n1. Acesse "Configurações"\n2. Role até o final da página\n3. Clique em "Excluir Conta"\n4. Confirme a ação\n\n⚠️ Atenção: Esta ação é irreversível! Todos os seus dados serão permanentemente removidos.',
    category: 'Conta',
    area: 'general',
  },
  // CANDIDATO
  {
    id: 'faq-c-1',
    question: 'Como me candidato a uma vaga?',
    answer: 'Para se candidatar a uma vaga:\n\n1. Acesse "Buscar Vagas" no menu lateral\n2. Encontre a vaga desejada usando os filtros\n3. Clique em "Ver detalhes" para ver mais informações\n4. Clique no botão "Candidatar-se"\n5. Selecione qual currículo deseja usar\n6. Escreva uma mensagem opcional para a empresa\n7. Confirme sua candidatura\n\n💡 Dica: Mantenha seu currículo atualizado para aumentar suas chances!',
    category: 'Candidaturas',
    area: 'candidate',
    relatedArticles: ['Como criar um currículo atrativo', 'Como funcionam os filtros de busca'],
  },
  {
    id: 'faq-c-2',
    question: 'Como acompanho minhas candidaturas?',
    answer: 'Você pode acompanhar suas candidaturas em:\n\n1. Acesse "Candidaturas" no menu lateral\n2. Veja todas as suas candidaturas com status atualizado\n3. Use os filtros para ver por status: Pendentes, Em análise, Entrevista, etc.\n4. Clique em "Ver vaga" para detalhes\n\nOs status possíveis são:\n• Pendente: Aguardando análise da empresa\n• Em análise: Empresa está avaliando\n• Entrevista: Você foi selecionado para entrevista\n• Proposta: Você recebeu uma proposta\n• Reprovado: Candidatura não foi selecionada\n• Contratado: Parabéns! Você foi contratado',
    category: 'Candidaturas',
    area: 'candidate',
  },
  {
    id: 'faq-c-3',
    question: 'Como edito meu currículo?',
    answer: 'Para editar seu currículo:\n\n1. Acesse "Currículos" no menu lateral\n2. Clique no currículo que deseja editar\n3. Faça as alterações necessárias\n4. Clique em "Salvar"\n\n💡 Dica: Você pode ter múltiplos currículos para diferentes tipos de vagas!',
    category: 'Perfil',
    area: 'candidate',
  },
  {
    id: 'faq-c-4',
    question: 'Como funciona o teste comportamental?',
    answer: 'O teste comportamental avalia:\n\n• Dominância: Orientação para resultados\n• Sociabilidade: Orientação para pessoas\n• Ritmo: Orientação para processos\n• Conformidade: Orientação para qualidade\n\nPara fazer o teste:\n1. Acesse "Meus Testes"\n2. Clique em "Fazer Teste Comportamental"\n3. Responda as 24 questões com sinceridade\n4. Veja seu perfil comportamental\n\n💡 Dica: Seja sincero nas respostas para obter um resultado preciso!',
    category: 'Testes',
    area: 'candidate',
  },
  {
    id: 'faq-c-5',
    question: 'Como controlo minha privacidade?',
    answer: 'Você tem 3 modos de visibilidade:\n\n🌐 Modo Público:\n• Seu perfil completo é visível para empresas\n• Aparece nas buscas com nome e foto\n\n😎 Modo Anônimo:\n• Aparece como "Perfil Anônimo #XXXX"\n• Empresas veem suas habilidades mas não sua identidade\n• Você decide quando revelar sua identidade\n\n🔒 Modo Privado:\n• Seu perfil não aparece em buscas\n• Apenas candidaturas ativas são visíveis\n\nPara alterar: Acesse Configurações > Visibilidade do Perfil',
    category: 'Privacidade',
    area: 'candidate',
  },
  // EMPRESA
  {
    id: 'faq-e-1',
    question: 'Como publico uma nova vaga?',
    answer: 'Para publicar uma vaga:\n\n1. Acesse "Minhas Vagas"\n2. Clique em "+ Nova Vaga"\n3. Preencha as informações:\n   • Título e descrição\n   • Requisitos e benefícios\n   • Faixa salarial (opcional)\n   • Localização e modelo de trabalho\n4. Clique em "Publicar"\n\nSua vaga ficará visível imediatamente para candidatos!',
    category: 'Vagas',
    area: 'company',
  },
  {
    id: 'faq-e-2',
    question: 'Como funciona o Banco de Talentos?',
    answer: 'O Banco de Talentos permite:\n\n• Buscar candidatos ativos na plataforma\n• Filtrar por habilidades, localização e experiência\n• Ver perfis comportamentais\n• Enviar convites diretos para candidatos\n\nPara usar:\n1. Acesse "Banco de Talentos"\n2. Use os filtros de busca\n3. Veja os perfis disponíveis\n4. Clique em "Ver Perfil" para mais detalhes\n5. Envie convite para candidatos interessantes',
    category: 'Talentos',
    area: 'company',
  },
  {
    id: 'faq-e-3',
    question: 'Como gerencio as candidaturas recebidas?',
    answer: 'Para gerenciar candidaturas:\n\n1. Acesse "Candidaturas"\n2. Veja todas as candidaturas por vaga\n3. Use os filtros por status\n4. Clique no candidato para ver detalhes\n5. Mova para as etapas:\n   • Em análise\n   • Entrevista\n   • Proposta\n   • Contratado/Reprovado\n\nVocê também pode:\n• Adicionar notas internas\n• Enviar mensagens\n• Agendar entrevistas',
    category: 'Candidaturas',
    area: 'company',
  },
];

export function useFAQ(userArea: UserArea = 'general') {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrar FAQ por área do usuário
  const faqByArea = useMemo(() => {
    // Sempre incluir FAQ gerais
    const generalFAQs = faqItems.filter((item) => item.area === 'general');

    // Se for área específica, incluir FAQs dessa área
    if (userArea !== 'general') {
      const specificFAQs = faqItems.filter((item) => item.area === userArea);
      return [...generalFAQs, ...specificFAQs];
    }

    return generalFAQs;
  }, [userArea]);

  // Aplicar filtros de busca e categoria
  const filteredFAQs = useMemo(() => {
    let filtered = faqByArea;

    // Filtrar por categoria
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filtrar por busca (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [faqByArea, searchQuery, selectedCategory]);

  // Obter categorias únicas disponíveis
  const categories = useMemo(() => {
    const uniqueCategories = new Set(faqByArea.map((item) => item.category));
    return Array.from(uniqueCategories).sort();
  }, [faqByArea]);

  return {
    faqs: filteredFAQs,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    totalCount: faqByArea.length,
    filteredCount: filteredFAQs.length,
  };
}
