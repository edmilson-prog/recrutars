/**
 * WhatsAppTemplateEditor
 * Dialog for creating or editing WhatsApp message templates.
 * Includes variable insertion buttons, character counter, live preview,
 * and form validation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { cn } from '@/lib/utils';
import { WhatsAppMessagePreview } from './WhatsAppMessagePreview';
import type {
  WhatsAppTemplate,
  WhatsAppTemplateCategory,
  CreateWhatsAppTemplateParams,
} from '@/types/whatsapp';
import { whatsAppCategoryLabels } from '@/types/whatsapp';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WhatsAppTemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: WhatsAppTemplate;
  onSave: (params: CreateWhatsAppTemplateParams) => void;
  isSaving: boolean;
}

interface FormErrors {
  name?: string;
  messageText?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MESSAGE_MAX = 1024;
const MESSAGE_MIN = 10;
const NAME_MAX = 80;

const VARIABLES = [
  { label: '{{nome}}', example: 'Joao Santos' },
  { label: '{{link}}', example: 'https://app.recrutars.com.br' },
  { label: '{{empresa}}', example: 'Tech Solutions' },
  { label: '{{vaga}}', example: 'Desenvolvedor React' },
] as const;

const CATEGORY_OPTIONS: WhatsAppTemplateCategory[] = [
  'convite',
  'lembrete',
  'informativo',
  'operacional',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCounterColor(length: number, max: number): string {
  const ratio = length / max;
  if (ratio >= 0.95) return 'text-red-500';
  if (ratio >= 0.8) return 'text-amber-500';
  return 'text-muted-foreground';
}

/** Replace template variables with example values for the preview. */
function replaceVariablesWithExamples(text: string): string {
  let result = text;
  for (const v of VARIABLES) {
    result = result.replaceAll(v.label, v.example);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WhatsAppTemplateEditor({
  open,
  onOpenChange,
  template,
  onSave,
  isSaving,
}: WhatsAppTemplateEditorProps) {
  const isEditMode = !!template;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WhatsAppTemplateCategory>('convite');
  const [messageText, setMessageText] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Ref for inserting variables at cursor position
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ------- Reset / Pre-fill -------

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setCategory('convite');
    setMessageText('');
    setErrors({});
  }, []);

  useEffect(() => {
    if (open && template) {
      setName(template.name);
      setDescription(template.description ?? '');
      setCategory(template.category);
      setMessageText(template.messageText);
      setErrors({});
    } else if (!open) {
      resetForm();
    }
  }, [open, template, resetForm]);

  // ------- Variable insertion -------

  const insertVariable = useCallback((variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessageText((prev) => prev + variable);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = messageText.slice(0, start);
    const after = messageText.slice(end);
    const newText = before + variable + after;

    if (newText.length <= MESSAGE_MAX) {
      setMessageText(newText);
      setErrors((prev) => ({ ...prev, messageText: undefined }));

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        const cursorPos = start + variable.length;
        textarea.selectionStart = cursorPos;
        textarea.selectionEnd = cursorPos;
        textarea.focus();
      });
    }
  }, [messageText]);

  // ------- Validation -------

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nome do template e obrigatorio';
    }

    if (!messageText.trim()) {
      newErrors.messageText = 'Texto da mensagem e obrigatorio';
    } else if (messageText.trim().length < MESSAGE_MIN) {
      newErrors.messageText = `Mensagem deve ter no minimo ${MESSAGE_MIN} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------- Submit -------

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const params: CreateWhatsAppTemplateParams = {
      name: name.trim(),
      description: description.trim() || undefined,
      messageText: messageText.trim(),
      category,
    };

    onSave(params);
  };

  const handleClose = () => {
    if (isSaving) return;
    onOpenChange(false);
  };

  // ------- Preview text -------

  const previewText = replaceVariablesWithExamples(messageText);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            {isEditMode ? 'Editar Template' : 'Novo Template WhatsApp'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Altere os dados do template de mensagem WhatsApp.'
              : 'Crie um template reutilizavel para mensagens WhatsApp.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
            {/* Left column — Form fields */}
            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template-name">
                    Nome <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      getCounterColor(name.length, NAME_MAX),
                    )}
                  >
                    {name.length}/{NAME_MAX}
                  </span>
                </div>
                <Input
                  id="template-name"
                  placeholder="Ex: Convite Gauge-Pro"
                  value={name}
                  onChange={(e) => {
                    if (e.target.value.length <= NAME_MAX) {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'template-name-error' : undefined}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p id="template-name-error" role="alert" className="text-xs text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="template-description">Descricao (opcional)</Label>
                <Textarea
                  id="template-description"
                  placeholder="Descreva brevemente quando usar este template..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="template-category">Categoria</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as WhatsAppTemplateCategory)}
                >
                  <SelectTrigger id="template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {whatsAppCategoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template-message">
                    Texto da Mensagem <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      getCounterColor(messageText.length, MESSAGE_MAX),
                    )}
                  >
                    {messageText.length}/{MESSAGE_MAX}
                  </span>
                </div>
                <Textarea
                  ref={textareaRef}
                  id="template-message"
                  placeholder="Ola {{nome}}, voce foi convidado para..."
                  rows={6}
                  value={messageText}
                  onChange={(e) => {
                    if (e.target.value.length <= MESSAGE_MAX) {
                      setMessageText(e.target.value);
                      setErrors((prev) => ({ ...prev, messageText: undefined }));
                    }
                  }}
                  aria-invalid={!!errors.messageText}
                  aria-describedby={errors.messageText ? 'template-message-error' : undefined}
                  className={cn(
                    'resize-none font-mono text-sm',
                    errors.messageText ? 'border-destructive' : '',
                  )}
                />
                {errors.messageText && (
                  <p id="template-message-error" role="alert" className="text-xs text-destructive">
                    {errors.messageText}
                  </p>
                )}
              </div>

              {/* Variable insertion buttons */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Inserir variavel</Label>
                <div className="flex flex-wrap gap-2">
                  {VARIABLES.map((v) => (
                    <Button
                      key={v.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(v.label)}
                      className="h-7 px-2.5 text-xs font-mono bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800 dark:hover:bg-cyan-900/40"
                    >
                      <Plus className="w-3 h-3 mr-1" aria-hidden="true" />
                      {v.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — Live Preview */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pre-visualizacao</Label>
              <WhatsAppMessagePreview
                message={previewText}
                recipientName="Joao Santos"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Salvando...' : isEditMode ? 'Salvar Alteracoes' : 'Criar Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
