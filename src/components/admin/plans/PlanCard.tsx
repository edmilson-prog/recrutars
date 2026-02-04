/**
 * PlanCard Component
 * PRD-060: Reusable plan card for admin plans management
 */

import { motion } from 'framer-motion';
import { Check, Edit, Power, PowerOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import type { Plan, PlanPeriod } from '@/types';

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onToggleStatus: (id: string) => void;
  index?: number;
}

export function PlanCard({ plan, onEdit, onToggleStatus, index = 0 }: PlanCardProps) {
  const hasLaunchPrices = plan.launchPrices && Object.values(plan.launchPrices).some(v => v > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'bg-card rounded-2xl shadow-soft overflow-hidden transition-all hover:shadow-md',
        !plan.isActive && 'opacity-60'
      )}
    >
      {/* Gradient top border */}
      <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600" />

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
            variant={plan.isActive ? 'default' : 'outline'}
            className={cn(
              plan.isActive
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            )}
          >
            {plan.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {plan.descriptionShort}
        </p>

        {/* Prices grid */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Precos</h4>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((period) => {
              const regularPrice = plan.prices[period];
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
                    <p className="text-base font-bold text-success">Gratis</p>
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
              Preco de lancamento ate {new Date(plan.launchPriceEndDate).toLocaleDateString('pt-BR')}
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
          <Button
            variant={plan.isActive ? 'ghost' : 'default'}
            size="sm"
            onClick={() => onToggleStatus(plan.id)}
          >
            {plan.isActive ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
