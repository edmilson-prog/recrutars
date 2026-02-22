/**
 * ScheduleInterviewModal Component
 * PRD-034: Agendamento de Entrevistas (Empresa)
 */

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  FileText,
  Plus,
  X,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { InterviewType, ProposedSlot } from '@/types/interview';
import type { CreateInterviewData } from '@/hooks/useCompanyInterviews';

interface ScheduleInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  applicationId: string;
  onSchedule: (data: CreateInterviewData) => void;
}

const INTERVIEW_TYPES: { value: InterviewType; label: string; icon: typeof Video }[] = [
  { value: 'video', label: 'Videochamada', icon: Video },
  { value: 'phone', label: 'Telefone', icon: Phone },
  { value: 'in_person', label: 'Presencial', icon: MapPin },
];

const DURATION_OPTIONS = [
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2 horas' },
];

const DEADLINE_OPTIONS = [
  { value: '2', label: '2 dias' },
  { value: '3', label: '3 dias' },
  { value: '5', label: '5 dias' },
  { value: '7', label: '7 dias' },
];

export function ScheduleInterviewModal({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  jobId,
  jobTitle,
  applicationId,
  onSchedule,
}: ScheduleInterviewModalProps) {
  // Form state
  const [title, setTitle] = useState('Entrevista');
  const [type, setType] = useState<InterviewType>('video');
  const [duration, setDuration] = useState('60');
  const [deadlineDays, setDeadlineDays] = useState('3');
  const [slots, setSlots] = useState<{ date: string; time: string }[]>([
    { date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), time: '10:00' },
  ]);
  const [videoLink, setVideoLink] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerRole, setInterviewerRole] = useState('');
  const [notes, setNotes] = useState('');

  const addSlot = () => {
    if (slots.length < 3) {
      const lastSlot = slots[slots.length - 1];
      setSlots([
        ...slots,
        {
          date: lastSlot?.date || format(addDays(new Date(), 3), 'yyyy-MM-dd'),
          time: '14:00',
        },
      ]);
    }
  };

  const removeSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const updateSlot = (index: number, field: 'date' | 'time', value: string) => {
    setSlots(slots.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSubmit = () => {
    // Converter slots para ProposedSlot[]
    const proposedSlots: ProposedSlot[] = slots.map(slot => ({
      datetime: `${slot.date}T${slot.time}:00`,
    }));

    // Calcular prazo de resposta
    const responseDeadline = addDays(new Date(), parseInt(deadlineDays)).toISOString();

    const data: CreateInterviewData = {
      applicationId,
      jobId,
      jobTitle,
      candidateId,
      candidateName,
      title,
      type,
      proposedSlots,
      duration: parseInt(duration),
      responseDeadline,
      videoLink: type === 'video' ? videoLink : undefined,
      phoneNumber: type === 'phone' ? phoneNumber : undefined,
      address: type === 'in_person' ? address : undefined,
      interviewerName: interviewerName || undefined,
      interviewerRole: interviewerRole || undefined,
      notes: notes || undefined,
    };

    onSchedule(data);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('Entrevista');
    setType('video');
    setDuration('60');
    setDeadlineDays('3');
    setSlots([{ date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), time: '10:00' }]);
    setVideoLink('');
    setPhoneNumber('');
    setAddress('');
    setInterviewerName('');
    setInterviewerRole('');
    setNotes('');
  };

  const isValid = title.trim() && slots.length > 0 && slots.every(s => s.date && s.time);

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) resetForm();
      onOpenChange(v);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agendar Entrevista
          </DialogTitle>
          <DialogDescription>
            {candidateName} - {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Titulo da Entrevista */}
          <div className="space-y-2">
            <Label htmlFor="title">Titulo da Entrevista *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Entrevista com RH, Entrevista com Gestor..."
            />
          </div>

          {/* Tipo de Entrevista */}
          <div className="space-y-2">
            <Label>Tipo de Entrevista *</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as InterviewType)}
              className="grid grid-cols-3 gap-2"
            >
              {INTERVIEW_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <Label
                    key={t.value}
                    htmlFor={t.value}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                      type === t.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    )}
                  >
                    <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                    <Icon className={cn(
                      'h-5 w-5',
                      type === t.value ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className="text-sm">{t.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Duracao */}
          <div className="space-y-2">
            <Label>Duracao *</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horarios Propostos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Horarios Propostos * (max. 3)</Label>
              {slots.length < 3 && (
                <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={slot.date}
                    onChange={(e) => updateSlot(index, 'date', e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={slot.time}
                    onChange={(e) => updateSlot(index, 'time', e.target.value)}
                    className="w-28"
                  />
                  {slots.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlot(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prazo para Resposta */}
          <div className="space-y-2">
            <Label>Prazo para Resposta</Label>
            <Select value={deadlineDays} onValueChange={setDeadlineDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEADLINE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campos condicionais por tipo */}
          {type === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="videoLink">Link da Reuniao</Label>
              <Input
                id="videoLink"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          {type === 'phone' && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Telefone</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          )}

          {type === 'in_person' && (
            <div className="space-y-2">
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Paulista, 1000 - Sao Paulo, SP"
              />
            </div>
          )}

          {/* Entrevistador */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interviewerName">Nome do Entrevistador</Label>
              <Input
                id="interviewerName"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="Carlos Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewerRole">Cargo</Label>
              <Input
                id="interviewerRole"
                value={interviewerRole}
                onChange={(e) => setInterviewerRole(e.target.value)}
                placeholder="Tech Lead"
              />
            </div>
          </div>

          {/* Observacoes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes para o Candidato</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Prepare-se para discutir sua experiencia..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            <Calendar className="h-4 w-4 mr-2" />
            Enviar Proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
