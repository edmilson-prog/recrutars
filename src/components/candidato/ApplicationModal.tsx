/**
 * Application Modal Component
 * PRD-007: Candidatura a Vagas
 * PRD-073: Destaques de candidatura customizável (step 2)
 */

import { useState } from 'react';
import { Building2, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { HighlightsSelector } from '@/components/candidato/HighlightsSelector';
import { cn } from '@/lib/utils';
import type { Job } from '@/types';
import type { Curriculum } from '@/types/curriculum';
import type { ApplicationHighlights } from '@/types/applicationHighlight';
import { getDisplayCompanyName } from '@/lib/anonymousJob';

const MAX_MESSAGE_LENGTH = 500;

type Step = 'message' | 'highlights';

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message?: string, highlights?: ApplicationHighlights) => void;
  curriculum?: Curriculum | null;
}

export function ApplicationModal({ job, isOpen, onClose, onConfirm, curriculum }: ApplicationModalProps) {
  const [includeMessage, setIncludeMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<Step>('message');

  const hasProfileItems = curriculum &&
    (curriculum.experiences.length > 0 ||
     curriculum.education.length > 0 ||
     curriculum.skills.length > 0 ||
     curriculum.courses.length > 0);

  const handleNext = () => {
    if (hasProfileItems) {
      setStep('highlights');
    } else {
      // No profile items — confirm without highlights
      handleFinalConfirm();
    }
  };

  const handleFinalConfirm = (highlights?: ApplicationHighlights) => {
    const msg = includeMessage && message.trim() ? message.trim() : undefined;
    onConfirm(msg, highlights);
    resetState();
  };

  const handleSkipHighlights = () => {
    handleFinalConfirm();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setMessage('');
    setIncludeMessage(false);
    setStep('message');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          step === 'message' && 'sm:max-w-md',
          step === 'highlights' &&
            'flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl',
        )}
      >
        {step === 'message' && (
          <>
            <DialogHeader>
              <DialogTitle>Confirmar Candidatura</DialogTitle>
              <DialogDescription>
                Seu perfil será enviado para análise pela empresa.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Job Summary */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{getDisplayCompanyName(job)}</p>
                </div>
              </div>

              {/* Optional Message Checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="include-message"
                  checked={includeMessage}
                  onCheckedChange={(checked) => setIncludeMessage(checked === true)}
                />
                <Label htmlFor="include-message" className="cursor-pointer">
                  Adicionar mensagem ao recrutador
                </Label>
              </div>

              {/* Message Field */}
              {includeMessage && (
                <div className="space-y-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder="Escreva uma mensagem personalizada para o recrutador..."
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleNext} className="gradient-primary">
                {hasProfileItems ? 'Próximo' : 'Confirmar Candidatura'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'highlights' && curriculum && (
          <>
            {/* Fixed header */}
            <DialogHeader className="shrink-0 space-y-2 border-b border-border px-6 pb-4 pr-12 pt-6 text-left">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 h-8 w-fit px-2 text-muted-foreground"
                onClick={() => setStep('message')}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar
              </Button>
              <DialogTitle>Destacar Itens do Perfil</DialogTitle>
              <DialogDescription>
                Etapa 2 de 2 · Escolha os itens mais relevantes para esta vaga.
              </DialogDescription>
            </DialogHeader>

            <HighlightsSelector
              curriculum={curriculum}
              onConfirm={handleFinalConfirm}
              onSkip={handleSkipHighlights}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
