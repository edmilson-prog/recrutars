/**
 * Simulation Context Provider
 * PRD-062: Feature Flags "Switch" - Plan Simulator
 *
 * Provides a sandboxed simulation mode for evaluating feature flags
 * against arbitrary contexts without affecting the real user state.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { EvaluationContext, EvaluationResult, FeatureFlag } from '@/types';
import { mockFeatureFlags, mockFlagOverrides } from '@/data/featureFlagsData';
import { evaluateWithExplanation } from '@/lib/featureFlagEngine';

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
): Record<string, EvaluationResult> {
  const results: Record<string, EvaluationResult> = {};
  flags.forEach(flag => {
    results[flag.key] = evaluateWithExplanation(flag, context, mockFlagOverrides);
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
  const flags = mockFeatureFlags;

  const startSimulation = useCallback((context: EvaluationContext) => {
    const results = evaluateAllFlags(context, flags);
    setState({
      isSimulating: true,
      simulatedContext: context,
      comparisonContext: null,
      results,
      comparisonResults: {},
    });
  }, [flags]);

  const startComparison = useCallback((contextA: EvaluationContext, contextB: EvaluationContext) => {
    const resultsA = evaluateAllFlags(contextA, flags);
    const resultsB = evaluateAllFlags(contextB, flags);
    setState({
      isSimulating: true,
      simulatedContext: contextA,
      comparisonContext: contextB,
      results: resultsA,
      comparisonResults: resultsB,
    });
  }, [flags]);

  const stopSimulation = useCallback(() => {
    setState(initialState);
  }, []);

  const updateSimulatedContext = useCallback((context: EvaluationContext) => {
    const results = evaluateAllFlags(context, flags);
    setState(prev => ({
      ...prev,
      simulatedContext: context,
      results,
    }));
  }, [flags]);

  return (
    <SimulationContext.Provider
      value={{
        ...state,
        startSimulation,
        startComparison,
        stopSimulation,
        updateSimulatedContext,
        flags,
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
