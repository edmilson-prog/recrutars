/**
 * PackageCard Component
 * Reusable card for each test package in the admin listing.
 * Follows PlanCard.tsx pattern.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Copy, Edit, Power, PowerOff, Trash2,
  RefreshCw, Cloud, CloudOff, MoreHorizontal, Package,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import type { TestPackage } from '@/types/testPackages';
import type { StripeEnvironment } from '@/types/plans';

const TYPE_LABELS: Record<string, string> = {
  gauge_pro: 'Gauge-Pro',
};

interface PackageCardProps {
  pkg: TestPackage;
  stripeEnv: StripeEnvironment;
  onEdit: () => void;
  onClone: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onSync: () => void;
  isSyncing?: boolean;
  index?: number;
}

export function PackageCard({
  pkg,
  stripeEnv,
  onEdit,
  onClone,
  onToggleActive,
  onDelete,
  onSync,
  isSyncing = false,
  index = 0,
}: PackageCardProps) {
  const isActive = pkg.isActive ?? (pkg as unknown as Record<string, unknown>).is_active ?? true;
  const credits = pkg.credits ?? (pkg as unknown as Record<string, unknown>).credits ?? 0;
  const price = pkg.price ?? 0;
  const originalPrice = pkg.originalPrice ?? (pkg as unknown as Record<string, unknown>).original_price ?? null;
  const features = pkg.features ?? [];
  const badge = pkg.badge ?? null;
  const pkgType = pkg.type ?? 'gauge_pro';

  const productId = stripeEnv === 'test' ? pkg.stripeProductIdTest : pkg.stripeProductIdLive;
  const syncedAt = stripeEnv === 'test' ? pkg.stripeSyncedAtTest : pkg.stripeSyncedAtLive;
  const isSynced = !!productId;

  const discountPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'bg-card rounded-2xl shadow-soft overflow-hidden transition-all hover:shadow-md',
        !isActive && 'opacity-60'
      )}
    >
      {/* Gradient top border */}
      <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[pkgType] ?? pkgType}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {credits} {credits === 1 ? 'credito' : 'creditos'}
              </span>
            </div>
          </div>
          <Badge
            variant={isActive ? 'default' : 'outline'}
            className={cn(
              isActive
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            )}
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {formatBRL(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatBRL(originalPrice)}
                </span>
                {discountPercentage && (
                  <Badge variant="secondary" className="text-xs text-green-600">
                    -{discountPercentage}%
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stripe sync badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'gap-1 text-xs',
              isSynced
                ? 'text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700'
                : 'text-muted-foreground border-border'
            )}
          >
            {isSynced ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
            {isSynced
              ? (syncedAt
                  ? `Sync ${new Date(syncedAt).toLocaleDateString('pt-BR')}`
                  : 'Stripe sincronizado')
              : 'Nao sincronizado'}
          </Badge>
        </div>

        {/* Features (first 3) */}
        {features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Recursos</h4>
            <ul className="space-y-1.5">
              {features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {features.length > 3 && (
                <li className="text-xs text-muted-foreground pl-6">
                  +{features.length - 3} {features.length - 3 === 1 ? 'recurso' : 'recursos'}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-cyan-600 border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 dark:text-cyan-400 dark:border-cyan-700 dark:hover:bg-cyan-950 dark:hover:text-cyan-300"
                onClick={onClone}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicar pacote</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSync} disabled={isSyncing}>
                <RefreshCw className={cn('w-4 h-4 mr-2', isSyncing && 'animate-spin')} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Stripe'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive}>
                {isActive ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
