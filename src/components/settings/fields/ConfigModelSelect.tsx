/**
 * ConfigModelSelect Component
 * Dropdown que carrega modelos dinamicamente da API Anthropic
 */

import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAnthropicModels } from '@/hooks/useAnthropicModelsQuery';
import type { ConfigField } from '@/types/settings';

interface ConfigModelSelectProps {
  field: ConfigField;
  value: string;
  onChange: (value: string) => void;
}

export function ConfigModelSelect({
  field,
  value,
  onChange,
}: ConfigModelSelectProps) {
  const { data: models, isLoading, isError } = useAnthropicModels();

  const options =
    models && models.length > 0
      ? models.map((m) => ({ value: m.id, label: m.display_name }))
      : field.options ?? [];

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key} className="text-sm font-medium">
        {field.name}
        {field.validation?.required && (
          <span className="text-destructive ml-1">*</span>
        )}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id={field.key}>
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando modelos...
            </span>
          ) : (
            <SelectValue placeholder="Selecione um modelo..." />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.description && (
        <p className="text-xs text-muted-foreground">
          {field.description}
          {isError && ' (fallback: lista offline)'}
        </p>
      )}
    </div>
  );
}
