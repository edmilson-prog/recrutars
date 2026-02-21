/**
 * OnboardingGaugeProTest
 * PRD-086: Gauge-Pro test — step 4 of candidate onboarding (v1.30.0 "Gateway")
 * 3 sub-phases: Intro → Test → Completion
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  ArrowRight,
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { OnboardingStepIndicator } from '@/components/onboarding/OnboardingStepIndicator';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';
import { TEST_CONFIG } from '@/data/testConfig';

type OnboardingTestPhase = 'intro' | 'test' | 'complete';

export default function OnboardingGaugeProTest() {
  const { user, currentCandidate } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingTestPhase>('intro');

  const candidateId = currentCandidate?.id || '';

  const gaugePro = useGaugeProAssessment({
    candidateId,
    onComplete: () => {
      setOnboardingPhase('complete');
    },
    onXPAwarded: (xp) => {
      toast({
        title: `+${xp} XP conquistados!`,
        description: `Parabens por completar a avaliacao ${TEST_CONFIG.name}.`,
      });
    },
    onBadgeAwarded: () => {
      toast({
        title: 'Nova conquista desbloqueada!',
        description: `Badge "${TEST_CONFIG.badgeName}" adicionado ao seu perfil.`,
      });
    },
  });

  // If user has an in-progress session, skip intro
  useEffect(() => {
    if (gaugePro.phase !== 'intro' && gaugePro.phase !== 'completed' && onboardingPhase === 'intro') {
      setOnboardingPhase('test');
    }
    if (gaugePro.phase === 'completed' && gaugePro.result) {
      setOnboardingPhase('complete');
    }
  }, [gaugePro.phase, gaugePro.result, onboardingPhase]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setOnboardingPhase('test');
    if (gaugePro.phase === 'intro') {
      gaugePro.startAssessment();
    }
  };

  // ── Intro Phase ──
  if (onboardingPhase === 'intro') {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center mb-6">
              <img src="/images/logo-horizontal.png" alt="RecrutaRS" className="h-10 w-auto" />
            </div>
            <OnboardingStepIndicator currentStep={4} />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Teste Comportamental</h1>
              <p className="text-muted-foreground">
                Ultima etapa! Descubra seu perfil comportamental.
              </p>
            </div>

            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold">O que e o Gauge-Pro?</h2>
                <p className="text-sm text-muted-foreground">
                  O Gauge-Pro e uma avaliacao comportamental que identifica seu perfil profissional
                  em 5 dimensoes. Os resultados ajudam empresas a encontrar candidatos compativeis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>15-20 minutos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Sem respostas certas ou erradas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Resultados imediatos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Voce pode sair e retomar</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleStartTest}
            >
              Iniciar Teste
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Complete Phase ──
  if (onboardingPhase === 'complete') {
    return <OnboardingComplete />;
  }

  // ── Test Phase (reuses Gauge-Pro components) ──
  const renderTestContent = () => {
    switch (gaugePro.phase) {
      case 'intro':
        return (
          <GaugeProIntro onStart={() => gaugePro.startAssessment()} />
        );

      case 'part1_words':
        return (
          <div className="space-y-4">
            <WordGrid
              words={gaugePro.currentDimensionWords}
              shuffledOrder={gaugePro.currentShuffledOrder}
              selectedIndices={gaugePro.currentStepSelections}
              selectionLimit={gaugePro.selectionLimit}
              onToggleWord={gaugePro.toggleWord}
              dimensionName={gaugePro.currentDimensionName}
              perspective={gaugePro.currentPerspective}
              perspectiveLabel={gaugePro.currentPerspectiveLabel}
            />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={gaugePro.goToPreviousStep}
                disabled={gaugePro.currentWordStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Etapa {gaugePro.currentWordStep + 1} de {gaugePro.totalWordSteps}
              </span>
              <Button
                onClick={gaugePro.submitCurrentStep}
                disabled={gaugePro.currentStepSelections.length !== gaugePro.selectionLimit}
              >
                {gaugePro.currentWordStep === gaugePro.totalWordSteps - 1 ? 'Finalizar Parte 1' : 'Proximo'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        );

      case 'part1_block_transition':
        return gaugePro.blockTransitionInfo ? (
          <BlockCompleteDivider
            completedDimension={gaugePro.blockTransitionInfo.completedDimension}
            nextDimension={gaugePro.blockTransitionInfo.nextDimension}
            completedBlockNumber={gaugePro.blockTransitionInfo.completedBlockNumber}
            totalBlocks={5}
            onContinue={gaugePro.submitCurrentStep}
          />
        ) : null;

      case 'part1_complete':
        return (
          <Part1Complete onContinue={gaugePro.startPart2} />
        );

      case 'part2_intro':
        return (
          <ScenarioIntro onStart={gaugePro.startPart2Scenarios} />
        );

      case 'part2_scenarios':
        return gaugePro.currentScenario ? (
          <div className="space-y-4">
            <ScenarioCard
              scenario={gaugePro.currentScenario}
              selectedOptionId={gaugePro.currentScenarioResponse?.selectedOptionId}
              onSelectOption={(optionId) => {
                gaugePro.submitScenarioResponse({
                  scenarioId: gaugePro.currentScenario!.id,
                  selectedOptionId: optionId,
                });
              }}
            />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={gaugePro.goPreviousScenario}
                disabled={gaugePro.currentScenarioIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Cenario {gaugePro.currentScenarioIndex + 1} de {gaugePro.totalScenarios}
              </span>
              {gaugePro.currentScenarioIndex === gaugePro.totalScenarios - 1 ? (
                <Button
                  onClick={gaugePro.finishAssessment}
                  disabled={gaugePro.scenarioResponses.length < gaugePro.totalScenarios}
                >
                  Finalizar
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={gaugePro.goNextScenario}
                  disabled={!gaugePro.currentScenarioResponse}
                >
                  Proximo
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ) : null;

      case 'analyzing':
        return <AnalyzingScreen />;

      case 'completed':
        // Will be handled by onComplete callback → setOnboardingPhase('complete')
        return <AnalyzingScreen />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header with timer */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src="/images/logo-horizontal.png" alt="RecrutaRS" className="h-8 w-auto" />
          {gaugePro.phase !== 'intro' && gaugePro.phase !== 'completed' && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {formatTime(gaugePro.elapsedSeconds)}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {renderTestContent()}
      </div>
    </div>
  );
}
