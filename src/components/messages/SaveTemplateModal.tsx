/**
 * Save Template Modal Component
 * PRD-041: Mensagens Personalizadas
 */

import { useState } from 'react';
import { Save } from 'lucide-react';
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
import type { TemplateCategory } from '@/types/messageTemplates';
import { CATEGORY_LABELS } from '@/types/messageTemplates';

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onSave: (name: string, content: string, category: TemplateCategory) => void;
}

const CATEGORIES: TemplateCategory[] = [
  'invitation',
  'feedback',
  'rejection',
  'followup',
  'welcome',
  'custom',
];

export function SaveTemplateModal({
  open,
  onOpenChange,
  content,
  onSave,
}: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [editedContent, setEditedContent] = useState(content);

  // Reset form when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEditedContent(content);
      setName('');
      setCategory('custom');
    }
    onOpenChange(isOpen);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), editedContent, category);
    onOpenChange(false);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-primary" />
            Salvar como Template
          </DialogTitle>
          <DialogDescription>
            Salve esta mensagem como um template para usar novamente no futuro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="templateName">Nome do Template *</Label>
            <Input
              id="templateName"
              placeholder="Ex: Convite para Entrevista Final"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="templateCategory">Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
              <SelectTrigger id="templateCategory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Preview/Edit */}
          <div className="space-y-2">
            <Label htmlFor="templateContent">Conteúdo</Label>
            <Textarea
              id="templateContent"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Dica: Use {'{{variavel}}'} para criar campos dinâmicos. Ex: {'{{nome}}'}, {'{{vaga}}'}, {'{{empresa}}'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
