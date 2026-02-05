/**
 * Simulation Context Provider (PRD-071 Migration)
 * PRD-062: Feature Flags "Switch" - Plan Simulator
 *
 * Provides a sandboxed simulation mode for evaluating feature flags
 * against arbitrary contexts without affecting the real user state.
 *
 * Data now flows through the service layer (useFlags, useFlagOverrides)
 * instead of importing mockFeatureFlags and mockFlagOverrides directly.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { EvaluationContext, EvaluationResult, FeatureFlag } from '@/types';
import { useFlags, useFlagOverrides } from '@/hooks/useFeatureFlagsQuery';
import { evaluateWithExplanation } from '@/lib/featureFlagEngine';
import type { FeatureFlagOverride } from '@/types/featureFlags';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SimulationState {
  isSimulating: boolean;
  simulatedContext: EvaluationContext | null;
  comparisonContext: EvaluationContext | null;
  results: Record<string, EvaluationResult>;
  comparisonResults: Record<string, EvaluationResult>;
}

interface SimulationContextType extends SimulationState {
  startSimulation: (context: EvaluationContext) => void;
  startComparison: (contextA: EvaluationContext, contextB: EvaluationContext) => void;
  stopSimulation: () => void;
  updateSimulatedContext: (context: EvaluationContext) => void;
  flags: FeatureFlag[];
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function evaluateAllFlags(
  context: EvaluationContext,
  flags: FeatureFlag[],
  overrides: FeatureFlagOverride[],
): Record<string, EvaluationResult> {
  const results: Record<string, EvaluationResult> = {};
  flags.forEach(flag => {
    results[flag.key] = evaluateWithExplanation(flag, context, overrides);
  });
  return results;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const initialState: SimulationState = {
  isSimulating: false,
  simulatedContext: null,
  comparisonContext: null,
  results: {},
  comparisonResults: {},
};

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationState>(initialState);

  // Fetch flags and overrides via service layer
  const { data: flags = [], isLoading: flagsLoading } = useFlags();
  const { data: overrides = [], isLoading: overridesLoading } = useFlagOverrides();
  const isLoading = flagsLoading || overridesLoading;

  const startSimulation = useCallback((context: EvaluationContext) => {
    const results = evaluateAllFlags(context, flags, overrides);
    setState({
      isSimulating: true,
      simulatedContext: context,
      comparisonContext: null,
      results,
      comparisonResults: {},
    });
  }, [flags, overrides]);

  const startComparison = useCallback((contextA: EvaluationContext, contextB: EvaluationContext) => {
    const resultsA = evaluateAllFlags(contextA, flags, overrides);
    const resultsB = evaluateAllFlags(contextB, flags, overrides);
    setState({
      isSimulating: true,
      simulatedContext: contextA,
      comparisonContext: contextB,
      results: resultsA,
      comparisonResults: resultsB,
    });
  }, [flags, overrides]);

  const stopSimulation = useCallback(() => {
    setState(initialState);
  }, []);

  const updateSimulatedContext = useCallback((context: EvaluationContext) => {
    const results = evaluateAllFlags(context, flags, overrides);
    setState(prev => ({
      ...prev,
      simulatedContext: context,
      results,
    }));
  }, [flags, overrides]);

  return (
    <SimulationContext.Provider
      value={{
        ...state,
        startSimulation,
        startComparison,
        stopSimulation,
        updateSimulatedContext,
        flags,
        isLoading,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
