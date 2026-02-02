/**
 * Gauge-Pro Word Bank - 100 Adjectives
 * PRD-049: 5 dimensions × 20 words (10 high, 10 low)
 */

import type { AdjectiveWord } from '@/types/gaugePro';

export const GAUGE_PRO_ADJECTIVES: AdjectiveWord[] = [
  // ===== D1 - DOMINÂNCIA/ASSERTIVIDADE =====
  // Alta Dominância (+2)
  { id: 1, text: 'Decidido', dimension: 'D1', polarity: 'high' },
  { id: 2, text: 'Influente', dimension: 'D1', polarity: 'high' },
  { id: 3, text: 'Competitivo', dimension: 'D1', polarity: 'high' },
  { id: 4, text: 'Determinado', dimension: 'D1', polarity: 'high' },
  { id: 5, text: 'Direto', dimension: 'D1', polarity: 'high' },
  { id: 6, text: 'Ousado', dimension: 'D1', polarity: 'high' },
  { id: 7, text: 'Controlador', dimension: 'D1', polarity: 'high' },
  { id: 8, text: 'Autoritário', dimension: 'D1', polarity: 'high' },
  { id: 9, text: 'Comandante', dimension: 'D1', polarity: 'high' },
  { id: 10, text: 'Desafiador', dimension: 'D1', polarity: 'high' },
  // Baixa Dominância (-2)
  { id: 11, text: 'Cooperativo', dimension: 'D1', polarity: 'low' },
  { id: 12, text: 'Receptivo', dimension: 'D1', polarity: 'low' },
  { id: 13, text: 'Conciliador', dimension: 'D1', polarity: 'low' },
  { id: 14, text: 'Diplomático', dimension: 'D1', polarity: 'low' },
  { id: 15, text: 'Consensual', dimension: 'D1', polarity: 'low' },
  { id: 16, text: 'Harmonioso', dimension: 'D1', polarity: 'low' },
  { id: 17, text: 'Moderado', dimension: 'D1', polarity: 'low' },
  { id: 18, text: 'Cauteloso', dimension: 'D1', polarity: 'low' },
  { id: 19, text: 'Prudente', dimension: 'D1', polarity: 'low' },
  { id: 20, text: 'Reservado', dimension: 'D1', polarity: 'low' },

  // ===== D2 - SOCIABILIDADE/EXTROVERSÃO =====
  // Alta Sociabilidade (+2)
  { id: 21, text: 'Comunicativo', dimension: 'D2', polarity: 'high' },
  { id: 22, text: 'Entusiasmado', dimension: 'D2', polarity: 'high' },
  { id: 23, text: 'Persuasivo', dimension: 'D2', polarity: 'high' },
  { id: 24, text: 'Amigável', dimension: 'D2', polarity: 'high' },
  { id: 25, text: 'Expressivo', dimension: 'D2', polarity: 'high' },
  { id: 26, text: 'Sociável', dimension: 'D2', polarity: 'high' },
  { id: 27, text: 'Animado', dimension: 'D2', polarity: 'high' },
  { id: 28, text: 'Caloroso', dimension: 'D2', polarity: 'high' },
  { id: 29, text: 'Extrovertido', dimension: 'D2', polarity: 'high' },
  { id: 30, text: 'Falante', dimension: 'D2', polarity: 'high' },
  // Baixa Sociabilidade (-2)
  { id: 31, text: 'Reservado', dimension: 'D2', polarity: 'low' },
  { id: 32, text: 'Reflexivo', dimension: 'D2', polarity: 'low' },
  { id: 33, text: 'Introspectivo', dimension: 'D2', polarity: 'low' },
  { id: 34, text: 'Discreto', dimension: 'D2', polarity: 'low' },
  { id: 35, text: 'Observador', dimension: 'D2', polarity: 'low' },
  { id: 36, text: 'Quieto', dimension: 'D2', polarity: 'low' },
  { id: 37, text: 'Concentrado', dimension: 'D2', polarity: 'low' },
  { id: 38, text: 'Sério', dimension: 'D2', polarity: 'low' },
  { id: 39, text: 'Analítico', dimension: 'D2', polarity: 'low' },
  { id: 40, text: 'Independente', dimension: 'D2', polarity: 'low' },

  // ===== D3 - RITMO/PACIÊNCIA =====
  // Alto Ritmo/Paciente (+2)
  { id: 41, text: 'Paciente', dimension: 'D3', polarity: 'high' },
  { id: 42, text: 'Constante', dimension: 'D3', polarity: 'high' },
  { id: 43, text: 'Persistente', dimension: 'D3', polarity: 'high' },
  { id: 44, text: 'Estável', dimension: 'D3', polarity: 'high' },
  { id: 45, text: 'Metódico', dimension: 'D3', polarity: 'high' },
  { id: 46, text: 'Regular', dimension: 'D3', polarity: 'high' },
  { id: 47, text: 'Previsível', dimension: 'D3', polarity: 'high' },
  { id: 48, text: 'Calmo', dimension: 'D3', polarity: 'high' },
  { id: 49, text: 'Consistente', dimension: 'D3', polarity: 'high' },
  { id: 50, text: 'Deliberado', dimension: 'D3', polarity: 'high' },
  // Baixo Ritmo/Dinâmico (-2)
  { id: 51, text: 'Ágil', dimension: 'D3', polarity: 'low' },
  { id: 52, text: 'Dinâmico', dimension: 'D3', polarity: 'low' },
  { id: 53, text: 'Rápido', dimension: 'D3', polarity: 'low' },
  { id: 54, text: 'Energético', dimension: 'D3', polarity: 'low' },
  { id: 55, text: 'Impulsivo', dimension: 'D3', polarity: 'low' },
  { id: 56, text: 'Versátil', dimension: 'D3', polarity: 'low' },
  { id: 57, text: 'Inquieto', dimension: 'D3', polarity: 'low' },
  { id: 58, text: 'Urgente', dimension: 'D3', polarity: 'low' },
  { id: 59, text: 'Espontâneo', dimension: 'D3', polarity: 'low' },
  { id: 60, text: 'Multitarefa', dimension: 'D3', polarity: 'low' },

  // ===== D4 - CONFORMIDADE/ESTRUTURA =====
  // Alta Conformidade (+2)
  { id: 61, text: 'Organizado', dimension: 'D4', polarity: 'high' },
  { id: 62, text: 'Preciso', dimension: 'D4', polarity: 'high' },
  { id: 63, text: 'Detalhista', dimension: 'D4', polarity: 'high' },
  { id: 64, text: 'Sistemático', dimension: 'D4', polarity: 'high' },
  { id: 65, text: 'Disciplinado', dimension: 'D4', polarity: 'high' },
  { id: 66, text: 'Cuidadoso', dimension: 'D4', polarity: 'high' },
  { id: 67, text: 'Meticuloso', dimension: 'D4', polarity: 'high' },
  { id: 68, text: 'Formal', dimension: 'D4', polarity: 'high' },
  { id: 69, text: 'Estruturado', dimension: 'D4', polarity: 'high' },
  { id: 70, text: 'Rigoroso', dimension: 'D4', polarity: 'high' },
  // Baixa Conformidade (-2)
  { id: 71, text: 'Criativo', dimension: 'D4', polarity: 'low' },
  { id: 72, text: 'Inovador', dimension: 'D4', polarity: 'low' },
  { id: 73, text: 'Flexível', dimension: 'D4', polarity: 'low' },
  { id: 74, text: 'Informal', dimension: 'D4', polarity: 'low' },
  { id: 75, text: 'Independente', dimension: 'D4', polarity: 'low' },
  { id: 76, text: 'Improvisador', dimension: 'D4', polarity: 'low' },
  { id: 77, text: 'Adaptável', dimension: 'D4', polarity: 'low' },
  { id: 78, text: 'Livre', dimension: 'D4', polarity: 'low' },
  { id: 79, text: 'Original', dimension: 'D4', polarity: 'low' },
  { id: 80, text: 'Questionador', dimension: 'D4', polarity: 'low' },

  // ===== D5 - ORIENTAÇÃO RELACIONAL =====
  // Orientação Relacional (+2)
  { id: 81, text: 'Empático', dimension: 'D5', polarity: 'high' },
  { id: 82, text: 'Compreensivo', dimension: 'D5', polarity: 'high' },
  { id: 83, text: 'Atencioso', dimension: 'D5', polarity: 'high' },
  { id: 84, text: 'Solidário', dimension: 'D5', polarity: 'high' },
  { id: 85, text: 'Colaborativo', dimension: 'D5', polarity: 'high' },
  { id: 86, text: 'Acolhedor', dimension: 'D5', polarity: 'high' },
  { id: 87, text: 'Gentil', dimension: 'D5', polarity: 'high' },
  { id: 88, text: 'Sensível', dimension: 'D5', polarity: 'high' },
  { id: 89, text: 'Prestativo', dimension: 'D5', polarity: 'high' },
  { id: 90, text: 'Carinhoso', dimension: 'D5', polarity: 'high' },
  // Orientação a Tarefas (-2)
  { id: 91, text: 'Objetivo', dimension: 'D5', polarity: 'low' },
  { id: 92, text: 'Prático', dimension: 'D5', polarity: 'low' },
  { id: 93, text: 'Focado', dimension: 'D5', polarity: 'low' },
  { id: 94, text: 'Eficiente', dimension: 'D5', polarity: 'low' },
  { id: 95, text: 'Direto', dimension: 'D5', polarity: 'low' },
  { id: 96, text: 'Produtivo', dimension: 'D5', polarity: 'low' },
  { id: 97, text: 'Lógico', dimension: 'D5', polarity: 'low' },
  { id: 98, text: 'Pragmático', dimension: 'D5', polarity: 'low' },
  { id: 99, text: 'Realista', dimension: 'D5', polarity: 'low' },
  { id: 100, text: 'Técnico', dimension: 'D5', polarity: 'low' },
];
