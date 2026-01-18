/**
 * CVParsingProgress Component - PRD-038
 * Exibe progresso do parsing do currículo
 */

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CVParserProgress } from '@/types/cvParser';
import { Progress } from '@/components/ui/progress';

interface CVParsingProgressProps {
  progress: CVParserProgress;
  className?: string;
}

export function CVParsingProgress({ progress, className }: CVParsingProgressProps) {
  const isComplete = progress.stage === 'complete';
  const isError = progress.stage === 'error';

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-4">
          {isError ? (
            <AlertCircle className="w-12 h-12 text-red-500" />
          ) : isComplete ? (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          ) : (
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-3">
          <Progress
            value={progress.progress}
            className={cn(
              'h-2',
              isError && '[&>div]:bg-red-500',
              isComplete && '[&>div]:bg-green-500'
            )}
          />
        </div>

        {/* Message */}
        <p
          className={cn(
            'text-sm font-medium',
            isError && 'text-red-600',
            isComplete && 'text-green-600',
            !isError && !isComplete && 'text-gray-600'
          )}
        >
          {progress.message}
        </p>

        {/* Percentage */}
        {!isError && !isComplete && (
          <p className="text-xs text-gray-400 mt-1">{progress.progress}%</p>
        )}

        {/* Stage indicator */}
        {!isError && !isComplete && (
          <div className="mt-4 flex flex-wrap justify-center gap-1">
            {getStageLabels().map((stage) => (
              <span
                key={stage.key}
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  stage.key === progress.stage
                    ? 'bg-cyan-100 text-cyan-700'
                    : getStageIndex(stage.key) < getStageIndex(progress.stage)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {stage.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getStageLabels() {
  return [
    { key: 'reading', label: 'Lendo' },
    { key: 'extracting', label: 'Extraindo' },
    { key: 'identifying_sections', label: 'Seções' },
    { key: 'parsing_personal', label: 'Dados' },
    { key: 'parsing_experience', label: 'Experiência' },
    { key: 'parsing_education', label: 'Educação' },
    { key: 'parsing_skills', label: 'Skills' },
    { key: 'normalizing', label: 'Finalizando' },
  ];
}

function getStageIndex(stage: string): number {
  const stages = [
    'idle',
    'reading',
    'extracting',
    'identifying_sections',
    'parsing_personal',
    'parsing_experience',
    'parsing_education',
    'parsing_skills',
    'normalizing',
    'complete',
  ];
  return stages.indexOf(stage);
}
