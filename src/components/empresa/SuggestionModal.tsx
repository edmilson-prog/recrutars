/**
 * Suggestion Modal Component
 * PRD-039: Modal for editing and applying suggestions
 */

import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobSuggestion, BiasDetection, SuggestionSeverity } from '@/types/jobAnalyzer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface SuggestionModalProps {
  suggestion: JobSuggestion | null;
  biasDetections?: BiasDetection[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (value: string, suggestion: JobSuggestion) => void;
}

const SEVERITY_CONFIG: Record<SuggestionSeverity, {
  icon: React.ElementType;
  color: string;
  label: string;
}> = {
  critical: {
    icon: AlertCircle,
    color: 'text-red-600',
    label: 'Crítico',
  },
  important: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    label: 'Importante',
  },
  ok: {
    icon: CheckCircle2,
    color: 'text-green-600',
    label: 'Opcional',
  },
};

export function SuggestionModal({
  suggestion,
  biasDetections = [],
  open,
  onOpenChange,
  onApply,
}: SuggestionModalProps) {
  const [editedValue, setEditedValue] = useState('');
  const [copied, setCopied] = useState(false);

  // Reset edited value when suggestion changes
  useEffect(() => {
    if (suggestion?.suggestedValue) {
      setEditedValue(suggestion.suggestedValue);
    } else {
      setEditedValue('');
    }
    setCopied(false);
  }, [suggestion]);

  if (!suggestion) {
    return null;
  }

  const config = SEVERITY_CONFIG[suggestion.severity];
  const Icon = config.icon;

  // Filter bias detections related to this suggestion
  const relatedBias = suggestion.category === 'bias' ? biasDetections : [];

  const handleApply = () => {
    onApply(editedValue, suggestion);
    onOpenChange(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn('w-5 h-5', config.color)} />
            {suggestion.title}
          </DialogTitle>
          <DialogDescription>
            {suggestion.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Impact badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Impacto:</span>
            <span className={cn(
              'text-sm font-medium px-2 py-0.5 rounded',
              suggestion.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
              suggestion.severity === 'important' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
              'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
            )}>
              +{suggestion.impact} pontos
            </span>
          </div>

          {/* Current value if exists */}
          {suggestion.currentValue && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Valor atual:</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="whitespace-pre-wrap line-clamp-4">{suggestion.currentValue}</p>
              </div>
            </div>
          )}

          {/* Bias detections */}
          {relatedBias.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Termos detectados:</Label>
              <div className="space-y-2">
                {relatedBias.map((bias, index) => (
                  <div key={index} className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        "{bias.term}"
                      </span>
                      <span className="text-xs text-muted-foreground">
                        posição {bias.position}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Contexto: ...{bias.context}...
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Sugestão:</span>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {bias.suggestion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested value (editable) */}
          {suggestion.suggestedValue && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="suggestion-value" className="text-sm">
                  Texto sugerido (editável):
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="suggestion-value"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="min-h-[120px] text-sm"
                placeholder="Edite o texto antes de aplicar..."
              />
              <p className="text-xs text-muted-foreground">
                Você pode editar o texto acima antes de aplicar a sugestão.
              </p>
            </div>
          )}

          {/* Action explanation */}
          {suggestion.action && !suggestion.suggestedValue && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {suggestion.action === 'add' && 'Adicione esta informação ao formulário para melhorar a pontuação.'}
                {suggestion.action === 'edit' && 'Edite o campo correspondente para corrigir este problema.'}
                {suggestion.action === 'remove' && 'Considere remover ou reformular este conteúdo.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {suggestion.suggestedValue && (
            <Button
              type="button"
              onClick={handleApply}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Aplicar sugestão
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple bias fix modal
export function BiasFixModal({
  detection,
  open,
  onOpenChange,
  onApply,
}: {
  detection: BiasDetection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (original: string, replacement: string) => void;
}) {
  if (!detection) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Linguagem potencialmente enviesada
          </DialogTitle>
          <DialogDescription>
            O termo "{detection.term}" pode ser considerado discriminatório.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Contexto:</p>
            <p className="text-sm">...{detection.context}...</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div>
              <p className="text-sm text-muted-foreground">Substituir por:</p>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {detection.suggestion}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Ignorar
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(detection.term, detection.suggestion);
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Substituir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
