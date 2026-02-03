/**
 * ModerationActions Component
 * PRD-058: Botoes de acao de moderacao (Aprovar, Rejeitar, Solicitar Correcao)
 */

import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminJob } from '@/types';
import { RejectionDialog } from './RejectionDialog';
import { CorrectionRequestDialog } from './CorrectionRequestDialog';

interface ModerationActionsProps {
  job: AdminJob;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestCorrection: (id: string, fields: string[]) => void;
  reasons?: string[];
}

export function ModerationActions({
  job,
  onApprove,
  onReject,
  onRequestCorrection,
  reasons = [
    'Conteudo inadequado',
    'Informacoes falsas',
    'Vaga duplicada',
    'Salario abaixo do minimo',
    'Discriminacao no anuncio',
    'Dados incompletos',
  ],
}: ModerationActionsProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => onApprove(job.id)}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Aprovar
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setRejectOpen(true)}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Rejeitar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10"
          onClick={() => setCorrectionOpen(true)}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Solicitar Correcao
        </Button>
      </div>

      <RejectionDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => {
          onReject(job.id, reason);
          setRejectOpen(false);
        }}
        reasons={reasons}
      />

      <CorrectionRequestDialog
        open={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        onConfirm={(fields) => {
          onRequestCorrection(job.id, fields);
          setCorrectionOpen(false);
        }}
      />
    </>
  );
}
