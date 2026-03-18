/**
 * SkillCategoryAccordion — Renders skill categories as accordion items
 * with selectable skill chips inside each category.
 */

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SkillCategory } from '@/types/standardizedSkill';

interface SkillCategoryAccordionProps {
  categories: SkillCategory[];
  selectedSkillIds: string[];
  onToggleSkill: (skillId: string) => void;
  maxReached: boolean;
  searchQuery: string;
  disabled?: boolean;
}

export function SkillCategoryAccordion({
  categories,
  selectedSkillIds,
  onToggleSkill,
  maxReached,
  searchQuery,
  disabled,
}: SkillCategoryAccordionProps) {
  const selectedSet = new Set(selectedSkillIds);
  const normalizedQuery = searchQuery.toLowerCase().trim();

  // Filter categories and skills by search query
  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      skills: normalizedQuery
        ? cat.skills.filter((s) => s.name.toLowerCase().includes(normalizedQuery))
        : cat.skills,
    }))
    .filter((cat) => cat.skills.length > 0);

  if (filteredCategories.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Nenhuma habilidade encontrada para &ldquo;{searchQuery}&rdquo;
      </p>
    );
  }

  // When searching, open all matching categories
  const defaultOpenValues = normalizedQuery
    ? filteredCategories.map((c) => c.name)
    : [];

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpenValues}
      className="w-full"
    >
      {filteredCategories.map((category) => {
        const selectedInCategory = category.skills.filter((s) => selectedSet.has(s.id)).length;

        return (
          <AccordionItem key={category.name} value={category.name}>
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <span>{category.name}</span>
                {selectedInCategory > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {selectedInCategory}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => {
                  const isSelected = selectedSet.has(skill.id);
                  const isDisabled = disabled || (!isSelected && maxReached);

                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => !isDisabled && onToggleSkill(skill.id)}
                      disabled={isDisabled}
                      className={cn(
                        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:bg-accent',
                        isDisabled && !isSelected && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
