/**
 * ConfigLayout Component
 * PRD-045: Layout principal da página de configurações
 */

import { useState, useMemo } from 'react';
import { History, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { ConfigSidebar } from './ConfigSidebar';
import { ConfigContent } from './ConfigContent';
import { ConfigSearch } from './ConfigSearch';
import { ConfigHistoryModal } from './ConfigHistoryModal';
import type { ConfigCategory, ConfigActiveState, ConfigState, ConfigHistoryEntry, ConfigPanel } from '@/types/settings';
import { searchSettings } from '@/data/settingsConfig';

interface ConfigLayoutProps {
  title: string;
  subtitle: string;
  categories: ConfigCategory[];
  values: ConfigState;
  history: ConfigHistoryEntry[];
  panel: ConfigPanel;
  onValueChange: (
    categoryKey: string,
    subcategoryKey: string,
    fieldKey: string,
    value: unknown
  ) => void;
  onSave: (categoryKey: string, subcategoryKey: string) => void;
  onSaveField?: (
    categoryKey: string,
    subcategoryKey: string,
    fieldKey: string,
    value: unknown,
  ) => Promise<void>;
  onRestoreDefaults: (categoryKey: string, subcategoryKey: string) => void;
}

export function ConfigLayout({
  title,
  subtitle,
  categories,
  values,
  history,
  panel,
  onValueChange,
  onSave,
  onSaveField,
  onRestoreDefaults,
}: ConfigLayoutProps) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [active, setActive] = useState<ConfigActiveState>(() => {
    const firstCategory = categories[0];
    const firstSubcategory = firstCategory?.subcategories[0];
    return {
      categoryKey: firstCategory?.key || '',
      subcategoryKey: firstSubcategory?.key || '',
    };
  });

  // Resultados da busca
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchSettings(categories, searchQuery);
  }, [categories, searchQuery]);

  // Categoria e subcategoria ativas
  const activeCategory = categories.find((c) => c.key === active.categoryKey);
  const activeSubcategory = activeCategory?.subcategories.find(
    (s) => s.key === active.subcategoryKey
  );

  // Handler para navegação
  const handleNavigate = (categoryKey: string, subcategoryKey: string) => {
    setActive({ categoryKey, subcategoryKey });
    setSearchQuery('');
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Handler para seleção de resultado de busca
  const handleSearchResultSelect = (categoryKey: string, subcategoryKey: string) => {
    handleNavigate(categoryKey, subcategoryKey);
  };

  // Valores da subcategoria ativa
  const activeValues = values[active.categoryKey]?.[active.subcategoryKey] || {};

  // Handler para mudança de valor
  const handleValueChange = (fieldKey: string, value: unknown) => {
    onValueChange(active.categoryKey, active.subcategoryKey, fieldKey, value);
  };

  // Handler para salvar
  const handleSave = () => {
    onSave(active.categoryKey, active.subcategoryKey);
  };

  // Handler para restaurar padrões
  const handleRestoreDefaults = () => {
    onRestoreDefaults(active.categoryKey, active.subcategoryKey);
  };

  const sidebarContent = (
    <ConfigSidebar
      categories={categories}
      activeCategory={active.categoryKey}
      activeSubcategory={active.subcategoryKey}
      searchResults={searchResults}
      searchQuery={searchQuery}
      onNavigate={handleNavigate}
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setHistoryOpen(true)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Historico</span>
        </Button>
      </div>

      {/* Search */}
      <ConfigSearch
        value={searchQuery}
        onChange={setSearchQuery}
        results={searchResults}
        onResultSelect={handleSearchResultSelect}
      />

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <aside className="w-72 shrink-0">{sidebarContent}</aside>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeCategory && activeSubcategory && (
            <ConfigContent
              category={activeCategory}
              subcategory={activeSubcategory}
              values={activeValues}
              panel={panel}
              onValueChange={handleValueChange}
              onSave={handleSave}
              onRestoreDefaults={handleRestoreDefaults}
              onNavigate={handleNavigate}
              onSaveField={
                onSaveField
                  ? (fieldKey, value) =>
                      onSaveField(active.categoryKey, active.subcategoryKey, fieldKey, value)
                  : undefined
              }
            />
          )}
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle>Categorias</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto">{sidebarContent}</div>
          </DrawerContent>
        </Drawer>
      )}

      {/* History Modal */}
      <ConfigHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        categories={categories}
      />
    </div>
  );
}
