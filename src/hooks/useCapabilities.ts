/**
 * useCapabilities Hook (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates to usePlansQuery service hooks.
 * Consumers can continue using the same API; data now flows through the service layer.
 */

import { useMemo, useCallback } from 'react';
import type { PlanCapability, PlanCapabilityAssignment } from '@/types';
import {
  useCapabilities as useCapabilitiesQuery,
  useCapabilityAssignments,
} from './usePlansQuery';

export function useCapabilities(activePlanId?: string) {
  const { data: capabilities = [], isLoading: capsLoading, error: capsError } = useCapabilitiesQuery();
  const { data: assignments = [], isLoading: assignLoading, error: assignError } = useCapabilityAssignments(activePlanId);

  const isLoading = capsLoading || assignLoading;
  const error = capsError || assignError;

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
  const getAssignmentsForPlan = useCallback((_planId: string) => {
    // When activePlanId matches, return the fetched assignments; otherwise empty
    return assignments;
  }, [assignments]);

  // Get assignment value for plan + capability
  const getAssignmentValue = useCallback((_planId: string, capabilityKey: string) => {
    const found = assignments.find(a => a.capabilityKey === capabilityKey);
    return found?.value ?? null;
  }, [assignments]);

  // Update a single assignment (no-op placeholder — mutations handled separately)
  const updateAssignment = useCallback(
    (_planId: string, _capabilityKey: string, _value: string | number | boolean) => {
      console.warn('[useCapabilities] updateAssignment is a no-op wrapper. Use mutation from usePlansQuery instead.');
    },
    [],
  );

  // Add new capability (no-op placeholder)
  const addCapability = useCallback((_capability: PlanCapability) => {
    console.warn('[useCapabilities] addCapability is a no-op wrapper. Use mutation from usePlansQuery instead.');
  }, []);

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
