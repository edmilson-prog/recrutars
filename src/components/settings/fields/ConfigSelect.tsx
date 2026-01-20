/**
 * ConfigSelect Component
 * PRD-045: Campo de seleção (select/multiselect)
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { ConfigField } from '@/types/settings';

interface ConfigSelectProps {
  field: ConfigField;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export function ConfigSelect({
  field,
  value,
  onChange,
  multiple = false,
}: ConfigSelectProps) {
  if (multiple) {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleToggle = (optionValue: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, optionValue]);
      } else {
        onChange(selectedValues.filter((v) => v !== optionValue));
      }
    };

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {field.name}
          {field.validation?.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        <div className="space-y-2 rounded-lg border p-3">
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`${field.key}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleToggle(option.value, checked as boolean)
                }
              />
              <Label
                htmlFor={`${field.key}-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key} className="text-sm font-medium">
        {field.name}
        {field.validation?.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={value as string}
        onValueChange={onChange as (value: string) => void}
      >
        <SelectTrigger id={field.key}>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
