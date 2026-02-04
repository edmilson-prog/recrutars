/**
 * FlagOverrideManager Component
 * PRD-062: Feature Flags "Switch"
 *
 * Manages per-flag overrides with add/remove capabilities.
 */

import { useState } from 'react';
import { Plus, Trash2, UserCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { FeatureFlagOverride } from '@/types';

interface FlagOverrideManagerProps {
  flagKey: string;
  overrides: FeatureFlagOverride[];
  onAdd: (override: Omit<FeatureFlagOverride, 'id' | 'createdAt'>) => void;
  onRemove: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function FlagOverrideManager({ flagKey, overrides, onAdd, onRemove }: FlagOverrideManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetType, setTargetType] = useState<'user' | 'company'>('user');
  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [reason, setReason] = useState('');

  const flagOverrides = overrides.filter((o) => o.flagKey === flagKey);

  const handleAdd = () => {
    if (!targetId.trim() || !targetName.trim()) return;

    onAdd({
      flagKey,
      targetType,
      targetId: targetId.trim(),
      targetName: targetName.trim(),
      enabled,
      reason: reason.trim() || undefined,
      createdBy: 'admin-1',
    });

    // Reset form
    setTargetId('');
    setTargetName('');
    setEnabled(true);
    setReason('');
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Overrides ({flagOverrides.length})
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="w-3 h-3 mr-1" />
                Adicionar Override
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Override</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Tipo de alvo</Label>
                  <Select value={targetType} onValueChange={(v) => setTargetType(v as 'user' | 'company')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="company">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>ID do alvo</Label>
                    <Input
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      placeholder={targetType === 'user' ? 'candidate-1' : 'company-1'}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nome</Label>
                    <Input
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      placeholder="Nome do alvo"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label>Habilitado</Label>
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                  <span className="text-sm text-muted-foreground">
                    {enabled ? 'Sim' : 'Nao'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label>Motivo (opcional)</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Descreva o motivo do override..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={!targetId.trim() || !targetName.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {flagOverrides.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum override configurado para esta flag.
          </p>
        ) : (
          <div className="space-y-2">
            {flagOverrides.map((override) => (
              <div
                key={override.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {override.targetType === 'user' ? (
                    <UserCheck className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  ) : (
                    <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{override.targetName}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {override.targetType === 'user' ? 'Usuario' : 'Empresa'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          override.enabled
                            ? 'text-[10px] px-1.5 py-0 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'text-[10px] px-1.5 py-0 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }
                      >
                        {override.enabled ? 'Habilitado' : 'Desabilitado'}
                      </Badge>
                    </div>
                    {override.reason && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {override.reason}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Criado em {formatDate(override.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(override.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
