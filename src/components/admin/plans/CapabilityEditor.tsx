/**
 * CapabilityEditor Component
 * PRD-060: Dialog for creating a new capability
 */

import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
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
import type { PlanCapability } from '@/types';

const CATEGORIES = [
  'Relatorios',
  'Visibilidade',
  'Candidaturas',
  'Testes',
  'Comunicacao',
  'Suporte',
  'Outro',
];

const VALUE_TYPES: { value: PlanCapability['valueType']; label: string }[] = [
  { value: 'boolean', label: 'Boolean (Sim/Nao)' },
  { value: 'number', label: 'Numero' },
  { value: 'enum', label: 'Enum (valores predefinidos)' },
];

interface CapabilityEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (capability: PlanCapability) => void;
}

export function CapabilityEditor({ open, onClose, onSave }: CapabilityEditorProps) {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Outro');
  const [valueType, setValueType] = useState<PlanCapability['valueType']>('boolean');
  const [possibleValues, setPossibleValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');

  const resetForm = () => {
    setKey('');
    setName('');
    setDescription('');
    setCategory('Outro');
    setValueType('boolean');
    setPossibleValues([]);
    setNewValue('');
  };

  const handleSave = () => {
    if (!key.trim() || !name.trim()) return;

    const capability: PlanCapability = {
      id: `cap-custom-${Date.now()}`,
      key: key.trim(),
      name: name.trim(),
      description: description.trim(),
      category,
      valueType,
      ...(valueType === 'enum' && possibleValues.length > 0
        ? { possibleValues }
        : {}),
    };

    onSave(capability);
    resetForm();
    onClose();
  };

  const addPossibleValue = () => {
    if (!newValue.trim() || possibleValues.includes(newValue.trim())) return;
    setPossibleValues((prev) => [...prev, newValue.trim()]);
    setNewValue('');
  };

  const removePossibleValue = (idx: number) => {
    setPossibleValues((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Capability</DialogTitle>
          <DialogDescription>
            Adicione uma nova feature/capability que pode ser atribuida aos planos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cap-key">Key (snake_case)</Label>
              <Input
                id="cap-key"
                placeholder="ex: custom_feature"
                value={key}
                onChange={(e) =>
                  setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cap-name">Nome</Label>
              <Input
                id="cap-name"
                placeholder="Nome amigavel"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cap-desc">Descricao</Label>
            <Textarea
              id="cap-desc"
              placeholder="Descreva o que esta capability faz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de valor</Label>
              <Select
                value={valueType}
                onValueChange={(v) => setValueType(v as PlanCapability['valueType'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALUE_TYPES.map((vt) => (
                    <SelectItem key={vt.value} value={vt.value}>
                      {vt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enum possible values */}
          {valueType === 'enum' && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Valores possiveis</Label>
              {possibleValues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {possibleValues.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-sm"
                    >
                      <span>{val}</span>
                      <button
                        onClick={() => removePossibleValue(idx)}
                        className="text-destructive hover:text-destructive/80 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Novo valor..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPossibleValue()}
                  className="h-8 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPossibleValue}
                  disabled={!newValue.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!key.trim() || !name.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Criar Capability
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
