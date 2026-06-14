/**
 * PlanCard Component
 * PRD-060: Reusable plan card for admin plans management
 */

import { motion } from 'framer-motion';
import { Check, Copy, Edit, Power, PowerOff, Clock, Percent, RefreshCw, Trash2 } from 'lucide-react';
import { StripeSyncStatus } from '@/components/admin/stripe/StripeSyncStatus';
import { STRIPE_ENV_LABELS } from '@/components/admin/stripe/stripeEnvironmentLabels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { useSyncPlan } from '@/hooks/useStripeQuery';
import type { Plan, PlanPeriod, StripeEnvironment } from '@/types';

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
  one_time: 'Avulso',
};

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onToggleStatus: (id: string) => void;
  onDelete?: (plan: Plan) => void;
  onClone?: (plan: Plan) => void;
  index?: number;
  stripeEnvironment?: StripeEnvironment;
}

export function PlanCard({ plan, onEdit, onToggleStatus, onDelete, onClone, index = 0, stripeEnvironment = 'live' }: PlanCardProps) {
  const hasLaunchPrices = plan.launchPrices && Object.values(plan.launchPrices).some(v => v > 0);
  const isTrial = !!plan.trialDurationDays;
  const syncPlan = useSyncPlan();

  const isActive = plan.isActive ?? true;

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
      {/* Gradient top border — cyan/teal for trial, cyan/blue for normal */}
      <div className={cn(
        "h-1.5 bg-gradient-to-r",
        isTrial ? "from-teal-400 to-cyan-500" : "from-cyan-500 to-blue-600"
      )} />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              {plan.badge && (
                <Badge variant="secondary" className="text-xs">
                  {plan.badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{plan.slug}</p>
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

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {plan.descriptionShort}
        </p>

        {/* PRD-074: Trial & discount info */}
        {(isTrial || ((plan.discountPercentage ?? 0) > 0)) && (
          <div className="flex flex-wrap gap-2">
            {isTrial && (
              <Badge variant="outline" className="gap-1 text-xs text-teal-600 border-teal-300 dark:text-teal-400 dark:border-teal-700">
                <Clock className="w-3 h-3" />
                Trial {plan.trialDurationDays} dias
              </Badge>
            )}
            {!isTrial && (plan.discountPercentage ?? 0) > 0 && (
              <Badge variant="outline" className="gap-1 text-xs text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">
                <Percent className="w-3 h-3" />
                {plan.discountPercentage}% off ({plan.discountMinPeriod}+)
              </Badge>
            )}
          </div>
        )}

        {/* Stripe sync status — both environments + sync action (active env) */}
        {!plan.isFree && (
          <div className="space-y-2">
            <StripeSyncStatus
              liveProductId={plan.stripeProductIdLive}
              liveSyncedAt={plan.stripeSyncedAtLive}
              testProductId={plan.stripeProductIdTest}
              testSyncedAt={plan.stripeSyncedAtTest}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={syncPlan.isPending}
              onClick={() => syncPlan.mutate({ planId: plan.id, environment: stripeEnvironment })}
            >
              <RefreshCw className={cn('mr-1 h-3 w-3', syncPlan.isPending && 'animate-spin')} />
              Sincronizar {STRIPE_ENV_LABELS[stripeEnvironment]}
            </Button>
          </div>
        )}

        {/* Prices grid */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Preços</h4>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((period) => {
              const regularPrice = plan.prices[period] ?? 0;
              const launchPrice = plan.launchPrices?.[period];
              const showLaunchPrice = hasLaunchPrices && launchPrice !== undefined && launchPrice > 0 && launchPrice < regularPrice;

              return (
                <div
                  key={period}
                  className="bg-muted/50 rounded-lg p-2.5 text-center"
                >
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {PERIOD_LABELS[period]}
                  </p>
                  {plan.isFree ? (
                    <p className="text-base font-bold text-success">Grátis</p>
                  ) : showLaunchPrice ? (
                    <div>
                      <p className="text-xs text-muted-foreground line-through">
                        {formatBRL(regularPrice)}
                      </p>
                      <p className="text-base font-bold text-cyan-600">
                        {formatBRL(launchPrice)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-base font-bold text-foreground">
                      {formatBRL(regularPrice)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {hasLaunchPrices && plan.launchPriceEndDate && (
            <p className="text-xs text-cyan-600 font-medium">
              Preço de lançamento até {new Date(plan.launchPriceEndDate).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Recursos</h4>
          <ul className="space-y-1.5">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(plan)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          {onClone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-cyan-600 border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 dark:text-cyan-400 dark:border-cyan-700 dark:hover:bg-cyan-950 dark:hover:text-cyan-300"
                  onClick={() => onClone(plan)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicar plano</TooltipContent>
            </Tooltip>
          )}
          <Button
            variant={isActive ? 'ghost' : 'default'}
            size="sm"
            onClick={() => onToggleStatus(plan.id)}
          >
            {isActive ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(plan)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
