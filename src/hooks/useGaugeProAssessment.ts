/**
 * Hook: useGaugeProAssessment
 * PRD-049 & PRD-050: Two-part Gauge-Pro assessment
 * Part 1: 10 steps (5 dimensions × 2 perspectives)
 * Part 2: 15 situational scenarios
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGaugeProService } from '@/services/gaugePro/gaugeProService';
import { gaugeProKeys } from './useGaugeProQuery';
import type {
  GaugeProPhase,
  GaugeProAssessment,
  GaugeProResult,
  WordStepResponse,
  ScenarioResponse,
  GaugeProDimension,
  Perspective,
  DimensionScores,
} from '@/types/gaugePro';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';
import { GAUGE_PRO_ADJECTIVES } from '@/data/gaugeProWords';
import { GAUGE_PRO_SCENARIOS } from '@/data/gaugeProScenarios';
import { determineArchetype } from '@/data/gaugeProArchetypes';
import {
  shuffleArray,
  calculateWordSelectionScores,
  calculateScenarioScores,
  calculateFinalScores,
  classifyAllDimensions,
} from '@/lib/gaugeProScoring';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];
const TOTAL_WORD_STEPS = 10;

export interface UseGaugeProOptions {
  candidateId: string;
  onComplete?: (result: GaugeProResult) => void;
  onXPAwarded?: (xp: number) => void;
  onBadgeAwarded?: (badgeId: string) => void;
}

export function useGaugeProAssessment(options: UseGaugeProOptions) {
  const { candidateId, onComplete, onXPAwarded, onBadgeAwarded } = options;
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<GaugeProPhase>('intro');
  const [assessment, setAssessment] = useState<GaugeProAssessment | null>(null);
  const [result, setResult] = useState<GaugeProResult | null>(null);

  // Part 1 state — 10 steps (5 dimensions × 2 perspectives)
  const [currentWordStep, setCurrentWordStep] = useState(0);
  const [wordStepResponses, setWordStepResponses] = useState<WordStepResponse[]>([]);
  const [shuffledWordOrders, setShuffledWordOrders] = useState<Partial<Record<GaugeProDimension, number[]>>>({});
  const [currentStepSelections, setCurrentStepSelections] = useState<number[]>([]);

  // Block transition state
  const [blockTransitionInfo, setBlockTransitionInfo] = useState<{
    completedDimension: GaugeProDimension;
    nextDimension: GaugeProDimension;
    completedBlockNumber: number;
  } | null>(null);

  // Part 2 state
  const [scenarioResponses, setScenarioResponses] = useState<ScenarioResponse[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Supabase persistence — UUID do assessment row no banco
  const supabaseAssessmentIdRef = useRef<string | null>(null);

  const storageKey = GAUGE_PRO_CONFIG.storageKeys.assessment(candidateId);
  const resultKey = GAUGE_PRO_CONFIG.storageKeys.result(candidateId);
  const lastCompletedKey = GAUGE_PRO_CONFIG.storageKeys.lastCompleted(candidateId);

  // Derived values for current word step
  const currentDimension: GaugeProDimension = DIMENSIONS[Math.floor(currentWordStep / 2)];
  const currentPerspective: Perspective = currentWordStep % 2 === 0 ? 'self' : 'others';
  const currentDimensionName = currentDimension ? DIMENSION_SHORT_NAMES[currentDimension] : '';
  const currentPerspectiveLabel = currentPerspective === 'self'
    ? 'Como você realmente é'
    : 'Como outros esperam que você seja';

  // Get words for current dimension
  const currentDimensionWords = currentDimension
    ? GAUGE_PRO_ADJECTIVES.filter(w => w.dimension === currentDimension)
    : [];
  const currentShuffledOrder = currentDimension ? (shuffledWordOrders[currentDimension] || []) : [];

  // Check cooldown
  const isInCooldown = useCallback(() => {
    const last = localStorage.getItem(lastCompletedKey);
    if (!last) return false;
    const daysSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < GAUGE_PRO_CONFIG.cooldownDays;
  }, [lastCompletedKey]);

  // Load existing session (localStorage sync, then Supabase async)
  useEffect(() => {
    // 1. Sync: Check localStorage for existing result (fast)
    const savedResult = localStorage.getItem(resultKey);
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch { /* ignore */ }
    }

    // 2. Sync: Check cooldown from localStorage
    if (isInCooldown()) {
      setPhase('completed');
      // Don't return — still run Supabase checks below for lazy sync
    }

    // 3. Sync: Check for existing in-progress session in localStorage
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const session: GaugeProAssessment = JSON.parse(saved);
        setAssessment(session);
        // Skip block transition on restore — go directly to word step
        setPhase(session.phase === 'part1_block_transition' ? 'part1_words' : session.phase);

        if (session.wordStepResponses) setWordStepResponses(session.wordStepResponses);
        if (session.shuffledWordOrders) setShuffledWordOrders(session.shuffledWordOrders);
        if (session.currentWordStep !== undefined) {
          setCurrentWordStep(session.currentWordStep);
          // Restore current step selections from saved responses
          const dim = DIMENSIONS[Math.floor(session.currentWordStep / 2)];
          const persp: Perspective = session.currentWordStep % 2 === 0 ? 'self' : 'others';
          const existingResp = session.wordStepResponses?.find(
            r => r.dimension === dim && r.perspective === persp
          );
          if (existingResp) {
            setCurrentStepSelections(existingResp.selectedWordIds);
          }
        }
        if (session.scenarioResponses) setScenarioResponses(session.scenarioResponses);
        if (session.currentScenarioIndex !== undefined) setCurrentScenarioIndex(session.currentScenarioIndex);
      } catch { /* ignore */ }
    }

    // 4. Async: Supabase checks (restore ref, detect completion, lazy sync)
    getGaugeProService().then(async svc => {
      // Restore supabaseAssessmentIdRef (lost on page refresh)
      const existingAssessment = await svc.getAssessmentByCandidate(candidateId);
      if (existingAssessment) {
        supabaseAssessmentIdRef.current = existingAssessment.id;
      }

      // Check if result exists in Supabase (new browser scenario)
      const existingResult = await svc.getResultByCandidate(candidateId);
      if (existingResult) {
        setResult(existingResult);
        setPhase('completed');
        // Update localStorage cache for future fast loads
        localStorage.setItem(resultKey, JSON.stringify(existingResult));
        localStorage.setItem(lastCompletedKey, existingResult.generatedAt);
        return;
      }

      // Lazy sync: localStorage has result but Supabase doesn't
      if (savedResult && !existingResult) {
        try {
          const localResult = JSON.parse(savedResult) as GaugeProResult;
          const assessmentId = existingAssessment?.id || localResult.assessmentId;

          await svc.saveResult({ ...localResult, assessmentId });

          // Update assessment status to completed
          if (existingAssessment && existingAssessment.phase !== 'completed') {
            await svc.updateAssessment(existingAssessment.id, {
              phase: 'completed',
              completedAt: localResult.generatedAt,
            });
          }
        } catch { /* Supabase offline — localStorage is sufficient */ }
      }
    }).catch(() => { /* Supabase offline */ });
  }, [storageKey, resultKey, lastCompletedKey, isInCooldown, candidateId]);

  // Timer
  useEffect(() => {
    const activePhases: GaugeProPhase[] = ['part1_words', 'part1_block_transition', 'part2_scenarios'];
    if (activePhases.includes(phase)) {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Auto-advance from block transition after 3 seconds
  useEffect(() => {
    if (phase === 'part1_block_transition') {
      const timer = setTimeout(() => {
        setPhase('part1_words');
        setBlockTransitionInfo(null);
        // Update session phase directly in localStorage
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const session = JSON.parse(saved);
            session.phase = 'part1_words';
            localStorage.setItem(storageKey, JSON.stringify(session));
          } catch { /* ignore */ }
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, storageKey]);

  // Save session
  const saveSession = useCallback((updates: Partial<GaugeProAssessment>) => {
    const current = assessment || {
      id: `gp-${Date.now()}`,
      candidateId,
      phase,
      startedAt: new Date().toISOString(),
      wordStepResponses: [],
      shuffledWordOrders: {},
      currentWordStep: 0,
      scenarioResponses: [],
      currentScenarioIndex: 0,
    };
    const updated = { ...current, ...updates };
    setAssessment(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    return updated;
  }, [assessment, candidateId, phase, storageKey]);

  // Start assessment — generate shuffled orders per dimension
  const startAssessment = useCallback(() => {
    const orders: Partial<Record<GaugeProDimension, number[]>> = {};

    for (const dim of DIMENSIONS) {
      const dimWords = GAUGE_PRO_ADJECTIVES.filter(w => w.dimension === dim);
      orders[dim] = shuffleArray(dimWords.map(w => w.id));
    }

    setShuffledWordOrders(orders);
    setCurrentWordStep(0);
    setCurrentStepSelections([]);
    setPhase('part1_words');

    saveSession({
      phase: 'part1_words',
      startedAt: new Date().toISOString(),
      part1StartedAt: new Date().toISOString(),
      shuffledWordOrders: orders,
      currentWordStep: 0,
      wordStepResponses: [],
    });

    // Fire-and-forget: create assessment row in Supabase
    getGaugeProService().then(svc =>
      svc.startAssessment(candidateId).then(row => {
        supabaseAssessmentIdRef.current = row.id;
      })
    ).catch(() => { /* Supabase unavailable — localStorage continues */ });
  }, [saveSession, candidateId]);

  // Toggle word selection for current step
  const toggleWord = useCallback((wordId: number) => {
    const max = GAUGE_PRO_CONFIG.part1.selectionsPerList;

    if (currentStepSelections.includes(wordId)) {
      setCurrentStepSelections(prev => prev.filter(id => id !== wordId));
    } else if (currentStepSelections.length < max) {
      setCurrentStepSelections(prev => [...prev, wordId]);
    }
  }, [currentStepSelections]);

  // Submit current word step and advance
  const submitCurrentStep = useCallback(() => {
    if (currentStepSelections.length !== GAUGE_PRO_CONFIG.part1.selectionsPerList) return;

    const response: WordStepResponse = {
      dimension: currentDimension,
      perspective: currentPerspective,
      selectedWordIds: currentStepSelections,
      completedAt: new Date().toISOString(),
    };

    // Replace existing response for this step or add new
    const updated = [
      ...wordStepResponses.filter(
        r => !(r.dimension === currentDimension && r.perspective === currentPerspective)
      ),
      response,
    ];
    setWordStepResponses(updated);

    const nextStep = currentWordStep + 1;

    if (nextStep >= TOTAL_WORD_STEPS) {
      // All 10 steps complete
      setPhase('part1_complete');
      setCurrentStepSelections([]);
      saveSession({
        phase: 'part1_complete',
        part1CompletedAt: new Date().toISOString(),
        wordStepResponses: updated,
        currentWordStep: nextStep,
      });
    } else {
      // Advance to next step
      setCurrentWordStep(nextStep);

      // Check if there's an existing response for the next step (going forward after going back)
      const nextDim = DIMENSIONS[Math.floor(nextStep / 2)];
      const nextPersp: Perspective = nextStep % 2 === 0 ? 'self' : 'others';
      const existingNext = updated.find(r => r.dimension === nextDim && r.perspective === nextPersp);
      setCurrentStepSelections(existingNext ? existingNext.selectedWordIds : []);

      // Check if we crossed a dimension boundary (show block transition)
      const currentDimIndex = Math.floor(currentWordStep / 2);
      const nextDimIndex = Math.floor(nextStep / 2);

      if (currentDimIndex !== nextDimIndex) {
        // Dimension boundary — show "Bloco Completo!" transition
        setBlockTransitionInfo({
          completedDimension: DIMENSIONS[currentDimIndex],
          nextDimension: DIMENSIONS[nextDimIndex],
          completedBlockNumber: currentDimIndex + 1,
        });
        setPhase('part1_block_transition');
        saveSession({
          phase: 'part1_block_transition',
          wordStepResponses: updated,
          currentWordStep: nextStep,
        });
      } else {
        saveSession({
          wordStepResponses: updated,
          currentWordStep: nextStep,
        });
      }
    }
  }, [currentStepSelections, currentDimension, currentPerspective, currentWordStep, wordStepResponses, saveSession]);

  // Go to previous word step
  const goToPreviousStep = useCallback(() => {
    if (currentWordStep <= 0) return;

    const prevStep = currentWordStep - 1;
    setCurrentWordStep(prevStep);

    // Restore previous step selections
    const prevDim = DIMENSIONS[Math.floor(prevStep / 2)];
    const prevPersp: Perspective = prevStep % 2 === 0 ? 'self' : 'others';
    const existing = wordStepResponses.find(r => r.dimension === prevDim && r.perspective === prevPersp);
    setCurrentStepSelections(existing ? existing.selectedWordIds : []);

    saveSession({ currentWordStep: prevStep });
  }, [currentWordStep, wordStepResponses, saveSession]);

  // Start Part 2
  const startPart2 = useCallback(() => {
    setPhase('part2_intro');
    saveSession({ phase: 'part2_intro' });
  }, [saveSession]);

  const startPart2Scenarios = useCallback(() => {
    setPhase('part2_scenarios');
    setCurrentScenarioIndex(0);
    saveSession({
      phase: 'part2_scenarios',
      part2StartedAt: new Date().toISOString(),
      currentScenarioIndex: 0,
    });
  }, [saveSession]);

  // Submit scenario response
  const submitScenarioResponse = useCallback((selectedOption: 'A' | 'B' | 'C' | 'D') => {
    const scenario = GAUGE_PRO_SCENARIOS[currentScenarioIndex];
    if (!scenario) return;

    const response: ScenarioResponse = {
      scenarioId: scenario.id,
      selectedOption,
      answeredAt: new Date().toISOString(),
    };

    const updated = [...scenarioResponses.filter(r => r.scenarioId !== scenario.id), response];
    setScenarioResponses(updated);

    saveSession({
      scenarioResponses: updated,
      currentScenarioIndex,
    });
  }, [currentScenarioIndex, scenarioResponses, saveSession]);

  // Navigate scenarios
  const goNextScenario = useCallback(() => {
    const next = currentScenarioIndex + 1;
    if (next < GAUGE_PRO_SCENARIOS.length) {
      setCurrentScenarioIndex(next);
      saveSession({ currentScenarioIndex: next });
    }
  }, [currentScenarioIndex, saveSession]);

  const goPreviousScenario = useCallback(() => {
    if (currentScenarioIndex > 0) {
      const prev = currentScenarioIndex - 1;
      setCurrentScenarioIndex(prev);
      saveSession({ currentScenarioIndex: prev });
    }
  }, [currentScenarioIndex, saveSession]);

  // Finish assessment
  const finishAssessment = useCallback(() => {
    if (scenarioResponses.length < GAUGE_PRO_SCENARIOS.length) return;

    setPhase('analyzing');
    saveSession({ phase: 'analyzing' });

    // Simulate analysis delay
    setTimeout(() => {
      const part1Scores = calculateWordSelectionScores(wordStepResponses, GAUGE_PRO_ADJECTIVES);
      const part2Scores = calculateScenarioScores(scenarioResponses, GAUGE_PRO_SCENARIOS);
      const finalScores = calculateFinalScores(part1Scores, part2Scores);
      const classifications = classifyAllDimensions(finalScores);
      const archetype = determineArchetype(finalScores, classifications);

      // Primary and secondary dimensions
      const sorted = Object.entries(finalScores).sort((a, b) => b[1] - a[1]);

      const gaugeResult: GaugeProResult = {
        id: `gpr-${Date.now()}`,
        assessmentId: assessment?.id || '',
        candidateId,
        part1Scores,
        part2Scores,
        finalScores,
        classifications,
        archetype,
        primaryDimension: sorted[0][0] as GaugeProDimension,
        secondaryDimension: sorted[1][0] as GaugeProDimension,
        strengths: archetype.strengths,
        developmentAreas: archetype.developmentAreas,
        careerRecommendations: archetype.idealRoles,
        xpAwarded: GAUGE_PRO_CONFIG.rewards.xpReward,
        badgeAwarded: GAUGE_PRO_CONFIG.rewards.badgeId,
        generatedAt: new Date().toISOString(),
      };

      setResult(gaugeResult);
      setPhase('completed');

      // Persist to localStorage
      localStorage.setItem(resultKey, JSON.stringify(gaugeResult));
      localStorage.setItem(lastCompletedKey, new Date().toISOString());
      localStorage.removeItem(storageKey);

      saveSession({ phase: 'completed', completedAt: new Date().toISOString(), part2CompletedAt: new Date().toISOString() });

      // Fire-and-forget: persist result to Supabase
      getGaugeProService().then(async svc => {
        let sbId = supabaseAssessmentIdRef.current;

        // Fallback: fetch assessment ID if ref was lost (e.g. page refresh)
        if (!sbId) {
          const existing = await svc.getAssessmentByCandidate(candidateId);
          if (existing) sbId = existing.id;
        }

        if (sbId) {
          // Update assessment to completed
          await svc.updateAssessment(sbId, {
            phase: 'completed',
            completedAt: new Date().toISOString(),
            part1CompletedAt: assessment?.part1CompletedAt,
            part2CompletedAt: new Date().toISOString(),
            wordStepResponses,
            scenarioResponses,
            shuffledWordOrders,
            currentWordStep: TOTAL_WORD_STEPS,
            currentScenarioIndex: GAUGE_PRO_SCENARIOS.length - 1,
          });
          // Save result
          await svc.saveResult({
            ...gaugeResult,
            assessmentId: sbId,
          });
        }
      }).catch(() => { /* Supabase unavailable — localStorage has the data */ });

      // Gamification callbacks
      onXPAwarded?.(GAUGE_PRO_CONFIG.rewards.xpReward);
      onBadgeAwarded?.(GAUGE_PRO_CONFIG.rewards.badgeId);
      onComplete?.(gaugeResult);

      // Fire-and-forget: gerar análises IA em background (PRD-051)
      import('@/lib/aiAgent').then(({ loadAgentSettingsAsync, generateBothAnalyses, saveAnalysisResult }) => {
        loadAgentSettingsAsync().then((agentSettings) => {
          if (agentSettings.agentEnabled) {
            generateBothAnalyses(gaugeResult, 'Candidato', agentSettings)
              .then((analysisResult) => {
                const hasValidAnalysis =
                  (analysisResult.practical && analysisResult.practical.status !== 'error') ||
                  (analysisResult.technical && analysisResult.technical.status !== 'error');
                if (hasValidAnalysis) {
                  saveAnalysisResult(analysisResult);
                  // Invalidate React Query cache so AI analysis shows without F5
                  queryClient.invalidateQueries({
                    queryKey: gaugeProKeys.aiAnalysisByCandidate(candidateId),
                  });
                }
              })
              .catch(() => { /* fallback: relatório básico sem IA */ });
          }
        });
      }).catch(() => { /* módulo IA indisponível */ });
    }, 2500);
  }, [scenarioResponses, wordStepResponses, shuffledWordOrders, assessment, candidateId, resultKey, lastCompletedKey, storageKey, saveSession, onComplete, onXPAwarded, onBadgeAwarded, queryClient]);

  // Get current scenario's existing response
  const currentScenarioResponse = scenarioResponses.find(
    r => r.scenarioId === GAUGE_PRO_SCENARIOS[currentScenarioIndex]?.id
  );

  return {
    // State
    phase,
    assessment,
    result,
    elapsedSeconds,
    isInCooldown: isInCooldown(),

    // Part 1 — Word steps
    blockTransitionInfo,
    currentWordStep,
    totalWordSteps: TOTAL_WORD_STEPS,
    currentDimension,
    currentDimensionName,
    currentPerspective,
    currentPerspectiveLabel,
    currentDimensionWords,
    currentShuffledOrder,
    currentStepSelections,
    wordStepResponses,
    selectionLimit: GAUGE_PRO_CONFIG.part1.selectionsPerList,
    adjectives: GAUGE_PRO_ADJECTIVES,

    // Part 2
    scenarios: GAUGE_PRO_SCENARIOS,
    currentScenarioIndex,
    currentScenario: GAUGE_PRO_SCENARIOS[currentScenarioIndex],
    scenarioResponses,
    currentScenarioResponse,
    totalScenarios: GAUGE_PRO_SCENARIOS.length,

    // Actions
    startAssessment,
    toggleWord,
    submitCurrentStep,
    goToPreviousStep,
    startPart2,
    startPart2Scenarios,
    submitScenarioResponse,
    goNextScenario,
    goPreviousScenario,
    finishAssessment,
  };
}
