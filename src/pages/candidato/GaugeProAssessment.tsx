/**
 * Gauge-Pro Assessment Page
 * PRD-049 & PRD-050: Two-part behavioral assessment
 * Part 1: 10 steps (5 dimensions × 2 perspectives)
 * Part 2: 15 situational scenarios
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useGaugeProAssessment } from '@/hooks/useGaugeProAssessment';
import { useToast } from '@/hooks/use-toast';
import { GaugeProIntro } from '@/components/gaugePro/GaugeProIntro';
import { WordGrid } from '@/components/gaugePro/WordGrid';
import { Part1Complete } from '@/components/gaugePro/Part1Complete';
import { ScenarioIntro } from '@/components/gaugePro/ScenarioIntro';
import { ScenarioCard } from '@/components/gaugePro/ScenarioCard';
import { AnalyzingScreen } from '@/components/gaugePro/AnalyzingScreen';
import { BlockCompleteDivider } from '@/components/gaugePro/BlockCompleteDivider';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { TEST_CONFIG } from '@/data/testConfig';

export default function GaugeProAssessment() {
  const { user, currentCandidate } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const candidateId = currentCandidate?.id || user?.id || '';

  const gaugePro = useGaugeProAssessment({
    candidateId,
    onComplete: () => {
      navigate('/candidato/gauge-pro/resultado');
    },
    onXPAwarded: (xp) => {
      toast({
        title: `+${xp} XP conquistados!`,
        description: `Parabéns por completar a avaliação ${TEST_CONFIG.name}.`,
      });
    },
    onBadgeAwarded: () => {
      toast({
        title: 'Nova conquista desbloqueada!',
        description: `Badge "${TEST_CONFIG.badgeName}" adicionado ao seu perfil.`,
      });
    },
  });

  // Redirect to result page when assessment is completed
  useEffect(() => {
    if (gaugePro.phase === 'completed' && gaugePro.result) {
      navigate('/candidato/gauge-pro/resultado');
    }
  }, [gaugePro.phase, gaugePro.result, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (gaugePro.phase) {
      case 'intro':
        return (
          <GaugeProIntro
            onStart={gaugePro.startAssessment}
            hasExistingResult={!!gaugePro.result}
          />
        );

      case 'part1_words': {
        const canSubmit = gaugePro.currentStepSelections.length === gaugePro.selectionLimit;
        const isLastStep = gaugePro.currentWordStep === gaugePro.totalWordSteps - 1;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(gaugePro.elapsedSeconds)}
              </span>
              <span>Parte 1 de 2</span>
            </div>

            <WordGrid
              words={gaugePro.currentDimensionWords}
              shuffledOrder={gaugePro.currentShuffledOrder}
              selectedIds={gaugePro.currentStepSelections}
              maxSelections={gaugePro.selectionLimit}
              dimensionName={gaugePro.currentDimensionName}
              perspectiveLabel={gaugePro.currentPerspectiveLabel}
              stepNumber={gaugePro.currentWordStep + 1}
              totalSteps={gaugePro.totalWordSteps}
              onToggle={gaugePro.toggleWord}
            />

            <div className="flex justify-between">
              {gaugePro.currentWordStep > 0 ? (
                <Button variant="outline" onClick={gaugePro.goToPreviousStep} className="gap-1">
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={gaugePro.submitCurrentStep}
                disabled={!canSubmit}
                className="gap-1"
              >
                {isLastStep ? 'Concluir Parte 1' : 'Próxima Etapa'} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      }

      case 'part1_block_transition':
        return gaugePro.blockTransitionInfo ? (
          <BlockCompleteDivider
            completedDimension={gaugePro.blockTransitionInfo.completedDimension}
            nextDimension={gaugePro.blockTransitionInfo.nextDimension}
            completedBlockNumber={gaugePro.blockTransitionInfo.completedBlockNumber}
            totalBlocks={5}
          />
        ) : null;

      case 'part1_complete':
        return <Part1Complete onContinue={gaugePro.startPart2} />;

      case 'part2_intro':
        return <ScenarioIntro onStart={gaugePro.startPart2Scenarios} />;

      case 'part2_scenarios': {
        const allAnswered = gaugePro.scenarioResponses.length >= gaugePro.totalScenarios;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(gaugePro.elapsedSeconds)}
              </span>
              <span>Parte 2 de 2</span>
            </div>

            <ScenarioCard
              scenario={gaugePro.currentScenario}
              currentIndex={gaugePro.currentScenarioIndex}
              totalScenarios={gaugePro.totalScenarios}
              selectedOption={gaugePro.currentScenarioResponse?.selectedOption}
              onSelectOption={gaugePro.submitScenarioResponse}
              onNext={gaugePro.goNextScenario}
              onPrevious={gaugePro.goPreviousScenario}
              onFinish={gaugePro.finishAssessment}
              canGoNext={!!gaugePro.currentScenarioResponse}
              canGoPrevious={gaugePro.currentScenarioIndex > 0}
              isLast={gaugePro.currentScenarioIndex === gaugePro.totalScenarios - 1}
              allAnswered={allAnswered}
            />
          </div>
        );
      }

      case 'analyzing':
        return <AnalyzingScreen />;

      case 'completed':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Avaliação já concluída.</p>
            <Button onClick={() => navigate('/candidato/gauge-pro/resultado')} className="mt-4">
              Ver Resultado
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="p-4 md:p-6">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
