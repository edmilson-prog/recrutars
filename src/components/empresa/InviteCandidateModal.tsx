/**
 * Modal de Convite para Candidato
 * PRD-037: Permite a empresa enviar convite/mensagem para candidato sugerido
 */

import { useState } from 'react';
import { Mail, Calendar, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { Candidate, Job } from '@/types';

interface InviteCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  job: Job;
  onConfirm: (message: string, scheduleInterview: boolean) => void;
  onCancel: () => void;
}

export function InviteCandidateModal({
  open,
  onOpenChange,
  candidate,
  job,
  onConfirm,
  onCancel,
}: InviteCandidateModalProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [scheduleInterview, setScheduleInterview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mensagem padrão sugerida
  const defaultMessage = `Olá ${candidate.name.split(' ')[0]},

Encontramos seu perfil e acreditamos que você seria um ótimo candidato para a vaga de ${job.title} na nossa empresa.

Gostaríamos de conhecê-lo(a) melhor e conversar sobre esta oportunidade. Caso tenha interesse, por favor responda esta mensagem para darmos continuidade ao processo.

Aguardamos seu retorno!

Atenciosamente,
Equipe ${job.companyName}`;

  const handleConfirm = async () => {
    if (!message.trim()) {
      toast({
        title: 'Mensagem obrigatória',
        description: 'Por favor, escreva uma mensagem para o candidato.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 500));

    onConfirm(message, scheduleInterview);

    toast({
      title: 'Convite enviado!',
      description: scheduleInterview
        ? `Mensagem enviada e agendamento de entrevista solicitado para ${candidate.name}.`
        : `Mensagem enviada para ${candidate.name}.`,
    });

    setIsSubmitting(false);
    setMessage('');
    setScheduleInterview(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    setMessage('');
    setScheduleInterview(false);
    onOpenChange(false);
  };

  const handleUseTemplate = () => {
    setMessage(defaultMessage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Convidar Candidato</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Envie uma mensagem para {candidate.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Info do candidato */}
          <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">
                {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{candidate.name}</p>
              <p className="text-sm text-muted-foreground truncate">{candidate.title}</p>
            </div>
          </div>

          {/* Vaga */}
          <div className="text-sm text-muted-foreground">
            Para a vaga: <span className="font-medium text-foreground">{job.title}</span>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Mensagem</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleUseTemplate}
              >
                Usar modelo
              </Button>
            </div>
            <Textarea
              id="message"
              placeholder="Escreva sua mensagem para o candidato..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 caracteres
            </p>
          </div>

          {/* Opção de agendar entrevista */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="schedule" className="text-sm font-medium">
                  Agendar entrevista
                </Label>
                <p className="text-xs text-muted-foreground">
                  Solicitar agendamento junto com o convite
                </p>
              </div>
            </div>
            <Switch
              id="schedule"
              checked={scheduleInterview}
              onCheckedChange={setScheduleInterview}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !message.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              'Enviando...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar convite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
