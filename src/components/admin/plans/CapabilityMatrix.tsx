/**
 * CapabilityMatrix Component
 * PRD-060: Matrix table for plan capabilities management
 */

import { useState, useEffect, useCallback, Fragment } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Plan, PlanCapability, PlanCapabilityAssignment } from '@/types';

interface CapabilityMatrixProps {
  plans: Plan[];
  capabilities: PlanCapability[];
  assignments: PlanCapabilityAssignment[];
  categorizedCapabilities: Record<string, PlanCapability[]>;
  onUpdateAssignment: (planId: string, capKey: string, value: string | number | boolean) => void;
}

export function CapabilityMatrix({
  plans,
  capabilities: _capabilities,
  assignments,
  categorizedCapabilities,
  onUpdateAssignment,
}: CapabilityMatrixProps) {
  // Optimistic local overrides — applied immediately on user interaction,
  // cleared when React Query delivers fresh data via `assignments` prop.
  const [localOverrides, setLocalOverrides] = useState<Map<string, string | number | boolean>>(new Map());

  // Clear overrides when server data arrives (React Query refetched)
  useEffect(() => {
    setLocalOverrides(new Map());
  }, [assignments]);

  const getValue = useCallback((planId: string, capKey: string): string | number | boolean | null => {
    const overrideKey = `${planId}:${capKey}`;
    if (localOverrides.has(overrideKey)) return localOverrides.get(overrideKey)!;
    const assignment = assignments.find(
      (a) => a.planId === planId && a.capabilityKey === capKey
    );
    return assignment?.value ?? null;
  }, [assignments, localOverrides]);

  // For checkboxes and selects: update local override + fire mutation immediately
  const handleImmediateChange = useCallback((planId: string, capKey: string, value: string | number | boolean) => {
    setLocalOverrides(prev => new Map(prev).set(`${planId}:${capKey}`, value));
    onUpdateAssignment(planId, capKey, value);
  }, [onUpdateAssignment]);

  // For number inputs: only update local override (mutation fires on blur)
  const handleLocalChange = useCallback((planId: string, capKey: string, value: number) => {
    setLocalOverrides(prev => new Map(prev).set(`${planId}:${capKey}`, value));
  }, []);

  // Fire mutation on blur for number inputs
  const handleBlurSave = useCallback((planId: string, capKey: string) => {
    const overrideKey = `${planId}:${capKey}`;
    const value = localOverrides.get(overrideKey);
    if (value !== undefined) {
      onUpdateAssignment(planId, capKey, value);
    }
  }, [localOverrides, onUpdateAssignment]);

  const renderCell = (plan: Plan, capability: PlanCapability) => {
    const value = getValue(plan.id, capability.key);

    if (capability.valueType === 'boolean') {
      return (
        <Checkbox
          checked={value === true}
          onCheckedChange={(checked) =>
            handleImmediateChange(plan.id, capability.key, !!checked)
          }
        />
      );
    }

    if (capability.valueType === 'number') {
      return (
        <Input
          type="number"
          min={0}
          value={typeof value === 'number' ? value : 0}
          onChange={(e) =>
            handleLocalChange(
              plan.id,
              capability.key,
              parseInt(e.target.value, 10) || 0
            )
          }
          onBlur={() => handleBlurSave(plan.id, capability.key)}
          className="h-8 w-20 text-sm text-center"
        />
      );
    }

    if (capability.valueType === 'enum' && capability.possibleValues) {
      const currentValue = typeof value === 'string' ? value : capability.possibleValues[0] || '';
      return (
        <Select
          value={currentValue}
          onValueChange={(v) =>
            handleImmediateChange(plan.id, capability.key, v)
          }
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {capability.possibleValues.map((pv) => (
              <SelectItem key={pv} value={pv}>
                {pv}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return <span className="text-muted-foreground text-xs">--</span>;
  };

  const categories = Object.keys(categorizedCapabilities);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[220px]">
              Capability
            </TableHead>
            {plans.map((plan) => (
              <TableHead key={plan.id} className="text-center min-w-[130px]">
                <div className="font-semibold">{plan.name}</div>
                <div className="text-xs font-normal text-muted-foreground">
                  {plan.slug}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <Fragment key={category}>
              {/* Category header row */}
              <TableRow className="bg-cyan-50/50 dark:bg-cyan-950/20">
                <TableCell
                  colSpan={plans.length + 1}
                  className="font-semibold text-cyan-700 dark:text-cyan-400 text-sm py-2"
                >
                  {category}
                </TableCell>
              </TableRow>

              {/* Capability rows */}
              {categorizedCapabilities[category].map((cap) => (
                <TableRow key={cap.id} className="hover:bg-muted/30">
                  <TableCell className={cn(
                    'sticky left-0 bg-card z-10',
                    'border-r border-border'
                  )}>
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {cap.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cap.key}
                      </div>
                    </div>
                  </TableCell>
                  {plans.map((plan) => (
                    <TableCell key={`${plan.id}-${cap.key}`} className="text-center">
                      <div className="flex items-center justify-center">
                        {renderCell(plan, cap)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
