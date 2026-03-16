/**
 * Meus Testes — Hub centralizado de testes do candidato
 * Exibe todos os testes realizados (voluntários e solicitados por empresas)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, Clock, Sparkles, Timer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedTests } from '@/hooks/useUnifiedTests';
import { TestCard } from '@/components/candidato/TestCard';
import { TestEmptyState } from '@/components/candidato/TestEmptyState';
import { cn } from '@/lib/utils';
import { TEST_CONFIG } from '@/data/testConfig';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

type FilterTab = 'all' | 'voluntary' | 'requested';

export default function CandidateTests() {
  const { user, currentCandidate } = useAuth();
  const navigate = useNavigate();
  const candidateId = currentCandidate?.id || user?.id || '';

  const { tests, stats, isLoading, hasGaugeProResult, cooldownInfo } = useUnifiedTests(candidateId);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Filter tests by tab
  const filteredTests =
    activeTab === 'all'
      ? tests
      : activeTab === 'voluntary'
        ? tests.filter((t) => t.origin === 'voluntary')
        : tests.filter((t) => t.origin === 'company-requested');

  // Counts per filter
  const voluntaryCount = tests.filter((t) => t.origin === 'voluntary').length;
  const requestedCount = tests.filter((t) => t.origin === 'company-requested').length;

  // CTA label (respect Gauge-Pro cooldown)
  const ctaLabel = cooldownInfo.inCooldown
    ? `Disponível em ${cooldownInfo.daysRemaining} dias`
    : hasGaugeProResult
      ? 'Refazer Teste'
      : 'Iniciar Novo Teste';

  return (
    <DashboardLayout userType="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Title area */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Seus Testes Comportamentais
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Acompanhe seus testes realizados e solicitados. Testes completos melhoram seu perfil e match com vagas.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatMini
                icon={<Sparkles className="w-4 h-4 text-primary" />}
                value={stats.total}
                label="Total"
              />
              <StatMini
                icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
                value={stats.completed}
                label="Concluídos"
              />
              <StatMini
                icon={<Clock className="w-4 h-4 text-amber-400" />}
                value={stats.pending}
                label="Pendentes"
              />
            </div>
          </div>

          {/* CTA or Countdown — separate row */}
          {cooldownInfo.inCooldown && cooldownInfo.cooldownEndDate ? (
            <CooldownTimer endDate={cooldownInfo.cooldownEndDate} />
          ) : (
            <Button
              onClick={() => navigate('/candidato/gauge-pro')}
              className="w-full gradient-primary"
            >
              <Brain className="w-4 h-4 mr-1.5" />
              {ctaLabel}
            </Button>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">
              Todos ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="voluntary">
              Voluntários ({voluntaryCount})
            </TabsTrigger>
            <TabsTrigger value="requested">
              Solicitados ({requestedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : tests.length === 0 ? (
          <TestEmptyState variant="global" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {filteredTests.length === 0 ? (
                <TestEmptyState
                  variant="filter"
                  filterLabel={activeTab === 'voluntary' ? 'voluntário' : 'solicitado'}
                />
              ) : (
                filteredTests.map((test, index) => (
                  <TestCard key={test.id} test={test} index={index} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatMini({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
      {icon}
      <div className="leading-tight">
        <span className="text-lg font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground ml-1">{label}</span>
      </div>
    </div>
  );
}

function CooldownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Timer className="w-3.5 h-3.5" />
        <span>Próximo teste disponível em</span>
      </div>
      <div className="flex items-center gap-2">
        <TimeUnit value={timeLeft.days} label="Dias" />
        <span className="text-lg font-bold text-muted-foreground/50">:</span>
        <TimeUnit value={timeLeft.hours} label="Horas" />
        <span className="text-lg font-bold text-muted-foreground/50">:</span>
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <span className="text-lg font-bold text-muted-foreground/50">:</span>
        <TimeUnit value={timeLeft.seconds} label="Seg" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-muted rounded-lg w-12 h-12 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

function getTimeLeft(endDate: string) {
  const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-xl p-5 shadow-soft flex items-center gap-4">
          <Skeleton className="w-11 h-11 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-64" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}
