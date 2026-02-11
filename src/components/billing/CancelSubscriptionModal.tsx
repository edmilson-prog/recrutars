/**
 * CancelSubscriptionModal Component
 * PRD-076: Modal for cancelling subscription with reason selection
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCancelSubscription } from '@/hooks/useStripeQuery';
import { toast } from 'sonner';
import type { StripeEnvironment } from '@/types/plans';

const CANCEL_REASONS = [
  { value: 'too_expensive', label: 'Muito caro para o momento' },
  { value: 'not_using', label: 'Nao estou usando o suficiente' },
  { value: 'missing_features', label: 'Faltam recursos que preciso' },
  { value: 'found_alternative', label: 'Encontrei uma alternativa melhor' },
  { value: 'temporary', label: 'Pausa temporaria — pretendo voltar' },
  { value: 'other', label: 'Outro motivo' },
];

interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  subscriptionId: string;
  planName: string;
  endDate: string;
  lostFeatures?: string[];
  environment?: StripeEnvironment;
  onSuccess?: () => void;
}

export function CancelSubscriptionModal({
  open,
  onClose,
  subscriptionId,
  planName,
  endDate,
  lostFeatures = [],
  environment = 'test',
  onSuccess,
}: CancelSubscriptionModalProps) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const cancelSub = useCancelSubscription();

  const handleCancel = async () => {
    const finalReason = reason === 'other' && customReason ? customReason : CANCEL_REASONS.find(r => r.value === reason)?.label ?? reason;

    cancelSub.mutate(
      { subscriptionId, reason: finalReason, environment },
      {
        onSuccess: () => {
          toast.success('Cancelamento programado. Voce mantera acesso ate o fim do periodo.');
          onSuccess?.();
          onClose();
        },
        onError: () => {
          toast.error('Erro ao processar cancelamento.');
        },
      },
    );
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    setConfirmed(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Cancelar Assinatura
          </DialogTitle>
          <DialogDescription>
            Ao cancelar o plano <strong>{planName}</strong>, voce mantera acesso ate{' '}
            <strong>{new Date(endDate).toLocaleDateString('pt-BR')}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {lostFeatures.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
              <p className="text-xs font-medium text-destructive mb-2">
                Voce perdera acesso a:
              </p>
              <ul className="space-y-1">
                {lostFeatures.map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-destructive mt-0.5">-</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Por que voce esta cancelando?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {CANCEL_REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                  <Label htmlFor={`reason-${r.value}`} className="text-sm font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {reason === 'other' && (
            <Textarea
              placeholder="Conte-nos mais..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          )}

          {reason && !confirmed && (
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Ja considerou?</p>
              <p>
                Voce pode fazer <strong>downgrade</strong> para um plano mais acessivel em vez de cancelar completamente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {!confirmed ? (
            <>
              <Button
                variant="destructive"
                disabled={!reason}
                onClick={() => setConfirmed(true)}
                className="w-full"
              >
                Quero cancelar mesmo assim
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Manter minha assinatura
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                disabled={cancelSub.isPending}
                onClick={handleCancel}
                className="w-full"
              >
                {cancelSub.isPending ? 'Processando...' : 'Confirmar Cancelamento'}
              </Button>
              <Button variant="outline" onClick={() => setConfirmed(false)} className="w-full">
                Voltar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
