import { useState, useMemo, useCallback } from 'react';
import type { PlanCapability, PlanCapabilityAssignment } from '@/types';
import { mockCapabilities, mockPlanCapabilityAssignments as mockCapabilityAssignments } from '@/data/plansData';

export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<PlanCapability[]>(mockCapabilities);
  const [assignments, setAssignments] = useState<PlanCapabilityAssignment[]>(mockCapabilityAssignments);

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

  // Update a single assignment
  const updateAssignment = useCallback((planId: string, capabilityKey: string, value: string | number | boolean) => {
    setAssignments(prev => {
      const idx = prev.findIndex(a => a.planId === planId && a.capabilityKey === capabilityKey);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], value };
        return updated;
      }
      return [...prev, { planId, capabilityKey, value }];
    });
  }, []);

  // Add new capability
  const addCapability = useCallback((capability: PlanCapability) => {
    setCapabilities(prev => [...prev, capability]);
  }, []);

  return { capabilities, categorizedCapabilities, assignments, getAssignmentsForPlan, getAssignmentValue, updateAssignment, addCapability };
}
