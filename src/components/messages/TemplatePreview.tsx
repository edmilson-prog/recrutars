/**
 * Template Preview Component
 * PRD-041: Mensagens Personalizadas
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MessageTemplate, MessageTone, TemplateVariableData } from '@/types/messageTemplates';
import { VARIABLE_LABELS } from '@/types/messageTemplates';
import { parseVariables, validateVariables } from '@/lib/messageTemplates';

interface TemplatePreviewProps {
  template: MessageTemplate | null;
  tone: MessageTone;
  variableData: Partial<TemplateVariableData>;
  className?: string;
}

export function TemplatePreview({
  template,
  tone,
  variableData,
  className,
}: TemplatePreviewProps) {
  // Get parsed content
  const parsedContent = useMemo(() => {
    if (!template) return '';
    const rawContent = template.content[tone];
    return parseVariables(rawContent, variableData);
  }, [template, tone, variableData]);

  // Validate variables
  const validation = useMemo(() => {
    if (!template) return { isValid: true, missingVariables: [] as string[] };
    const rawContent = template.content[tone];
    return validateVariables(rawContent, variableData);
  }, [template, tone, variableData]);

  // Highlight remaining variables in preview
  const highlightedContent = useMemo(() => {
    if (!parsedContent) return '';

    // Replace remaining {{variables}} with highlighted spans
    return parsedContent.replace(
      /\{\{(\w+)\}\}/g,
      '<span class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded text-yellow-800 dark:text-yellow-200">{{$1}}</span>'
    );
  }, [parsedContent]);

  if (!template) {
    return (
      <div className={cn('rounded-xl border border-dashed border-muted p-8 text-center', className)}>
        <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Selecione um template para visualizar a prévia
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border border-border bg-card', className)}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">Prévia da Mensagem</span>
        </div>
        {validation.isValid ? (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
            <CheckCircle2 className="w-3 h-3" />
            Completa
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-600">
            <AlertCircle className="w-3 h-3" />
            {validation.missingVariables.length} campo(s) pendente(s)
          </Badge>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-[300px]">
        <div className="p-4">
          {/* Subject if exists */}
          {template.subject && (
            <div className="mb-4 pb-4 border-b border-border">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Assunto
              </label>
              <p
                className="text-foreground font-medium mt-1"
                dangerouslySetInnerHTML={{
                  __html: parseVariables(template.subject, variableData).replace(
                    /\{\{(\w+)\}\}/g,
                    '<span class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded text-yellow-800 dark:text-yellow-200">{{$1}}</span>'
                  ),
                }}
              />
            </div>
          )}

          {/* Message body */}
          <div
            className="text-foreground whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>
      </ScrollArea>

      {/* Missing variables */}
      {!validation.isValid && validation.missingVariables.length > 0 && (
        <div className="p-4 border-t border-border bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            Preencha os campos destacados:
          </p>
          <div className="flex flex-wrap gap-2">
            {validation.missingVariables.map((variable) => (
              <Badge key={variable} variant="secondary" className="text-xs">
                {VARIABLE_LABELS[variable as keyof typeof VARIABLE_LABELS] || variable}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
