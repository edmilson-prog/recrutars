/**
 * ObjectiveForm
 * PRD-057: Dialog para criar / editar um objetivo do PDI.
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DIMENSION_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { DevelopmentObjective, ObjectivePriority } from '@/types/teamManagement';

interface ObjectiveFormProps {
  objective?: DevelopmentObjective | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<DevelopmentObjective>) => void;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export default function ObjectiveForm({
  objective,
  open,
  onOpenChange,
  onSave,
}: ObjectiveFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dimension, setDimension] = useState<GaugeProDimension>('D1');
  const [priority, setPriority] = useState<ObjectivePriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (objective) {
      setTitle(objective.title);
      setDescription(objective.description || '');
      setDimension(objective.dimension);
      setPriority(objective.priority);
      setDueDate(objective.dueDate || '');
      setNotes(objective.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setDimension('D1');
      setPriority('medium');
      setDueDate('');
      setNotes('');
    }
  }, [objective, open]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSave({
      ...(objective ? { id: objective.id } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      dimension,
      priority,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {objective ? 'Editar Objetivo' : 'Novo Objetivo'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="obj-title">Título *</Label>
            <Input
              id="obj-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do objetivo"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="obj-description">Descrição</Label>
            <Textarea
              id="obj-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo em detalhes..."
              rows={3}
            />
          </div>

          {/* Dimension + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dimensão</Label>
              <Select
                value={dimension}
                onValueChange={(v) => setDimension(v as GaugeProDimension)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSIONS.map((dim) => (
                    <SelectItem key={dim} value={dim}>
                      {dim} - {DIMENSION_NAMES[dim]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as ObjectivePriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label htmlFor="obj-due-date">Prazo</Label>
            <Input
              id="obj-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="obj-notes">Notas</Label>
            <Textarea
              id="obj-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
