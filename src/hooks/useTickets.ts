/**
 * useTickets Hook
 * PRD-028: Central de Ajuda - Ticket Management
 */

import { useState, useEffect, useCallback } from 'react';
import type { Ticket, TicketMessage, TicketCategory, TicketStatus } from '@/types/help';
import { mockTickets } from '@/data/mockData';

// Respostas automáticas do suporte baseadas na categoria
const supportResponses: Record<TicketCategory, string> = {
  account:
    'Obrigado por entrar em contato! Nossa equipe está analisando seu caso de acesso à conta. Retornaremos em breve com uma solução.',
  applications:
    'Recebemos sua solicitação sobre candidaturas. Estamos verificando o status das suas aplicações e retornaremos com detalhes em breve.',
  resumes:
    'Obrigado pelo contato! Nossa equipe está analisando a questão do seu currículo. Entraremos em contato em breve com orientações.',
  tests:
    'Recebemos sua dúvida sobre os testes comportamentais. Nossa equipe está verificando e retornará com esclarecimentos em breve.',
  interviews:
    'Obrigado por entrar em contato sobre entrevistas. Estamos analisando sua solicitação e retornaremos com mais informações.',
  messages:
    'Recebemos seu relato sobre o sistema de mensagens. Nossa equipe técnica está investigando e retornará com uma solução.',
  billing:
    'Obrigado pelo contato sobre pagamentos. Nossa equipe financeira está analisando sua solicitação e retornará em breve.',
  technical:
    'Identificamos o problema técnico reportado. Nossa equipe de desenvolvimento está trabalhando na solução. Atualizaremos você em breve.',
  suggestions:
    'Muito obrigado pela sua sugestão! Valorizamos muito o feedback dos nossos usuários. Sua ideia será analisada pela equipe de produto.',
  other:
    'Obrigado por entrar em contato! Recebemos sua mensagem e nossa equipe está analisando. Retornaremos em breve com mais informações.',
};

export function useTickets(userId: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar tickets do localStorage ou usar mock
  useEffect(() => {
    const storageKey = `tickets_${userId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Ticket[];
        setTickets(parsed);
      } catch (error) {
        console.error('Erro ao carregar tickets:', error);
        // Se falhar, usar mock tickets do usuário
        const userTickets = mockTickets.filter((t) => t.userId === userId);
        setTickets(userTickets);
      }
    } else {
      // Primeira vez: carregar mock tickets do usuário
      const userTickets = mockTickets.filter((t) => t.userId === userId);
      setTickets(userTickets);
    }

    setLoading(false);
  }, [userId]);

  // Salvar tickets no localStorage sempre que mudar
  useEffect(() => {
    if (!loading) {
      const storageKey = `tickets_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(tickets));
    }
  }, [tickets, userId, loading]);

  // Obter próximo número de ticket
  const getNextTicketNumber = useCallback(() => {
    const lastNumberKey = 'last_ticket_number';
    const stored = localStorage.getItem(lastNumberKey);
    const lastNumber = stored ? parseInt(stored, 10) : 1000;
    const nextNumber = lastNumber + 1;
    localStorage.setItem(lastNumberKey, nextNumber.toString());
    return nextNumber;
  }, []);

  // Criar novo ticket
  const createTicket = useCallback(
    async (
      category: TicketCategory,
      subject: string,
      description: string,
      attachment?: { url: string; name: string }
    ): Promise<Ticket> => {
      const now = new Date().toISOString();
      const ticketNumber = getNextTicketNumber();

      const firstMessage: TicketMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        content: description,
        attachmentUrl: attachment?.url,
        attachmentName: attachment?.name,
        createdAt: now,
      };

      const newTicket: Ticket = {
        id: `ticket-${Date.now()}`,
        number: ticketNumber,
        userId,
        category,
        subject,
        status: 'open',
        messages: [firstMessage],
        createdAt: now,
        updatedAt: now,
      };

      setTickets((prev) => [newTicket, ...prev]);

      // Simular resposta automática do suporte após 2-5 segundos
      const delay = Math.random() * 3000 + 2000; // 2-5 segundos
      setTimeout(() => {
        addMessage(
          newTicket.id,
          supportResponses[category],
          undefined,
          'support'
        );
      }, delay);

      return newTicket;
    },
    [userId, getNextTicketNumber]
  );

  // Adicionar mensagem ao ticket
  const addMessage = useCallback(
    (
      ticketId: string,
      content: string,
      attachment?: { url: string; name: string },
      sender: 'user' | 'support' = 'user'
    ) => {
      const now = new Date().toISOString();

      const newMessage: TicketMessage = {
        id: `msg-${Date.now()}`,
        sender,
        content,
        attachmentUrl: attachment?.url,
        attachmentName: attachment?.name,
        createdAt: now,
      };

      setTickets((prev) =>
        prev.map((ticket) => {
          if (ticket.id === ticketId) {
            return {
              ...ticket,
              messages: [...ticket.messages, newMessage],
              status: sender === 'support' ? 'answered' : ticket.status,
              updatedAt: now,
            };
          }
          return ticket;
        })
      );

      // Se for mensagem do usuário, simular resposta do suporte
      if (sender === 'user') {
        const delay = Math.random() * 3000 + 2000; // 2-5 segundos
        setTimeout(() => {
          const ticket = tickets.find((t) => t.id === ticketId);
          if (ticket) {
            addMessage(
              ticketId,
              supportResponses[ticket.category],
              undefined,
              'support'
            );
          }
        }, delay);
      }
    },
    [tickets]
  );

  // Marcar ticket como resolvido
  const markAsResolved = useCallback((ticketId: string) => {
    const now = new Date().toISOString();

    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            status: 'resolved' as TicketStatus,
            resolvedAt: now,
            updatedAt: now,
          };
        }
        return ticket;
      })
    );
  }, []);

  // Obter ticket por ID
  const getTicketById = useCallback(
    (ticketId: string): Ticket | undefined => {
      return tickets.find((t) => t.id === ticketId);
    },
    [tickets]
  );

  // Filtrar tickets por status
  const getTicketsByStatus = useCallback(
    (status: TicketStatus | 'all'): Ticket[] => {
      if (status === 'all') {
        return tickets;
      }
      return tickets.filter((t) => t.status === status);
    },
    [tickets]
  );

  return {
    tickets,
    loading,
    createTicket,
    addMessage,
    markAsResolved,
    getTicketById,
    getTicketsByStatus,
  };
}
