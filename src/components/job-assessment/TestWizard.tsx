/**
 * TestWizard Component
 * PRD-048: Teste por Vaga
 *
 * Wizard de 3 passos para criação de teste
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompetencySelector } from './CompetencySelector';
import { QuestionSuggestions } from './QuestionSuggestions';
import { TestPreview } from './TestPreview';
import { useCompetencySelection } from '@/hooks/useCompetencySelection';
import { JOB_TEST_CONFIG } from '@/data/behavioralAssessmentData';
import type { JobAssessment, SelectedCompetencies } from '@/types/assessment';

interface TestWizardProps {
  jobId: string;
  jobTitle: string;
  companyId: string;
  userId: string;
  existingAssessment?: JobAssessment;
  onComplete: (assessment: JobAssessment) => void;
  onCancel: () => void;
  className?: string;
}

type WizardStep = 0 | 1 | 2;

const steps = [
  { number: 1, title: 'Competências', description: 'Selecione o que avaliar' },
  { number: 2, title: 'Perguntas', description: 'Revise as perguntas' },
  { number: 3, title: 'Publicar', description: 'Finalize o teste' },
];

export function TestWizard({
  jobId,
  jobTitle,
  companyId,
  userId,
  existingAssessment,
  onComplete,
  onCancel,
  className,
}: TestWizardProps) {
  const config = JOB_TEST_CONFIG;

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [title, setTitle] = useState(
    existingAssessment?.title || `Avaliação para ${jobTitle}`
  );
  const [expirationDays, setExpirationDays] = useState(
    existingAssessment?.expirationDays || config.defaultExpirationDays
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    existingAssessment?.questionsIds || []
  );
  const [isPublishing, setIsPublishing] = useState(false);

  // Competency selection hook
  const {
    competencyOptions,
    selectedCompetencies,
    suggestedQuestions,
    selectCompetency,
    removeCompetency,
    setWeight,
    totalSelected,
    estimatedMinutes,
  } = useCompetencySelection();

  // Initialize selected questions when suggestions change
  useMemo(() => {
    if (selectedQuestionIds.length === 0 && suggestedQuestions.length > 0) {
      setSelectedQuestionIds(suggestedQuestions.map((q) => q.id));
    }
  }, [suggestedQuestions]);

  // Validation per step
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return totalSelected >= config.minCompetencies;
      case 1:
        return (
          selectedQuestionIds.length >= config.minQuestions &&
          selectedQuestionIds.length <= config.maxQuestions
        );
      case 2:
        return true;
      default:
        return false;
    }
  }, [currentStep, totalSelected, selectedQuestionIds.length, config]);

  // Navigation
  const goNext = () => {
    if (currentStep < 2) {
      setCurrentStep((s) => (s + 1) as WizardStep);
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => (s - 1) as WizardStep);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step <= 2) {
      setCurrentStep(step as WizardStep);
    }
  };

  // Question selection handlers
  const handleSelectQuestion = (id: string) => {
    if (selectedQuestionIds.length < config.maxQuestions) {
      setSelectedQuestionIds((prev) => [...prev, id]);
    }
  };

  const handleDeselectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => prev.filter((qId) => qId !== id));
  };

  // Refresh questions
  const handleRefreshQuestions = () => {
    // This would regenerate suggestions based on current competencies
    setSelectedQuestionIds(suggestedQuestions.map((q) => q.id));
  };

  // Save handlers
  const handleSaveDraft = () => {
    const assessment: JobAssessment = {
      id: existingAssessment?.id || `ja-${Date.now()}`,
      jobId,
      companyId,
      title,
      status: 'draft',
      competencies: selectedCompetencies,
      questionsIds: selectedQuestionIds,
      totalQuestions: selectedQuestionIds.length,
      estimatedMinutes,
      expirationDays,
      createdBy: userId,
      createdAt: existingAssessment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onComplete(assessment);
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    // Simular delay de publicação
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const assessment: JobAssessment = {
      id: existingAssessment?.id || `ja-${Date.now()}`,
      jobId,
      companyId,
      title,
      status: 'published',
      competencies: selectedCompetencies,
      questionsIds: selectedQuestionIds,
      totalQuestions: selectedQuestionIds.length,
      estimatedMinutes,
      expirationDays,
      createdBy: userId,
      createdAt: existingAssessment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsPublishing(false);
    onComplete(assessment);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Test title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título do Teste</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Avaliação para Desenvolvedor Frontend"
              />
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expiration">
                Dias para o candidato completar
              </Label>
              <Input
                id="expiration"
                type="number"
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value) || 7)}
                min={1}
                max={30}
              />
            </div>

            {/* Competency selector */}
            <CompetencySelector
              options={competencyOptions}
              selected={selectedCompetencies}
              onSelect={selectCompetency}
              onRemove={removeCompetency}
              onWeightChange={setWeight}
              maxCompetencies={config.maxCompetencies}
            />
          </div>
        );

      case 1:
        return (
          <QuestionSuggestions
            questions={suggestedQuestions}
            selectedIds={selectedQuestionIds}
            onSelect={handleSelectQuestion}
            onDeselect={handleDeselectQuestion}
            onRefresh={handleRefreshQuestions}
            minQuestions={config.minQuestions}
            maxQuestions={config.maxQuestions}
          />
        );

      case 2:
        return (
          <TestPreview
            title={title}
            competencies={selectedCompetencies}
            questions={suggestedQuestions.filter((q) =>
              selectedQuestionIds.includes(q.id)
            )}
            estimatedMinutes={estimatedMinutes}
            expirationDays={expirationDays}
            onEdit={goToStep}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            isPublishing={isPublishing}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={cn(
              'flex items-center',
              index < steps.length - 1 && 'flex-1'
            )}
          >
            <button
              onClick={() => index <= currentStep && goToStep(index)}
              disabled={index > currentStep}
              className={cn(
                'flex items-center gap-2',
                index <= currentStep
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  index < currentStep
                    ? 'bg-success text-success-foreground'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-foreground">
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  index < currentStep ? 'bg-success' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons (não mostrar no step de preview) */}
      {currentStep < 2 && (
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : goPrevious}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 0 ? 'Cancelar' : 'Voltar'}
          </Button>

          <Button
            onClick={goNext}
            disabled={!canProceed}
            className={canProceed ? 'gradient-primary' : ''}
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
