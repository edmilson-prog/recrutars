/**
 * ConfigContent Component
 * PRD-045: Área de conteúdo com campos editáveis
 * PRD-080: Custom component support for subcategories
 */

import { lazy, Suspense, useState } from 'react';
import { RotateCcw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ConfigSection } from './ConfigSection';
import { PromptEditor } from '@/components/admin/prompts/PromptEditor';
import type { ConfigCategory, ConfigPanel, ConfigSubcategory } from '@/types/settings';

const LLMProvidersPanel = lazy(() => import('./custom/LLMProvidersPanel'));
const ChatbotDashboard = lazy(() => import('./custom/ChatbotDashboard'));
const LLMTestPlayground = lazy(() => import('./custom/LLMTestPlayground'));
const EvolutionPanel = lazy(() => import('./custom/EvolutionPanel'));
const ResendPanel = lazy(() => import('./custom/ResendPanel'));
const StripePanel = lazy(() => import('./custom/StripePanel'));

interface ConfigContentProps {
  category: ConfigCategory;
  subcategory: ConfigSubcategory;
  values: Record<string, unknown>;
  panel: ConfigPanel;
  onValueChange: (fieldKey: string, value: unknown) => void;
  onSave: () => void;
  onRestoreDefaults: () => void;
  onNavigate?: (categoryKey: string, subcategoryKey: string) => void;
  /** Atomic single-field save — used by reinforced flows like PromptEditor. */
  onSaveField?: (fieldKey: string, value: unknown) => Promise<void>;
}

export function ConfigContent({
  category,
  subcategory,
  values,
  panel,
  onValueChange,
  onSave,
  onRestoreDefaults,
  onNavigate,
  onSaveField,
}: ConfigContentProps) {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const handleRestoreDefaults = () => {
    onRestoreDefaults();
    setShowRestoreDialog(false);
  };

  // Custom component rendering
  if (subcategory.customComponent === 'LLMProvidersPanel') {
    return (
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <LLMProvidersPanel
          values={values}
          onValueChange={onValueChange}
          onSave={onSave}
        />
      </Suspense>
    );
  }

  if (subcategory.customComponent === 'ChatbotDashboard') {
    return (
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <ChatbotDashboard
          values={values}
          onValueChange={onValueChange}
          onSave={onSave}
        />
      </Suspense>
    );
  }

  if (subcategory.customComponent === 'LLMTestPlayground') {
    return (
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <LLMTestPlayground
          values={values}
          onValueChange={onValueChange}
          onSave={onSave}
        />
      </Suspense>
    );
  }

  if (subcategory.customComponent === 'EvolutionPanel') {
    return (
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <EvolutionPanel
          values={values}
          onValueChange={onValueChange}
          onSave={onSave}
        />
      </Suspense>
    );
  }

  if (subcategory.customComponent === 'ResendPanel') {
    return (
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <ResendPanel
          values={values}
          onValueChange={onValueChange}
          onSave={onSave}
        />
      </Suspense>
    );
  }

  if (subcategory.customComponent === 'StripePanel') {
    return (
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <StripePanel
          values={values}
          onValueChange={onValueChange}
          onSave={onSave}
        />
      </Suspense>
    );
  }

  // Campos ordenados
  const sortedFields = [...subcategory.fields].sort((a, b) => a.order - b.order);

  // Reinforced editor for AI prompts (each field has its own warning + double-confirm + history flow)
  const isAIPromptsSubcategory =
    category.key === 'ai' && subcategory.key === 'prompts' && !!onSaveField;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {category.name} - {subcategory.name}
            </CardTitle>
            <CardDescription>{subcategory.description}</CardDescription>
          </div>
          {!isAIPromptsSubcategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRestoreDialog(true)}
              className="gap-2 shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Restaurar Padrao</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAIPromptsSubcategory ? (
          <>
            <div className="rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-200">
              <strong>Edição protegida.</strong> Cada prompt possui seu próprio fluxo de
              edição com advertência, dupla confirmação ao salvar e histórico
              completo de alterações. Cada salvamento é independente — não existe um
              botão único de "Salvar Alterações" para esta seção.
            </div>
            {sortedFields.map((field) => (
              <PromptEditor
                key={field.key}
                field={field}
                value={String(values[field.key] ?? field.defaultValue ?? '')}
                panel={panel}
                categoryKey={category.key}
                subcategoryKey={subcategory.key}
                onSave={(value) => onSaveField!(field.key, value)}
              />
            ))}
          </>
        ) : (
          <>
            {sortedFields.map((field) => (
              <ConfigSection
                key={field.key}
                field={field}
                value={values[field.key] ?? field.defaultValue}
                onChange={(value) => onValueChange(field.key, value)}
                onNavigate={field.link && onNavigate ? (link) => {
                  const [catKey, subKey] = link.split(':');
                  if (catKey && subKey) onNavigate(catKey, subKey);
                } : undefined}
              />
            ))}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onSave} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Alteracoes
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Dialog de confirmação para restaurar padrões */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar valores padrao?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao vai restaurar todos os campos desta secao para seus
              valores padrao. As alteracoes nao salvas serao perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDefaults}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
