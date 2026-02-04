/**
 * ScheduleEditor component
 * PRD-059: Relatorios "Radar"
 *
 * Dialog form for creating / editing report schedules.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReportSchedule } from '@/types';

interface ScheduleEditorProps {
  schedule?: ReportSchedule;
  open: boolean;
  onClose: () => void;
  onSave: (schedule: Omit<ReportSchedule, 'id'>) => void;
}

export function ScheduleEditor({ schedule, open, onClose, onSave }: ScheduleEditorProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'pdf' | 'excel'>('pdf');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [hour, setHour] = useState(8);
  const [recipients, setRecipients] = useState('');

  // Populate form when editing an existing schedule
  useEffect(() => {
    if (schedule) {
      setName(schedule.name);
      setType(schedule.type);
      setFrequency(schedule.frequency);
      setDayOfWeek(schedule.dayOfWeek ?? 1);
      setDayOfMonth(schedule.dayOfMonth ?? 1);
      setHour(schedule.hour);
      setRecipients(schedule.recipients.join(', '));
    } else {
      setName('');
      setType('pdf');
      setFrequency('weekly');
      setDayOfWeek(1);
      setDayOfMonth(1);
      setHour(8);
      setRecipients('');
    }
  }, [schedule, open]);

  const handleSave = () => {
    const recipientList = recipients
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    onSave({
      name,
      type,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      hour,
      recipients: recipientList,
      isActive: schedule?.isActive ?? true,
      lastSentAt: schedule?.lastSentAt,
      nextSendAt: schedule?.nextSendAt,
    });
    onClose();
  };

  const WEEKDAYS = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terca' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sabado' },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {schedule ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription>
            Configure o envio automatico de relatorios por e-mail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="schedule-name">Nome</Label>
            <Input
              id="schedule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Relatorio Semanal Executivo"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo de Relatorio</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'pdf' | 'excel')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Executivo</SelectItem>
                <SelectItem value="excel">Excel Detalhado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequencia</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as 'weekly' | 'monthly')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day selector */}
          {frequency === 'weekly' ? (
            <div className="space-y-2">
              <Label>Dia da Semana</Label>
              <Select
                value={String(dayOfWeek)}
                onValueChange={(v) => setDayOfWeek(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((wd) => (
                    <SelectItem key={wd.value} value={String(wd.value)}>
                      {wd.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Dia do Mes</Label>
              <Select
                value={String(dayOfMonth)}
                onValueChange={(v) => setDayOfMonth(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      Dia {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hour */}
          <div className="space-y-2">
            <Label>Horario (hora)</Label>
            <Select value={String(hour)} onValueChange={(v) => setHour(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {String(h).padStart(2, '0')}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="schedule-recipients">Destinatarios (separados por virgula)</Label>
            <Input
              id="schedule-recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="email1@empresa.com, email2@empresa.com"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name || !recipients}>
            {schedule ? 'Salvar' : 'Criar Agendamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
