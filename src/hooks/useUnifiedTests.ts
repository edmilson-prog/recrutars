/**
 * Unified Tests Hook
 * Combines Gauge-Pro results + Behavioral Tests into a normalized list
 */

import { useMemo } from 'react';
import { useGaugeProResultByCandidate } from '@/hooks/useGaugeProQuery';
import { useBehavioralTestsByCandidate } from '@/hooks/useBehavioralTestsQuery';
import { TEST_CONFIG } from '@/data/testConfig';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';
import type { GaugeProResult } from '@/types/gaugePro';
import type { BehavioralTest } from '@/types/test';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UnifiedTestType = 'gauge-pro' | 'behavioral';
export type UnifiedTestOrigin = 'voluntary' | 'company-requested';
export type UnifiedTestStatus = 'completed' | 'pending' | 'in_progress' | 'expired';

export interface DimensionBar {
  label: string;
  value: number;
  color: string;
}

export interface UnifiedTest {
  id: string;
  type: UnifiedTestType;
  origin: UnifiedTestOrigin;
  status: UnifiedTestStatus;
  testName: string;
  companyName?: string;
  jobTitle?: string;
  completedAt?: string;
  sentAt?: string;
  resultSummary?: {
    archetype?: string;
    dimensions?: DimensionBar[];
    profile?: string;
  };
  actionUrl: string;
}

export interface UnifiedTestStats {
  total: number;
  completed: number;
  pending: number;
}

// ---------------------------------------------------------------------------
// Dimension colors (Gauge-Pro 5 dimensions)
// ---------------------------------------------------------------------------

const GP_DIMENSION_COLORS: Record<string, string> = {
  D1: '#ef4444', // red
  D2: '#f59e0b', // amber
  D3: '#22c55e', // green
  D4: '#3b82f6', // blue
  D5: '#a855f7', // purple
};

const GP_DIMENSION_LABELS: Record<string, string> = {
  D1: 'Dominância',
  D2: 'Sociabilidade',
  D3: 'Ritmo',
  D4: 'Conformidade',
  D5: 'Relacional',
};

// ---------------------------------------------------------------------------
// DISC colors (Behavioral Test 4 dimensions)
// ---------------------------------------------------------------------------

const DISC_COLORS: Record<string, string> = {
  D: '#ef4444',
  I: '#f59e0b',
  S: '#22c55e',
  C: '#3b82f6',
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapGaugeProResult(result: GaugeProResult): UnifiedTest {
  const dimensions: DimensionBar[] = Object.entries(result.finalScores).map(
    ([key, value]) => ({
      label: GP_DIMENSION_LABELS[key] || key,
      value: Math.round(value),
      color: GP_DIMENSION_COLORS[key] || '#6b7280',
    })
  );

  return {
    id: `gp-${result.id}`,
    type: 'gauge-pro',
    origin: 'voluntary',
    status: 'completed',
    testName: TEST_CONFIG.name,
    completedAt: result.generatedAt,
    resultSummary: {
      archetype: result.archetype?.name,
      dimensions,
    },
    actionUrl: '/candidato/gauge-pro/resultado',
  };
}

function mapBehavioralTest(test: BehavioralTest): UnifiedTest {
  const hasCompany = !!test.companyId;
  const origin: UnifiedTestOrigin = hasCompany ? 'company-requested' : 'voluntary';

  const statusMap: Record<string, UnifiedTestStatus> = {
    sent: 'pending',
    in_progress: 'in_progress',
    completed: 'completed',
  };

  const status = statusMap[test.status] || 'pending';

  let resultSummary: UnifiedTest['resultSummary'];
  if (test.result) {
    const dimensions: DimensionBar[] = [
      { label: 'D', value: test.result.dominance, color: DISC_COLORS.D },
      { label: 'I', value: test.result.influence, color: DISC_COLORS.I },
      { label: 'S', value: test.result.steadiness, color: DISC_COLORS.S },
      { label: 'C', value: test.result.compliance, color: DISC_COLORS.C },
    ];
    resultSummary = {
      profile: test.result.profile,
      dimensions,
    };
  }

  let actionUrl: string;
  if (status === 'completed') {
    actionUrl = '/candidato/teste-comportamental/resultado';
  } else {
    actionUrl = '/candidato/teste-comportamental';
  }

  return {
    id: `bt-${test.id}`,
    type: 'behavioral',
    origin,
    status,
    testName: 'Teste Comportamental',
    companyName: hasCompany ? test.candidateName : undefined, // fallback — service may not expose company name
    completedAt: test.completedAt,
    sentAt: test.sentAt,
    resultSummary,
    actionUrl,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUnifiedTests(candidateId: string) {
  const gaugeProQuery = useGaugeProResultByCandidate(candidateId);
  const behavioralQuery = useBehavioralTestsByCandidate(candidateId);

  const isLoading = gaugeProQuery.isLoading || behavioralQuery.isLoading;

  const tests = useMemo<UnifiedTest[]>(() => {
    const items: UnifiedTest[] = [];

    // Gauge-Pro result (single or null)
    if (gaugeProQuery.data) {
      items.push(mapGaugeProResult(gaugeProQuery.data));
    }

    // Behavioral tests (array)
    const behavioralTests = behavioralQuery.data;
    if (Array.isArray(behavioralTests)) {
      items.push(...behavioralTests.map(mapBehavioralTest));
    }

    // Sort: completed first, then by date descending
    items.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return -1;
      if (a.status !== 'completed' && b.status === 'completed') return 1;
      const dateA = a.completedAt || a.sentAt || '';
      const dateB = b.completedAt || b.sentAt || '';
      return dateB.localeCompare(dateA);
    });

    return items;
  }, [gaugeProQuery.data, behavioralQuery.data]);

  const stats = useMemo<UnifiedTestStats>(() => {
    const completed = tests.filter((t) => t.status === 'completed').length;
    return {
      total: tests.length,
      completed,
      pending: tests.length - completed,
    };
  }, [tests]);

  const hasGaugeProResult = !!gaugeProQuery.data;

  // Gauge-Pro cooldown info (reads from same localStorage key as useGaugeProAssessment)
  const cooldownInfo = useMemo(() => {
    if (!candidateId) return { inCooldown: false, daysRemaining: 0 };
    const lastCompletedKey = GAUGE_PRO_CONFIG.storageKeys.lastCompleted(candidateId);
    const last = localStorage.getItem(lastCompletedKey);
    if (!last) return { inCooldown: false, daysRemaining: 0 };
    const daysSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < GAUGE_PRO_CONFIG.cooldownDays) {
      return { inCooldown: true, daysRemaining: Math.ceil(GAUGE_PRO_CONFIG.cooldownDays - daysSince) };
    }
    return { inCooldown: false, daysRemaining: 0 };
  }, [candidateId]);

  return { tests, stats, isLoading, hasGaugeProResult, cooldownInfo };
}
