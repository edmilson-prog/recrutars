/**
 * TicketStatusChanger Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Dropdown for changing ticket status.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TicketStatus } from '@/types/help';
import { ticketStatusLabels, ticketStatusColors } from '@/types/help';
import { cn } from '@/lib/utils';

interface TicketStatusChangerProps {
  currentStatus: TicketStatus;
  onStatusChange: (status: TicketStatus) => void;
  disabled?: boolean;
}

const statusBadgeColors: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

export function TicketStatusChanger({ currentStatus, onStatusChange, disabled }: TicketStatusChangerProps) {
  return (
    <Select
      value={currentStatus}
      onValueChange={(v) => onStatusChange(v as TicketStatus)}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-[160px] h-8 text-xs', statusBadgeColors[ticketStatusColors[currentStatus]])}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ticketStatusLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
