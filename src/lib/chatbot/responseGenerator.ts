/**
 * Response Generator for Chatbot
 * PRD-040: Chatbot de Suporte
 *
 * Generates contextual responses based on matches
 */

import type {
  ChatbotMessage,
  ChatbotSuggestion,
  UserContext,
  FuzzyMatchResult,
} from '@/types/chatbot';
import {
  welcomeMessages,
  fallbackMessages,
  initialSuggestions,
  getKnowledgeItem,
} from '@/data/chatbotKnowledge';
import { findMatches, detectIntent } from './fuzzyMatcher';

/**
 * Gera ID único para mensagem
 */
function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gera mensagem de boas-vindas
 */
export function generateWelcomeMessage(context: UserContext): ChatbotMessage {
  return {
    id: generateMessageId(),
    type: 'bot',
    content: welcomeMessages[context],
    timestamp: new Date().toISOString(),
    suggestions: initialSuggestions[context],
  };
}

/**
 * Gera resposta para saudação
 */
export function generateGreetingResponse(context: UserContext): ChatbotMessage {
  const greetings = [
    'Olá! Como posso ajudar você hoje?',
    'Oi! Estou aqui para ajudar. O que você precisa?',
    'Olá! Em que posso ser útil?',
  ];

  return {
    id: generateMessageId(),
    type: 'bot',
    content: greetings[Math.floor(Math.random() * greetings.length)],
    timestamp: new Date().toISOString(),
    suggestions: initialSuggestions[context],
  };
}

/**
 * Gera resposta para despedida
 */
export function generateFarewellResponse(): ChatbotMessage {
  const farewells = [
    'Até mais! Se precisar de algo, é só chamar.',
    'Foi um prazer ajudar! Volte sempre.',
    'Tchau! Estou aqui se precisar de mais alguma coisa.',
  ];

  return {
    id: generateMessageId(),
    type: 'bot',
    content: farewells[Math.floor(Math.random() * farewells.length)],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Gera resposta de fallback (quando não encontra match)
 */
export function generateFallbackResponse(context: UserContext): ChatbotMessage {
  const fallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

  const suggestions: ChatbotSuggestion[] = [
    ...initialSuggestions[context].slice(0, 2),
    {
      id: 'sug-escalate',
      type: 'action',
      label: 'Falar com atendente',
      value: 'ESCALATE',
    },
  ];

  return {
    id: generateMessageId(),
    type: 'bot',
    content: fallback,
    timestamp: new Date().toISOString(),
    suggestions,
  };
}

/**
 * Gera resposta baseada em match
 */
export function generateMatchResponse(
  match: FuzzyMatchResult,
  context: UserContext
): ChatbotMessage {
  const { item } = match;

  // Gera sugestões de perguntas relacionadas
  const suggestions: ChatbotSuggestion[] = [];

  if (item.relatedQuestions && item.relatedQuestions.length > 0) {
    for (const relatedId of item.relatedQuestions.slice(0, 2)) {
      const relatedItem = getKnowledgeItem(relatedId);
      if (relatedItem) {
        suggestions.push({
          id: `sug-${relatedId}`,
          type: 'quick_reply',
          label: relatedItem.question.slice(0, 30) + (relatedItem.question.length > 30 ? '...' : ''),
          value: relatedItem.question,
        });
      }
    }
  }

  // Adiciona opção de feedback
  suggestions.push({
    id: 'sug-helpful',
    type: 'action',
    label: 'Isso ajudou?',
    value: 'FEEDBACK',
  });

  return {
    id: generateMessageId(),
    type: 'bot',
    content: item.answer,
    timestamp: new Date().toISOString(),
    relatedQuestionId: item.id,
    suggestions,
  };
}

/**
 * Gera resposta de escalonamento
 */
export function generateEscalationResponse(): ChatbotMessage {
  return {
    id: generateMessageId(),
    type: 'bot',
    content: 'Entendo que você precisa de ajuda mais específica. Vou encaminhar sua solicitação para nossa equipe de suporte.\n\nPor favor, descreva brevemente seu problema para que possamos ajudá-lo melhor.',
    timestamp: new Date().toISOString(),
    suggestions: [
      {
        id: 'sug-cancel',
        type: 'action',
        label: 'Cancelar',
        value: 'CANCEL_ESCALATION',
      },
    ],
  };
}

/**
 * Gera resposta completa baseada na query
 */
export function generateResponse(
  query: string,
  context: UserContext
): ChatbotMessage {
  const intent = detectIntent(query);

  switch (intent) {
    case 'greeting':
      return generateGreetingResponse(context);

    case 'farewell':
      return generateFarewellResponse();

    case 'escalation':
      return generateEscalationResponse();

    case 'feedback':
      return {
        id: generateMessageId(),
        type: 'bot',
        content: 'Fico feliz em saber! Posso ajudar com mais alguma coisa?',
        timestamp: new Date().toISOString(),
        suggestions: initialSuggestions[context],
      };

    case 'question':
    default: {
      const matches = findMatches(query, context, 1, 0.25);

      if (matches.length > 0) {
        return generateMatchResponse(matches[0], context);
      }

      return generateFallbackResponse(context);
    }
  }
}

/**
 * Gera mensagem do usuário
 */
export function createUserMessage(content: string): ChatbotMessage {
  return {
    id: generateMessageId(),
    type: 'user',
    content,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Gera mensagem de sistema
 */
export function createSystemMessage(content: string): ChatbotMessage {
  return {
    id: generateMessageId(),
    type: 'system',
    content,
    timestamp: new Date().toISOString(),
  };
}
