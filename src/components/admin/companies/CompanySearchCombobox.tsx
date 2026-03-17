import { useState } from 'react';
import { ChevronsUpDown, Check, Building2, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatCNPJ } from '@/lib/cnpj';
import { useDebounce } from '@/hooks/useDebounce';
import { useCompanySearch } from '@/hooks/useTestPackagesQuery';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';

interface CompanySearchComboboxProps {
  value: { id: string; name: string; cnpj: string } | null;
  onChange: (company: { id: string; name: string; cnpj: string } | null) => void;
  excludeId?: string;
  placeholder?: string;
}

export function CompanySearchCombobox({
  value,
  onChange,
  excludeId,
  placeholder = 'Selecionar empresa...',
}: CompanySearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: companies = [], isLoading } = useCompanySearch(debouncedQuery, excludeId);

  const handleSelect = (company: { id: string; name: string; cnpj: string }) => {
    if (value?.id === company.id) {
      onChange(null);
    } else {
      onChange(company);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? (
            <span className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{value.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nome..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhuma empresa encontrada</CommandEmpty>
                <CommandGroup>
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.id}
                      onSelect={() => handleSelect(company)}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate text-sm font-medium">{company.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatCNPJ(company.cnpj)}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4 shrink-0',
                          value?.id === company.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
