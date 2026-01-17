/**
 * Message Templates Library
 * PRD-041: Mensagens Personalizadas
 *
 * Central export for template utilities
 */

export {
  parseVariables,
  extractVariables,
  validateVariables,
  highlightVariables,
  getExampleData,
} from './variableParser';

export {
  adjustTone,
  getToneSuggestions,
  getToneCharacteristics,
} from './toneGenerator';
