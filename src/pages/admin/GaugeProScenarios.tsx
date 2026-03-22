/**
 * Gauge-Pro Scenarios Admin Page
 * CRUD interface for managing 15 situational scenarios,
 * each with 4 options (A/B/C/D) mapped to behavioral dimensions.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  Plus,
  BookOpen,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useGaugeProAdminScenarios,
  useUpdateScenario,
  useToggleScenarioActive,
  useScenarioUsageCount,
} from '@/hooks/useGaugeProAdminQuery';
import type {
  Scenario,
  ScenarioOption,
  DimensionMapping,
  GaugeProDimension,
} from '@/types/gaugePro';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const OPTION_KEY_COLORS: Record<string, string> = {
  A: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  B: 'bg-green-500/10 text-green-600 dark:text-green-400',
  C: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  D: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

function getHexForDimension(d: GaugeProDimension): string {
  switch (d) {
    case 'D1': return '#ef4444';
    case 'D2': return '#f59e0b';
    case 'D3': return '#22c55e';
    case 'D4': return '#3b82f6';
    case 'D5': return '#a855f7';
  }
}

// ---------------------------------------------------------------------------
// Helper: Dimension mapping badge
// ---------------------------------------------------------------------------

function DimensionMappingBadge({ mapping }: { mapping: DimensionMapping }) {
  const isPositive = mapping.direction === '+';
  const label = `${mapping.dimension}${mapping.direction}`;
  const hex = getHexForDimension(mapping.dimension);

  if (isPositive) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: `${hex}1a`,
          color: hex,
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive">
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Scenario Card
// ---------------------------------------------------------------------------

interface ScenarioCardProps {
  scenario: Scenario;
  onEdit: (s: Scenario) => void;
  onToggleActive: (s: Scenario) => void;
}

function ScenarioCard({ scenario, onEdit, onToggleActive }: ScenarioCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const previewText = scenario.situation.length > 100
    ? scenario.situation.slice(0, 100) + '...'
    : scenario.situation;

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header — always visible */}
        <div className="flex items-center gap-3 p-4">
          {/* Order badge */}
          <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary text-sm font-bold">
            #{scenario.order}
          </span>

          {/* Title + preview */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {scenario.title}
              </h3>
              {!scenario.isActive && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  Inativo
                </Badge>
              )}
            </div>
            {!isOpen && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {previewText}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isOpen ? 'Recolher' : 'Expandir'}
                </span>
              </Button>
            </CollapsibleTrigger>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(scenario)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleActive(scenario)}>
                  <Power className="h-4 w-4 mr-2" />
                  {scenario.isActive ? 'Desativar' : 'Ativar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <Separator />

            {/* Full situation text */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Situação
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {scenario.situation}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Opções de Resposta
              </p>
              {scenario.options.map((option) => (
                <div
                  key={option.key}
                  className="flex items-start gap-3 p-3 rounded-md border bg-muted/30"
                >
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-bold shrink-0',
                      OPTION_KEY_COLORS[option.key]
                    )}
                  >
                    {option.key}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{option.text}</p>
                    {option.mappings.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {option.mappings.map((m, idx) => (
                          <DimensionMappingBadge key={idx} mapping={m} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit Sheet — Option Section
// ---------------------------------------------------------------------------

interface OptionEditorProps {
  option: ScenarioOption;
  onChange: (updated: ScenarioOption) => void;
}

function OptionEditor({ option, onChange }: OptionEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTextChange = (text: string) => {
    onChange({ ...option, text });
  };

  const handleAddMapping = () => {
    const usedDimensions = option.mappings.map((m) => m.dimension);
    const available = ALL_DIMENSIONS.find((d) => !usedDimensions.includes(d));
    const newMapping: DimensionMapping = {
      dimension: available || 'D1',
      direction: '+',
    };
    onChange({ ...option, mappings: [...option.mappings, newMapping] });
  };

  const handleRemoveMapping = (idx: number) => {
    const updated = option.mappings.filter((_, i) => i !== idx);
    onChange({ ...option, mappings: updated });
  };

  const handleMappingChange = (idx: number, field: 'dimension' | 'direction', value: string) => {
    const updated = option.mappings.map((m, i) => {
      if (i !== idx) return m;
      return {
        ...m,
        [field]: value,
      };
    });
    onChange({ ...option, mappings: updated as DimensionMapping[] });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors text-left">
          <span
            className={cn(
              'inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-bold shrink-0',
              OPTION_KEY_COLORS[option.key]
            )}
          >
            {option.key}
          </span>
          <span className="text-sm text-foreground truncate flex-1">
            {option.text || '(sem texto)'}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {option.mappings.map((m, idx) => (
              <DimensionMappingBadge key={idx} mapping={m} />
            ))}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 ml-10 space-y-3 pb-2">
          {/* Option text */}
          <div className="space-y-1.5">
            <Label className="text-xs">Texto da Opção</Label>
            <Textarea
              rows={3}
              value={option.text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Descreva a opção de resposta..."
            />
          </div>

          {/* Dimension mappings */}
          <div className="space-y-2">
            <Label className="text-xs">Mapeamentos de Dimensão</Label>
            {option.mappings.map((mapping, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Select
                  value={mapping.dimension}
                  onValueChange={(v) => handleMappingChange(idx, 'dimension', v)}
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DIMENSIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d} — {DIMENSION_SHORT_NAMES[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={mapping.direction}
                  onValueChange={(v) => handleMappingChange(idx, 'direction', v)}
                >
                  <SelectTrigger className="w-[80px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">+ (positivo)</SelectItem>
                    <SelectItem value="-">- (negativo)</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveMapping(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Remover mapeamento</span>
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleAddMapping}
            >
              <Plus className="h-3 w-3 mr-1" />
              Adicionar Mapeamento
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Edit Sheet — Usage Alert
// ---------------------------------------------------------------------------

function ScenarioUsageAlert({ scenarioId }: { scenarioId: number }) {
  const { data: count, isLoading } = useScenarioUsageCount(scenarioId);

  if (isLoading || !count || count === 0) return null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <p className="text-sm text-amber-700 dark:text-amber-400">
        Este cenário foi utilizado em{' '}
        <strong>{count}</strong>{' '}
        {count === 1 ? 'teste' : 'testes'} respondidos. Alterações afetarão
        apenas testes futuros.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit Sheet
// ---------------------------------------------------------------------------

interface EditSheetProps {
  scenario: Scenario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, data: {
    title: string;
    situation: string;
    sortOrder: number;
    options: ScenarioOption[];
    isActive: boolean;
  }) => void;
  isSaving: boolean;
}

function EditSheet({ scenario, open, onOpenChange, onSave, isSaving }: EditSheetProps) {
  // Local form state — deep cloned from scenario when sheet opens
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [options, setOptions] = useState<ScenarioOption[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Populate form when scenario changes
  const populateForm = useCallback((s: Scenario) => {
    setTitle(s.title);
    setSituation(s.situation);
    setSortOrder(s.order);
    setIsActive(s.isActive ?? true);
    // Deep clone options
    setOptions(
      s.options.map((o) => ({
        ...o,
        mappings: o.mappings.map((m) => ({ ...m })),
      }))
    );
  }, []);

  // When scenario prop changes (sheet opens), populate
  const [prevScenarioId, setPrevScenarioId] = useState<number | null>(null);
  if (scenario && scenario.id !== prevScenarioId) {
    setPrevScenarioId(scenario.id);
    populateForm(scenario);
  }
  if (!scenario && prevScenarioId !== null) {
    setPrevScenarioId(null);
  }

  const handleOptionChange = (idx: number, updated: ScenarioOption) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? updated : o)));
  };

  const handleSave = () => {
    if (!scenario) return;
    onSave(scenario.id, {
      title: title.trim(),
      situation: situation.trim(),
      sortOrder,
      options,
      isActive,
    });
  };

  const isValid = title.trim().length > 0 && situation.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[700px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            Editar Cenário #{scenario?.order ?? ''}
          </SheetTitle>
          <SheetDescription>
            Altere o texto, opções e mapeamentos do cenário situacional.
          </SheetDescription>
        </SheetHeader>

        {scenario && (
          <div className="mt-6 space-y-6">
            {/* Usage alert */}
            <ScenarioUsageAlert scenarioId={scenario.id} />

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="scenario-title">Título</Label>
              <Input
                id="scenario-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do cenário"
              />
            </div>

            {/* Situation */}
            <div className="space-y-1.5">
              <Label htmlFor="scenario-situation">Situação</Label>
              <Textarea
                id="scenario-situation"
                rows={4}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Descreva a situação apresentada ao candidato..."
              />
            </div>

            {/* Sort order */}
            <div className="space-y-1.5">
              <Label htmlFor="scenario-order">Ordem de Exibição</Label>
              <Input
                id="scenario-order"
                type="number"
                min={1}
                max={99}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                className="w-24"
              />
            </div>

            <Separator />

            {/* Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Opções de Resposta</p>
              {options.map((option, idx) => (
                <OptionEditor
                  key={option.key}
                  option={option}
                  onChange={(updated) => handleOptionChange(idx, updated)}
                />
              ))}
            </div>

            <Separator />

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="scenario-active" className="text-sm font-medium">
                  Status
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cenários inativos não aparecem nos testes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {isActive ? 'Ativo' : 'Inativo'}
                </span>
                <Switch
                  id="scenario-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>
        )}

        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !isValid}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function GaugeProScenarios() {
  const { data: scenarios, isLoading, error } = useGaugeProAdminScenarios();
  const updateScenario = useUpdateScenario();
  const toggleActive = useToggleScenarioActive();

  const [showInactive, setShowInactive] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Stats
  const stats = useMemo(() => {
    if (!scenarios) return { total: 0, active: 0, inactive: 0 };
    const active = scenarios.filter((s) => s.isActive !== false).length;
    return {
      total: scenarios.length,
      active,
      inactive: scenarios.length - active,
    };
  }, [scenarios]);

  // Filtered & sorted scenarios
  const filteredScenarios = useMemo(() => {
    if (!scenarios) return [];
    const list = showInactive
      ? [...scenarios]
      : scenarios.filter((s) => s.isActive !== false);
    return list.sort((a, b) => a.order - b.order);
  }, [scenarios, showInactive]);

  // Handlers
  const handleEdit = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setSheetOpen(true);
  };

  const handleToggleActive = (scenario: Scenario) => {
    toggleActive.mutate(scenario.id, {
      onSuccess: () => {
        toast.success(
          scenario.isActive
            ? `Cenário "${scenario.title}" desativado`
            : `Cenário "${scenario.title}" ativado`
        );
      },
      onError: () => {
        toast.error('Erro ao alterar status do cenário');
      },
    });
  };

  const handleSave = (
    id: number,
    data: {
      title: string;
      situation: string;
      sortOrder: number;
      options: ScenarioOption[];
      isActive: boolean;
    }
  ) => {
    updateScenario.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success(`Cenário "${data.title}" atualizado com sucesso`);
          setSheetOpen(false);
          setEditingScenario(null);
        },
        onError: () => {
          toast.error('Erro ao salvar cenário. Tente novamente.');
        },
      }
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Cenários Situacionais"
          description="Gerencie os 15 cenários do módulo situacional do Gauge-Pro. Cada cenário apresenta uma situação com 4 opções mapeadas a dimensões comportamentais."
          howItWorks={[
            'Cada cenário descreve uma situação profissional com 4 alternativas (A/B/C/D)',
            'Cada alternativa é mapeada a dimensões comportamentais (D1-D5) com direção positiva (+) ou negativa (-)',
            'A pontuação do candidato é calculada pela soma dos mapeamentos das opções escolhidas',
            'Cenários inativos não aparecem nos testes, mas o histórico de respostas é preservado',
          ]}
        />

        <AdminTabNav />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de Cenários</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <BookOpen className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Show inactive toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="text-sm cursor-pointer">
            Mostrar inativos
          </Label>
          {stats.inactive > 0 && (
            <Badge variant="secondary" className="text-xs">
              {stats.inactive}
            </Badge>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              Erro ao carregar cenários. Tente recarregar a página.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredScenarios.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">
              {showInactive
                ? 'Nenhum cenário cadastrado.'
                : 'Nenhum cenário ativo encontrado. Ative o toggle "Mostrar inativos" para ver todos.'}
            </p>
          </div>
        )}

        {/* Scenario cards */}
        {!isLoading && !error && filteredScenarios.length > 0 && (
          <div className="space-y-3">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}

        {/* Edit Sheet */}
        <EditSheet
          scenario={editingScenario}
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) setEditingScenario(null);
          }}
          onSave={handleSave}
          isSaving={updateScenario.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
