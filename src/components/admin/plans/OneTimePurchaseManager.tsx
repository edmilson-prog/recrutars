/**
 * OneTimePurchaseManager Component
 * PRD-060: One-time purchases section (read-only display)
 */

import { ShoppingBag, User, Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatBRL, formatDateBR } from '@/lib/formatters';
import type { OneTimePurchase } from '@/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativa', color: 'bg-success/10 text-success' },
  expired: { label: 'Expirada', color: 'bg-muted text-muted-foreground' },
  refunded: { label: 'Reembolsada', color: 'bg-warning/10 text-warning' },
};

interface OneTimePurchaseManagerProps {
  purchases: OneTimePurchase[];
}

export function OneTimePurchaseManager({ purchases }: OneTimePurchaseManagerProps) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 bg-card rounded-2xl shadow-soft">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Nenhuma compra avulsa registrada</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Compras Avulsas
          <Badge variant="secondary" className="ml-2">
            {purchases.length}
          </Badge>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Usuario
                </div>
              </TableHead>
              <TableHead>Capability</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Valor
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Compra
                </div>
              </TableHead>
              <TableHead>Expiracao</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => {
              const statusInfo = STATUS_LABELS[purchase.status] || STATUS_LABELS.active;

              return (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium text-foreground">
                    {purchase.userName}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{purchase.capabilityName}</p>
                      <p className="text-xs text-muted-foreground">{purchase.capabilityKey}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatBRL(purchase.price)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDateBR(purchase.purchasedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {purchase.expiresAt
                      ? formatDateBR(purchase.expiresAt)
                      : 'Permanente'}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', statusInfo.color)}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
