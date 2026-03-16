/**
 * BulkCampaignWizard
 * 3-step dialog wizard for sending bulk WhatsApp campaigns.
 *
 * Step 1 — Selecionar Audiência: choose a target audience
 * Step 2 — Compor Mensagem: compose or pick a template
 * Step 3 — Revisar e Enviar: review recipients and send
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ClipboardCheck,
  UserCheck,
  Building2,
  Check,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Users,
  Send,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { WhatsAppMessagePreview } from './WhatsAppMessagePreview';
import {
  usePendingGaugeProCandidates,
  useWhatsAppTemplates,
  useCheckWhatsAppNumbers,
  useSendWhatsAppBulk,
} from '@/hooks/useWhatsAppQuery';
import { supabase } from '@/lib/supabase';
import type {
  WhatsAppTemplate,
  WhatsAppBulkRecipient,
} from '@/types/whatsapp';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BulkCampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AudienceKey = 'pending_gauge_pro' | 'all_candidates' | 'all_companies';

interface AudienceOption {
  key: AudienceKey;
  label: string;
  description: string;
  icon: typeof ClipboardCheck;
}

interface RecipientStatus {
  phone: string;
  onWhatsApp: boolean | null; // null = not checked yet
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    key: 'pending_gauge_pro',
    label: 'Candidatos sem teste Gauge-Pro',
    description: 'Candidatos que ainda nao completaram o teste',
    icon: ClipboardCheck,
  },
  {
    key: 'all_candidates',
    label: 'Todos os candidatos',
    description: 'Candidatos ativos com telefone cadastrado',
    icon: UserCheck,
  },
  {
    key: 'all_companies',
    label: 'Todas as empresas',
    description: 'Empresas ativas com telefone cadastrado',
    icon: Building2,
  },
];

const VARIABLES = [
  { label: '{{nome}}', example: 'João Santos' },
  { label: '{{link}}', example: 'https://app.recrutars.com.br' },
] as const;

const MESSAGE_MIN = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

export function BulkCampaignWizard({
  open,
  onOpenChange,
}: BulkCampaignWizardProps) {
  // Wizard state
  const [step, setStep] = useState(1);

  // Step 1 — Audience
  const [selectedAudience, setSelectedAudience] = useState<AudienceKey | null>(null);
  const [recipients, setRecipients] = useState<WhatsAppBulkRecipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // Step 2 — Message
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageError, setMessageError] = useState('');

  // Step 3 — Review
  const [recipientStatuses, setRecipientStatuses] = useState<Map<string, boolean | null>>(new Map());
  const [hasCheckedNumbers, setHasCheckedNumbers] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hooks
  const { data: pendingCandidates = [], isLoading: loadingPending } = usePendingGaugeProCandidates();
  const { data: templates = [] } = useWhatsAppTemplates();
  const checkNumbersMutation = useCheckWhatsAppNumbers();
  const sendBulkMutation = useSendWhatsAppBulk();

  // ------- Audience counts -------

  const [allCandidatesCount, setAllCandidatesCount] = useState<number | null>(null);
  const [allCompaniesCount, setAllCompaniesCount] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    // Fetch counts for audiences with phone numbers
    const fetchCounts = async () => {
      const [candidatesResult, companiesResult] = await Promise.all([
        supabase
          .from('candidates')
          .select('id', { count: 'exact', head: true })
          .not('phone', 'is', null),
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true })
          .not('phone', 'is', null),
      ]);
      setAllCandidatesCount(candidatesResult.count ?? 0);
      setAllCompaniesCount(companiesResult.count ?? 0);
    };

    fetchCounts();
  }, [open]);

  const getAudienceCount = (key: AudienceKey): number | null => {
    switch (key) {
      case 'pending_gauge_pro':
        return loadingPending ? null : pendingCandidates.length;
      case 'all_candidates':
        return allCandidatesCount;
      case 'all_companies':
        return allCompaniesCount;
    }
  };

  // ------- Load recipients for selected audience -------

  const loadRecipients = useCallback(async (audience: AudienceKey) => {
    setLoadingRecipients(true);

    try {
      let result: WhatsAppBulkRecipient[] = [];

      switch (audience) {
        case 'pending_gauge_pro': {
          result = pendingCandidates.map((c) => ({
            phone: c.phone,
            name: c.name,
            id: c.id,
            type: 'candidate' as const,
          }));
          break;
        }
        case 'all_candidates': {
          const { data } = await supabase
            .from('candidates')
            .select('id, profile_id, phone')
            .not('phone', 'is', null);

          if (data) {
            const profileIds = data.map((c) => c.profile_id).filter(Boolean);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, name')
              .in('id', profileIds);

            const profileMap = new Map(profiles?.map((p) => [p.id, p.name]) ?? []);
            result = data.map((c) => ({
              phone: c.phone!,
              name: profileMap.get(c.profile_id) ?? 'Candidato',
              id: c.id,
              type: 'candidate' as const,
            }));
          }
          break;
        }
        case 'all_companies': {
          const { data } = await supabase
            .from('companies')
            .select('id, profile_id, phone, trade_name')
            .not('phone', 'is', null);

          if (data) {
            result = data.map((c) => ({
              phone: c.phone!,
              name: c.trade_name ?? 'Empresa',
              id: c.id,
              type: 'company' as const,
            }));
          }
          break;
        }
      }

      setRecipients(result);
    } finally {
      setLoadingRecipients(false);
    }
  }, [pendingCandidates]);

  // ------- Reset -------

  const resetWizard = useCallback(() => {
    setStep(1);
    setSelectedAudience(null);
    setRecipients([]);
    setLoadingRecipients(false);
    setSelectedTemplateId('');
    setMessageText('');
    setMessageError('');
    setRecipientStatuses(new Map());
    setHasCheckedNumbers(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetWizard();
    }
  }, [open, resetWizard]);

  // ------- Template selection -------

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    if (id && id !== 'none') {
      const tmpl = templates.find((t: WhatsAppTemplate) => t.id === id);
      if (tmpl) {
        setMessageText(tmpl.messageText);
        setMessageError('');
      }
    }
  };

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
    setMessageText(before + variable + after);
    setMessageError('');

    requestAnimationFrame(() => {
      const cursorPos = start + variable.length;
      textarea.selectionStart = cursorPos;
      textarea.selectionEnd = cursorPos;
      textarea.focus();
    });
  }, [messageText]);

  // ------- Navigation -------

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return selectedAudience !== null;
      case 2:
        return messageText.trim().length >= MESSAGE_MIN;
      case 3:
        return recipients.length > 0 && !sendBulkMutation.isPending;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (selectedAudience) {
        await loadRecipients(selectedAudience);
      }
      setStep(2);
    } else if (step === 2) {
      if (messageText.trim().length < MESSAGE_MIN) {
        setMessageError(`Mensagem deve ter no minimo ${MESSAGE_MIN} caracteres`);
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ------- Check numbers -------

  const handleCheckNumbers = async () => {
    const phones = recipients.map((r) => r.phone);
    const result = await checkNumbersMutation.mutateAsync(phones);

    // result is expected to be an array of { phone, exists }
    const statusMap = new Map<string, boolean | null>();
    if (Array.isArray(result)) {
      for (const item of result) {
        statusMap.set(item.phone, item.exists);
      }
    }
    setRecipientStatuses(statusMap);
    setHasCheckedNumbers(true);
  };

  // ------- Send campaign -------

  const handleSend = async () => {
    await sendBulkMutation.mutateAsync({
      recipients,
      text: messageText.trim(),
      templateId: selectedTemplateId && selectedTemplateId !== 'none' ? selectedTemplateId : undefined,
    });
    onOpenChange(false);
  };

  // ------- Computed values -------

  const invalidCount = useMemo(() => {
    if (!hasCheckedNumbers) return 0;
    let count = 0;
    recipientStatuses.forEach((v) => {
      if (v === false) count++;
    });
    return count;
  }, [hasCheckedNumbers, recipientStatuses]);

  const selectedAudienceLabel = AUDIENCE_OPTIONS.find((o) => o.key === selectedAudience)?.label ?? '';
  const selectedTemplateName = templates.find((t: WhatsAppTemplate) => t.id === selectedTemplateId)?.name;
  const previewText = replaceVariablesWithExamples(messageText);

  const handleClose = () => {
    if (sendBulkMutation.isPending) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            Nova Campanha WhatsApp
          </DialogTitle>
          <DialogDescription>
            Envie mensagens em lote para um grupo de destinatários.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 py-2" aria-label="Progresso do assistente">
          {[1, 2, 3].map((s, idx) => {
            const isActive = step === s;
            const isCompleted = step > s;
            const labels = ['Audiência', 'Mensagem', 'Enviar'];

            return (
              <div key={s} className="flex items-center">
                {idx > 0 && (
                  <div
                    className={cn(
                      'w-8 sm:w-12 h-0.5 transition-colors',
                      isCompleted || isActive ? 'bg-primary' : 'bg-muted',
                    )}
                    aria-hidden="true"
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      isActive && 'bg-primary text-primary-foreground',
                      isCompleted && 'bg-primary/20 text-primary',
                      !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      s
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {labels[idx]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <ScrollArea className="max-h-[60vh] pr-3">
          <AnimatePresence mode="wait">
            {/* ============ Step 1 — Audience ============ */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <Label className="text-sm font-medium">Selecione a audiencia</Label>

                <div className="space-y-3">
                  {AUDIENCE_OPTIONS.map((option) => {
                    const isSelected = selectedAudience === option.key;
                    const count = getAudienceCount(option.key);

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSelectedAudience(option.key)}
                        className={cn(
                          'w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all text-left',
                          isSelected
                            ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20'
                            : 'bg-background border-border hover:bg-muted/50',
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                            isSelected
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <option.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium',
                            isSelected ? 'text-primary' : 'text-foreground',
                          )}>
                            {option.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {option.description}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'shrink-0 tabular-nums',
                            isSelected && 'bg-primary/20 text-primary',
                          )}
                        >
                          {count === null ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            count
                          )}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ============ Step 2 — Compose ============ */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Template selector */}
                <div className="space-y-1.5">
                  <Label>Template (opcional)</Label>
                  <Select
                    value={selectedTemplateId || 'none'}
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Texto livre</SelectItem>
                      {templates.map((t: WhatsAppTemplate) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message text */}
                <div className="space-y-1.5">
                  <Label htmlFor="campaign-message">
                    Mensagem <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    ref={textareaRef}
                    id="campaign-message"
                    placeholder="Digite a mensagem da campanha..."
                    rows={5}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      setMessageError('');
                    }}
                    aria-invalid={!!messageError}
                    aria-describedby={messageError ? 'campaign-message-error' : undefined}
                    className={cn(
                      'resize-none font-mono text-sm',
                      messageError ? 'border-destructive' : '',
                    )}
                  />
                  {messageError && (
                    <p id="campaign-message-error" role="alert" className="text-xs text-destructive">
                      {messageError}
                    </p>
                  )}
                </div>

                {/* Variable insertion */}
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

                {/* Preview */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Pré-visualização</Label>
                  <WhatsAppMessagePreview
                    message={previewText}
                    recipientName="João Santos"
                  />
                </div>
              </motion.div>
            )}

            {/* ============ Step 3 — Review & Send ============ */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Summary card */}
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Resumo da campanha</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Audiência</p>
                      <p className="font-medium text-foreground">{selectedAudienceLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Destinatarios</p>
                      <p className="font-medium text-foreground">{recipients.length}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Template</p>
                      <p className="font-medium text-foreground">
                        {selectedTemplateName ?? 'Texto livre'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Check numbers button */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCheckNumbers}
                    disabled={checkNumbersMutation.isPending || hasCheckedNumbers}
                  >
                    {checkNumbersMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : hasCheckedNumbers ? (
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                    ) : (
                      <Users className="w-4 h-4 mr-2" />
                    )}
                    {checkNumbersMutation.isPending
                      ? 'Verificando...'
                      : hasCheckedNumbers
                        ? 'Números verificados'
                        : 'Verificar numeros'}
                  </Button>
                  {hasCheckedNumbers && invalidCount > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                      <span className="text-xs font-medium">
                        {invalidCount} numero{invalidCount !== 1 ? 's' : ''} não encontrado{invalidCount !== 1 ? 's' : ''} no WhatsApp
                      </span>
                    </div>
                  )}
                </div>

                {/* Recipients list */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Destinatarios ({recipients.length})
                  </Label>
                  <div className="rounded-lg border max-h-[300px] overflow-y-auto">
                    {recipients.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          Nenhum destinatario encontrado
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {recipients.map((recipient) => {
                          const status = recipientStatuses.get(recipient.phone);
                          return (
                            <div
                              key={recipient.id}
                              className="flex items-center gap-3 px-3 py-2 text-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {recipient.name}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {recipient.phone}
                                </p>
                              </div>
                              {hasCheckedNumbers && (
                                <div className="shrink-0">
                                  {status === true ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-label="Número encontrado no WhatsApp" />
                                  ) : status === false ? (
                                    <XCircle className="w-4 h-4 text-red-500" aria-label="Numero não encontrado no WhatsApp" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-muted" aria-label="Status desconhecido" />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Send progress */}
                {sendBulkMutation.isPending && (
                  <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Enviando campanha...</p>
                      <p className="text-xs text-muted-foreground">
                        Aguarde enquanto as mensagens sao processadas.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 1 ? handleClose : handleBack}
            disabled={sendBulkMutation.isPending}
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext() || loadingRecipients}
            >
              {loadingRecipients ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Próximo
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSend}
              disabled={!canGoNext()}
            >
              {sendBulkMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {sendBulkMutation.isPending ? 'Enviando...' : 'Enviar Campanha'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
