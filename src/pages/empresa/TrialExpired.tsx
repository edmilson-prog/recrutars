/**
 * TrialExpired Page
 * PRD-074: Fullscreen conversion page shown when a company's trial has expired.
 *
 * - Message explaining trial ended
 * - Summary of what the company had (active jobs, candidates)
 * - Comparison of the 3 paid plans with pricing
 * - Period selector with discount highlighting
 * - CTA to subscribe on each plan
 * - Link to account settings (allowed even when expired)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans } from '@/hooks/usePlans';
import { CheckoutButton } from '@/components/billing/CheckoutButton';
import type { PlanPeriod } from '@/types';

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

export default function TrialExpired() {
  const { currentCompany } = useAuth();
  const { companyPlans } = usePlans();
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');

  // Exclude the free/trial plan — show only paid plans
  const paidPlans = companyPlans.filter((p) => !p.isFree && p.isActive);

  const isDiscountPeriod = selectedPeriod === 'semiannual' || selectedPeriod === 'annual';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 px-4 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Seu periodo gratuito encerrou
        </h1>
        <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
          Assine um plano para continuar recrutando os melhores talentos.
        </p>
      </div>

      {/* Summary of what the company had */}
      {currentCompany && (currentCompany.activeJobs > 0 || currentCompany.totalCandidates > 0) && (
        <div className="container max-w-3xl mx-auto px-4 py-6">
          <div className="bg-muted/50 rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Durante o periodo de teste, sua empresa teve:
            </p>
            <div className="flex items-center justify-center gap-8">
              {currentCompany.activeJobs > 0 && (
                <div>
                  <p className="text-2xl font-bold text-foreground">{currentCompany.activeJobs}</p>
                  <p className="text-xs text-muted-foreground">vagas ativas</p>
                </div>
              )}
              {currentCompany.totalCandidates > 0 && (
                <div>
                  <p className="text-2xl font-bold text-foreground">{currentCompany.totalCandidates}</p>
                  <p className="text-xs text-muted-foreground">candidatos</p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Assine agora para nao perder seus dados e processos seletivos.
            </p>
          </div>
        </div>
      )}

      {/* Period selector */}
      <div className="container max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
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

                  {plan.bonusTests && (isDiscountPeriod) && (
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
        <Link to="/empresa/configuracoes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
          Acessar configuracoes da conta
        </Link>
      </div>
    </div>
  );
}
