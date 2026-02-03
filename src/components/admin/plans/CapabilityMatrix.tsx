/**
 * CapabilityMatrix Component
 * PRD-060: Matrix table for plan capabilities management
 */

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
  const getValue = (planId: string, capKey: string): string | number | boolean | null => {
    const assignment = assignments.find(
      (a) => a.planId === planId && a.capabilityKey === capKey
    );
    return assignment?.value ?? null;
  };

  const renderCell = (plan: Plan, capability: PlanCapability) => {
    const value = getValue(plan.id, capability.key);

    if (capability.valueType === 'boolean') {
      return (
        <Checkbox
          checked={value === true}
          onCheckedChange={(checked) =>
            onUpdateAssignment(plan.id, capability.key, !!checked)
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
            onUpdateAssignment(
              plan.id,
              capability.key,
              parseInt(e.target.value, 10) || 0
            )
          }
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
            onUpdateAssignment(plan.id, capability.key, v)
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
            <>
              {/* Category header row */}
              <TableRow key={`cat-${category}`} className="bg-cyan-50/50 dark:bg-cyan-950/20">
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
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
