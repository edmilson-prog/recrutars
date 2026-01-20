/**
 * ConfigSidebar Component
 * PRD-045: Sidebar com categorias expansíveis
 */

import {
  Building2,
  Brain,
  Trophy,
  Bell,
  Plug,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { ConfigCategory, ConfigSearchResult } from '@/types/settings';

// Mapa de ícones
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Brain,
  Trophy,
  Bell,
  Plug,
  Users,
  BarChart3,
  Settings,
};

interface ConfigSidebarProps {
  categories: ConfigCategory[];
  activeCategory: string;
  activeSubcategory: string;
  searchResults: ConfigSearchResult[];
  searchQuery: string;
  onNavigate: (categoryKey: string, subcategoryKey: string) => void;
}

export function ConfigSidebar({
  categories,
  activeCategory,
  activeSubcategory,
  searchResults,
  searchQuery,
  onNavigate,
}: ConfigSidebarProps) {
  // Verificar se uma categoria/subcategoria está nos resultados de busca
  const isInSearchResults = (categoryKey: string, subcategoryKey?: string) => {
    if (!searchQuery) return true;
    return searchResults.some(
      (r) =>
        r.categoryKey === categoryKey &&
        (!subcategoryKey || r.subcategoryKey === subcategoryKey)
    );
  };

  // Categorias ordenadas
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Categorias expandidas por padrão (a ativa)
  const defaultExpanded = activeCategory ? [activeCategory] : [];

  return (
    <div className="rounded-lg border bg-card">
      <Accordion
        type="multiple"
        defaultValue={defaultExpanded}
        className="w-full"
      >
        {sortedCategories.map((category) => {
          const Icon = iconMap[category.icon] || Settings;
          const isVisible = isInSearchResults(category.key);
          const hasVisibleSubcategories = category.subcategories.some((sub) =>
            isInSearchResults(category.key, sub.key)
          );

          if (!isVisible && !hasVisibleSubcategories) return null;

          return (
            <AccordionItem
              key={category.key}
              value={category.key}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger
                className={cn(
                  'px-4 hover:no-underline hover:bg-muted/50',
                  activeCategory === category.key && 'text-primary'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{category.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="space-y-1 px-2 pb-3">
                  {category.subcategories
                    .sort((a, b) => a.order - b.order)
                    .map((subcategory) => {
                      const isSubVisible = isInSearchResults(
                        category.key,
                        subcategory.key
                      );
                      if (!isSubVisible && searchQuery) return null;

                      const isActive =
                        activeCategory === category.key &&
                        activeSubcategory === subcategory.key;

                      // Highlight no texto se estiver na busca
                      const isHighlighted =
                        searchQuery &&
                        searchResults.some(
                          (r) =>
                            r.categoryKey === category.key &&
                            r.subcategoryKey === subcategory.key
                        );

                      return (
                        <button
                          key={subcategory.key}
                          onClick={() =>
                            onNavigate(category.key, subcategory.key)
                          }
                          className={cn(
                            'w-full text-left px-4 py-2 rounded-md text-sm transition-colors',
                            'hover:bg-muted/50',
                            isActive && 'bg-primary/10 text-primary font-medium',
                            isHighlighted &&
                              !isActive &&
                              'bg-yellow-100/50 dark:bg-yellow-900/20'
                          )}
                        >
                          {subcategory.name}
                        </button>
                      );
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {searchQuery && searchResults.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Nenhuma configuracao encontrada
        </div>
      )}
    </div>
  );
}
