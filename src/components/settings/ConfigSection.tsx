/**
 * ConfigSection Component
 * PRD-045: Seção de campo individual com renderização por tipo
 */

import { ConfigTextField } from './fields/ConfigTextField';
import { ConfigToggle } from './fields/ConfigToggle';
import { ConfigSelect } from './fields/ConfigSelect';
import { ConfigModelSelect } from './fields/ConfigModelSelect';
import { ConfigImageUpload } from './fields/ConfigImageUpload';
import type { ConfigField } from '@/types/settings';

interface ConfigSectionProps {
  field: ConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function ConfigSection({ field, value, onChange }: ConfigSectionProps) {
  switch (field.type) {
    case 'text':
    case 'password':
      return (
        <ConfigTextField
          field={field}
          value={value as string}
          onChange={onChange}
          type={field.type === 'password' ? 'password' : 'text'}
        />
      );

    case 'textarea':
      return (
        <ConfigTextField
          field={field}
          value={value as string}
          onChange={onChange}
          multiline
        />
      );

    case 'number':
      return (
        <ConfigTextField
          field={field}
          value={value as number}
          onChange={onChange}
          type="number"
        />
      );

    case 'boolean':
      return (
        <ConfigToggle
          field={field}
          value={value as boolean}
          onChange={onChange}
        />
      );

    case 'select':
      return (
        <ConfigSelect
          field={field}
          value={value as string}
          onChange={onChange}
        />
      );

    case 'model-select':
      return (
        <ConfigModelSelect
          field={field}
          value={value as string}
          onChange={onChange}
        />
      );

    case 'multiselect':
      return (
        <ConfigSelect
          field={field}
          value={value as string[]}
          onChange={onChange}
          multiple
        />
      );

    case 'color':
      return (
        <ConfigTextField
          field={field}
          value={value as string}
          onChange={onChange}
          type="color"
        />
      );

    case 'image':
      return (
        <ConfigImageUpload
          field={field}
          value={value as string}
          onChange={onChange}
        />
      );

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Tipo de campo nao suportado: {field.type}
        </div>
      );
  }
}
