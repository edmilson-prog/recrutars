/**
 * Subscription Rules - Regras de Ciclo de Vida de Assinaturas
 * PRD-060: Gestao de Planos "Commerce"
 *
 * Funcoes para validar e calcular:
 *   - Upgrade / Downgrade de plano
 *   - Cancelamento e reativacao
 *   - Credito proporcional (prorata)
 *   - Precos de lancamento vs. precos normais
 *   - Data de renovacao
 *   - Flag early adopter
 */

import type { Subscription, Plan, PlanPeriod } from '@/types';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Data-limite para considerar um assinante como early adopter */
const EARLY_ADOPTER_CUTOFF = '2025-03-01';

/** Prazo maximo (em meses) para reativacao apos cancelamento */
const REACTIVATION_WINDOW_MONTHS = 6;

/** Mapeamento de periodo para quantidade de meses */
const PERIOD_MONTHS: Record<PlanPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
};

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Calcula a diferenca em dias entre duas datas (dateB - dateA).
 * Resultado positivo significa dateB e posterior a dateA.
 */
function diffInDays(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

/**
 * Adiciona N meses a uma data ISO e retorna a string ISO (yyyy-mm-dd).
 */
function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

/**
 * Retorna a data de hoje no formato ISO (yyyy-mm-dd).
 */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// API publica
// ---------------------------------------------------------------------------

/**
 * Verifica se o upgrade de plano e permitido.
 *
 * Regras:
 *   - O plano destino deve ter `order` maior que o plano atual
 *   - Ambos os planos devem ser do mesmo `type` (candidate | company)
 *
 * @returns true se o upgrade e permitido
 */
export function canUpgrade(currentPlan: Plan, targetPlan: Plan): boolean {
  if (currentPlan.type !== targetPlan.type) {
    return false;
  }

  return targetPlan.order > currentPlan.order;
}

/**
 * Calcula o credito proporcional (prorata) pelo periodo nao utilizado
 * da assinatura atual, para abater no preco do upgrade.
 *
 * Formula: (dias restantes / dias totais) * preco pago
 *
 * @returns valor do credito em reais (2 casas decimais)
 */
export function calculateUpgradeCredit(
  subscription: Subscription,
  currentPlan: Plan,
): number {
  void currentPlan; // reservado para futuras regras que dependam do plano

  const totalDays = diffInDays(subscription.startDate, subscription.endDate);
  if (totalDays <= 0) {
    return 0;
  }

  const now = today();
  const remainingDays = diffInDays(now, subscription.endDate);
  if (remainingDays <= 0) {
    return 0;
  }

  const credit = (remainingDays / totalDays) * subscription.pricePaid;
  return Math.round(credit * 100) / 100;
}

/**
 * Verifica se o downgrade de plano e permitido.
 *
 * Regras:
 *   - O plano destino deve ter `order` menor que o plano atual
 *   - Ambos os planos devem ser do mesmo `type`
 *   - O downgrade so entra em vigor ao fim do periodo atual (scheduledDate)
 *
 * @returns objeto com `allowed` e, se permitido, `scheduledDate` (= endDate da assinatura)
 */
export function canDowngrade(
  currentPlan: Plan,
  targetPlan: Plan,
  subscription?: Subscription,
): { allowed: boolean; scheduledDate?: string } {
  if (currentPlan.type !== targetPlan.type) {
    return { allowed: false };
  }

  if (targetPlan.order >= currentPlan.order) {
    return { allowed: false };
  }

  return {
    allowed: true,
    scheduledDate: subscription?.endDate,
  };
}

/**
 * Verifica se o cancelamento e permitido.
 *
 * Regras:
 *   - Cancelamento e sempre permitido para assinaturas ativas
 *   - O acesso continua ate o fim do periodo pago (accessUntil = endDate)
 *
 * @returns objeto com `allowed` e `accessUntil`
 */
export function canCancel(subscription: Subscription): {
  allowed: boolean;
  accessUntil: string;
} {
  if (subscription.status !== 'active') {
    return {
      allowed: false,
      accessUntil: subscription.endDate,
    };
  }

  return {
    allowed: true,
    accessUntil: subscription.endDate,
  };
}

/**
 * Verifica se a reativacao de uma assinatura cancelada e possivel.
 *
 * Regras:
 *   - Status deve ser 'cancelled'
 *   - A data de cancelamento (cancelledAt) deve estar dentro de 6 meses
 *   - Se ultrapassou 6 meses, o usuario precisara atualizar dados e refazer testes
 *
 * @returns objeto com `allowed` e, se negado, `reason`
 */
export function canReactivate(subscription: Subscription): {
  allowed: boolean;
  reason?: string;
} {
  if (subscription.status !== 'cancelled') {
    return {
      allowed: false,
      reason: 'Somente assinaturas com status "cancelled" podem ser reativadas.',
    };
  }

  if (!subscription.cancelledAt) {
    // Sem data de cancelamento registrada — permitir reativacao por seguranca (fail open)
    return { allowed: true };
  }

  const cancelDate = subscription.cancelledAt;
  const deadlineDate = addMonths(cancelDate, REACTIVATION_WINDOW_MONTHS);
  const now = today();

  if (now > deadlineDate) {
    return {
      allowed: false,
      reason:
        'O prazo de 6 meses para reativacao expirou. E necessario atualizar os dados cadastrais e refazer o teste comportamental.',
    };
  }

  return { allowed: true };
}

/**
 * Verifica se a assinatura se qualifica como early adopter.
 *
 * Regra: createdAt anterior a 2025-03-01.
 */
export function isEarlyAdopter(subscription: Subscription): boolean {
  return subscription.createdAt < EARLY_ADOPTER_CUTOFF;
}

/**
 * Calcula o preco de um plano para o periodo informado.
 *
 * Logica:
 *   1. Se o plano possui `launchPrices` e a data atual esta antes de
 *      `launchPriceEndDate`, retorna o preco de lancamento
 *   2. Caso contrario, retorna o preco normal
 *
 * @returns preco em reais
 */
export function calculatePrice(plan: Plan, period: PlanPeriod): number {
  // Verificar se preco de lancamento esta disponivel e vigente
  if (plan.launchPrices && plan.launchPriceEndDate) {
    const now = today();
    if (now <= plan.launchPriceEndDate) {
      const launchPrice = plan.launchPrices[period];
      if (launchPrice !== undefined && launchPrice > 0) {
        return launchPrice;
      }
    }
  }

  return plan.prices[period] ?? 0;
}

/**
 * Retorna a proxima data de renovacao com base no periodo.
 *
 * Adiciona 1, 3, 6 ou 12 meses a `startDate` conforme o periodo.
 *
 * @returns data de renovacao no formato ISO (yyyy-mm-dd)
 */
export function getNextRenewalDate(
  startDate: string,
  period: PlanPeriod,
): string {
  const months = PERIOD_MONTHS[period];
  return addMonths(startDate, months);
}

// ---------------------------------------------------------------------------
// PRD-074: Discount & Bonus Rules
// ---------------------------------------------------------------------------

/**
 * Checks whether a subscription period qualifies for the plan's long-term discount.
 *
 * PRD-074 RF-014: 10% discount for semiannual or annual subscriptions.
 */
export function shouldApplyDiscount(
  period: PlanPeriod,
  discountMinPeriod?: PlanPeriod,
): boolean {
  if (!discountMinPeriod) return false;
  return PERIOD_MONTHS[period] >= PERIOD_MONTHS[discountMinPeriod];
}

/**
 * Calculates the discounted price.
 *
 * @returns price after discount (2 decimal places)
 */
export function calculateDiscountedPrice(
  basePrice: number,
  discountPercentage: number,
): number {
  if (discountPercentage <= 0 || discountPercentage >= 100) return basePrice;
  const discounted = basePrice * (1 - discountPercentage / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Returns the number of bonus behavioral tests for a given plan/period.
 *
 * PRD-074 RF-012: Bonus is granted only for 6+ month subscriptions.
 */
export function calculateBonusTests(
  period: PlanPeriod,
  bonusConfig?: Partial<Record<PlanPeriod, number>>,
): number {
  if (!bonusConfig) return 0;
  return bonusConfig[period] ?? 0;
}
