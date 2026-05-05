/**
 * PromptEditor — wrapper de edição reforçada para prompts de IA.
 *
 * Fluxo:
 * 1. Estado inicial: textarea readonly mostrando o valor salvo. Botões: "Editar",
 *    "Ver histórico".
 * 2. Ao clicar "Editar": AlertDialog de pré-edição com advertência sobre o impacto.
 *    Confirmar → habilita o textarea + botões "Restaurar padrão", "Salvar", "Descartar".
 * 3. Ao clicar "Salvar": abre PromptEditConfirmDialog com diff + caixa "CONFIRMAR".
 * 4. Após salvar: textarea volta a readonly, modificações persistidas.
 * 5. Histórico abre via PromptHistorySheet — pode pré-popular o editor com versão antiga.
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, FileEdit, History, Loader2, RotateCcw, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { ConfigField } from '@/types/settings';
import { PromptEditConfirmDialog } from './PromptEditConfirmDialog';
import { PromptHistorySheet } from './PromptHistorySheet';

interface PromptEditorProps {
  field: ConfigField;
  value: string;
  panel: string;
  categoryKey: string;
  subcategoryKey: string;
  /** Persiste o novo valor atomicamente em system_settings + grava em settings_history. */
  onSave: (value: string) => Promise<void>;
}

export function PromptEditor({
  field,
  value,
  panel,
  categoryKey,
  subcategoryKey,
  onSave,
}: PromptEditorProps) {
  const [draft, setDraft] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRestoreDefault, setShowRestoreDefault] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sincroniza o draft com o valor remoto enquanto não está editando
  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [value, isEditing]);

  const isDirty = draft !== value;
  const defaultValue = (field.defaultValue as string) ?? '';
  const maxLen = field.validation?.maxLength;
  const minLen = field.validation?.minLength;
  const tooShort = minLen !== undefined && draft.trim().length < minLen;
  const tooLong = maxLen !== undefined && draft.length > maxLen;

  const handleStartEdit = () => setShowWarning(true);

  const handleConfirmStartEdit = () => {
    setShowWarning(false);
    setIsEditing(true);
  };

  const handleRequestSave = () => {
    if (tooShort || tooLong || !isDirty) return;
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      await onSave(draft);
      toast.success('Prompt salvo com sucesso');
      setShowConfirm(false);
      setIsEditing(false);
    } catch (err) {
      toast.error(`Falha ao salvar: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefault = () => {
    setDraft(defaultValue);
    setShowRestoreDefault(false);
    toast.info('Texto do prompt-fábrica carregado no editor. Revise e clique em "Salvar" para aplicar.');
  };

  const handleDiscard = () => {
    setDraft(value);
    setIsEditing(false);
    setShowDiscard(false);
  };

  const handleAttemptDiscard = () => {
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    setShowDiscard(true);
  };

  const handleRestoreFromHistory = (oldValue: string) => {
    if (!isEditing) {
      setShowWarning(true);
    }
    setDraft(oldValue);
    toast.info('Versão anterior carregada no editor. Revise e clique em "Salvar" para aplicar.');
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <Label htmlFor={field.key} className="text-sm font-semibold flex items-center gap-2">
            {field.name}
            {field.validation?.required && <span className="text-destructive">*</span>}
            {isEditing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                <FileEdit className="h-3 w-3" />
                Editando
              </span>
            )}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowHistory(true)}
          >
            <History className="h-3.5 w-3.5" />
            Histórico
          </Button>
          {!isEditing ? (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={handleStartEdit}
            >
              <FileEdit className="h-3.5 w-3.5" />
              Editar prompt
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowRestoreDefault(true)}
                disabled={draft === defaultValue}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar padrão
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleAttemptDiscard}
                disabled={saving}
              >
                <X className="h-3.5 w-3.5" />
                Descartar
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={handleRequestSave}
                disabled={!isDirty || tooShort || tooLong || saving}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      <Textarea
        id={field.key}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        readOnly={!isEditing}
        rows={isEditing ? 18 : 10}
        className={`font-mono text-xs leading-relaxed resize-y ${
          isEditing ? 'border-amber-300 dark:border-amber-700/60 bg-background' : 'bg-muted/40 cursor-default'
        }`}
        spellCheck={false}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div>
          {tooShort && (
            <span className="text-destructive">
              Mínimo de {minLen} caracteres exigido (atual: {draft.trim().length}).
            </span>
          )}
          {tooLong && (
            <span className="text-destructive">
              Máximo de {maxLen} caracteres excedido (atual: {draft.length}).
            </span>
          )}
        </div>
        {maxLen && (
          <span>
            {draft.length}/{maxLen} caracteres
          </span>
        )}
      </div>

      {/* Advertência de pré-edição */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Você está prestes a editar um prompt usado pela IA
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 pt-2">
                <p>Mudanças no prompt afetam diretamente a qualidade e a estrutura das análises geradas. Edite com atenção:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>
                    Se o prompt define uma <strong>estrutura obrigatória de seções</strong>{' '}
                    (ex.: títulos <code className="rounded bg-muted px-1">##</code>), preserve essas seções —
                    o front-end pode depender disso para renderizar.
                  </li>
                  <li>
                    Não remova <strong>regras críticas</strong> (ex.: "responda em português", "não invente fatos").
                  </li>
                  <li>
                    Mudanças entram em vigor imediatamente para todas as próximas análises geradas pela plataforma.
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStartEdit}>
              Entendi, vou editar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de restauração do padrão */}
      <AlertDialog open={showRestoreDefault} onOpenChange={setShowRestoreDefault}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar texto do prompt-fábrica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação carrega no editor o prompt original definido pelo sistema —
              substituindo qualquer alteração não salva. Você ainda precisa clicar em
              "Salvar" e passar pela confirmação para aplicar de fato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDefault}>
              Carregar padrão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de descarte */}
      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas neste prompt. Ao descartar, o texto
              voltará para a última versão salva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>
              Descartar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de dupla confirmação */}
      <PromptEditConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        fieldName={field.name}
        previousValue={value}
        newValue={draft}
        onConfirm={handleConfirmSave}
        saving={saving}
      />

      {/* Sheet de histórico */}
      <PromptHistorySheet
        open={showHistory}
        onOpenChange={setShowHistory}
        panel={panel}
        categoryKey={categoryKey}
        subcategoryKey={subcategoryKey}
        fieldKey={field.key}
        fieldName={field.name}
        onRestoreVersion={handleRestoreFromHistory}
      />
    </div>
  );
}
