/**
 * UnlinkModal
 * PRD-090 Phase 2: Single-step dialog for unlinking a team member
 * from the company while preserving their platform account.
 */

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Unlink, Loader2, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUnlinkMember } from '@/hooks/useTeamLifecycleMutation';
import type { TeamMember, UnlinkReason } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UnlinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  performedBy: string;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UNLINK_REASONS: { value: UnlinkReason; label: string }[] = [
  { value: 'error', label: 'Vínculo por engano' },
  { value: 'company_change', label: 'Saiu da empresa' },
  { value: 'duplicate', label: 'Registro duplicado' },
  { value: 'other', label: 'Outro' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UnlinkModal({
  open,
  onOpenChange,
  member,
  performedBy,
  onSuccess,
}: UnlinkModalProps) {
  const [reason, setReason] = useState<UnlinkReason | ''>('');
  const [reasonDetail, setReasonDetail] = useState('');

  const unlinkMutation = useUnlinkMember();

  const isValid = reason !== '' && (reason !== 'other' || reasonDetail.trim().length > 0);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setReason('');
    setReasonDetail('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (!reason) return;

    try {
      await unlinkMutation.mutateAsync({
        teamMemberId: member.id,
        unlinkReason: reason,
        unlinkReasonDetail: reason === 'other' ? reasonDetail : undefined,
        performedBy,
      });

      toast.success(`${member.name} foi desvinculado(a) com sucesso`);
      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao desvincular colaborador. Tente novamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlink className="h-5 w-5 text-amber-500" />
            Desvincular Colaborador
          </DialogTitle>
          <DialogDescription>
            Desvincular <span className="font-semibold">{member.name}</span> da empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
              Desvincular remove o vinculo do colaborador com a empresa, mas preserva a conta na
              plataforma. Use esta opcao quando o vinculo foi criado por engano ou o colaborador
              nao pertence mais a empresa.
            </AlertDescription>
          </Alert>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="unlink-reason">Motivo da desvinculação</Label>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as UnlinkReason)}
            >
              <SelectTrigger id="unlink-reason">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {UNLINK_REASONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="unlink-detail">
                Detalhe do motivo <span aria-hidden="true">*</span>
              </Label>
              <Textarea
                id="unlink-detail"
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="Descreva o motivo da desvinculação..."
                className="min-h-[80px]"
                required
              />
            </div>
          )}

          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
              Esta acao nao pode ser desfeita automaticamente.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isValid || unlinkMutation.isPending}
          >
            {unlinkMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4 mr-2" />
            )}
            Desvincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
