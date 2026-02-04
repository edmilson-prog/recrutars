/**
 * SubscriptionDetail Component
 * PRD-060: Sheet content for subscription detail view
 */

import {
  User,
  CreditCard,
  Calendar,
  Clock,
  Star,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Pause,
} from 'lucide-react';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SubscriptionActions } from './SubscriptionActions';
import { cn } from '@/lib/utils';
import { formatBRL, formatDateBR } from '@/lib/formatters';
import type { Subscription, SubscriptionHistory, SubscriptionActionType } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: { label: 'Ativa', color: 'text-success bg-success/10', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', color: 'text-destructive bg-destructive/10', icon: XCircle },
  expired: { label: 'Expirada', color: 'text-muted-foreground bg-muted', icon: Clock },
  suspended: { label: 'Suspensa', color: 'text-warning bg-warning/10', icon: Pause },
  pending: { label: 'Pendente', color: 'text-blue-600 bg-blue-100 dark:bg-blue-950', icon: AlertTriangle },
};

const PERIOD_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

const ACTION_CONFIG: Record<SubscriptionActionType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  created: { label: 'Assinatura criada', icon: CheckCircle2, color: 'text-success' },
  upgraded: { label: 'Upgrade', icon: ArrowUpCircle, color: 'text-cyan-600' },
  downgraded: { label: 'Downgrade', icon: ArrowDownCircle, color: 'text-warning' },
  cancelled: { label: 'Cancelada', icon: XCircle, color: 'text-destructive' },
  reactivated: { label: 'Reativada', icon: RefreshCw, color: 'text-success' },
  renewed: { label: 'Renovada', icon: RefreshCw, color: 'text-cyan-600' },
  expired: { label: 'Expirou', icon: Clock, color: 'text-muted-foreground' },
};

interface SubscriptionDetailProps {
  subscription: Subscription | null;
  history: SubscriptionHistory[];
  onCancel: (id: string, reason: string) => void;
  onReactivate: (id: string) => void;
  onClose: () => void;
}

export function SubscriptionDetail({
  subscription,
  history,
  onCancel,
  onReactivate,
  onClose: _onClose,
}: SubscriptionDetailProps) {
  if (!subscription) return null;

  const statusConfig = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
      <SheetHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-xl">{subscription.userName}</SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {subscription.userType === 'candidate' ? 'Candidato' : 'Empresa'}
            </p>
          </div>
          <Badge className={cn('gap-1', statusConfig.color)}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 mt-6">
        <div className="space-y-6 pr-4">
          {/* Subscription info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Informacoes da Assinatura
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Plano" value={subscription.planName} />
              <InfoItem label="Periodo" value={PERIOD_LABELS[subscription.period] || subscription.period} />
              <InfoItem label="Valor" value={formatBRL(subscription.pricePaid)} />
              <InfoItem
                label="Early Adopter"
                value={subscription.isEarlyAdopter ? 'Sim' : 'Nao'}
                highlight={subscription.isEarlyAdopter}
              />
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Datas
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Inicio" value={formatDateBR(subscription.startDate)} />
              <InfoItem label="Fim" value={formatDateBR(subscription.endDate)} />
              <InfoItem label="Renovacao" value={formatDateBR(subscription.renewalDate)} />
              <InfoItem label="Criada em" value={formatDateBR(subscription.createdAt)} />
              {subscription.cancelledAt && (
                <InfoItem label="Cancelada em" value={formatDateBR(subscription.cancelledAt)} />
              )}
            </div>
            {subscription.cancellationReason && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="text-xs font-medium text-destructive mb-1">Motivo do cancelamento</p>
                <p className="text-sm text-foreground">{subscription.cancellationReason}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* History timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Historico
            </h4>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => {
                  const actionConfig = ACTION_CONFIG[item.action] || ACTION_CONFIG.created;
                  const ActionIcon = actionConfig.icon;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 border-l-2 border-muted pl-4 py-1"
                    >
                      <ActionIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', actionConfig.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {actionConfig.label}
                        </p>
                        {item.fromPlanName && item.toPlanName && (
                          <p className="text-xs text-muted-foreground">
                            {item.fromPlanName} → {item.toPlanName}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.createdAt).toLocaleString('pt-BR')} ·{' '}
                          {item.performedBy === 'system' ? 'Sistema' : item.performedBy}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum historico registrado
              </p>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Acoes</h4>
            <SubscriptionActions
              subscription={subscription}
              onCancel={onCancel}
              onReactivate={onReactivate}
            />
          </div>
        </div>
      </ScrollArea>
    </SheetContent>
  );
}

function InfoItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-2.5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p
        className={cn(
          'text-sm font-medium mt-0.5',
          highlight ? 'text-cyan-600' : 'text-foreground'
        )}
      >
        {highlight && <Star className="w-3 h-3 inline mr-1" />}
        {value}
      </p>
    </div>
  );
}
