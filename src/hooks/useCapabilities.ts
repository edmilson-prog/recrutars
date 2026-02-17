/**
 * useCapabilities Hook (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates to usePlansQuery service hooks.
 * Consumers can continue using the same API; data now flows through the service layer.
 */

import { useMemo, useCallback } from 'react';
import type { PlanCapability } from '@/types';
import {
  useCapabilities as useCapabilitiesQuery,
  useCapabilityAssignments,
  useAllCapabilityAssignments,
  useCreateCapability,
  useUpsertAssignment,
} from './usePlansQuery';

export function useCapabilities(activePlanId?: string) {
  const { data: capabilities = [], isLoading: capsLoading, error: capsError } = useCapabilitiesQuery();

  // When activePlanId is provided, fetch only that plan's assignments;
  // otherwise fetch ALL assignments (needed for the admin matrix view).
  const singlePlanQuery = useCapabilityAssignments(activePlanId);
  const allAssignmentsQuery = useAllCapabilityAssignments();

  const assignmentsQuery = activePlanId ? singlePlanQuery : allAssignmentsQuery;
  const assignments = assignmentsQuery.data ?? [];

  const isLoading = capsLoading || assignmentsQuery.isLoading;
  const error = capsError || assignmentsQuery.error;

  const createCapabilityMutation = useCreateCapability();
  const upsertAssignmentMutation = useUpsertAssignment();

  // Group capabilities by category
  const categorizedCapabilities = useMemo(() => {
    const groups: Record<string, PlanCapability[]> = {};
    capabilities.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [capabilities]);

  // Get assignments for a specific plan
  const getAssignmentsForPlan = useCallback((planId: string) => {
    return assignments.filter(a => a.planId === planId);
  }, [assignments]);

  // Get assignment value for plan + capability
  const getAssignmentValue = useCallback((planId: string, capabilityKey: string) => {
    const found = assignments.find(a => a.planId === planId && a.capabilityKey === capabilityKey);
    return found?.value ?? null;
  }, [assignments]);

  // Update a single assignment — persists to Supabase
  const updateAssignment = useCallback(
    (planId: string, capabilityKey: string, value: string | number | boolean) => {
      upsertAssignmentMutation.mutate({ planId, capabilityKey, value });
    },
    [upsertAssignmentMutation],
  );

  // Add new capability — persists to Supabase
  const addCapability = useCallback((capability: PlanCapability) => {
    const { id: _id, ...data } = capability;
    createCapabilityMutation.mutate(data);
  }, [createCapabilityMutation]);

  return {
    capabilities,
    categorizedCapabilities,
    assignments,
    getAssignmentsForPlan,
    getAssignmentValue,
    updateAssignment,
    addCapability,
    isLoading,
    error,
  };
}
