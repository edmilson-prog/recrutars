/**
 * StandardizedSkillSelector — Main reusable component for selecting standardized skills
 * Used in both job form (company) and candidate profile.
 *
 * Features:
 * - Search across all categories
 * - Accordion categories with selectable chips
 * - Counter with color progression (green → amber → red)
 * - Drag-to-reorder priority strip
 */

import { useState, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { StandardizedSkill } from '@/types/standardizedSkill';
import { groupSkillsByCategory } from '@/types/standardizedSkill';
import { SkillCategoryAccordion } from './SkillCategoryAccordion';
import { SelectedSkillsStrip } from './SelectedSkillsStrip';

interface StandardizedSkillSelectorProps {
  type: 'technical' | 'behavioral';
  selectedSkillIds: string[];
  onChange: (skillIds: string[]) => void;
  maxSelections: number;
  catalog: StandardizedSkill[];
  disabled?: boolean;
}

export function StandardizedSkillSelector({
  type,
  selectedSkillIds,
  onChange,
  maxSelections,
  catalog,
  disabled,
}: StandardizedSkillSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter catalog by type and group into categories
  const filteredCatalog = useMemo(
    () => catalog.filter((s) => s.type === type),
    [catalog, type],
  );

  const categories = useMemo(
    () => groupSkillsByCategory(filteredCatalog),
    [filteredCatalog],
  );

  const count = selectedSkillIds.length;
  const maxReached = count >= maxSelections;

  // Counter color based on fill percentage
  const counterColor = useMemo(() => {
    const pct = count / maxSelections;
    if (pct >= 1) return 'text-destructive';
    if (pct >= 0.8) return 'text-amber-500';
    return 'text-emerald-600';
  }, [count, maxSelections]);

  const handleToggleSkill = useCallback((skillId: string) => {
    const isSelected = selectedSkillIds.includes(skillId);
    if (isSelected) {
      onChange(selectedSkillIds.filter((id) => id !== skillId));
    } else if (!maxReached) {
      onChange([...selectedSkillIds, skillId]);
    }
  }, [selectedSkillIds, onChange, maxReached]);

  const typeLabel = type === 'technical' ? 'Técnicas' : 'Comportamentais';

  return (
    <div className="space-y-4">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">
          {type === 'technical' ? 'Competências Técnicas' : 'Competências Comportamentais'}
        </h4>
        <span className={cn('text-sm font-medium', counterColor)}>
          {count} de {maxSelections} selecionadas
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Pesquisar ${typeLabel.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={disabled}
        />
      </div>

      {/* Category accordion with selectable chips */}
      <SkillCategoryAccordion
        categories={categories}
        selectedSkillIds={selectedSkillIds}
        onToggleSkill={handleToggleSkill}
        maxReached={maxReached}
        searchQuery={searchQuery}
        disabled={disabled}
      />

      {/* Selected skills with drag-to-reorder */}
      <SelectedSkillsStrip
        selectedSkillIds={selectedSkillIds}
        catalog={filteredCatalog}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
