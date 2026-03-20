/**
 * RetestScheduleModal
 * PRD-089: Modal para agendamento de reteste (RF-010)
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CalendarClock } from 'lucide-react';
import { useSaveRetestSchedule } from '@/hooks/useTeamsQuery';
import { useToast } from '@/hooks/use-toast';
import type { RetestFrequency, RetestSchedule } from '@/types/teamManagement';

interface RetestScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  existingSchedule?: RetestSchedule | null;
}

const FREQUENCY_OPTIONS: { value: RetestFrequency; label: string; months: number }[] = [
  { value: '3months', label: '3 meses', months: 3 },
  { value: '6months', label: '6 meses', months: 6 },
  { value: '9months', label: '9 meses', months: 9 },
  { value: '12months', label: '12 meses', months: 12 },
];

function calculateNextDate(frequency: RetestFrequency): string {
  const months = FREQUENCY_OPTIONS.find(f => f.value === frequency)?.months ?? 6;
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

export function RetestScheduleModal({ open, onOpenChange, memberId, memberName, existingSchedule }: RetestScheduleModalProps) {
  const [frequency, setFrequency] = useState<RetestFrequency>(existingSchedule?.frequency ?? '6months');
  const [autoSend, setAutoSend] = useState(existingSchedule?.autoSend ?? false);
  const { toast } = useToast();

  const nextDate = calculateNextDate(frequency);
  const saveMutation = useSaveRetestSchedule();

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        id: existingSchedule?.id ?? crypto.randomUUID(),
        memberId,
        frequency,
        nextDate,
        autoSend,
        createdAt: existingSchedule?.createdAt ?? new Date().toISOString(),
      });
      toast({ title: 'Reteste agendado', description: `Próximo reteste em ${new Date(nextDate).toLocaleDateString('pt-BR')}` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro ao agendar reteste', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Agendar Reteste
          </DialogTitle>
          <DialogDescription>
            Configurar agendamento de reteste para {memberName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Frequência</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as RetestFrequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Próximo reteste</Label>
            <p className="text-lg font-semibold">
              {new Date(nextDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Envio automático</Label>
              <p className="text-xs text-muted-foreground">Criar convite automaticamente na data</p>
            </div>
            <Switch checked={autoSend} onCheckedChange={setAutoSend} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : existingSchedule ? 'Atualizar' : 'Agendar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
