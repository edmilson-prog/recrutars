/**
 * Billing Rules - Regras de Billing para Upgrade/Downgrade
 * PRD-076: Builds on subscriptionRules.ts with Stripe-aware logic
 */

import type { Plan, Subscription } from '@/types';
import { canUpgrade, canDowngrade } from './subscriptionRules';

/**
 * Verifica se o plano e um trial (possui trialDurationDays).
 */
export function isTrialPlan(plan: Plan): boolean {
  return !!plan.trialDurationDays && plan.trialDurationDays > 0;
}

/**
 * Verifica se uma assinatura em trial pode converter para paga.
 * Requer que a assinatura esteja ativa ou em trial.
 */
export function canConvertFromTrial(
  plan: Plan,
  subscription?: Subscription,
): boolean {
  if (!isTrialPlan(plan)) return false;
  if (!subscription) return false;
  return subscription.status === 'active' || subscription.status === 'trial';
}

/**
 * Retorna a lista de planos para os quais o usuario pode fazer upgrade.
 * Filtra pelo mesmo tipo e order superior.
 */
export function getAvailableUpgrades(currentPlan: Plan, allPlans: Plan[]): Plan[] {
  return allPlans.filter(
    (p) => p.isActive && !p.isFree && !isTrialPlan(p) && canUpgrade(currentPlan, p),
  );
}

/**
 * Retorna a lista de planos para os quais o usuario pode fazer downgrade.
 * Filtra pelo mesmo tipo e order inferior. Inclui plano gratuito se disponivel.
 */
export function getAvailableDowngrades(currentPlan: Plan, allPlans: Plan[]): Plan[] {
  return allPlans.filter(
    (p) => p.isActive && !isTrialPlan(p) && canDowngrade(currentPlan, p).allowed,
  );
}

/**
 * Determina se o upgrade e imediato (proration) ou agendado.
 * Upgrades sao sempre imediatos no Stripe (com proration).
 * Downgrades sao sempre agendados para o fim do periodo.
 */
export function getUpgradeType(
  currentPlan: Plan,
  targetPlan: Plan,
): 'immediate' | 'scheduled' | 'not_allowed' {
  if (canUpgrade(currentPlan, targetPlan)) return 'immediate';
  if (canDowngrade(currentPlan, targetPlan).allowed) return 'scheduled';
  return 'not_allowed';
}

/**
 * Retorna as features que serao perdidas no downgrade.
 * Compara features do plano atual com o plano de destino.
 */
export function getLostFeatures(currentPlan: Plan, targetPlan: Plan): string[] {
  const targetSet = new Set(targetPlan.features);
  return currentPlan.features.filter((f) => !targetSet.has(f));
}
