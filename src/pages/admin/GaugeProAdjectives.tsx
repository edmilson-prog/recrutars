/**
 * Gauge-Pro Adjectives Admin Page
 *
 * CRUD interface for managing the 100 behavioral test adjectives
 * organized by 5 dimensions (D1–D5), each with high/low polarity.
 * Includes word order mode selector with preview and fixed-mode reordering.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Lock,
  Type,
  CheckCircle,
  XCircle,
  Layers,
  AlertTriangle,
  Info,
  GripVertical,
  Eye,
  Shuffle,
  ArrowDownAZ,
  ArrowUpDown,
  SplitSquareHorizontal,
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
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { AdjectiveWord, GaugeProDimension, WordOrderMode } from '@/types/gaugePro';
import { DIMENSION_NAMES } from '@/types/gaugePro';
import {
  useGaugeProAdminWords,
  useUpdateWord,
  useToggleWordActive,
  useUpdateWordSortOrders,
} from '@/hooks/useGaugeProAdminQuery';
import { useGaugeProWordOrderMode } from '@/hooks/useGaugeProWordOrderMode';

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

// ─── Mode descriptions ──────────────────────────────────────────

const MODE_DESCRIPTIONS: Record<WordOrderMode, string> = {
  random: 'Os adjetivos aparecem em ordem diferente para cada candidato, reduzindo viés posicional.',
  fixed: 'Os adjetivos aparecem na mesma ordem para todos, conforme definido pelo administrador.',
  alternating: 'Alterna automaticamente entre adjetivos de alta e baixa polaridade (alta-baixa-alta-baixa).',
  grouped: 'Agrupa todos os adjetivos de alta polaridade primeiro, depois os de baixa polaridade.',
  alphabetical: 'Os adjetivos aparecem em ordem alfabética (A-Z) dentro de cada dimensão.',
};

const MODE_ICONS: Record<WordOrderMode, React.ReactNode> = {
  random: <Shuffle className="h-4 w-4" />,
  fixed: <GripVertical className="h-4 w-4" />,
  alternating: <ArrowUpDown className="h-4 w-4" />,
  grouped: <SplitSquareHorizontal className="h-4 w-4" />,
  alphabetical: <ArrowDownAZ className="h-4 w-4" />,
};

// ─── Preview order helper ────────────────────────────────────────

function computePreviewOrder(dimWords: AdjectiveWord[], mode: WordOrderMode): AdjectiveWord[] {
  switch (mode) {
    case 'random':
      // Deterministic-ish "sample" shuffle for preview
      return [...dimWords].sort(() => Math.random() - 0.5);
    case 'fixed':
      return [...dimWords].sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id));
    case 'alternating': {
      const high = dimWords.filter(w => w.polarity === 'high');
      const low = dimWords.filter(w => w.polarity === 'low');
      const result: AdjectiveWord[] = [];
      for (let i = 0; i < Math.max(high.length, low.length); i++) {
        if (high[i]) result.push(high[i]);
        if (low[i]) result.push(low[i]);
      }
      return result;
    }
    case 'grouped':
      return [
        ...dimWords.filter(w => w.polarity === 'high'),
        ...dimWords.filter(w => w.polarity === 'low'),
      ];
    case 'alphabetical':
      return [...dimWords].sort((a, b) => a.text.localeCompare(b.text, 'pt-BR'));
  }
}

// ─── Component ───────────────────────────────────────────────────

export default function GaugeProAdjectives() {
  const { data: words = [], isLoading, error } = useGaugeProAdminWords();
  const updateWordMutation = useUpdateWord();
  const toggleWordActiveMutation = useToggleWordActive();
  const { wordOrderMode, setWordOrderMode } = useGaugeProWordOrderMode();
  const updateSortOrders = useUpdateWordSortOrders();

  // Local state
  const [showInactive, setShowInactive] = useState(false);
  const [editingWord, setEditingWord] = useState<AdjectiveWord | null>(null);
  const [editText, setEditText] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDimension, setPreviewDimension] = useState<GaugeProDimension>('D1');

  // Fixed-mode sort orders: { [wordId]: sortOrderValue }
  const [localSortOrders, setLocalSortOrders] = useState<Record<number, number>>({});
  const [savingDimension, setSavingDimension] = useState<GaugeProDimension | null>(null);

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

  const handleModeChange = (newMode: string) => {
    setWordOrderMode.mutate(newMode as WordOrderMode, {
      onSuccess: () => toast.success('Modo de ordenação atualizado'),
      onError: () => toast.error('Erro ao salvar modo de ordenação'),
    });
  };

  const getLocalSortOrder = useCallback(
    (word: AdjectiveWord) => {
      if (localSortOrders[word.id] !== undefined) {
        return localSortOrders[word.id];
      }
      return word.sortOrder ?? word.id;
    },
    [localSortOrders],
  );

  const handleSortOrderChange = (wordId: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setLocalSortOrders((prev) => ({ ...prev, [wordId]: num }));
    }
  };

  const handleSaveSortOrders = (dim: GaugeProDimension) => {
    const dimWords = wordsByDimension[dim];
    const updates: { id: number; sortOrder: number }[] = dimWords.map((w) => ({
      id: w.id,
      sortOrder: localSortOrders[w.id] ?? w.sortOrder ?? w.id,
    }));

    setSavingDimension(dim);
    updateSortOrders.mutate(updates, {
      onSuccess: () => {
        toast.success(`Ordem da dimensão ${dim} salva com sucesso.`);
        // Clear local overrides for this dimension
        setLocalSortOrders((prev) => {
          const next = { ...prev };
          for (const w of dimWords) {
            delete next[w.id];
          }
          return next;
        });
        setSavingDimension(null);
      },
      onError: () => {
        toast.error('Erro ao salvar ordem. Tente novamente.');
        setSavingDimension(null);
      },
    });
  };

  const handleResetSortOrders = (dim: GaugeProDimension) => {
    const dimWords = wordsByDimension[dim];
    const resetOrders: Record<number, number> = {};
    // Reset sort_order to match ID order (ascending by ID)
    const sorted = [...dimWords].sort((a, b) => a.id - b.id);
    sorted.forEach((w, idx) => {
      resetOrders[w.id] = idx + 1;
    });
    setLocalSortOrders((prev) => ({ ...prev, ...resetOrders }));
    toast.info(`Ordem da dimensão ${dim} restaurada ao padrão. Clique em "Salvar Ordem" para confirmar.`);
  };

  // ─── Filter logic ────────────────────────────────────────────

  const filterWords = (dimensionWords: AdjectiveWord[], polarity: 'high' | 'low') => {
    const polarityFiltered = dimensionWords.filter((w) => w.polarity === polarity);
    if (showInactive) return polarityFiltered;
    return polarityFiltered.filter((w) => w.isActive !== false);
  };

  const filterAllWords = (dimensionWords: AdjectiveWord[]) => {
    if (showInactive) return dimensionWords;
    return dimensionWords.filter((w) => w.isActive !== false);
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

  const renderFixedModeList = (dim: GaugeProDimension) => {
    const dimWords = filterAllWords(wordsByDimension[dim]);
    const sorted = [...dimWords].sort((a, b) => getLocalSortOrder(a) - getLocalSortOrder(b));
    const isSavingThis = savingDimension === dim;

    return (
      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          {sorted.map((word, idx) => {
            const isInactive = word.isActive === false;
            return (
              <div
                key={word.id}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                  idx % 2 === 0 ? 'bg-muted/40' : 'bg-transparent',
                  isInactive && 'opacity-50',
                )}
              >
                <span className="w-6 text-right font-mono text-xs text-muted-foreground">
                  {idx + 1}.
                </span>
                <button
                  type="button"
                  onClick={() => openEditDialog(word)}
                  className={cn(
                    'flex-1 text-left hover:underline cursor-pointer',
                    isInactive && 'line-through',
                  )}
                >
                  {word.text}
                </button>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] shrink-0',
                    word.polarity === 'high'
                      ? 'border-green-400/60 text-green-600 dark:text-green-400'
                      : 'border-blue-400/60 text-blue-600 dark:text-blue-400',
                  )}
                >
                  {word.polarity === 'high' ? 'Alta' : 'Baixa'}
                </Badge>
                <Input
                  type="number"
                  min={1}
                  className="w-[60px] h-8 text-center text-xs font-mono"
                  value={getLocalSortOrder(word)}
                  onChange={(e) => handleSortOrderChange(word.id, e.target.value)}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResetSortOrders(dim)}
            disabled={isSavingThis}
          >
            Restaurar Padrão
          </Button>
          <Button
            size="sm"
            onClick={() => handleSaveSortOrders(dim)}
            disabled={isSavingThis}
          >
            {isSavingThis ? 'Salvando...' : 'Salvar Ordem'}
          </Button>
        </div>
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

  // ─── Preview helpers ──────────────────────────────────────────

  const previewWords = useMemo(() => {
    const dimWords = wordsByDimension[previewDimension].filter((w) => w.isActive !== false);
    return computePreviewOrder(dimWords, wordOrderMode);
  }, [wordsByDimension, previewDimension, wordOrderMode]);

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

        {/* Word Order Mode Selector */}
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Modo de Ordenação</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[280px]">
                  <p className="text-xs">
                    Define como os adjetivos são apresentados aos candidatos durante o teste
                    Gauge-Pro. O modo aleatório é recomendado para maximizar a validade psicométrica.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 space-y-2">
              <Select
                value={wordOrderMode}
                onValueChange={handleModeChange}
              >
                <SelectTrigger className="w-full sm:w-[320px]">
                  <SelectValue placeholder="Selecione o modo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">
                    <span className="flex items-center gap-2">
                      Aleatória
                      <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0 hover:bg-green-600">
                        Recomendado
                      </Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <span className="flex items-center gap-2">
                      Ordem Fixa
                      <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0 hover:bg-amber-600">
                        Avançado
                      </Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="alternating">
                    Polaridade Alternada
                  </SelectItem>
                  <SelectItem value="grouped">
                    <span className="flex items-center gap-2">
                      Agrupada por Polaridade
                      <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 hover:bg-red-600">
                        Atenção
                      </Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="alphabetical">
                    Alfabética
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {MODE_DESCRIPTIONS[wordOrderMode]}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="shrink-0"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Pré-visualizar
            </Button>
          </div>

          {/* Psychometric alerts */}
          {wordOrderMode !== 'random' && (
            <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                A ordem aleatória é recomendada para maximizar a validade psicométrica dos resultados.
              </AlertDescription>
            </Alert>
          )}

          {wordOrderMode === 'grouped' && (
            <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                A ordem agrupada torna o teste previsível e pode comprometer a validade dos resultados.
                Use apenas se houver motivo específico.
              </AlertDescription>
            </Alert>
          )}
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
                  {wordOrderMode === 'fixed' ? (
                    renderFixedModeList(dim)
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 pt-2">
                      {renderPolarityColumn(dimWords, 'high', 'Alta Polaridade (+)')}
                      {renderPolarityColumn(dimWords, 'low', 'Baixa Polaridade (-)')}
                    </div>
                  )}
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

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Pré-visualização
              </DialogTitle>
              <DialogDescription>
                Veja como os adjetivos serão apresentados ao candidato durante o teste.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Dimension selector */}
              <div className="flex items-center gap-3">
                <Label className="text-sm shrink-0">Dimensão:</Label>
                <Select
                  value={previewDimension}
                  onValueChange={(v) => setPreviewDimension(v as GaugeProDimension)}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DIMENSIONS.map((dim) => (
                      <SelectItem key={dim} value={dim}>
                        <span className={cn('font-mono mr-1.5', DIMENSION_INFO[dim].color)}>
                          {dim}
                        </span>
                        {DIMENSION_INFO[dim].name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {MODE_ICONS[wordOrderMode]}
                <span>
                  Modo: <strong>{wordOrderMode === 'random' ? 'Aleatória' : wordOrderMode === 'fixed' ? 'Ordem Fixa' : wordOrderMode === 'alternating' ? 'Polaridade Alternada' : wordOrderMode === 'grouped' ? 'Agrupada por Polaridade' : 'Alfabética'}</strong>
                </span>
              </div>

              {/* Word grid — 3 columns matching the test UI */}
              <div className="grid grid-cols-3 gap-2">
                {previewWords.map((word) => (
                  <div
                    key={word.id}
                    className={cn(
                      'rounded-lg border p-2.5 text-center text-sm transition-colors',
                      'hover:bg-accent cursor-default',
                      word.polarity === 'high'
                        ? 'border-l-[3px] border-l-green-400/60'
                        : 'border-l-[3px] border-l-blue-400/60',
                    )}
                  >
                    {word.text}
                  </div>
                ))}
              </div>

              {/* Random mode note */}
              {wordOrderMode === 'random' && (
                <p className="text-xs text-muted-foreground italic text-center">
                  Cada candidato verá uma ordem diferente
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
