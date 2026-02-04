/**
 * SubscriptionActions Component
 * PRD-060: Action buttons for subscription management
 */

import { useState } from 'react';
import { XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Subscription } from '@/types';

interface SubscriptionActionsProps {
  subscription: Subscription;
  onCancel: (id: string, reason: string) => void;
  onReactivate: (id: string) => void;
}

export function SubscriptionActions({
  subscription,
  onCancel,
  onReactivate,
}: SubscriptionActionsProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = () => {
    onCancel(subscription.id, cancelReason || 'Cancelado pelo admin.');
    setCancelDialogOpen(false);
    setCancelReason('');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {subscription.status === 'active' && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setCancelDialogOpen(true)}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancelar Assinatura
        </Button>
      )}

      {(subscription.status === 'cancelled' || subscription.status === 'expired') && (
        <Button
          variant="default"
          size="sm"
          onClick={() => onReactivate(subscription.id)}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reativar
        </Button>
      )}

      {/* Cancel reason dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a assinatura de{' '}
              <strong>{subscription.userName}</strong>? O acesso sera mantido ate
              o fim do periodo pago.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason">Motivo do cancelamento</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Informe o motivo..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
