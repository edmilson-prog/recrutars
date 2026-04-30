import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useId } from 'react';

export interface MatchCombineSkillsToggleProps {
  combined: boolean;
  onChange: (next: boolean) => void;
}

export function MatchCombineSkillsToggle({ combined, onChange }: MatchCombineSkillsToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={combined} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-xs text-muted-foreground cursor-pointer">
        Combinar skills
      </Label>
    </div>
  );
}
