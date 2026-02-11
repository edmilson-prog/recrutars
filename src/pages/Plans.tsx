/**
 * Plans Page (Public)
 * PRD-074: Dynamic pricing page with 4 company plans from database.
 *
 * Shows period selector, discount highlighting, bonus tests info,
 * and responsive grid layout.
 */

import { useState } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { usePlans } from '@/hooks/usePlans';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutButton } from '@/components/billing/CheckoutButton';
import type { PlanPeriod } from '@/types';

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

export default function PlansPage() {
  const { companyPlans, isLoading } = usePlans();
  const { isAuthenticated } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');

  const activePlans = companyPlans.filter((p) => p.isActive);
  const isDiscountPeriod = selectedPeriod === 'semiannual' || selectedPeriod === 'annual';

  return (
    <PublicLayout>
      <div className="min-h-screen pb-12">
        <Header />
        <div className="pt-20 gradient-hero min-h-[40vh] flex items-center">
          <div className="container py-16 text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Planos e Precos</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Escolha o plano ideal para sua empresa
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="container py-8">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
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

        {/* Plans Grid */}
        <div className="container py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {activePlans.map((plan, index) => {
                const isTrial = !!plan.trialDurationDays;
                const basePrice = plan.prices.monthly ?? 0;
                const periodPrice = plan.prices[selectedPeriod] ?? basePrice;
                const hasDiscount = !isTrial && isDiscountPeriod && periodPrice < basePrice;
                const isPopular = plan.badge === 'Mais popular';

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'bg-card rounded-2xl p-6 shadow-soft relative border flex flex-col',
                      isPopular
                        ? 'border-2 border-secondary ring-4 ring-secondary/20'
                        : 'border-border',
                    )}
                  >
                    {plan.badge && (
                      <span
                        className={cn(
                          'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap',
                          isTrial
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                            : 'bg-secondary text-secondary-foreground',
                        )}
                      >
                        {plan.badge}
                      </span>
                    )}

                    <div className="text-center mb-6 pt-2">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.descriptionShort}
                      </p>

                      {isTrial ? (
                        <div>
                          <span className="text-3xl font-bold text-foreground">Gratis</span>
                          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{plan.trialDurationDays} dias de teste</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline justify-center gap-1">
                            {hasDiscount && (
                              <span className="text-base text-muted-foreground line-through mr-1">
                                {formatBRL(basePrice)}
                              </span>
                            )}
                            <span className="text-3xl font-bold text-foreground">
                              {formatBRL(periodPrice)}
                            </span>
                            <span className="text-muted-foreground text-sm">/mes</span>
                          </div>
                          {hasDiscount && (
                            <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0 text-xs">
                              10% de desconto
                            </Badge>
                          )}
                          {plan.bonusTests && isDiscountPeriod && (plan.bonusTests[selectedPeriod] ?? 0) > 0 && (
                            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 font-medium">
                              + {plan.bonusTests[selectedPeriod]} testes comportamentais
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isAuthenticated && !isTrial ? (
                      <CheckoutButton
                        planId={plan.id}
                        planName={plan.name}
                        period={selectedPeriod}
                        variant={isPopular ? 'default' : 'outline'}
                        className="w-full mt-auto"
                      />
                    ) : (
                      <Button
                        className="w-full mt-auto"
                        variant={isPopular ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => { if (!isAuthenticated) window.location.href = '/cadastro'; }}
                      >
                        {isTrial ? 'Comecar gratis' : 'Assinar agora'}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PublicLayout>
  );
}
