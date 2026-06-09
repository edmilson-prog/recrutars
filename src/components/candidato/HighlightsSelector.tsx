/**
 * Highlights Selector Component
 * PRD-073: Destaques de candidatura customizável
 *
 * Allows candidates to select which profile items to highlight
 * when applying for a job. The candidate can switch between three
 * view modes (tabs, list/accordion, hybrid) — preference persisted
 * in localStorage. Header/footer stay fixed while the item list scrolls.
 */

import { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  ChevronDown,
  PanelTop,
  List as ListIcon,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Curriculum } from '@/types/curriculum';
import { skillLevelLabels } from '@/types/curriculum';
import type { ApplicationHighlights } from '@/types/applicationHighlight';

interface HighlightsSelectorProps {
  curriculum: Curriculum;
  onConfirm: (highlights: ApplicationHighlights) => void;
  onSkip: () => void;
}

// ---------------------------------------------------------------------------
// View modes
// ---------------------------------------------------------------------------

type ViewMode = 'tabs' | 'list' | 'hybrid';

const VIEW_STORAGE_KEY = 'recrutars:highlights-view';

const VIEW_MODES: { value: ViewMode; label: string; icon: typeof PanelTop }[] = [
  { value: 'tabs', label: 'Abas', icon: PanelTop },
  { value: 'list', label: 'Lista', icon: ListIcon },
  { value: 'hybrid', label: 'Híbrido', icon: LayoutGrid },
];

function readStoredView(): ViewMode {
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY);
    if (v === 'tabs' || v === 'list' || v === 'hybrid') return v;
  } catch {
    /* localStorage indisponível — usa padrão */
  }
  return 'tabs';
}

// Formata "2023-06" -> "06/2023"; demais valores são retornados sem alteração.
function formatMonthYear(value?: string): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  return match ? `${match[2]}/${match[1]}` : value;
}

interface SectionData {
  key: string;
  icon: React.ReactNode;
  title: string;
  shortTitle: string;
  selected: Set<string>;
  setter: React.Dispatch<React.SetStateAction<Set<string>>>;
  total: number;
  items: { id: string; label: string; sublabel?: string }[];
}

export function HighlightsSelector({ curriculum, onConfirm, onSkip }: HighlightsSelectorProps) {
  const [selectedExperiences, setSelectedExperiences] = useState<Set<string>>(new Set());
  const [selectedEducation, setSelectedEducation] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>(readStoredView);

  // Constrói as seções disponíveis (apenas as que possuem itens).
  const sections: SectionData[] = [];
  if (curriculum.experiences.length > 0) {
    sections.push({
      key: 'experiences',
      icon: <Briefcase className="h-4 w-4" />,
      title: 'Experiências',
      shortTitle: 'Experiências',
      selected: selectedExperiences,
      setter: setSelectedExperiences,
      total: curriculum.experiences.length,
      items: curriculum.experiences.map((exp) => ({
        id: exp.id,
        label: `${exp.role} — ${exp.company}`,
        sublabel: exp.current ? 'Atual' : formatMonthYear(exp.endDate),
      })),
    });
  }
  if (curriculum.education.length > 0) {
    sections.push({
      key: 'education',
      icon: <GraduationCap className="h-4 w-4" />,
      title: 'Formação',
      shortTitle: 'Formação',
      selected: selectedEducation,
      setter: setSelectedEducation,
      total: curriculum.education.length,
      items: curriculum.education.map((edu) => ({
        id: edu.id,
        label: `${edu.degree} em ${edu.field}`,
        sublabel: edu.institution,
      })),
    });
  }
  if (curriculum.skills.length > 0) {
    sections.push({
      key: 'skills',
      icon: <Wrench className="h-4 w-4" />,
      title: 'Habilidades',
      shortTitle: 'Habilidades',
      selected: selectedSkills,
      setter: setSelectedSkills,
      total: curriculum.skills.length,
      items: curriculum.skills.map((skill) => ({
        id: skill.id,
        label: skill.name,
        sublabel: skillLevelLabels[skill.level] ?? skill.level,
      })),
    });
  }
  if (curriculum.courses.length > 0) {
    sections.push({
      key: 'courses',
      icon: <Award className="h-4 w-4" />,
      title: 'Cursos',
      shortTitle: 'Cursos',
      selected: selectedCourses,
      setter: setSelectedCourses,
      total: curriculum.courses.length,
      items: curriculum.courses.map((course) => ({
        id: course.id,
        label: course.name,
        sublabel: course.institution,
      })),
    });
  }

  const [activeKey, setActiveKey] = useState<string>(() => {
    if (curriculum.experiences.length > 0) return 'experiences';
    if (curriculum.education.length > 0) return 'education';
    if (curriculum.skills.length > 0) return 'skills';
    return 'courses';
  });

  const totalSelected =
    selectedExperiences.size + selectedEducation.size + selectedSkills.size + selectedCourses.size;

  const handleViewChange = (value: ViewMode) => {
    setViewMode(value);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, value);
    } catch {
      /* localStorage indisponível — preferência apenas na sessão */
    }
  };

  const toggle = (section: SectionData, id: string) => {
    const next = new Set(section.selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    section.setter(next);
  };

  const toggleAll = (section: SectionData) => {
    const allIds = section.items.map((item) => item.id);
    const allSelected = allIds.every((id) => section.selected.has(id));
    section.setter(allSelected ? new Set() : new Set(allIds));
  };

  const handleConfirm = () => {
    onConfirm({
      experienceIds: Array.from(selectedExperiences),
      educationIds: Array.from(selectedEducation),
      skillIds: Array.from(selectedSkills),
      courseIds: Array.from(selectedCourses),
    });
  };

  if (sections.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Seu perfil ainda não possui itens para destacar.
        </p>
        <Button variant="outline" className="mt-4" onClick={onSkip}>
          Continuar sem destaques
        </Button>
      </div>
    );
  }

  const activeSection = sections.find((s) => s.key === activeKey) ?? sections[0];

  // --- Tabs / Hybrid -------------------------------------------------------
  const renderTabsView = (showSelectAll: boolean) => {
    const allSelected =
      activeSection.items.length > 0 &&
      activeSection.items.every((item) => activeSection.selected.has(item.id));

    return (
      <div>
        {/* Tab bar (sticky) */}
        <div
          role="tablist"
          aria-label="Categorias do perfil"
          className="sticky top-0 z-10 -mx-6 flex gap-1 overflow-x-auto bg-background px-6 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((section) => {
            const isActive = section.key === activeSection.key;
            return (
              <button
                key={section.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveKey(section.key)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {section.icon}
                <span>{section.shortTitle}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[11px] tabular-nums',
                    isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {section.selected.size}/{section.total}
                </span>
              </button>
            );
          })}
        </div>

        {showSelectAll && (
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => toggleAll(activeSection)}
            >
              {allSelected ? 'Limpar seleção' : 'Selecionar todas'}
            </Button>
          </div>
        )}

        {/* Active category items */}
        <div
          key={activeSection.key}
          className="space-y-1 py-2 duration-200 animate-in fade-in-50 motion-reduce:animate-none"
        >
          {activeSection.items.map((item) => (
            <HighlightItem
              key={item.id}
              id={item.id}
              label={item.label}
              sublabel={item.sublabel}
              checked={activeSection.selected.has(item.id)}
              onToggle={() => toggle(activeSection, item.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  // --- List / Accordion ----------------------------------------------------
  const renderListView = () => (
    <div className="space-y-2 py-1">
      {sections.map((section, index) => (
        <HighlightSection
          key={section.key}
          icon={section.icon}
          title={section.title}
          count={section.selected.size}
          total={section.total}
          defaultOpen={index === 0}
        >
          {section.items.map((item) => (
            <HighlightItem
              key={item.id}
              id={item.id}
              label={item.label}
              sublabel={item.sublabel}
              checked={section.selected.has(item.id)}
              onToggle={() => toggle(section, item.id)}
            />
          ))}
        </HighlightSection>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* View-mode switcher (fixed) */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-6 pb-3 pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Visualização
        </span>
        <TooltipProvider delayDuration={300}>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && handleViewChange(value as ViewMode)}
            variant="outline"
            size="sm"
          >
            {VIEW_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <Tooltip key={mode.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value={mode.value} aria-label={`Visualização em ${mode.label}`}>
                      <Icon className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{mode.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </ToggleGroup>
        </TooltipProvider>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        {viewMode === 'list' ? renderListView() : renderTabsView(viewMode === 'hybrid')}
      </div>

      {/* Fixed footer */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-6 py-4">
        <span className="text-sm text-muted-foreground">
          {totalSelected === 0
            ? 'Nenhum item destacado'
            : `${totalSelected} ${totalSelected === 1 ? 'item destacado' : 'itens destacados'}`}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Pular
          </Button>
          <Button
            size="sm"
            className="gradient-primary"
            onClick={handleConfirm}
            disabled={totalSelected === 0}
          >
            Confirmar {totalSelected > 0 ? `(${totalSelected})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HighlightSection({
  icon,
  title,
  count,
  total,
  defaultOpen = true,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  total: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted">
          {icon}
          <span className="flex-1 text-sm font-medium">{title}</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs tabular-nums',
              count > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            {count}/{total}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1 py-1 pl-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function HighlightItem({
  id,
  label,
  sublabel,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  sublabel?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 transition-colors',
        checked ? 'bg-primary/5' : 'hover:bg-muted/50',
      )}
    >
      <Checkbox id={`hl-${id}`} checked={checked} onCheckedChange={onToggle} />
      <Label htmlFor={`hl-${id}`} className="flex-1 cursor-pointer text-sm">
        <span className="text-foreground">{label}</span>
        {sublabel && <span className="ml-2 text-xs text-muted-foreground">{sublabel}</span>}
      </Label>
    </div>
  );
}
