/**
 * OnboardingStepIndicator
 * PRD-083: Visual progress indicator for the 4-step candidate onboarding
 * Reused across all onboarding PRDs (083-086)
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepIndicatorProps {
  currentStep: number; // 1-4
  totalSteps?: number;
}

const STEP_LABELS = [
  'Cadastro',
  'Perfil Pessoal',
  'Perfil Profissional',
  'Teste Comportamental',
];

export function OnboardingStepIndicator({
  currentStep,
  totalSteps = 4,
}: OnboardingStepIndicatorProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step}
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1.5 text-center whitespace-nowrap',
                    isCurrent && 'font-semibold text-primary',
                    isCompleted && 'text-green-600 font-medium',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>

              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mt-[-18px] transition-colors duration-300',
                    isCompleted ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
