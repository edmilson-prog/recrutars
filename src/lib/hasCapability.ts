/**
 * Capability Checking System - Verificacao de Recursos por Plano
 * PRD-060: Gestao de Planos "Commerce"
 *
 * Verifica quais capabilities (features) estao disponiveis para um
 * determinado plano, com base na tabela de atribuicoes (assignments).
 *
 * Principio: fail open — se a verificacao falhar, permite acesso (UX).
 */

import type { PlanCapabilityAssignment } from '@/types';

// ---------------------------------------------------------------------------
// Lazy imports — plansData.ts pode estar sendo criado em paralelo
// ---------------------------------------------------------------------------

type PlansDataModule = {
  mockPlans: Array<{ id: string; slug: string; name: string; order: number }>;
  mockCapabilities: Array<{ id: string; key: string; name: string }>;
  mockCapabilityAssignments: PlanCapabilityAssignment[];
};

let _plansData: PlansDataModule | null = null;
let _loadAttempted = false;

/**
 * Carrega o modulo de dados de planos sob demanda.
 * Retorna null se o modulo ainda nao estiver disponivel.
 */
function getPlansData(): PlansDataModule | null {
  if (_plansData) return _plansData;
  if (_loadAttempted) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _plansData = require('@/data/plansData') as PlansDataModule;
    return _plansData;
  } catch {
    _loadAttempted = true;
    return null;
  }
}

/**
 * Reseta o cache de carregamento (util para testes).
 */
export function resetPlansDataCache(): void {
  _plansData = null;
  _loadAttempted = false;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Localiza o ID do plano pelo slug.
 */
function findPlanIdBySlug(planSlug: string): string | null {
  const data = getPlansData();
  if (!data) return null;

  const plan = data.mockPlans.find((p) => p.slug === planSlug);
  return plan?.id ?? null;
}

/**
 * Localiza o order do plano pelo slug.
 */
function findPlanOrderBySlug(planSlug: string): number | null {
  const data = getPlansData();
  if (!data) return null;

  const plan = data.mockPlans.find((p) => p.slug === planSlug);
  return plan?.order ?? null;
}

/**
 * Determina se um valor de capability e considerado "truthy".
 *   - boolean: retorna o proprio valor
 *   - number: retorna true se > 0
 *   - string: retorna true se nao vazia
 */
function isTruthyValue(value: string | number | boolean | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') return value.length > 0;
  return false;
}

// ---------------------------------------------------------------------------
// API publica
// ---------------------------------------------------------------------------

/**
 * Verifica se o plano identificado por `planSlug` possui uma determinada
 * capability ativa (valor truthy).
 *
 * Retorna true se:
 *   - O assignment existe E
 *   - O valor e truthy (true, > 0, string nao vazia)
 *
 * Fail open: retorna false se o plano ou dados nao forem encontrados
 * (sem lancar erro).
 */
export function hasCapability(
  planSlug: string,
  capabilityKey: string,
): boolean {
  const value = getCapabilityValue(planSlug, capabilityKey);
  return isTruthyValue(value);
}

/**
 * Retorna o valor atribuido a uma capability para um determinado plano.
 *
 * @returns o valor (string | number | boolean) ou null se nao encontrado
 */
export function getCapabilityValue(
  planSlug: string,
  capabilityKey: string,
): string | number | boolean | null {
  const data = getPlansData();
  if (!data) return null;

  const planId = findPlanIdBySlug(planSlug);
  if (!planId) return null;

  const assignment = data.mockCapabilityAssignments.find(
    (a) => a.planId === planId && a.capabilityKey === capabilityKey,
  );

  if (!assignment) return null;
  return assignment.value;
}

/**
 * Retorna todas as capability assignments de um plano.
 *
 * @returns array de PlanCapabilityAssignment (vazio se plano nao encontrado)
 */
export function getPlanCapabilities(
  planSlug: string,
): PlanCapabilityAssignment[] {
  const data = getPlansData();
  if (!data) return [];

  const planId = findPlanIdBySlug(planSlug);
  if (!planId) return [];

  return data.mockCapabilityAssignments.filter((a) => a.planId === planId);
}

/**
 * Compara as capabilities entre dois planos, identificando diferencas
 * e melhorias. Util para preview de upgrade/downgrade.
 *
 * Para cada capability conhecida, retorna:
 *   - key: identificador da capability
 *   - nameA: valor no plano A
 *   - nameB: valor no plano B
 *   - improved: true se o plano B oferece algo "melhor" que o plano A
 *
 * Logica de "improved":
 *   - boolean: false -> true e melhoria
 *   - number: valor B > valor A e melhoria
 *   - string: A vazio e B preenchido e melhoria; ou plano B tem order maior
 *   - null -> qualquer valor truthy e melhoria
 */
export function compareCapabilities(
  planSlugA: string,
  planSlugB: string,
): {
  key: string;
  nameA: string | number | boolean | null;
  nameB: string | number | boolean | null;
  improved: boolean;
}[] {
  const data = getPlansData();
  if (!data) return [];

  const planIdA = findPlanIdBySlug(planSlugA);
  const planIdB = findPlanIdBySlug(planSlugB);
  if (!planIdA || !planIdB) return [];

  // Coletar todas as capability keys unicas entre os dois planos
  const allKeys = new Set<string>();
  for (const a of data.mockCapabilityAssignments) {
    if (a.planId === planIdA || a.planId === planIdB) {
      allKeys.add(a.capabilityKey);
    }
  }

  // Order dos planos (para desempate de strings/enums)
  const orderA = findPlanOrderBySlug(planSlugA) ?? 0;
  const orderB = findPlanOrderBySlug(planSlugB) ?? 0;

  const results: {
    key: string;
    nameA: string | number | boolean | null;
    nameB: string | number | boolean | null;
    improved: boolean;
  }[] = [];

  for (const key of allKeys) {
    const assignA = data.mockCapabilityAssignments.find(
      (a) => a.planId === planIdA && a.capabilityKey === key,
    );
    const assignB = data.mockCapabilityAssignments.find(
      (a) => a.planId === planIdB && a.capabilityKey === key,
    );

    const valueA = assignA?.value ?? null;
    const valueB = assignB?.value ?? null;

    const improved = isImproved(valueA, valueB, orderA, orderB);

    results.push({
      key,
      nameA: valueA,
      nameB: valueB,
      improved,
    });
  }

  return results;
}

/**
 * Determina se valueB e uma melhoria em relacao a valueA.
 */
function isImproved(
  valueA: string | number | boolean | null,
  valueB: string | number | boolean | null,
  orderA: number,
  orderB: number,
): boolean {
  // null/undefined -> truthy e melhoria
  if (!isTruthyValue(valueA) && isTruthyValue(valueB)) {
    return true;
  }

  // truthy -> null/undefined e piora
  if (isTruthyValue(valueA) && !isTruthyValue(valueB)) {
    return false;
  }

  // Ambos falsy ou ambos truthy — comparar valores
  if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
    return !valueA && valueB;
  }

  if (typeof valueA === 'number' && typeof valueB === 'number') {
    return valueB > valueA;
  }

  // Para strings (ex: 'partial' vs 'level_1' vs 'level_2'), usar order do plano
  if (typeof valueA === 'string' && typeof valueB === 'string') {
    if (valueA === valueB) return false;
    return orderB > orderA;
  }

  // Tipos mistos ou iguais — sem melhoria detectavel
  return false;
}
