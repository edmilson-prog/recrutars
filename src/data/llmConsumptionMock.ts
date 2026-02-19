/**
 * LLM Consumption Mock Data (PRD-080)
 * Dados mockados para o painel de consumo de provedores LLM
 */

export interface ConsumptionWeek {
  period: string;
  calls: number;
  tokens: number;
  cost: number;
  byProvider?: {
    anthropic: number;
    openai: number;
    openrouter: number;
  };
}

export interface ProviderConsumption {
  calls: number;
  tokens: number;
  cost: number;
  percentage: number;
}

export interface ConsumptionData {
  month: string;
  totalCalls: number;
  totalTokens: number;
  estimatedCost: number;
  callLimit: number;
  weekly: ConsumptionWeek[];
  byProvider: {
    anthropic: ProviderConsumption;
    openai: ProviderConsumption;
    openrouter: ProviderConsumption;
  };
}

export const MOCK_CONSUMPTION: ConsumptionData = {
  month: 'Fevereiro 2026',
  totalCalls: 6,
  totalTokens: 5240,
  estimatedCost: 0.12,
  callLimit: 100,
  weekly: [
    { period: '11/02 – 18/02', calls: 4, tokens: 3940, cost: 0.08, byProvider: { anthropic: 3, openai: 0, openrouter: 1 } },
    { period: '04/02 – 11/02', calls: 2, tokens: 1300, cost: 0.04, byProvider: { anthropic: 0, openai: 2, openrouter: 0 } },
    { period: '28/01 – 04/02', calls: 0, tokens: 0, cost: 0.00, byProvider: { anthropic: 0, openai: 0, openrouter: 0 } },
  ],
  byProvider: {
    anthropic: { calls: 3, tokens: 2940, cost: 0.06, percentage: 50 },
    openai: { calls: 2, tokens: 1300, cost: 0.04, percentage: 33 },
    openrouter: { calls: 1, tokens: 1000, cost: 0.02, percentage: 17 },
  },
};
