/**
 * ConfigSearch Component
 * PRD-045: Busca global nas configurações
 */

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ConfigSearchResult } from '@/types/settings';

interface ConfigSearchProps {
  value: string;
  onChange: (value: string) => void;
  results: ConfigSearchResult[];
  onResultSelect: (categoryKey: string, subcategoryKey: string) => void;
}

export function ConfigSearch({
  value,
  onChange,
  results,
  onResultSelect,
}: ConfigSearchProps) {
  const hasResults = results.length > 0;
  const showDropdown = value.length > 0 && hasResults;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar configuracao..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-64 overflow-y-auto">
          {results.slice(0, 10).map((result, index) => (
            <button
              key={`${result.categoryKey}-${result.subcategoryKey}-${result.fieldKey || index}`}
              onClick={() =>
                onResultSelect(result.categoryKey, result.subcategoryKey)
              }
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-muted',
                'flex items-center gap-2 border-b last:border-b-0'
              )}
            >
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  result.matchType === 'category' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                  result.matchType === 'subcategory' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  result.matchType === 'field' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                )}
              >
                {result.matchType === 'category' && 'Cat'}
                {result.matchType === 'subcategory' && 'Sub'}
                {result.matchType === 'field' && 'Campo'}
              </span>
              <span>{result.matchText}</span>
            </button>
          ))}
          {results.length > 10 && (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              +{results.length - 10} resultados
            </div>
          )}
        </div>
      )}

      {/* Nenhum resultado */}
      {value.length > 0 && !hasResults && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg">
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            Nenhuma configuracao encontrada para "{value}"
          </div>
        </div>
      )}
    </div>
  );
}
