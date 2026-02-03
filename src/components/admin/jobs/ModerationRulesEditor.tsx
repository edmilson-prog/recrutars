/**
 * ModerationRulesEditor Component
 * PRD-058: Editor de regras de auto-flagging
 */

import { motion } from 'framer-motion';
import { Shield, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { AutoFlagRule } from '@/types';
import { cn } from '@/lib/utils';

interface ModerationRulesEditorProps {
  rules: AutoFlagRule[];
  onToggle: (id: string) => void;
}

const CONDITION_LABELS: Record<string, string> = {
  below: 'Valor abaixo de',
  contains: 'Contem palavras',
  length_below: 'Comprimento menor que',
  is_new: 'Registrada ha menos de (dias)',
  regex: 'Corresponde a padrao',
};

export function ModerationRulesEditor({ rules, onToggle }: ModerationRulesEditorProps) {
  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <motion.div
          key={rule.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'flex items-start gap-4 p-4 rounded-xl border bg-card',
            rule.isActive ? 'border-cyan-500/30' : 'border-border'
          )}
        >
          <Switch
            checked={rule.isActive}
            onCheckedChange={() => onToggle(rule.id)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Shield className={cn('w-4 h-4', rule.isActive ? 'text-cyan-600' : 'text-muted-foreground')} />
              <Label className="font-medium text-sm">{rule.name}</Label>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>
                Campo: <strong>{rule.field}</strong> | {CONDITION_LABELS[rule.condition] || rule.condition}: <strong>{rule.value}</strong>
              </span>
            </div>
          </div>
          <span
            className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
              rule.isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {rule.isActive ? 'Ativa' : 'Inativa'}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
