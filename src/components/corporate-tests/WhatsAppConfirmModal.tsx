/**
 * WhatsApp Confirmation Modal
 * Shows recipient list with phone validation/editing and message preview
 * before sending test invitations via WhatsApp (Evolution API).
 */

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Check, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { CompanyTeamMemberForInvite } from '@/types/companyTest';

interface WhatsAppConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: CompanyTeamMemberForInvite[];
  creditCost: number;
  isPending: boolean;
  onConfirm: (members: CompanyTeamMemberForInvite[]) => void;
}

/** Format phone as (XX) XXXXX-XXXX for display */
function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Remove country code if present
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return phone;
}

/** Validate phone has enough digits */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export function WhatsAppConfirmModal({
  open,
  onOpenChange,
  members,
  creditCost,
  isPending,
  onConfirm,
}: WhatsAppConfirmModalProps) {
  const [phoneEdits, setPhoneEdits] = useState<Record<string, string>>({});
  const [savingPhones, setSavingPhones] = useState(false);

  const { readyMembers, missingMembers, readyCount } = useMemo(() => {
    const ready: CompanyTeamMemberForInvite[] = [];
    const missing: CompanyTeamMemberForInvite[] = [];

    for (const m of members) {
      const editedPhone = phoneEdits[m.id];
      const hasPhone = editedPhone ? isValidPhone(editedPhone) : !!m.phone;
      if (hasPhone) {
        ready.push(m);
      } else {
        missing.push(m);
      }
    }

    return { readyMembers: ready, missingMembers: missing, readyCount: ready.length };
  }, [members, phoneEdits]);

  const handlePhoneChange = (memberId: string, value: string) => {
    setPhoneEdits(prev => ({ ...prev, [memberId]: value }));
  };

  const handleConfirm = async () => {
    setSavingPhones(true);
    try {
      // Save edited phones to team_members
      const phoneUpdates = Object.entries(phoneEdits).filter(
        ([, phone]) => isValidPhone(phone),
      );

      for (const [memberId, phone] of phoneUpdates) {
        const digits = phone.replace(/\D/g, '');
        await supabase
          .from('team_members')
          .update({ phone: digits })
          .eq('id', memberId);
      }

      // Build final member list with updated phones
      const finalMembers = members
        .map(m => {
          const editedPhone = phoneEdits[m.id];
          if (editedPhone && isValidPhone(editedPhone)) {
            return { ...m, phone: editedPhone.replace(/\D/g, '') };
          }
          return m;
        })
        .filter(m => !!m.phone);

      if (finalMembers.length === 0) {
        toast.warning('Nenhum destinatario com telefone valido.');
        return;
      }

      onConfirm(finalMembers);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar telefones.';
      toast.error(msg);
    } finally {
      setSavingPhones(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setPhoneEdits({});
    }
    onOpenChange(value);
  };

  const isProcessing = isPending || savingPhones;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Confirmar Envio WhatsApp
          </DialogTitle>
          <DialogDescription>
            Revise os destinatarios e seus telefones antes de enviar.
          </DialogDescription>
        </DialogHeader>

        {/* Recipients list */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Destinatarios ({members.length})
          </p>
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-1.5 pr-3">
              {members.map(member => {
                const editedPhone = phoneEdits[member.id];
                const hasPhone = editedPhone
                  ? isValidPhone(editedPhone)
                  : !!member.phone;

                return (
                  <div
                    key={member.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md text-sm',
                      hasPhone ? 'bg-muted/30' : 'bg-amber-500/10 border border-amber-500/30',
                    )}
                  >
                    {hasPhone ? (
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="font-medium truncate min-w-0 flex-1">
                      {member.name}
                    </span>
                    {member.phone && !editedPhone ? (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatPhoneDisplay(member.phone)}
                      </span>
                    ) : (
                      <Input
                        value={editedPhone ?? ''}
                        onChange={e => handlePhoneChange(member.id, e.target.value)}
                        placeholder="(00) 00000-0000"
                        className={cn(
                          'h-7 w-36 text-xs shrink-0',
                          !hasPhone && editedPhone ? 'border-red-500' : '',
                        )}
                        disabled={isProcessing}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Message preview */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Preview da Mensagem
          </p>
          <div className="rounded-lg bg-[#dcf8c6] dark:bg-[#025c4c] p-3 text-sm leading-relaxed">
            <p className="text-foreground dark:text-green-50">
              Ola <strong>{'{nome}'}</strong>! Voce foi convidado(a) para realizar o
              teste comportamental Gauge-Pro pela empresa. Acesse o link para iniciar:{' '}
              <span className="text-blue-600 dark:text-blue-300 underline">
                https://recrutars.com/convite/teste/...
              </span>
            </p>
            <p className="text-foreground dark:text-green-50 mt-2">
              Este link expira em 24 horas.
            </p>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
          <span>
            Envios:{' '}
            <strong className="text-primary">
              {readyCount}/{members.length}
            </strong>
          </span>
          <span>
            Creditos: <strong className="text-primary">{creditCost}</strong>
          </span>
          {missingMembers.length > 0 && (
            <span className="text-amber-500 font-medium">
              {missingMembers.length} sem telefone
            </span>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={readyCount === 0 || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar {readyCount} via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
