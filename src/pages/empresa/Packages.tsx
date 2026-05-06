/**
 * Packages Page — Company
 * Test credit packages store and transaction history
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Package,
  History,
  CreditCard,
  CheckCircle,
  ShoppingCart,
  Loader2,
  Sparkles,
  Check,
  Star,
  Minus,
  Plus,
  Inbox,
  Store,
  Coins,
  Clock,
  Tag,
  Settings,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatBRL, formatDateBR, formatDateTimeBR } from '@/lib/formatters';
import { useAuth } from '@/contexts/AuthContext';
import {
  useTestPackages,
  useCompanyCreditBalance,
  useCreditTransactions,
} from '@/hooks/useTestPackagesQuery';
import { usePlans, useSubscription } from '@/hooks/usePlansQuery';
import { getStripeService } from '@/services/stripe/stripeService';
import { CheckoutButton } from '@/components/billing/CheckoutButton';
import { useStripeEnvironment } from '@/hooks/useStripeEnvironment';
import { shouldApplyDiscount } from '@/lib/subscriptionRules';
import type { StripeEnvironment, PlanPeriod } from '@/types/plans';
import type { TestPackage, TestCreditTransaction } from '@/types/testPackages';

const PLAN_PERIOD_LABELS: Partial<Record<PlanPeriod, string>> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcDiscount(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function pricePerTest(price: number, credits: number): number {
  if (credits <= 0) return price;
  return price / credits;
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  purchase: {
    label: 'Compra',
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  },
  consume: {
    label: 'Consumo',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  },
  refund: {
    label: 'Devolução',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CreditBalanceBar({
  balance,
  totalPurchased,
  totalUsed,
  onViewHistory,
}: {
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  onViewHistory: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 dark:from-cyan-700 dark:via-cyan-600 dark:to-blue-700 p-8 text-white shadow-xl"
    >
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.25),transparent_50%)]" />
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-cyan-200" />
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-100">Créditos disponíveis</p>
          </div>
          <p className="text-6xl font-bold tracking-tight mt-2">{balance}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-cyan-100">
              <Plus className="w-3.5 h-3.5" />
              Comprados: <span className="font-semibold text-white">{totalPurchased}</span>
            </span>
            <span className="text-cyan-300">|</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-cyan-100">
              <Minus className="w-3.5 h-3.5" />
              Utilizados: <span className="font-semibold text-white">{totalUsed}</span>
            </span>
          </div>
        </div>
        <button
          onClick={onViewHistory}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-all duration-200 self-start md:self-auto border border-white/10"
        >
          <History className="w-4 h-4" />
          Ver histórico
        </button>
      </div>
    </motion.div>
  );
}

function PackageCard({
  pkg,
  onPurchase,
  purchasing,
}: {
  pkg: TestPackage;
  onPurchase: (pkg: TestPackage) => void;
  purchasing: boolean;
}) {
  const discount = calcDiscount(pkg.price, pkg.originalPrice);
  const perTest = pricePerTest(pkg.price, pkg.credits);
  const isHighlighted = !!pkg.badge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex flex-col bg-card rounded-2xl overflow-hidden transition-all duration-300',
        isHighlighted
          ? 'ring-2 ring-cyan-500 dark:ring-cyan-400 shadow-xl scale-[1.02]'
          : 'shadow-soft hover:shadow-xl',
      )}
    >
      {/* Top color bar */}
      <div
        className={cn(
          'h-1.5',
          isHighlighted
            ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400'
            : 'bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10',
        )}
      />

      {/* Floating badge */}
      {isHighlighted && (
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-4 z-10">
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg px-4 py-1 text-xs font-semibold">
            <Sparkles className="w-3 h-3 mr-1.5" />
            {pkg.badge}
          </Badge>
        </div>
      )}

      <div className={cn('flex flex-col flex-1 p-8', isHighlighted && 'pt-10')}>
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
          </div>
          {pkg.descriptionShort && (
            <p className="text-sm text-muted-foreground leading-relaxed">{pkg.descriptionShort}</p>
          )}
          {pkg.description && !pkg.descriptionShort && (
            <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
          )}
        </div>

        {/* Credits pill */}
        <div className={cn(
          'rounded-xl p-4 mb-5 text-center',
          isHighlighted
            ? 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30'
            : 'bg-muted/50',
        )}>
          <p className="text-4xl font-bold text-foreground">{pkg.credits}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1">
            {pkg.credits === 1 ? 'crédito de teste' : 'créditos de teste'}
          </p>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-foreground">{formatBRL(pkg.price)}</span>
            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
              <span className="text-base text-muted-foreground line-through">
                {formatBRL(pkg.originalPrice)}
              </span>
            )}
          </div>
          {discount && (
            <Badge variant="outline" className="mt-2 text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
              Economize {discount}%
            </Badge>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {formatBRL(perTest)} por teste
          </p>
        </div>

        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <ul className="space-y-2.5 mb-8 flex-1">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Buy button */}
        <Button
          onClick={() => onPurchase(pkg)}
          disabled={purchasing}
          className={cn(
            'w-full h-12 gap-2 mt-auto text-base font-semibold transition-all duration-200',
            isHighlighted
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
              : '',
          )}
        >
          {purchasing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecionando...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Comprar
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function TransactionAmountCell({ type, amount }: { type: string; amount: number }) {
  if (type === 'consume') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
        <Minus className="w-3 h-3" />
        {amount}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
      <Plus className="w-3 h-3" />
      {amount}
    </span>
  );
}

function TransactionsTable({ transactions }: { transactions: TestCreditTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <p className="text-lg font-medium text-foreground">Nenhuma transação</p>
        <p className="text-sm text-muted-foreground mt-1">
          Seu histórico de créditos aparecerá aqui após a primeira compra.
        </p>
      </div>
    );
  }

  // Compute running balance
  // Service layer may return snake_case or camelCase depending on converter usage
  const getDate = (tx: TestCreditTransaction) =>
    tx.createdAt ?? (tx as unknown as Record<string, string>).created_at ?? '';
  const sorted = [...transactions].sort(
    (a, b) => new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime(),
  );
  let runningBalance = 0;
  const withBalance = sorted.map((tx) => {
    const amt = tx.amount ?? 0;
    if (tx.type === 'consume') {
      runningBalance -= Math.abs(amt);
    } else {
      runningBalance += Math.abs(amt);
    }
    return { ...tx, balance: runningBalance };
  });
  // Display newest first
  withBalance.reverse();

  return (
    <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Créditos</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withBalance.map((tx) => {
            const badge = TYPE_BADGES[tx.type] ?? TYPE_BADGES.purchase;
            const dateStr = tx.createdAt ?? (tx as unknown as Record<string, string>).created_at;
            return (
              <TableRow key={tx.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {dateStr ? formatDateTimeBR(dateStr) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('text-xs', badge.className)}>
                    {badge.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-foreground max-w-xs truncate">
                  {tx.description ?? '—'}
                </TableCell>
                <TableCell className="text-right">
                  <TransactionAmountCell type={tx.type} amount={Math.abs(tx.amount)} />
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-foreground">
                  {tx.balance}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function Packages() {
  const { user, currentCompany } = useAuth();
  const stripeEnv = useStripeEnvironment();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'pacotes';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Plan data
  const { data: companyPlans = [] } = usePlans('company');
  const { data: currentSubscription } = useSubscription(user?.id);
  const [selectedPlanPeriod, setSelectedPlanPeriod] = useState<PlanPeriod>('monthly');

  // Discount aggregation for period selector badges (same pattern as Plans.tsx)
  const maxDiscount = companyPlans.length > 0
    ? Math.max(...companyPlans.map(p => {
        const plan = p as Record<string, unknown>;
        return (plan.discount_percentage ?? plan.discountPercentage ?? 0) as number;
      }))
    : 0;
  const periodHasDiscount = (period: PlanPeriod) =>
    maxDiscount > 0 && companyPlans.some(p => {
      const plan = p as Record<string, unknown>;
      const disc = (plan.discount_percentage ?? plan.discountPercentage ?? 0) as number;
      const minPeriod = (plan.discount_min_period ?? plan.discountMinPeriod) as PlanPeriod | undefined;
      return disc > 0 && shouldApplyDiscount(period, minPeriod);
    });

  const { data: packages = [], isLoading: packagesLoading } = useTestPackages();
  const { data: balance = 0 } = useCompanyCreditBalance(currentCompany?.id);
  const { data: transactions = [], isLoading: transactionsLoading } = useCreditTransactions(currentCompany?.id);

  // Compute totals from transactions
  const totalPurchased = (transactions as TestCreditTransaction[]).reduce(
    (sum, tx) => (tx.type === 'purchase' ? sum + Math.abs(tx.amount) : sum),
    0,
  );
  const totalUsed = (transactions as TestCreditTransaction[]).reduce(
    (sum, tx) => (tx.type === 'consume' ? sum + Math.abs(tx.amount) : sum),
    0,
  );

  // Show success toast from URL param
  useEffect(() => {
    if (searchParams.get('compra') === 'sucesso') {
      const pacote = searchParams.get('pacote');
      toast.success(
        pacote
          ? `Compra do pacote "${pacote}" realizada com sucesso!`
          : 'Compra realizada com sucesso!',
      );
    }
  }, [searchParams]);

  // Handle purchase
  const handlePurchase = async (pkg: TestPackage) => {
    if (!user?.id || !currentCompany?.id) {
      toast.error('Você precisa estar logado em uma empresa para comprar.');
      return;
    }

    setPurchasingId(pkg.id);
    try {
      const stripeService = await getStripeService();
      const result = await stripeService.createPackageCheckout({
        packageId: pkg.id,
        companyId: currentCompany.id,
        userId: user.id,
        environment: stripeEnv,
        successUrl: `${window.location.origin}/empresa/pacotes?compra=sucesso&pacote=${pkg.slug}`,
        cancelUrl: `${window.location.origin}/empresa/pacotes?compra=cancelada`,
      });
      window.open(result.url, '_blank');
      setPurchasingId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar checkout';
      toast.error(message);
      setPurchasingId(null);
    }
  };

  // Sort packages by sortOrder
  const sortedPackages = [...(packages as TestPackage[])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 via-background to-blue-50 dark:from-cyan-950/20 dark:via-background dark:to-blue-950/20 p-8 mb-2">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-100/40 to-transparent dark:from-cyan-900/20 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/30 to-transparent dark:from-blue-900/15 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Store className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              Loja
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Adquira créditos e escolha o plano ideal para sua empresa.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pacotes" className="gap-2">
              <Package className="w-4 h-4" />
              Pacotes
            </TabsTrigger>
            <TabsTrigger value="plano" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Meu Plano
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* -- Tab: Pacotes -- */}
          <TabsContent value="pacotes" className="space-y-6 mt-6">
            {/* Credit balance bar */}
            <CreditBalanceBar
              balance={balance as number}
              totalPurchased={totalPurchased}
              totalUsed={totalUsed}
              onViewHistory={() => setActiveTab('historico')}
            />

            {/* Packages grid */}
            {packagesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              </div>
            ) : sortedPackages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-lg font-medium text-foreground">Nenhum pacote disponível</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Novos pacotes serão adicionados em breve.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onPurchase={handlePurchase}
                    purchasing={purchasingId === pkg.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* -- Tab: Meu Plano -- */}
          <TabsContent value="plano" className="space-y-6 mt-6">
            {/* Hero: Plano Atual */}
            {currentSubscription ? (() => {
              const sub = currentSubscription as Record<string, unknown>;
              const subPlanName = (sub.plan_name ?? sub.planName ?? '—') as string;
              const subPricePaid = (sub.price_paid ?? sub.pricePaid ?? 0) as number;
              const subStatus = (sub.status ?? '') as string;
              const subPeriod = (sub.period ?? '') as string;
              const subRenewalDate = (sub.renewal_date ?? sub.renewalDate) as string | undefined;

              const statusLabel: Record<string, string> = {
                active: 'Ativa',
                trial: 'Trial',
                cancelled: 'Cancelada',
                past_due: 'Pagamento Pendente',
                expired: 'Expirada',
                suspended: 'Suspensa',
              };
              const statusColor: Record<string, string> = {
                active: 'bg-green-500/15 text-green-500 border-green-500/30',
                trial: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
                cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
                past_due: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                expired: 'bg-muted text-muted-foreground border-border',
                suspended: 'bg-red-500/15 text-red-400 border-red-500/30',
              };
              const periodLabel: Record<string, string> = {
                monthly: 'Mensal',
                quarterly: 'Trimestral',
                semiannual: 'Semestral',
                annual: 'Anual',
                one_time: 'Avulso',
              };

              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900/60 via-cyan-800/40 to-blue-900/60 p-7 border border-cyan-500/20"
                >
                  {/* Decorative radial */}
                  <div className="absolute top-0 right-0 w-56 h-56 bg-[radial-gradient(circle,rgba(34,211,238,0.08),transparent_70%)]" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-cyan-400 mb-1.5">
                        Seu Plano Atual
                      </p>
                      <h3 className="text-xl font-bold text-foreground">{subPlanName}</h3>
                      <div className="flex items-center gap-2.5 mt-3">
                        <Badge
                          variant="outline"
                          className={cn('text-xs', statusColor[subStatus] ?? 'bg-muted text-muted-foreground')}
                        >
                          {statusLabel[subStatus] ?? subStatus}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {periodLabel[subPeriod] ?? subPeriod}
                          {subRenewalDate && (
                            <> · {subStatus === 'cancelled'
                              ? `Acesso até ${formatDateBR(subRenewalDate)}`
                              : subStatus === 'trial'
                                ? `Expira em ${formatDateBR(subRenewalDate)}`
                                : `Renova em ${formatDateBR(subRenewalDate)}`
                            }</>
                          )}
                        </span>
                      </div>
                      {subStatus === 'cancelled' && (
                        <p className="text-xs text-red-400 mt-2">
                          Assinatura cancelada. Escolha um novo plano abaixo para continuar.
                        </p>
                      )}
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-3xl font-extrabold text-foreground">
                        {formatBRL(subPricePaid)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        /{periodLabel[subPeriod]?.toLowerCase() ?? 'mês'}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2.5 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
                        onClick={() => navigate('/empresa/meu-plano')}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Gerenciar assinatura
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })() : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900/60 via-cyan-800/40 to-blue-900/60 p-7 border border-cyan-500/20"
              >
                <div className="relative z-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-cyan-400 mb-1.5">
                    Seu Plano Atual
                  </p>
                  <h3 className="text-xl font-bold text-foreground">Sem assinatura ativa</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Escolha um plano abaixo para começar.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Seção: Alterar Plano */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Alterar Plano</h2>
              <p className="text-sm text-muted-foreground">
                Compare os planos e escolha o melhor para sua empresa.
              </p>
            </div>

            {/* Seletor de Período Global */}
            <div className="flex items-center gap-1.5 bg-muted rounded-xl p-1 w-fit flex-wrap">
              {(Object.keys(PLAN_PERIOD_LABELS) as PlanPeriod[]).map((period) => (
                <button
                  key={period}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5',
                    selectedPlanPeriod === period
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setSelectedPlanPeriod(period)}
                >
                  {PLAN_PERIOD_LABELS[period]}
                  {periodHasDiscount(period) && (
                    <span className="bg-green-600/20 text-green-500 dark:bg-green-500/20 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      -{maxDiscount}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Grid de Planos */}
            <div className={cn(
              'grid grid-cols-1 md:grid-cols-2 gap-6',
              companyPlans.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            )}>
              {companyPlans.map((p, index) => {
                const plan = p as Record<string, unknown>;
                const planId = (plan.id as string) ?? '';
                const planName = (plan.name as string) ?? '';
                const planSlug = (plan.slug as string) ?? '';
                const prices = (plan.prices as Record<string, number>) ?? {};
                const launchPrices = (plan.launch_prices ?? plan.launchPrices) as Record<string, number> | undefined;
                const launchPriceEndDate = (plan.launch_price_end_date ?? plan.launchPriceEndDate) as string | undefined;
                const billingModel = (plan.billing_model ?? plan.billingModel) as string ?? 'recurring';
                const isOneTime = billingModel === 'one_time';
                const isFree = (plan.is_free ?? plan.isFree) as boolean;
                const isTrial = !!((plan.trial_duration_days ?? plan.trialDurationDays) as number | undefined);
                const trialDays = (plan.trial_duration_days ?? plan.trialDurationDays) as number | undefined;
                const features = (plan.features as string[]) ?? [];
                const descShort = (plan.description_short ?? plan.descriptionShort) as string ?? '';
                const badge = plan.badge as string | undefined;
                const discountPct = (plan.discount_percentage ?? plan.discountPercentage ?? 0) as number;
                const discountMinPeriod = (plan.discount_min_period ?? plan.discountMinPeriod) as PlanPeriod | undefined;
                const bonusTests = (plan.bonus_tests ?? plan.bonusTests) as Record<string, number> | undefined;

                const isCurrent = currentSubscription &&
                  ((currentSubscription as Record<string, unknown>).plan_slug === planSlug ||
                   (currentSubscription as Record<string, unknown>).planSlug === planSlug);

                // Price calculation
                const basePrice = prices.monthly ?? 0;
                const periodPrice = isOneTime ? (prices.one_time ?? 0) : (prices[selectedPlanPeriod] ?? basePrice);

                // Launch price check (priority 1)
                const launchPrice = launchPrices?.[selectedPlanPeriod];
                const hasLaunchPrice = !isFree && !isTrial && launchPrice !== undefined && launchPrice > 0 && launchPrice < periodPrice;
                const isLaunchActive = hasLaunchPrice && launchPriceEndDate && new Date(launchPriceEndDate) > new Date();

                // Discount check (priority 2, only if no launch price)
                const hasDiscount = !isFree && !isTrial && !isLaunchActive && discountPct > 0
                  && shouldApplyDiscount(selectedPlanPeriod, discountMinPeriod)
                  && periodPrice < basePrice;

                // Bonus tests for selected period
                const periodBonusTests = bonusTests?.[selectedPlanPeriod] ?? 0;
                const showBonusTests = periodBonusTests > 0 && shouldApplyDiscount(selectedPlanPeriod, discountMinPeriod);

                return (
                  <motion.div
                    key={planSlug || planId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={cn(
                      'relative flex flex-col bg-card rounded-2xl overflow-hidden transition-all',
                      isCurrent
                        ? 'ring-2 ring-cyan-500 dark:ring-cyan-400 shadow-xl'
                        : 'shadow-soft hover:shadow-lg',
                    )}
                  >
                    {/* Gradient top bar */}
                    <div className={cn(
                      'h-1',
                      isTrial || isFree
                        ? 'bg-gradient-to-r from-teal-400 to-cyan-500'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                    )} />

                    {/* Floating badge */}
                    {badge && (
                      <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-3 z-10">
                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg px-3 py-0.5 text-[10px] font-semibold gap-1">
                          <Star className="w-3 h-3" />
                          {badge}
                        </Badge>
                      </div>
                    )}

                    <div className={cn('flex flex-col flex-1 p-6', badge && 'pt-8')}>
                      {/* Plan name & description */}
                      <div className="text-center mb-5">
                        <h3 className="text-base font-bold text-foreground mb-1">{planName}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{descShort}</p>
                      </div>

                      {/* Price section */}
                      <div className="text-center mb-5">
                        {isFree || isTrial ? (
                          <>
                            <span className="text-3xl font-extrabold text-foreground">Grátis</span>
                            {isTrial && trialDays && (
                              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-teal-500 dark:text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">
                                <Clock className="w-3 h-3" />
                                {trialDays} dias de teste
                              </div>
                            )}
                          </>
                        ) : isLaunchActive ? (
                          <>
                            <div className="text-sm text-muted-foreground line-through mb-0.5">
                              {formatBRL(periodPrice)}
                            </div>
                            <span className="text-3xl font-extrabold text-cyan-500">
                              {formatBRL(launchPrice!)}
                            </span>
                            {!isOneTime && <span className="text-muted-foreground text-sm ml-1">/mês</span>}
                            <div className="mt-2">
                              <Badge variant="outline" className="text-[10px] text-cyan-500 border-cyan-500/30 bg-cyan-500/10 gap-1">
                                <Tag className="w-3 h-3" />
                                Preço de lançamento
                              </Badge>
                            </div>
                          </>
                        ) : hasDiscount ? (
                          <>
                            <div className="text-sm text-muted-foreground line-through mb-0.5">
                              {formatBRL(basePrice)}
                            </div>
                            <span className="text-3xl font-extrabold text-foreground">
                              {formatBRL(periodPrice)}
                            </span>
                            {!isOneTime && <span className="text-muted-foreground text-sm ml-1">/mês</span>}
                            <div className="mt-2">
                              <Badge variant="outline" className="text-[10px] text-green-600 dark:text-green-400 border-green-500/30 bg-green-500/10">
                                Economize {discountPct}%
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-3xl font-extrabold text-foreground">
                              {formatBRL(periodPrice)}
                            </span>
                            {!isOneTime && <span className="text-muted-foreground text-sm ml-1">/mês</span>}
                          </>
                        )}
                      </div>

                      {/* Bonus tests */}
                      {showBonusTests && (
                        <div className="text-center mb-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
                            <Target className="w-3 h-3" />
                            +{periodBonusTests} {periodBonusTests === 1 ? 'teste comportamental' : 'testes comportamentais'}
                          </span>
                        </div>
                      )}

                      {/* Features */}
                      <ul className="space-y-2 mb-6 flex-1">
                        {features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Action button */}
                      <div className="mt-auto">
                        {isCurrent ? (
                          <Button variant="outline" className="w-full gap-2" disabled>
                            <CheckCircle className="w-4 h-4" />
                            Plano Atual
                          </Button>
                        ) : isFree ? (
                          <Button variant="outline" className="w-full" disabled>
                            Plano Gratuito
                          </Button>
                        ) : (
                          <CheckoutButton
                            planId={planId}
                            planName={planName}
                            period={(isOneTime ? 'one_time' : selectedPlanPeriod) as PlanPeriod}
                            variant={badge ? 'default' : 'outline'}
                            size="default"
                            className={cn(
                              'w-full',
                              badge && 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25'
                            )}
                          >
                            {currentSubscription ? 'Fazer upgrade' : `Assinar ${planName}`}
                          </CheckoutButton>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Banner: Preço de Lançamento */}
            {companyPlans.some(p => {
              const plan = p as Record<string, unknown>;
              const lp = (plan.launch_prices ?? plan.launchPrices) as Record<string, number> | undefined;
              const lpEnd = (plan.launch_price_end_date ?? plan.launchPriceEndDate) as string | undefined;
              return lp && Object.values(lp).some(v => v > 0) && lpEnd && new Date(lpEnd) > new Date();
            }) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-5 py-3.5"
              >
                <Tag className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                <p className="text-sm text-cyan-600 dark:text-cyan-400">
                  <span className="font-semibold">Preço de lançamento</span> disponível para planos selecionados.
                  {(() => {
                    const dates = companyPlans
                      .map(p => {
                        const plan = p as Record<string, unknown>;
                        return (plan.launch_price_end_date ?? plan.launchPriceEndDate) as string | undefined;
                      })
                      .filter(d => d && new Date(d) > new Date())
                      .sort();
                    if (dates.length > 0) {
                      return ` Válido até ${formatDateBR(dates[0]!)}.`;
                    }
                    return '';
                  })()}
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* -- Tab: Histórico -- */}
          <TabsContent value="historico" className="space-y-6 mt-6">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              </div>
            ) : (
              <TransactionsTable transactions={transactions as TestCreditTransaction[]} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
