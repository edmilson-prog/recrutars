/**
 * RetestScheduleForm
 * PRD-057: Formulario de agendamento de reteste comportamental.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarClock, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RetestSchedule, RetestFrequency } from '@/types/teamManagement';

interface RetestScheduleFormProps {
  schedule?: RetestSchedule | null;
  onSave: (data: Partial<RetestSchedule>) => void;
}

const FREQUENCY_LABELS: Record<RetestFrequency, string> = {
  '3months': '3 meses',
  '6months': '6 meses',
  '9months': '9 meses',
  '12months': '12 meses',
};

export default function RetestScheduleForm({
  schedule,
  onSave,
}: RetestScheduleFormProps) {
  const [frequency, setFrequency] = useState<RetestFrequency>(
    schedule?.frequency || '6months',
  );
  const [nextDate, setNextDate] = useState(schedule?.nextDate || '');
  const [autoSend, setAutoSend] = useState(schedule?.autoSend ?? true);

  useEffect(() => {
    if (schedule) {
      setFrequency(schedule.frequency);
      setNextDate(schedule.nextDate);
      setAutoSend(schedule.autoSend);
    }
  }, [schedule]);

  const handleSave = () => {
    onSave({
      ...(schedule ? { id: schedule.id } : {}),
      frequency,
      nextDate,
      autoSend,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Agendamento de Reteste
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frequency */}
        <div className="space-y-2">
          <Label>Frequência</Label>
          <Select
            value={frequency}
            onValueChange={(v) => setFrequency(v as RetestFrequency)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FREQUENCY_LABELS) as RetestFrequency[]).map((freq) => (
                <SelectItem key={freq} value={freq}>
                  {FREQUENCY_LABELS[freq]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Next date */}
        <div className="space-y-2">
          <Label htmlFor="retest-next-date">Próxima data</Label>
          <Input
            id="retest-next-date"
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
          />
        </div>

        {/* Auto-send toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="retest-auto-send" className="cursor-pointer">
            Envio automático
          </Label>
          <Switch
            id="retest-auto-send"
            checked={autoSend}
            onCheckedChange={setAutoSend}
          />
        </div>

        {/* Last sent date (read-only) */}
        {schedule?.lastSentAt && (
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Último envio</Label>
            <p className="text-sm">
              {format(new Date(schedule.lastSentAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        )}

        {/* Save button */}
        <Button
          onClick={handleSave}
          className="w-full gap-2"
          size="sm"
          disabled={!nextDate}
        >
          <Save className="h-4 w-4" />
          Salvar Agendamento
        </Button>
        {!nextDate && (
          <p className="text-xs text-muted-foreground text-center">
            Preencha a data do próximo reteste para salvar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
