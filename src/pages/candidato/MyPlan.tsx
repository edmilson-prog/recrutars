/**
 * MyPlan Page — Candidate
 * PRD-076: Shows current plan details and subscription actions for candidates
 */

import { Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowUp,
  CheckCircle,
  CircleDot,
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
import type { Subscription } from '@/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativa', color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' },
  trial: { label: 'Trial', color: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800' },
  cancelled: { label: 'Cancelada', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' },
  expired: { label: 'Expirada', color: 'text-muted-foreground bg-muted/50 border-border' },
  pending: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
};

export default function CandidateMyPlan() {
  const { user } = useAuth();
  const { candidatePlans } = usePlans();
  const { data: subscription } = useSubscription(user?.id);

  const sub = subscription as (Subscription & Record<string, unknown>) | null;
  const planName = (sub?.plan_name ?? sub?.planName ?? 'Essencial') as string;
  const status = (sub?.status ?? 'active') as string;
  const pricePaid = (sub?.price_paid ?? sub?.pricePaid ?? 0) as number;
  const endDate = (sub?.end_date ?? sub?.endDate ?? '') as string;
  const statusCfg = STATUS_LABELS[status] ?? STATUS_LABELS.active;
  const isFree = pricePaid === 0;

  const currentPlan = candidatePlans.find(p => p.name === planName || p.slug === (sub?.plan_slug ?? sub?.planSlug));

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-cyan-600" />
            Meu Plano
          </h1>
          <p className="text-muted-foreground mt-1">
            Detalhes da sua assinatura
          </p>
        </div>

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
                  {currentPlan?.descriptionShort ?? (isFree ? 'Plano gratuito' : 'Plano atual')}
                </p>
              </div>
              <Badge variant="outline" className={cn('text-xs gap-1', statusCfg.color)}>
                <CircleDot className="w-3 h-3" />
                {statusCfg.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Valor</p>
                <p className="text-lg font-bold text-foreground">
                  {isFree ? 'Gratis' : formatBRL(pricePaid)}
                </p>
              </div>
              {!isFree && endDate && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Proxima cobranca</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-sm font-medium text-foreground">{statusCfg.label}</p>
              </div>
            </div>

            {currentPlan && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Recursos inclusos:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="default" size="sm" className="gap-2 gradient-primary">
            <Link to="/candidato/conta?tab=plano">
              <ArrowUp className="w-4 h-4" />
              {isFree ? 'Fazer Upgrade' : 'Mudar Plano'}
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Compare todos os planos e gerencie sua assinatura.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
