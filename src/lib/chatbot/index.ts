/**
 * Chatbot Library
 * PRD-040: Chatbot de Suporte
 *
 * Central export for chatbot utilities
 */

export {
  findMatches,
  findBestMatch,
  isGreeting,
  isFarewell,
  detectIntent,
} from './fuzzyMatcher';

export {
  generateWelcomeMessage,
  generateGreetingResponse,
  generateFarewellResponse,
  generateFallbackResponse,
  generateMatchResponse,
  generateEscalationResponse,
  generateResponse,
  createUserMessage,
  createSystemMessage,
} from './responseGenerator';
