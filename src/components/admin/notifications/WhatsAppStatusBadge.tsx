/**
 * WhatsAppStatusBadge
 * Displays a colored badge with an icon for WhatsApp message delivery status.
 */

import { Check, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  whatsAppStatusColors,
  whatsAppStatusLabels,
  type WhatsAppMessageStatus,
} from '@/types/whatsapp';

interface WhatsAppStatusBadgeProps {
  status: WhatsAppMessageStatus;
  className?: string;
}

const statusIcons: Record<WhatsAppMessageStatus, typeof Clock> = {
  queued: Clock,
  sent: Check,
  failed: XCircle,
};

export function WhatsAppStatusBadge({ status, className }: WhatsAppStatusBadgeProps) {
  const Icon = statusIcons[status];
  const label = whatsAppStatusLabels[status];
  const colors = whatsAppStatusColors[status];

  return (
    <Badge
      variant="secondary"
      className={cn('gap-1 border-transparent', colors, className)}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}
