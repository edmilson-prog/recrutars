/**
 * ChannelSelector
 * Toggle selector for notification delivery channels (In-App, WhatsApp, Ambos).
 * Follows the same visual pattern as targetOptions in CreateNotificationDialog.
 */

import { Bell, MessageCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationChannel } from '@/types/notificationSends';

interface ChannelSelectorProps {
  value: NotificationChannel | '';
  onChange: (channel: NotificationChannel) => void;
  disabled?: boolean;
}

const channelOptions: {
  value: NotificationChannel;
  label: string;
  icon: typeof Bell;
}[] = [
  { value: 'in_app', label: 'In-App', icon: Bell },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'both', label: 'Ambos', icon: RefreshCw },
];

export function ChannelSelector({ value, onChange, disabled = false }: ChannelSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Canal de envio">
      {channelOptions.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-left',
              isSelected
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-background text-muted-foreground border-border hover:bg-muted/50',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <option.icon className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium leading-tight">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
