/**
 * MyPlan Page — Company
 * PRD-076: Shows current plan details, billing info, and subscription actions
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  ArrowUp,
  ArrowDown,
  X as XIcon,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans } from '@/hooks/usePlans';
import { useSubscription } from '@/hooks/usePlansQuery';
import { CancelSubscriptionModal } from '@/components/billing/CancelSubscriptionModal';
import type { Subscription } from '@/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativa', color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' },
  trial: { label: 'Trial', color: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800' },
  cancelled: { label: 'Cancelada', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' },
  past_due: { label: 'Pagamento Pendente', color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800' },
  expired: { label: 'Expirada', color: 'text-muted-foreground bg-muted/50 border-border' },
  suspended: { label: 'Suspensa', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  pending: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
};

export default function MyPlan() {
  const { user } = useAuth();
  const { companyPlans } = usePlans();
  const { data: subscription } = useSubscription(user?.id);
  const [cancelOpen, setCancelOpen] = useState(false);

  const sub = subscription as (Subscription & Record<string, unknown>) | null;
  const planName = (sub?.plan_name ?? sub?.planName ?? 'Sem plano') as string;
  const status = (sub?.status ?? 'pending') as string;
  const period = (sub?.period ?? 'monthly') as string;
  const pricePaid = (sub?.price_paid ?? sub?.pricePaid ?? 0) as number;
  const startDate = (sub?.start_date ?? sub?.startDate ?? '') as string;
  const endDate = (sub?.end_date ?? sub?.endDate ?? '') as string;
  const scheduledChange = (sub?.scheduled_plan_change ?? sub?.scheduledPlanChange) as { toPlanName: string; effectiveDate: string } | undefined;
  const statusCfg = STATUS_LABELS[status] ?? STATUS_LABELS.pending;

  const currentPlan = companyPlans.find(p => p.name === planName || p.slug === (sub?.plan_slug ?? sub?.planSlug));

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-cyan-600" />
            Meu Plano
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua assinatura e faturamento
          </p>
        </div>

        {/* Current plan card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-soft overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600" />
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{planName}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentPlan?.descriptionShort ?? 'Plano atual da sua empresa'}
                </p>
              </div>
              <Badge variant="outline" className={cn('text-xs', statusCfg.color)}>
                {statusCfg.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Valor</p>
                <p className="text-lg font-bold text-foreground">{formatBRL(pricePaid)}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{period}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Inicio</p>
                <p className="text-sm font-medium text-foreground">
                  {startDate ? new Date(startDate).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Proxima cobranca</p>
                <p className="text-sm font-medium text-foreground">
                  {endDate ? new Date(endDate).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-sm font-medium text-foreground">{statusCfg.label}</p>
              </div>
            </div>

            {/* Scheduled downgrade warning */}
            {scheduledChange && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Downgrade programado para {scheduledChange.toPlanName}
                  </p>
                  <p className="text-xs text-yellow-600">
                    Efetivo em {new Date(scheduledChange.effectiveDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {/* Past due warning */}
            {status === 'past_due' && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Problema com seu pagamento
                  </p>
                  <p className="text-xs text-red-600">
                    Atualize seu metodo de pagamento para manter o acesso.
                  </p>
                </div>
              </div>
            )}

            {/* Features */}
            {currentPlan && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Recursos do plano:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentPlan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="default" size="sm" className="gap-2">
            <Link to="/planos">
              <ArrowUp className="w-4 h-4" />
              Fazer Upgrade
            </Link>
          </Button>
          {status === 'active' && (
            <>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link to="/planos">
                  <ArrowDown className="w-4 h-4" />
                  Fazer Downgrade
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                <XIcon className="w-4 h-4" />
                Cancelar Assinatura
              </Button>
            </>
          )}
          {status === 'cancelled' && (
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reativar Assinatura
            </Button>
          )}
        </div>

        {/* Cancel Modal */}
        {sub && (
          <CancelSubscriptionModal
            open={cancelOpen}
            onClose={() => setCancelOpen(false)}
            subscriptionId={sub.id as string}
            planName={planName}
            endDate={endDate}
            lostFeatures={currentPlan?.features}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
