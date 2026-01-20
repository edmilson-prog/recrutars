/**
 * ConfigTextField Component
 * PRD-045: Campo de texto/número/password/textarea
 */

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { ConfigField } from '@/types/settings';

interface ConfigTextFieldProps {
  field: ConfigField;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'password' | 'number' | 'color';
  multiline?: boolean;
}

export function ConfigTextField({
  field,
  value,
  onChange,
  type = 'text',
  multiline = false,
}: ConfigTextFieldProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  const inputProps = {
    id: field.key,
    value: value ?? '',
    onChange: handleChange,
    placeholder: field.description,
    ...(field.validation?.minLength && { minLength: field.validation.minLength }),
    ...(field.validation?.maxLength && { maxLength: field.validation.maxLength }),
    ...(type === 'number' && field.validation?.min !== undefined && { min: field.validation.min }),
    ...(type === 'number' && field.validation?.max !== undefined && { max: field.validation.max }),
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key} className="text-sm font-medium">
        {field.name}
        {field.validation?.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {type === 'color' ? (
        <div className="flex items-center gap-3">
          <Input
            type="color"
            {...inputProps}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={value ?? ''}
            onChange={handleChange}
            className="flex-1 font-mono"
            placeholder="#000000"
          />
        </div>
      ) : multiline ? (
        <Textarea
          {...inputProps}
          rows={4}
          className="resize-none"
        />
      ) : (
        <Input
          type={type}
          {...inputProps}
        />
      )}

      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}

      {field.validation?.maxLength && multiline && (
        <p className="text-xs text-muted-foreground text-right">
          {String(value).length}/{field.validation.maxLength} caracteres
        </p>
      )}
    </div>
  );
}
