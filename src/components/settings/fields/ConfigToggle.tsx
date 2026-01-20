/**
 * ConfigToggle Component
 * PRD-045: Campo de toggle/switch
 */

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { ConfigField } from '@/types/settings';

interface ConfigToggleProps {
  field: ConfigField;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ConfigToggle({ field, value, onChange }: ConfigToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={field.key} className="text-sm font-medium cursor-pointer">
          {field.name}
        </Label>
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
      </div>
      <Switch
        id={field.key}
        checked={value ?? false}
        onCheckedChange={onChange}
      />
    </div>
  );
}
