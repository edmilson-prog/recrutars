/**
 * Gauge-Pro Adjectives Admin Page
 *
 * CRUD interface for managing the 100 behavioral test adjectives
 * organized by 5 dimensions (D1–D5), each with high/low polarity.
 */

import { useState, useMemo } from 'react';
import {
  Lock,
  Type,
  CheckCircle,
  XCircle,
  Layers,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { AdjectiveWord, GaugeProDimension } from '@/types/gaugePro';
import { DIMENSION_NAMES } from '@/types/gaugePro';
import {
  useGaugeProAdminWords,
  useUpdateWord,
  useToggleWordActive,
} from '@/hooks/useGaugeProAdminQuery';

// ─── Dimension metadata ──────────────────────────────────────────

const DIMENSION_INFO: Record<
  GaugeProDimension,
  { name: string; shortName: string; color: string }
> = {
  D1: { name: 'Dominância/Assertividade', shortName: 'Dominância', color: 'text-red-500' },
  D2: { name: 'Sociabilidade/Extroversão', shortName: 'Sociabilidade', color: 'text-amber-500' },
  D3: { name: 'Ritmo/Paciência', shortName: 'Ritmo', color: 'text-green-500' },
  D4: { name: 'Conformidade/Estrutura', shortName: 'Conformidade', color: 'text-blue-500' },
  D5: { name: 'Orientação Relacional', shortName: 'Relacional', color: 'text-purple-500' },
};

const ALL_DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

// ─── Component ───────────────────────────────────────────────────

export default function GaugeProAdjectives() {
  const { data: words = [], isLoading, error } = useGaugeProAdminWords();
  const updateWordMutation = useUpdateWord();
  const toggleWordActiveMutation = useToggleWordActive();

  // Local state
  const [showInactive, setShowInactive] = useState(false);
  const [editingWord, setEditingWord] = useState<AdjectiveWord | null>(null);
  const [editText, setEditText] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Derived data ────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = words.length;
    const active = words.filter((w) => w.isActive !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [words]);

  const wordsByDimension = useMemo(() => {
    const grouped: Record<GaugeProDimension, AdjectiveWord[]> = {
      D1: [],
      D2: [],
      D3: [],
      D4: [],
      D5: [],
    };
    for (const word of words) {
      if (grouped[word.dimension]) {
        grouped[word.dimension].push(word);
      }
    }
    return grouped;
  }, [words]);

  // ─── Handlers ────────────────────────────────────────────────

  const openEditDialog = (word: AdjectiveWord) => {
    setEditingWord(word);
    setEditText(word.text);
    setEditIsActive(word.isActive !== false);
  };

  const closeEditDialog = () => {
    setEditingWord(null);
    setEditText('');
    setEditIsActive(true);
    setIsSaving(false);
  };

  const handleSave = () => {
    if (!editingWord) return;

    setIsSaving(true);

    const hasTextChanged = editText.trim() !== editingWord.text;
    const hasStatusChanged = editIsActive !== (editingWord.isActive !== false);

    if (!hasTextChanged && !hasStatusChanged) {
      toast.info('Nenhuma alteração detectada.');
      setIsSaving(false);
      return;
    }

    const updateData: { text?: string; isActive?: boolean } = {};
    if (hasTextChanged) updateData.text = editText.trim();
    if (hasStatusChanged) updateData.isActive = editIsActive;

    updateWordMutation.mutate(
      { id: editingWord.id, data: updateData },
      {
        onSuccess: () => {
          toast.success(`Adjetivo "${editText.trim()}" atualizado com sucesso.`);
          closeEditDialog();
        },
        onError: () => {
          toast.error('Erro ao atualizar adjetivo. Tente novamente.');
          setIsSaving(false);
        },
      },
    );
  };

  // ─── Filter logic ────────────────────────────────────────────

  const filterWords = (dimensionWords: AdjectiveWord[], polarity: 'high' | 'low') => {
    const polarityFiltered = dimensionWords.filter((w) => w.polarity === polarity);
    if (showInactive) return polarityFiltered;
    return polarityFiltered.filter((w) => w.isActive !== false);
  };

  // ─── Render helpers ──────────────────────────────────────────

  const renderWordPill = (word: AdjectiveWord) => {
    const isInactive = word.isActive === false;
    return (
      <button
        key={word.id}
        type="button"
        onClick={() => openEditDialog(word)}
        className={cn(
          'cursor-pointer rounded-lg border p-2 text-sm transition-colors',
          'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          word.polarity === 'high'
            ? 'border-l-[3px] border-l-green-400/60'
            : 'border-l-[3px] border-l-blue-400/60',
          isInactive && 'opacity-50 line-through',
        )}
      >
        {word.text}
      </button>
    );
  };

  const renderPolarityColumn = (
    dimensionWords: AdjectiveWord[],
    polarity: 'high' | 'low',
    label: string,
  ) => {
    const filtered = filterWords(dimensionWords, polarity);
    return (
      <div className="flex-1 space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {showInactive
              ? 'Nenhum adjetivo nesta polaridade.'
              : 'Nenhum adjetivo ativo nesta polaridade.'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map(renderWordPill)}
          </div>
        )}
      </div>
    );
  };

  const renderDimensionCount = (dimension: GaugeProDimension) => {
    const dimWords = wordsByDimension[dimension];
    if (showInactive) return dimWords.length;
    return dimWords.filter((w) => w.isActive !== false).length;
  };

  // Placeholder for usage count (to be replaced with real data later)
  const wordUsageCount = 0;

  // ─── Loading state ───────────────────────────────────────────

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          <PageHeader
            title="Adjetivos Gauge-Pro"
            description="Gerencie os 100 adjetivos comportamentais organizados por 5 dimensões do sistema Gauge-Pro."
          />
          <AdminTabNav />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Error state ─────────────────────────────────────────────

  if (error) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          <PageHeader
            title="Adjetivos Gauge-Pro"
            description="Gerencie os 100 adjetivos comportamentais organizados por 5 dimensões do sistema Gauge-Pro."
          />
          <AdminTabNav />
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar adjetivos. Verifique a conexão e tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Main render ─────────────────────────────────────────────

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Adjetivos Gauge-Pro"
          description="Gerencie os 100 adjetivos comportamentais organizados por 5 dimensões do sistema Gauge-Pro."
          howItWorks={[
            'Cada dimensão possui 20 adjetivos: 10 de alta polaridade (+) e 10 de baixa polaridade (-)',
            'Clique em um adjetivo para editar o texto ou alterar o status ativo/inativo',
            'Adjetivos inativos não aparecem no teste comportamental para candidatos e colaboradores',
            'Ative o toggle "Mostrar inativos" para visualizar e gerenciar adjetivos desativados',
          ]}
        />

        <AdminTabNav />

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Type className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de Adjetivos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <XCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inativos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Dimensões</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle show inactive */}
        <div className="flex items-center justify-end gap-2">
          <Label htmlFor="show-inactive" className="text-sm text-muted-foreground">
            Mostrar inativos
          </Label>
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
        </div>

        {/* Accordion per dimension */}
        <Accordion type="multiple" defaultValue={ALL_DIMENSIONS}>
          {ALL_DIMENSIONS.map((dim) => {
            const info = DIMENSION_INFO[dim];
            const dimWords = wordsByDimension[dim];
            const count = renderDimensionCount(dim);

            return (
              <AccordionItem key={dim} value={dim}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn('font-mono text-xs', info.color)}>
                      {dim}
                    </Badge>
                    <span className="font-medium">{info.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count} adjetivo{count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-6 md:grid-cols-2 pt-2">
                    {renderPolarityColumn(dimWords, 'high', 'Alta Polaridade (+)')}
                    {renderPolarityColumn(dimWords, 'low', 'Baixa Polaridade (-)')}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingWord}
          onOpenChange={(open) => !open && closeEditDialog()}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Adjetivo</DialogTitle>
              <DialogDescription>
                Altere o texto ou o status do adjetivo comportamental.
              </DialogDescription>
            </DialogHeader>

            {editingWord && (
              <div className="space-y-5">
                {/* ID (read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ID
                  </Label>
                  <Input
                    value={editingWord.id}
                    readOnly
                    disabled
                    className="bg-muted font-mono text-muted-foreground"
                  />
                </div>

                {/* Text (editable) */}
                <div className="space-y-2">
                  <Label htmlFor="edit-text">Texto</Label>
                  <Input
                    id="edit-text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Digite o adjetivo..."
                    autoFocus
                  />
                </div>

                {/* Dimension (read-only) */}
                <div className="space-y-2">
                  <Label>Dimensão</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-normal',
                        DIMENSION_INFO[editingWord.dimension].color,
                      )}
                    >
                      {editingWord.dimension} — {DIMENSION_NAMES[editingWord.dimension]}
                    </Badge>
                  </div>
                </div>

                {/* Polarity (read-only) */}
                <div className="space-y-2">
                  <Label>Polaridade</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-normal',
                        editingWord.polarity === 'high'
                          ? 'border-green-400/60 text-green-600 dark:text-green-400'
                          : 'border-blue-400/60 text-blue-600 dark:text-blue-400',
                      )}
                    >
                      {editingWord.polarity === 'high'
                        ? 'Alta Polaridade (+)'
                        : 'Baixa Polaridade (-)'}
                    </Badge>
                  </div>
                </div>

                {/* Status switch */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-status">Status</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {editIsActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <Switch
                      id="edit-status"
                      checked={editIsActive}
                      onCheckedChange={setEditIsActive}
                    />
                  </div>
                </div>

                {/* Usage warning */}
                {wordUsageCount > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Este adjetivo já foi utilizado em{' '}
                      <strong>{wordUsageCount}</strong> teste{wordUsageCount !== 1 ? 's' : ''}.
                      Alterações afetarão apenas testes futuros.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={closeEditDialog} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !editText.trim()}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
