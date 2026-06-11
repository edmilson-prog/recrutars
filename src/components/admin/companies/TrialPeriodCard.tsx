/**
 * TrialPeriodCard — Admin control for a company's trial period.
 * Spec 2026-06-10: per-company trial release/extend/end from /admin/empresas/:id.
 *
 * Three vertical bands: current state (high contrast) -> controls -> destructive action.
 * State colors mirror TrialAlert (amber = high, red = urgent/expired).
 */

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  Info,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSubscription, useAdminSetTrialPeriod, useAdminEndTrial } from '@/hooks/usePlansQuery';
import { calculateTrialStatus, getWarningLevel } from '@/lib/trialRules';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type TrialCardState = 'awaiting' | 'active' | 'expiring' | 'expired' | 'paid';

interface TrialPeriodCardProps {
  /** Company auth user id (companies.profile_id / subscriptions.user_id) */
  userId: string | undefined;
  companyName: string;
  /** Suggested default for the days input (plans.trial_duration_days) */
  defaultDays?: number;
  /** Registers an entry in the page's admin actions timeline */
  onActionRegistered?: (details: string) => void;
}

const QUICK_DAYS = [7, 15, 30, 90];

function formatDateBRFromISO(iso: string): string {
  const datePart = iso.split('T')[0];
  const [y, m, d] = datePart.split('-');
  return `${d}/${m}/${y}`;
}

function addDaysISO(baseISO: string | null, days: number): string {
  const base = baseISO ? new Date(baseISO) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
}

const STATE_CONFIG: Record<
  TrialCardState,
  { icon: typeof Clock; band: string; iconWrap: string; iconColor: string; title: string }
> = {
  awaiting: {
    icon: Clock,
    band: 'border-border bg-muted/30',
    iconWrap: 'bg-muted',
    iconColor: 'text-muted-foreground',
    title: 'Aguardando liberação',
  },
  active: {
    icon: CalendarCheck,
    band: 'border-cyan-500/30 bg-cyan-500/5',
    iconWrap: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
    title: 'Em avaliação',
  },
  expiring: {
    icon: AlertTriangle,
    band: 'border-amber-500/30 bg-amber-500/5',
    iconWrap: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    title: 'Avaliação terminando',
  },
  expired: {
    icon: CalendarX,
    band: 'border-red-500/30 bg-red-500/5',
    iconWrap: 'bg-red-500/10',
    iconColor: 'text-red-500',
    title: 'Avaliação expirada',
  },
  paid: {
    icon: BadgeCheck,
    band: 'border-emerald-500/30 bg-emerald-500/5',
    iconWrap: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    title: 'Assinante ativo',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TrialPeriodCard({
  userId,
  companyName,
  defaultDays = 90,
  onActionRegistered,
}: TrialPeriodCardProps) {
  const { data: subscription, isLoading } = useSubscription(userId);
  const setTrialMutation = useAdminSetTrialPeriod();
  const endTrialMutation = useAdminEndTrial();

  const [days, setDays] = useState<number>(defaultDays);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  // ---------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------

  const trialStatus = useMemo(() => {
    if (!subscription?.isTrial || !subscription.trialStartDate || !subscription.trialEndDate) {
      return null;
    }
    return calculateTrialStatus(subscription.trialStartDate, subscription.trialEndDate);
  }, [subscription]);

  const cardState: TrialCardState = useMemo(() => {
    if (subscription && !subscription.isTrial) return 'paid';
    if (!subscription || !subscription.trialReleasedAt) return 'awaiting';
    if (!trialStatus) return 'awaiting';
    if (trialStatus.isExpired) return 'expired';
    const level = getWarningLevel(trialStatus.daysRemaining);
    if (level === 'high' || level === 'urgent') return 'expiring';
    return 'active';
  }, [subscription, trialStatus]);

  const isTrialRunning = cardState === 'active' || cardState === 'expiring';
  const endDateISO = subscription?.trialEndDate ?? null;
  const previewISO = useMemo(
    () => addDaysISO(isTrialRunning ? endDateISO : null, days || 0),
    [isTrialRunning, endDateISO, days],
  );
  const previewBR = formatDateBRFromISO(previewISO);
  const daysValid = Number.isInteger(days) && days >= 1 && days <= 365;
  const isPending = setTrialMutation.isPending || endTrialMutation.isPending;

  const config = STATE_CONFIG[cardState];
  const StateIcon =
    cardState === 'expiring' && trialStatus && getWarningLevel(trialStatus.daysRemaining) === 'urgent'
      ? Zap
      : config.icon;

  // ---------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------

  const handleConfirmSet = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // AlertDialogAction auto-closes; close manually in finally
    if (!userId || !daysValid) return;
    try {
      await setTrialMutation.mutateAsync({ userId, days });
      const verb = isTrialRunning ? 'estendida' : 'liberada';
      toast.success(`Avaliação ${verb} até ${previewBR}.`);
      onActionRegistered?.(
        isTrialRunning
          ? `Avaliação estendida em ${days} dias (até ${previewBR})`
          : `Avaliação liberada por ${days} dias (até ${previewBR})`,
      );
    } catch {
      toast.error('Não foi possível atualizar o período. Tente novamente.');
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleConfirmEnd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await endTrialMutation.mutateAsync({ userId });
      toast.success('Avaliação encerrada.');
      onActionRegistered?.('Avaliação encerrada manualmente');
    } catch {
      toast.error('Não foi possível encerrar a avaliação. Tente novamente.');
    } finally {
      setEndOpen(false);
    }
  };

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  if (isLoading) return null;

  return (
    <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Período de avaliação</h4>

      {/* Band 1: current state */}
      <div className={cn('flex items-start gap-4 rounded-lg border p-4', config.band)} role="status">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.iconWrap)}>
          <StateIcon className={cn('h-5 w-5', config.iconColor)} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{config.title}</p>
          <p className="text-sm text-muted-foreground">
            {cardState === 'awaiting' &&
              'Esta empresa ainda não teve o período de avaliação liberado.'}
            {cardState === 'active' && trialStatus && (
              <>
                <span className="font-medium text-cyan-600 dark:text-cyan-400">
                  {trialStatus.daysRemaining} dias
                </span>{' '}
                restantes · termina em {formatDateBRFromISO(trialStatus.endDate)}
              </>
            )}
            {cardState === 'expiring' && trialStatus && (
              <>
                Faltam{' '}
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {trialStatus.daysRemaining} dias
                </span>
                . Termina em {formatDateBRFromISO(trialStatus.endDate)}.
              </>
            )}
            {cardState === 'expired' && trialStatus && (
              <>Encerrou em {formatDateBRFromISO(trialStatus.endDate)}. A empresa está bloqueada.</>
            )}
            {cardState === 'paid' &&
              'Controle de avaliação não se aplica a assinantes pagos.'}
          </p>
          {/* Progress bar for running trials */}
          {isTrialRunning && trialStatus && trialStatus.totalDays > 0 && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  cardState === 'expiring' ? 'bg-amber-500' : 'bg-cyan-500',
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, (trialStatus.daysElapsed / trialStatus.totalDays) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Band 2: controls (or explanatory note for paid subscribers) */}
      {cardState === 'paid' ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Esta empresa possui assinatura paga ativa. O período de avaliação não se aplica.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Label
            htmlFor="trialDays"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {isTrialRunning ? 'Estender em mais quantos dias?' : 'Dias de avaliação a partir de hoje'}
          </Label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              id="trialDays"
              type="number"
              min={1}
              max={365}
              inputMode="numeric"
              placeholder="Ex.: 14"
              value={Number.isNaN(days) ? '' : days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              aria-describedby="trialDaysPreview"
              aria-invalid={!daysValid}
              className="w-full sm:w-32"
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de período">
              {QUICK_DAYS.map((d) => (
                <Button
                  key={d}
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                  className={cn(
                    days === d &&
                      'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                  )}
                >
                  +{d} dias
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            id="trialDaysPreview"
            className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm"
            aria-live="polite"
          >
            <CalendarClock className="h-4 w-4 text-cyan-500" aria-hidden="true" />
            <span className="text-muted-foreground">Novo término:</span>
            <motion.span
              key={previewBR}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-semibold text-foreground"
            >
              {daysValid ? previewBR : '—'}
            </motion.span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setConfirmOpen(true)} disabled={!daysValid || !userId || isPending}>
              {isTrialRunning ? 'Estender avaliação' : 'Liberar avaliação'}
            </Button>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              Esta ação será registrada no histórico da empresa.
            </p>
          </div>
        </div>
      )}

      {/* Band 3: destructive action — only for running trials */}
      {isTrialRunning && (
        <div className="border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEndOpen(true)}
            disabled={isPending}
            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500 focus-visible:ring-red-500"
          >
            Encerrar agora
          </Button>
        </div>
      )}

      {/* Confirm release/extend */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isTrialRunning
                ? `Estender avaliação até ${previewBR}?`
                : 'Liberar período de avaliação?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isTrialRunning
                ? `A avaliação de ${companyName} passará a terminar em ${previewBR}. A empresa receberá uma notificação no app.`
                : `${companyName} terá acesso completo até ${previewBR} e receberá uma notificação no app.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSet} disabled={isPending}>
              {isPending ? 'Confirmando...' : 'Confirmar liberação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm end now */}
      <AlertDialog open={endOpen} onOpenChange={setEndOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar avaliação agora?</AlertDialogTitle>
            <AlertDialogDescription>
              {companyName} perderá o acesso imediatamente e verá a tela de bloqueio.
              Esta ação pode ser revertida liberando um novo período.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter avaliação</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEnd}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Encerrando...' : 'Encerrar acesso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
