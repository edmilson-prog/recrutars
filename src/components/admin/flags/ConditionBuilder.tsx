/**
 * ConditionBuilder Component
 * PRD-062: Feature Flags "Switch"
 *
 * Visual builder for condition groups (OR between groups, AND within).
 */

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ConditionGroup, FlagCondition, ConditionType, ConditionOperator } from '@/types';

interface ConditionBuilderProps {
  conditionGroups: ConditionGroup[];
  onChange: (groups: ConditionGroup[]) => void;
}

const conditionTypes: { value: ConditionType; label: string }[] = [
  { value: 'plan_is', label: 'Plano' },
  { value: 'role_is', label: 'Papel' },
  { value: 'has_capability', label: 'Capacidade' },
  { value: 'user_type_is', label: 'Tipo de usuário' },
  { value: 'rollout_percent', label: 'Rollout percentual' },
];

const operatorsByType: Record<ConditionType, { value: ConditionOperator; label: string }[]> = {
  plan_is: [
    { value: 'EQUALS', label: 'Igual a' },
    { value: 'IN', label: 'Está em' },
    { value: 'NOT_IN', label: 'Não está em' },
  ],
  role_is: [
    { value: 'EQUALS', label: 'Igual a' },
    { value: 'IN', label: 'Está em' },
    { value: 'NOT_IN', label: 'Não está em' },
  ],
  has_capability: [
    { value: 'IN', label: 'Possui algum' },
    { value: 'NOT_IN', label: 'Não possui' },
  ],
  user_type_is: [
    { value: 'EQUALS', label: 'Igual a' },
    { value: 'IN', label: 'Está em' },
  ],
  rollout_percent: [
    { value: 'LTE', label: 'Até (%)' },
  ],
};

const userTypeOptions = ['admin', 'company', 'candidate'];
const planOptions = ['essencial', 'avancar', 'destaque-maximo', 'essencial-empresas', 'selecao-inteligente', 'recrutamento-premium'];

function getValueOptions(type: ConditionType): string[] | null {
  switch (type) {
    case 'user_type_is':
      return userTypeOptions;
    case 'plan_is':
      return planOptions;
    default:
      return null;
  }
}

function isMultiValue(operator: ConditionOperator): boolean {
  return operator === 'IN' || operator === 'NOT_IN';
}

function ConditionRow({
  condition,
  onUpdate,
  onRemove,
}: {
  condition: FlagCondition;
  onUpdate: (updates: Partial<FlagCondition>) => void;
  onRemove: () => void;
}) {
  const availableOperators = operatorsByType[condition.type] || [];
  const valueOptions = getValueOptions(condition.type);
  const multiValue = isMultiValue(condition.operator);

  const handleTypeChange = (newType: ConditionType) => {
    const ops = operatorsByType[newType] || [];
    onUpdate({
      type: newType,
      operator: ops[0]?.value || 'EQUALS',
      value: newType === 'rollout_percent' ? 50 : '',
    });
  };

  const handleValueChange = (newValue: string) => {
    if (condition.type === 'rollout_percent') {
      onUpdate({ value: parseInt(newValue) || 0 });
    } else if (multiValue) {
      onUpdate({ value: newValue.split(',').map(v => v.trim()).filter(Boolean) });
    } else {
      onUpdate({ value: newValue });
    }
  };

  const currentValueStr =
    condition.type === 'rollout_percent'
      ? String(condition.value)
      : Array.isArray(condition.value)
        ? condition.value.join(', ')
        : String(condition.value || '');

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Type select */}
      <Select value={condition.type} onValueChange={(v) => handleTypeChange(v as ConditionType)}>
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {conditionTypes.map((ct) => (
            <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator select */}
      <Select
        value={condition.operator}
        onValueChange={(v) => onUpdate({ operator: v as ConditionOperator })}
      >
        <SelectTrigger className="w-[130px] h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableOperators.map((op) => (
            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value input */}
      {valueOptions ? (
        <Select
          value={Array.isArray(condition.value) ? condition.value[0] || '' : String(condition.value)}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {valueOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={currentValueStr}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={
            condition.type === 'rollout_percent'
              ? '0-100'
              : multiValue
                ? 'valor1, valor2'
                : 'valor'
          }
          className="w-[180px] h-9 text-xs"
        />
      )}

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function ConditionBuilder({ conditionGroups, onChange }: ConditionBuilderProps) {
  const addGroup = () => {
    const newGroup: ConditionGroup = {
      conditions: [{ type: 'plan_is', operator: 'EQUALS', value: '' }],
    };
    onChange([...conditionGroups, newGroup]);
  };

  const removeGroup = (groupIndex: number) => {
    onChange(conditionGroups.filter((_, i) => i !== groupIndex));
  };

  const addCondition = (groupIndex: number) => {
    const updated = conditionGroups.map((group, i) => {
      if (i !== groupIndex) return group;
      return {
        ...group,
        conditions: [...group.conditions, { type: 'plan_is' as ConditionType, operator: 'EQUALS' as ConditionOperator, value: '' }],
      };
    });
    onChange(updated);
  };

  const removeCondition = (groupIndex: number, condIndex: number) => {
    const updated = conditionGroups.map((group, i) => {
      if (i !== groupIndex) return group;
      return {
        ...group,
        conditions: group.conditions.filter((_, ci) => ci !== condIndex),
      };
    });
    // Remove group if empty
    onChange(updated.filter(g => g.conditions.length > 0));
  };

  const updateCondition = (groupIndex: number, condIndex: number, updates: Partial<FlagCondition>) => {
    const updated = conditionGroups.map((group, i) => {
      if (i !== groupIndex) return group;
      return {
        ...group,
        conditions: group.conditions.map((cond, ci) => {
          if (ci !== condIndex) return cond;
          return { ...cond, ...updates };
        }),
      };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {conditionGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {groupIndex > 0 && (
            <div className="flex items-center justify-center my-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3">
                OU
              </Badge>
            </div>
          )}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Grupo {groupIndex + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(groupIndex)}
                  className="h-7 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remover grupo
                </Button>
              </div>

              {group.conditions.map((condition, condIndex) => (
                <div key={condIndex}>
                  {condIndex > 0 && (
                    <div className="flex items-center ml-4 my-1">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0">
                        E
                      </Badge>
                    </div>
                  )}
                  <ConditionRow
                    condition={condition}
                    onUpdate={(updates) => updateCondition(groupIndex, condIndex, updates)}
                    onRemove={() => removeCondition(groupIndex, condIndex)}
                  />
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => addCondition(groupIndex)}
                className="h-7 text-xs mt-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar Condição
              </Button>
            </CardContent>
          </Card>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addGroup}
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Grupo
      </Button>
    </div>
  );
}
