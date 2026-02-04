/**
 * PlanEditor Component
 * PRD-060: Dialog content for editing a plan
 */

import { useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { LaunchPriceEditor } from './LaunchPriceEditor';
import type { Plan, PlanPeriod } from '@/types';

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

interface PlanEditorProps {
  plan: Plan | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Plan>) => void;
}

export function PlanEditor({ plan, open, onClose, onSave }: PlanEditorProps) {
  const [editState, setEditState] = useState<Plan | null>(null);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (plan) {
      setEditState({ ...plan, features: [...plan.features] });
    } else {
      setEditState(null);
    }
  }, [plan]);

  if (!editState) return null;

  const handleFieldChange = <K extends keyof Plan>(field: K, value: Plan[K]) => {
    setEditState(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handlePriceChange = (period: PlanPeriod, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditState(prev =>
      prev
        ? { ...prev, prices: { ...prev.prices, [period]: numValue } }
        : null
    );
  };

  const handlePartialChange = (updates: Partial<Plan>) => {
    setEditState(prev => prev ? { ...prev, ...updates } : null);
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setEditState(prev =>
      prev
        ? { ...prev, features: [...prev.features, newFeature.trim()] }
        : null
    );
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setEditState(prev =>
      prev
        ? { ...prev, features: prev.features.filter((_, i) => i !== idx) }
        : null
    );
  };

  const handleSave = () => {
    if (!editState || !plan) return;
    const { id, ...updates } = editState;
    onSave(plan.id, updates);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Plano: {plan?.name}</DialogTitle>
          <DialogDescription>
            Altere as informacoes do plano. As alteracoes serao aplicadas imediatamente.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Nome</Label>
                <Input
                  id="plan-name"
                  value={editState.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-slug">Slug</Label>
                <Input
                  id="plan-slug"
                  value={editState.slug}
                  onChange={(e) => handleFieldChange('slug', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-badge">Badge</Label>
              <Input
                id="plan-badge"
                value={editState.badge || ''}
                onChange={(e) => handleFieldChange('badge', e.target.value || undefined)}
                placeholder="Ex: Mais popular"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-desc-short">Descricao curta</Label>
              <Input
                id="plan-desc-short"
                value={editState.descriptionShort}
                onChange={(e) => handleFieldChange('descriptionShort', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-desc">Descricao completa</Label>
              <Textarea
                id="plan-desc"
                value={editState.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Prices */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Precos Regulares</Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((period) => (
                  <div key={period} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {PERIOD_LABELS[period]}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editState.prices[period]}
                      onChange={(e) => handlePriceChange(period, e.target.value)}
                      className="h-9"
                      disabled={editState.isFree}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Launch prices */}
            {!editState.isFree && (
              <LaunchPriceEditor
                plan={editState}
                onChange={handlePartialChange}
              />
            )}

            {/* Features list */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Recursos do plano</Label>
              <div className="space-y-2">
                {editState.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const updated = [...editState.features];
                        updated[idx] = e.target.value;
                        handleFieldChange('features', updated);
                      }}
                      className="h-8 text-sm flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFeature(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Novo recurso..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                  className="h-8 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  disabled={!newFeature.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alteracoes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
