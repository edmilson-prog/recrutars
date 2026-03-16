/**
 * CreateNotificationDialog
 * Dialog for creating and sending admin notifications.
 * Supports template selection, target type, scheduling, and form validation.
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Send, Clock, Users, UserCheck, Building2, User, Loader2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { notificationTemplates } from '@/data/notificationTemplates';
import type {
  CreateNotificationParams,
  NotificationCategory,
  NotificationPriority,
  NotificationTargetType,
} from '@/types/notificationSends';

interface CreateNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<CreateNotificationParams>;
  onSend: (params: CreateNotificationParams) => void;
  isSending: boolean;
}

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 500;
const DESCRIPTION_MIN = 10;

const targetOptions: {
  value: NotificationTargetType;
  label: string;
  icon: typeof Users;
}[] = [
  { value: 'all_users', label: 'Todos os usuarios', icon: Users },
  { value: 'all_candidates', label: 'Todos os candidatos', icon: UserCheck },
  { value: 'all_companies', label: 'Todas as empresas', icon: Building2 },
  { value: 'specific_user', label: 'Usuario especifico', icon: User },
];

function getCounterColor(length: number, max: number): string {
  const ratio = length / max;
  if (ratio >= 0.95) return 'text-red-500';
  if (ratio >= 0.8) return 'text-amber-500';
  return 'text-muted-foreground';
}

interface FormErrors {
  title?: string;
  description?: string;
  targetType?: string;
  targetUserId?: string;
}

export function CreateNotificationDialog({
  open,
  onOpenChange,
  defaultValues,
  onSend,
  isSending,
}: CreateNotificationDialogProps) {
  const [templateId, setTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('informativo');
  const [priority, setPriority] = useState<NotificationPriority>('media');
  const [targetType, setTargetType] = useState<NotificationTargetType | ''>('');
  const [targetUserId, setTargetUserId] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = useCallback(() => {
    setTemplateId('');
    setTitle('');
    setDescription('');
    setCategory('informativo');
    setPriority('media');
    setTargetType('');
    setTargetUserId('');
    setScheduleEnabled(false);
    setScheduledAt('');
    setErrors({});
  }, []);

  // Apply default values when dialog opens
  useEffect(() => {
    if (open && defaultValues) {
      setTitle(defaultValues.title ?? '');
      setDescription(defaultValues.description ?? '');
      setCategory(defaultValues.category ?? 'informativo');
      setPriority(defaultValues.priority ?? 'media');
      setTargetType(defaultValues.targetType ?? '');
      setTargetUserId(defaultValues.targetUserId ?? '');
      setTemplateId(defaultValues.templateId ?? '');
      if (defaultValues.scheduledAt) {
        setScheduleEnabled(true);
        setScheduledAt(defaultValues.scheduledAt);
      }
    }
  }, [open, defaultValues]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  // Template selection handler
  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    if (id === 'none') {
      return;
    }
    const template = notificationTemplates.find((t) => t.id === id);
    if (template) {
      setTitle(template.title);
      setDescription(template.description);
      setCategory(template.category);
      setPriority(template.priority);
      setErrors({});
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Titulo e obrigatorio';
    }

    if (!description.trim()) {
      newErrors.description = 'Mensagem e obrigatoria';
    } else if (description.trim().length < DESCRIPTION_MIN) {
      newErrors.description = `Mensagem deve ter no minimo ${DESCRIPTION_MIN} caracteres`;
    }

    if (!targetType) {
      newErrors.targetType = 'Selecione o destinatario';
    }

    if (targetType === 'specific_user' && !targetUserId.trim()) {
      newErrors.targetUserId = 'Informe o usuario';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const params: CreateNotificationParams = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      targetType: targetType as NotificationTargetType,
      targetUserId: targetType === 'specific_user' ? targetUserId.trim() : undefined,
      scheduledAt: scheduleEnabled && scheduledAt ? scheduledAt : undefined,
      templateId: templateId && templateId !== 'none' ? templateId : undefined,
    };

    onSend(params);
  };

  const handleClose = () => {
    if (isSending) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            Nova Notificacao
          </DialogTitle>
          <DialogDescription>
            Crie e envie uma notificacao para os usuarios da plataforma.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-3">
          <div className="space-y-5 pb-1">
            {/* Template selector */}
            <div className="space-y-1.5">
              <Label>Template</Label>
              <Select value={templateId || 'none'} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (personalizado)</SelectItem>
                  {notificationTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destinatarios */}
            <div className="space-y-2">
              <Label>Destinatarios</Label>
              <div className="grid grid-cols-2 gap-2">
                {targetOptions.map((option) => {
                  const isSelected = targetType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setTargetType(option.value);
                        setErrors((prev) => ({ ...prev, targetType: '', targetUserId: '' }));
                        if (option.value !== 'specific_user') {
                          setTargetUserId('');
                        }
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-left',
                        isSelected
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-background text-muted-foreground border-border hover:bg-muted/50',
                      )}
                    >
                      <option.icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-medium leading-tight">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.targetType && (
                <p className="text-xs text-destructive">{errors.targetType}</p>
              )}

              {/* Specific user search */}
              <AnimatePresence>
                {targetType === 'specific_user' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 pt-2">
                      <Label htmlFor="target-user-search">Buscar usuario</Label>
                      <Input
                        id="target-user-search"
                        placeholder="Nome ou email do usuario..."
                        value={targetUserId}
                        onChange={(e) => {
                          setTargetUserId(e.target.value);
                          setErrors((prev) => ({ ...prev, targetUserId: '' }));
                        }}
                        className={errors.targetUserId ? 'border-destructive' : ''}
                      />
                      {errors.targetUserId && (
                        <p className="text-xs text-destructive">{errors.targetUserId}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category + Priority side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as NotificationCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informativo">Informativo</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="alerta">Alerta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as NotificationPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Titulo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="notif-title">Titulo</Label>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    getCounterColor(title.length, TITLE_MAX),
                  )}
                >
                  {title.length}/{TITLE_MAX}
                </span>
              </div>
              <Input
                id="notif-title"
                placeholder="Titulo da notificacao"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= TITLE_MAX) {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: '' }));
                  }
                }}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Mensagem */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="notif-description">Mensagem</Label>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    getCounterColor(description.length, DESCRIPTION_MAX),
                  )}
                >
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <Textarea
                id="notif-description"
                placeholder="Conteudo da notificacao..."
                rows={4}
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= DESCRIPTION_MAX) {
                    setDescription(e.target.value);
                    setErrors((prev) => ({ ...prev, description: '' }));
                  }
                }}
                className={cn(
                  'resize-none',
                  errors.description ? 'border-destructive' : '',
                )}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Schedule toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="schedule-switch" className="cursor-pointer">
                    Agendar para depois
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Defina uma data e hora para o envio automatico.
                  </p>
                </div>
                <Switch
                  id="schedule-switch"
                  checked={scheduleEnabled}
                  onCheckedChange={(checked) => {
                    setScheduleEnabled(checked);
                    if (!checked) setScheduledAt('');
                  }}
                />
              </div>

              <AnimatePresence>
                {scheduleEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 pt-1">
                      <Label htmlFor="schedule-date">Data e hora</Label>
                      <Input
                        id="schedule-date"
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : scheduleEnabled ? (
              <Clock className="w-4 h-4 mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSending
              ? 'Enviando...'
              : scheduleEnabled
                ? 'Agendar Envio'
                : 'Enviar Agora'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
