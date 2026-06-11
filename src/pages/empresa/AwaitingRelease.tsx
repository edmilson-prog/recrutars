/**
 * AwaitingRelease Page
 * Spec 2026-06-10: Welcoming fullscreen page for newly registered companies
 * whose trial was not yet released by the admin (trial_released_at IS NULL).
 *
 * - Success-toned hero (account created, awaiting team release)
 * - 3-step timeline (created -> awaiting -> full access)
 * - Optional shortcut: subscribe to a paid plan right away
 * - Link to account settings (allowed even while locked)
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CircleCheckBig, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { usePlans } from '@/hooks/usePlans';
import { CheckoutButton } from '@/components/billing/CheckoutButton';
import type { PlanPeriod } from '@/types';

const PERIOD_LABELS: Omit<Record<PlanPeriod, string>, 'one_time'> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

type RecurringPeriod = Exclude<PlanPeriod, 'one_time'>;

export default function AwaitingRelease() {
  const { companyPlans } = usePlans();
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the heading so screen readers announce the status immediately
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const paidPlans = companyPlans.filter((p) => !p.isFree && p.isActive);
  const isDiscountPeriod = selectedPeriod === 'semiannual' || selectedPeriod === 'annual';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero — success tone, never punitive */}
      <div className="bg-gradient-to-br from-cyan-500/10 via-background to-emerald-500/10 py-12 px-4 text-center border-b border-border">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"
        >
          <CircleCheckBig className="h-8 w-8 text-emerald-500" aria-hidden="true" />
        </motion.div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl md:text-4xl font-bold text-foreground mb-3 outline-none"
        >
          Sua conta foi criada com sucesso!
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Nossa equipe vai liberar seu período de avaliação em instantes.
          Você receberá um aviso assim que estiver tudo pronto.
        </p>
      </div>

      {/* Steps timeline */}
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <ol className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-8">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-foreground">Conta criada</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15">
              <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-cyan-500/60 motion-reduce:hidden" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
            </span>
            <span className="text-sm font-medium text-foreground">Aguardando liberação</span>
          </li>
          <li className="flex items-center gap-3 opacity-60">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground text-sm">
              3
            </span>
            <span className="text-sm text-muted-foreground">Acesso completo</span>
          </li>
        </ol>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Liberações costumam levar poucos minutos em horário comercial.
        </p>
      </div>

      {/* Divider — optional shortcut */}
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-sm font-medium text-muted-foreground text-center">
            Não quer esperar? Assine um plano e comece a recrutar agora mesmo.
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      {/* Period selector */}
      <div className="container max-w-5xl mx-auto px-4 py-4">
        <div
          className="flex items-center justify-center gap-2 flex-wrap"
          role="group"
          aria-label="Período de cobrança"
        >
          {(Object.keys(PERIOD_LABELS) as RecurringPeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              aria-pressed={selectedPeriod === period}
              className="relative"
            >
              {PERIOD_LABELS[period]}
              {(period === 'semiannual' || period === 'annual') && (
                <Badge className="ml-1.5 text-[9px] px-1 py-0 h-3.5 bg-green-500 text-white border-0">
                  -10%
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Plans comparison */}
      <div className="container max-w-5xl mx-auto px-4 py-8 flex-1">
        <div className="grid md:grid-cols-3 gap-6">
          {paidPlans.map((plan, index) => {
            const basePrice = plan.prices.monthly ?? 0;
            const periodPrice = plan.prices[selectedPeriod] ?? basePrice;
            const hasDiscount = isDiscountPeriod && periodPrice < basePrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'bg-card rounded-2xl p-6 shadow-soft relative border',
                  plan.badge === 'Mais popular'
                    ? 'border-2 border-secondary ring-4 ring-secondary/20'
                    : 'border-border',
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.descriptionShort}</p>

                  <div className="flex items-baseline justify-center gap-1">
                    {hasDiscount && (
                      <span className="text-lg text-muted-foreground line-through mr-1">
                        {formatBRL(basePrice)}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-foreground">
                      {formatBRL(periodPrice)}
                    </span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>

                  {hasDiscount && (
                    <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                      10% de desconto
                    </Badge>
                  )}

                  {plan.bonusTests && isDiscountPeriod && (
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 font-medium">
                      + {plan.bonusTests[selectedPeriod] ?? 0} testes comportamentais de bonus
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <CheckoutButton
                  planId={plan.id}
                  planName={plan.name}
                  period={selectedPeriod}
                  variant={plan.badge === 'Mais popular' ? 'default' : 'outline'}
                  className="w-full"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer link to settings */}
      <div className="text-center py-6 border-t border-border">
        <Link
          to="/empresa/configuracoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          Acessar configurações da conta
        </Link>
      </div>
    </div>
  );
}
