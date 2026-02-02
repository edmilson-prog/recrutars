/**
 * Hook: useBehavioralAssessment
 * PRD-047: Teste Geral do Candidato
 *
 * Hook principal para gerenciar sessões de avaliação comportamental:
 * - Criar/retomar sessão
 * - Salvar respostas (autosave)
 * - Pausar/continuar
 * - Finalizar e gerar resultado
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  BEHAVIORAL_TEST_CONFIG,
  STORAGE_KEYS,
  canTakeTest,
  hasActiveSession,
  mockBehavioralResults,
} from '@/data/behavioralAssessmentData';
import { useQuestionSelection } from './useQuestionSelection';
import { useAssessmentAnalysis } from './useAssessmentAnalysis';
import type {
  BehavioralAssessment,
  BehavioralResponse,
  BehavioralResult,
  AssessmentQuestion,
} from '@/types/assessment';

export type AssessmentPhase =
  | 'intro'           // Tela de introdução
  | 'in_progress'     // Respondendo perguntas
  | 'paused'          // Pausado pelo usuário
  | 'analyzing'       // Processando resultado
  | 'completed'       // Teste concluído
  | 'cooldown';       // Aguardando cooldown

export interface UseBehavioralAssessmentOptions {
  candidateId: string;
  onComplete?: (result: BehavioralResult) => void;
  onXPAwarded?: (xp: number) => void;
  onBadgeAwarded?: (badgeId: string) => void;
}

export interface UseBehavioralAssessmentReturn {
  // Estado
  phase: AssessmentPhase;
  assessment: BehavioralAssessment | null;
  questions: AssessmentQuestion[];
  currentQuestion: AssessmentQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  responses: BehavioralResponse[];
  result: BehavioralResult | null;
  cooldownDays: number | null;

  // Progresso
  progress: number;
  answeredCount: number;
  elapsedSeconds: number;

  // Ações
  startTest: () => void;
  resumeTest: () => void;
  submitResponse: (response: string) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrevious: () => void;
  pauseTest: () => void;
  finishTest: () => void;

  // Verificações
  canStart: boolean;
  hasActiveSession: boolean;
  isLastQuestion: boolean;
}

export function useBehavioralAssessment(
  options: UseBehavioralAssessmentOptions
): UseBehavioralAssessmentReturn {
  const { candidateId, onComplete, onXPAwarded, onBadgeAwarded } = options;

  const config = BEHAVIORAL_TEST_CONFIG;
  const { selectQuestions, getQuestionsByIds } = useQuestionSelection();
  const { analyzeResponses } = useAssessmentAnalysis();

  // Estado
  const [phase, setPhase] = useState<AssessmentPhase>('intro');
  const [assessment, setAssessment] = useState<BehavioralAssessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [responses, setResponses] = useState<BehavioralResponse[]>([]);
  const [result, setResult] = useState<BehavioralResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Storage keys específicos do candidato
  const sessionKey = `${STORAGE_KEYS.CURRENT_ASSESSMENT}-${candidateId}`;
  const responsesKey = `${STORAGE_KEYS.ASSESSMENT_RESPONSES}-${candidateId}`;
  const lastCompletedKey = `${STORAGE_KEYS.LAST_COMPLETED}-${candidateId}`;

  // Verificar estado inicial
  useEffect(() => {
    // Verificar cooldown
    const testStatus = canTakeTest(candidateId);
    if (!testStatus.canTake) {
      setCooldownDays(testStatus.daysRemaining || null);
      setPhase('cooldown');
      return;
    }

    // Verificar sessão ativa
    const activeSession = hasActiveSession(candidateId);
    if (activeSession) {
      setAssessment(activeSession);
      setPhase('paused');

      // Carregar perguntas e respostas
      const loadedQuestions = getQuestionsByIds(activeSession.questionsIds);
      setQuestions(loadedQuestions);

      const savedResponses = localStorage.getItem(responsesKey);
      if (savedResponses) {
        setResponses(JSON.parse(savedResponses));
      }

      setCurrentIndex(activeSession.currentQuestionIndex);
    }

    // Verificar se já existe resultado
    const existingResult = mockBehavioralResults.find(
      (r) => r.candidateId === candidateId
    );
    if (existingResult) {
      setResult(existingResult);
      setPhase('completed');
    }
  }, [candidateId, getQuestionsByIds, responsesKey]);

  // Timer para contagem de tempo
  useEffect(() => {
    if (phase === 'in_progress') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase]);

  // Salvar sessão no localStorage
  const saveSession = useCallback(
    (updatedAssessment: BehavioralAssessment, updatedResponses: BehavioralResponse[]) => {
      localStorage.setItem(sessionKey, JSON.stringify(updatedAssessment));
      localStorage.setItem(responsesKey, JSON.stringify(updatedResponses));
    },
    [sessionKey, responsesKey]
  );

  // Iniciar novo teste
  const startTest = useCallback(() => {
    const testStatus = canTakeTest(candidateId);
    if (!testStatus.canTake) {
      setCooldownDays(testStatus.daysRemaining || null);
      setPhase('cooldown');
      return;
    }

    // Selecionar perguntas
    const selection = selectQuestions();

    // Criar nova sessão
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.sessionValidDays * 24 * 60 * 60 * 1000);

    const newAssessment: BehavioralAssessment = {
      id: `ba-${Date.now()}`,
      candidateId,
      status: 'in_progress',
      questionsIds: selection.questionIds,
      totalQuestions: selection.questions.length,
      currentQuestionIndex: 0,
      answeredCount: 0,
      startedAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    setAssessment(newAssessment);
    setQuestions(selection.questions);
    setResponses([]);
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setPhase('in_progress');

    questionStartTimeRef.current = Date.now();
    saveSession(newAssessment, []);
  }, [candidateId, selectQuestions, config.sessionValidDays, saveSession]);

  // Retomar teste
  const resumeTest = useCallback(() => {
    if (!assessment) return;

    const updatedAssessment: BehavioralAssessment = {
      ...assessment,
      lastActivityAt: new Date().toISOString(),
    };

    setAssessment(updatedAssessment);
    setPhase('in_progress');
    questionStartTimeRef.current = Date.now();

    saveSession(updatedAssessment, responses);
  }, [assessment, responses, saveSession]);

  // Submeter resposta
  const submitResponse = useCallback(
    (responseValue: string) => {
      if (!assessment || phase !== 'in_progress') return;

      const question = questions[currentIndex];
      if (!question) return;

      const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

      // Criar ou atualizar resposta
      const existingIndex = responses.findIndex(
        (r) => r.questionId === question.id
      );

      const newResponse: BehavioralResponse = {
        id: `br-${Date.now()}`,
        assessmentId: assessment.id,
        questionId: question.id,
        response: responseValue,
        score: 0, // Será calculado na análise
        answeredAt: new Date().toISOString(),
        timeSpentSeconds: timeSpent,
      };

      let updatedResponses: BehavioralResponse[];
      if (existingIndex >= 0) {
        updatedResponses = [...responses];
        updatedResponses[existingIndex] = newResponse;
      } else {
        updatedResponses = [...responses, newResponse];
      }

      setResponses(updatedResponses);

      // Atualizar sessão
      const updatedAssessment: BehavioralAssessment = {
        ...assessment,
        answeredCount: new Set(updatedResponses.map((r) => r.questionId)).size,
        lastActivityAt: new Date().toISOString(),
      };

      setAssessment(updatedAssessment);
      saveSession(updatedAssessment, updatedResponses);
    },
    [assessment, phase, questions, currentIndex, responses, saveSession]
  );

  // Navegar para pergunta específica
  const goToQuestion = useCallback(
    (index: number) => {
      if (!assessment || index < 0 || index >= questions.length) return;

      setCurrentIndex(index);
      questionStartTimeRef.current = Date.now();

      const updatedAssessment: BehavioralAssessment = {
        ...assessment,
        currentQuestionIndex: index,
        lastActivityAt: new Date().toISOString(),
      };

      setAssessment(updatedAssessment);
      saveSession(updatedAssessment, responses);
    },
    [assessment, questions.length, responses, saveSession]
  );

  // Próxima pergunta
  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  }, [currentIndex, questions.length, goToQuestion]);

  // Pergunta anterior
  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);

  // Pausar teste
  const pauseTest = useCallback(() => {
    if (!assessment) return;

    const updatedAssessment: BehavioralAssessment = {
      ...assessment,
      lastActivityAt: new Date().toISOString(),
    };

    setAssessment(updatedAssessment);
    setPhase('paused');
    saveSession(updatedAssessment, responses);
  }, [assessment, responses, saveSession]);

  // Finalizar teste
  const finishTest = useCallback(() => {
    if (!assessment) return;

    setPhase('analyzing');

    // Simular tempo de processamento
    setTimeout(() => {
      // Gerar resultado
      const analysisResult = analyzeResponses(
        responses,
        questions,
        candidateId,
        assessment.id
      );

      setResult(analysisResult);

      // Atualizar sessão como completa
      const completedAssessment: BehavioralAssessment = {
        ...assessment,
        status: 'completed',
        completedAt: new Date().toISOString(),
        totalTimeSeconds: elapsedSeconds,
      };

      // Salvar data de conclusão para cooldown
      localStorage.setItem(lastCompletedKey, new Date().toISOString());

      // Limpar sessão em andamento
      localStorage.removeItem(sessionKey);
      localStorage.removeItem(responsesKey);

      // Adicionar ao mock de resultados
      mockBehavioralResults.push(analysisResult);

      setAssessment(completedAssessment);
      setPhase('completed');

      // Callbacks
      onXPAwarded?.(analysisResult.xpAwarded);
      onBadgeAwarded?.(analysisResult.badgeAwarded);
      onComplete?.(analysisResult);
    }, 2000); // 2 segundos de "análise"
  }, [
    assessment,
    responses,
    questions,
    candidateId,
    elapsedSeconds,
    analyzeResponses,
    sessionKey,
    responsesKey,
    lastCompletedKey,
    onComplete,
    onXPAwarded,
    onBadgeAwarded,
  ]);

  // Valores calculados
  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length;
  const answeredCount = responses.length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasSession = assessment !== null && assessment.status === 'in_progress';

  const testStatus = canTakeTest(candidateId);

  return {
    // Estado
    phase,
    assessment,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    responses,
    result,
    cooldownDays,

    // Progresso
    progress,
    answeredCount,
    elapsedSeconds,

    // Ações
    startTest,
    resumeTest,
    submitResponse,
    goToQuestion,
    goNext,
    goPrevious,
    pauseTest,
    finishTest,

    // Verificações
    canStart: testStatus.canTake,
    hasActiveSession: hasSession,
    isLastQuestion,
  };
}
