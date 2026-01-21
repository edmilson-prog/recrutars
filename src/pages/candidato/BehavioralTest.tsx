/**
 * BehavioralTest Page
 * PRD-047: Teste Geral do Candidato
 *
 * Página principal do teste comportamental Gauge-Pro 2.0
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  TestIntro,
  TestProgress,
  QuestionDisplay,
  TestNavigation,
  QuestionDots,
  AnalysisProgress,
} from '@/components/assessment';
import { useBehavioralAssessment } from '@/hooks/useBehavioralAssessment';
import { useAuth } from '@/contexts/AuthContext';
import { assessmentCategories } from '@/data/assessmentData';
import { toast } from 'sonner';
import type { BehavioralResult } from '@/types/assessment';

export default function BehavioralTest() {
  const navigate = useNavigate();
  const { currentCandidate } = useAuth();
  const candidateId = currentCandidate?.id || 'candidate-1';

  // Callbacks para gamificação
  const handleComplete = (result: BehavioralResult) => {
    toast.success('Teste concluído! Seu perfil foi gerado.');
    navigate('/candidato/teste-comportamental/resultado', {
      state: { resultId: result.id },
    });
  };

  const handleXPAwarded = (xp: number) => {
    toast.success(`+${xp} XP conquistados!`, {
      description: 'Continue participando para subir de nível.',
    });
  };

  const handleBadgeAwarded = (badgeId: string) => {
    toast.success('Nova conquista desbloqueada!', {
      description: 'Você ganhou o badge "Autoconhecimento".',
    });
  };

  const {
    phase,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    responses,
    cooldownDays,
    progress,
    answeredCount,
    elapsedSeconds,
    startTest,
    resumeTest,
    submitResponse,
    goToQuestion,
    goNext,
    goPrevious,
    pauseTest,
    finishTest,
    hasActiveSession,
    isLastQuestion,
  } = useBehavioralAssessment({
    candidateId,
    onComplete: handleComplete,
    onXPAwarded: handleXPAwarded,
    onBadgeAwarded: handleBadgeAwarded,
  });

  // Resposta atual
  const currentResponse = useMemo(() => {
    if (!currentQuestion) return null;
    const response = responses.find((r) => r.questionId === currentQuestion.id);
    return response?.response || null;
  }, [currentQuestion, responses]);

  // Dimensão da pergunta atual
  const currentDimensionId = useMemo(() => {
    if (!currentQuestion) return undefined;
    const category = assessmentCategories.find(
      (c) => c.id === currentQuestion.categoryId
    );
    return category?.dimensionId;
  }, [currentQuestion]);

  // Set de perguntas respondidas (índices)
  const answeredQuestions = useMemo(() => {
    const answeredIds = new Set(responses.map((r) => r.questionId));
    const indices = new Set<number>();
    questions.forEach((q, index) => {
      if (answeredIds.has(q.id)) {
        indices.add(index);
      }
    });
    return indices;
  }, [questions, responses]);

  // Handler para resposta
  const handleResponseChange = (value: string) => {
    submitResponse(value);
  };

  // Render por fase
  const renderContent = () => {
    switch (phase) {
      case 'intro':
      case 'cooldown':
      case 'paused':
        return (
          <TestIntro
            totalQuestions={totalQuestions || 55}
            estimatedMinutes={30}
            hasActiveSession={hasActiveSession}
            cooldownDays={cooldownDays}
            onStart={startTest}
            onResume={resumeTest}
          />
        );

      case 'analyzing':
        return <AnalysisProgress />;

      case 'in_progress':
        if (!currentQuestion) return null;

        return (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress */}
            <TestProgress
              currentQuestion={currentIndex}
              totalQuestions={totalQuestions}
              answeredCount={answeredCount}
              elapsedSeconds={elapsedSeconds}
            />

            {/* Question dots navigation */}
            <QuestionDots
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
              answeredQuestions={answeredQuestions}
              onGoTo={goToQuestion}
              className="py-2"
            />

            {/* Question display */}
            <QuestionDisplay
              question={currentQuestion}
              questionIndex={currentIndex}
              value={currentResponse}
              onChange={handleResponseChange}
              dimensionId={currentDimensionId}
            />

            {/* Navigation */}
            <TestNavigation
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
              answeredCount={answeredCount}
              hasCurrentAnswer={currentResponse !== null}
              isFirstQuestion={currentIndex === 0}
              isLastQuestion={isLastQuestion}
              onPrevious={goPrevious}
              onNext={goNext}
              onPause={pauseTest}
              onFinish={finishTest}
            />
          </div>
        );

      case 'completed':
        // Redirecionar para página de resultado
        navigate('/candidato/teste-comportamental/resultado');
        return null;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout userType="candidate">
      {renderContent()}
    </DashboardLayout>
  );
}
