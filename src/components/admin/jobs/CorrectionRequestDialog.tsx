/**
 * CorrectionRequestDialog Component
 * PRD-058: Dialog para solicitar correcao de campos da vaga
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CorrectionRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (fields: string[]) => void;
}

const CORRECTION_FIELDS = [
  { id: 'title', label: 'Titulo' },
  { id: 'description', label: 'Descricao' },
  { id: 'requirements', label: 'Requisitos' },
  { id: 'salary', label: 'Salario' },
  { id: 'location', label: 'Localizacao' },
  { id: 'contractType', label: 'Tipo de Contrato' },
];

export function CorrectionRequestDialog({ open, onClose, onConfirm }: CorrectionRequestDialogProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId) ? prev.filter((f) => f !== fieldId) : [...prev, fieldId]
    );
  };

  const canConfirm = selectedFields.length > 0;

  const handleConfirm = () => {
    if (canConfirm) {
      const fields = message.trim()
        ? [...selectedFields, `__message:${message.trim()}`]
        : selectedFields;
      onConfirm(fields);
      setSelectedFields([]);
      setMessage('');
    }
  };

  const handleClose = () => {
    setSelectedFields([]);
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Correcao</DialogTitle>
          <DialogDescription>
            Selecione os campos que precisam de ajuste. A empresa sera notificada.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-3">
            {CORRECTION_FIELDS.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field.id}`}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={() => toggleField(field.id)}
                />
                <Label htmlFor={`field-${field.id}`} className="cursor-pointer text-sm">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Mensagem adicional (opcional)
            </Label>
            <Textarea
              placeholder="Detalhes sobre as correcoes necessarias..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Solicitar Correcao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
