/**
 * Feature Flag Evaluation Engine
 * PRD-062: Feature Flags "Switch"
 *
 * Evaluation order:
 * 1. Kill switch check
 * 2. Flag status check (inactive)
 * 3. User-level override
 * 4. Company-level override
 * 5. Condition groups (OR between groups, AND within)
 * 6. Rollout percentage
 * 7. Default value
 */

import type {
  FeatureFlag,
  FeatureFlagOverride,
  FlagCondition,
  ConditionGroup,
  EvaluationContext,
  EvaluationStep,
  EvaluationResult,
} from '@/types';

// ---------------------------------------------------------------------------
// Dual-access helper for snake_case (DB) / camelCase (TS) fields
// ---------------------------------------------------------------------------

/** Returns obj[camel] ?? obj[snake], handling the DB snake_case vs TS camelCase mismatch */
function d<T>(obj: Record<string, unknown>, camel: string, snake: string): T {
  return (obj[camel] ?? obj[snake]) as T;
}

/** Finds an override matching flagKey + targetType + targetId with dual-access */
function findOverride(
  overrides: FeatureFlagOverride[],
  flagKey: string,
  targetType: string,
  targetId: string,
): FeatureFlagOverride | undefined {
  return overrides.find(o => {
    const oKey = d<string>(o as any, 'flagKey', 'flag_key');
    const oType = d<string>(o as any, 'targetType', 'target_type');
    const oId = d<string>(o as any, 'targetId', 'target_id');
    return oKey === flagKey && oType === targetType && oId === targetId;
  });
}

// ---------------------------------------------------------------------------
// Hash helpers for deterministic rollout
// ---------------------------------------------------------------------------

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // int32
  }
  return Math.abs(hash);
}

function isInRollout(userId: string, flagKey: string, percentage: number): boolean {
  const hash = hashCode(`${userId}:${flagKey}`);
  return (hash % 100) < percentage;
}

// ---------------------------------------------------------------------------
// Condition evaluation
// ---------------------------------------------------------------------------

function evaluateCondition(condition: FlagCondition, context: EvaluationContext): boolean {
  const { type, operator, value } = condition;

  switch (type) {
    case 'plan_is': {
      const values = Array.isArray(value) ? value : [value];
      if (operator === 'IN') return values.includes(context.planSlug);
      if (operator === 'NOT_IN') return !values.includes(context.planSlug);
      if (operator === 'EQUALS') return context.planSlug === value;
      return false;
    }

    case 'role_is': {
      if (!context.roleSlug) return false;
      const values = Array.isArray(value) ? value : [value];
      if (operator === 'IN') return values.includes(context.roleSlug);
      if (operator === 'NOT_IN') return !values.includes(context.roleSlug);
      if (operator === 'EQUALS') return context.roleSlug === value;
      return false;
    }

    case 'has_capability': {
      const values = Array.isArray(value) ? value : [value];
      if (operator === 'IN') return values.some(v => context.capabilities.includes(v as string));
      if (operator === 'NOT_IN') return !values.some(v => context.capabilities.includes(v as string));
      return false;
    }

    case 'user_type_is': {
      if (operator === 'EQUALS') return context.userType === value;
      if (operator === 'IN') {
        const values = Array.isArray(value) ? value : [value];
        return values.includes(context.userType);
      }
      return false;
    }

    case 'rollout_percent': {
      if (operator === 'LTE' && typeof value === 'number') {
        return isInRollout(context.userId, '', value);
      }
      return false;
    }

    default:
      return false;
  }
}

function evaluateConditionGroup(group: ConditionGroup, context: EvaluationContext): boolean {
  // AND logic: every condition in the group must pass
  return group.conditions.every(condition => evaluateCondition(condition, context));
}

// ---------------------------------------------------------------------------
// Main evaluation functions
// ---------------------------------------------------------------------------

/**
 * Simple boolean check: is this flag enabled for the given context?
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  context: EvaluationContext,
  overrides: FeatureFlagOverride[],
): boolean {
  return evaluateWithExplanation(flag, context, overrides).enabled;
}

/**
 * Detailed evaluation with an explanation chain describing each step.
 */
export function evaluateWithExplanation(
  flag: FeatureFlag,
  context: EvaluationContext,
  overrides: FeatureFlagOverride[],
): EvaluationResult {
  const chain: EvaluationStep[] = [];

  // Extract fields with dual-access (snake_case from DB / camelCase from TS types)
  const f = flag as any;
  const flagIsKillSwitched = d<boolean>(f, 'isKillSwitched', 'is_kill_switched');
  const flagKillSwitchReason = d<string | undefined>(f, 'killSwitchReason', 'kill_switch_reason');
  const flagDefaultValue = d<boolean>(f, 'defaultValue', 'default_value') ?? false;
  const flagConditionGroups = d<ConditionGroup[]>(f, 'conditionGroups', 'condition_groups') ?? [];
  const flagRolloutPercentage = d<number | undefined>(f, 'rolloutPercentage', 'rollout_percentage');

  // Step 1 - Kill switch
  const isKilled = flag.status === 'killed' || flagIsKillSwitched;
  chain.push({
    step: 'Kill Switch',
    checked: 'flag.isKillSwitched / flag.status',
    result: !isKilled,
    detail: isKilled
      ? `Flag esta com kill switch ativo${flagKillSwitchReason ? `: ${flagKillSwitchReason}` : ''}`
      : 'Kill switch inativo',
  });
  if (isKilled) {
    return { enabled: false, reason: 'Kill switch ativo', chain };
  }

  // Step 2 - Flag status
  if (flag.status === 'inactive') {
    chain.push({
      step: 'Status da Flag',
      checked: 'flag.status',
      result: false,
      detail: 'Flag inativa - retornando valor padrao',
    });
    return { enabled: flagDefaultValue, reason: 'Flag inativa - valor padrao utilizado', chain };
  }
  chain.push({
    step: 'Status da Flag',
    checked: 'flag.status',
    result: true,
    detail: `Flag ativa (status: ${flag.status})`,
  });

  // Step 3 - User-level override
  const userOverride = findOverride(overrides, flag.key, 'user', context.userId);
  if (userOverride) {
    chain.push({
      step: 'Override de Usuario',
      checked: `override para userId=${context.userId}`,
      result: userOverride.enabled,
      detail: `Override encontrado: ${userOverride.enabled ? 'habilitado' : 'desabilitado'}${userOverride.reason ? ` (${userOverride.reason})` : ''}`,
    });
    return {
      enabled: userOverride.enabled,
      reason: `Override de usuario: ${userOverride.enabled ? 'habilitado' : 'desabilitado'}`,
      chain,
    };
  }
  chain.push({
    step: 'Override de Usuario',
    checked: `override para userId=${context.userId}`,
    result: false,
    detail: 'Nenhum override de usuario encontrado',
  });

  // Step 4 - Company-level override
  if (context.companyId) {
    const companyOverride = findOverride(overrides, flag.key, 'company', context.companyId);
    if (companyOverride) {
      chain.push({
        step: 'Override de Empresa',
        checked: `override para companyId=${context.companyId}`,
        result: companyOverride.enabled,
        detail: `Override encontrado: ${companyOverride.enabled ? 'habilitado' : 'desabilitado'}${companyOverride.reason ? ` (${companyOverride.reason})` : ''}`,
      });
      return {
        enabled: companyOverride.enabled,
        reason: `Override de empresa: ${companyOverride.enabled ? 'habilitado' : 'desabilitado'}`,
        chain,
      };
    }
    chain.push({
      step: 'Override de Empresa',
      checked: `override para companyId=${context.companyId}`,
      result: false,
      detail: 'Nenhum override de empresa encontrado',
    });
  }

  // Step 5 - Condition groups (OR between groups)
  if (flagConditionGroups.length > 0) {
    let anyGroupPassed = false;
    flagConditionGroups.forEach((group, idx) => {
      const groupResult = evaluateConditionGroup(group, context);
      const conditionDetails = group.conditions
        .map(c => {
          const condResult = evaluateCondition(c, context);
          return `${c.type} ${c.operator} ${JSON.stringify(c.value)} => ${condResult ? 'PASS' : 'FAIL'}`;
        })
        .join('; ');

      chain.push({
        step: `Grupo de Condicoes #${idx + 1}`,
        checked: `${group.conditions.length} condicao(oes)`,
        result: groupResult,
        detail: conditionDetails,
      });

      if (groupResult) anyGroupPassed = true;
    });

    if (anyGroupPassed) {
      return {
        enabled: true,
        reason: 'Condicoes atendidas',
        chain,
      };
    }

    // If condition groups exist but none passed, check rollout before falling to default
  }

  // Step 6 - Rollout percentage
  if (flagRolloutPercentage !== undefined && flagRolloutPercentage > 0) {
    const inRollout = isInRollout(context.userId, flag.key, flagRolloutPercentage);
    chain.push({
      step: 'Rollout Percentual',
      checked: `${flagRolloutPercentage}%`,
      result: inRollout,
      detail: inRollout
        ? `Usuario dentro do rollout de ${flagRolloutPercentage}%`
        : `Usuario fora do rollout de ${flagRolloutPercentage}%`,
    });
    if (inRollout) {
      return { enabled: true, reason: `Dentro do rollout de ${flagRolloutPercentage}%`, chain };
    }
  }

  // Step 7 - Default value
  chain.push({
    step: 'Valor Padrao',
    checked: `defaultValue=${flagDefaultValue}`,
    result: flagDefaultValue,
    detail: `Utilizando valor padrao: ${flagDefaultValue}`,
  });

  return {
    enabled: flagDefaultValue,
    reason: `Valor padrao: ${flagDefaultValue}`,
    chain,
  };
}
