/**
 * Cultural Fit Library
 * PRD-042: Fit Cultural
 *
 * Central export for cultural fit utilities
 */

export {
  deriveCulturalProfileFromDisc,
  getDominantDiscLetter,
  getDiscCultureDescription,
  getDiscCultureStrengths,
} from './discCultureMapping';

export {
  calculateCompatibility,
  getCompatibilityLabel,
  getCompatibilityRecommendations,
  getQuickCompatibilityScore,
} from './compatibilityCalculator';
