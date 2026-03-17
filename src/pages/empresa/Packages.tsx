/**
 * Packages Page — Company
 * Test credit packages store and transaction history
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  History,
  CreditCard,
  CheckCircle,
  ShoppingCart,
  Loader2,
  Sparkles,
  Minus,
  Plus,
  Inbox,
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
import { cn } from '@/lib/utils';
import { formatBRL, formatDateTimeBR } from '@/lib/formatters';
import { useAuth } from '@/contexts/AuthContext';
import {
  useTestPackages,
  useCompanyCreditBalance,
  useCreditTransactions,
} from '@/hooks/useTestPackagesQuery';
import { getStripeService } from '@/services/stripe/stripeService';
import type { StripeEnvironment } from '@/types/plans';
import type { TestPackage, TestCreditTransaction } from '@/types/testPackages';

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
    label: 'Devolucao',
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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 dark:from-cyan-700 dark:to-cyan-600 p-6 text-white shadow-lg"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-100">Creditos disponiveis</p>
          <p className="text-5xl font-bold tracking-tight mt-1">{balance}</p>
          <p className="text-sm text-cyan-100 mt-2">
            Total comprado: {totalPurchased} | Utilizados: {totalUsed}
          </p>
        </div>
        <button
          onClick={onViewHistory}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white underline underline-offset-4 transition-colors self-start md:self-auto"
        >
          <History className="w-4 h-4" />
          Ver historico
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
      className={cn(
        'relative flex flex-col bg-card rounded-2xl shadow-soft overflow-hidden transition-shadow hover:shadow-md',
        isHighlighted && 'ring-2 ring-cyan-500 dark:ring-cyan-400',
      )}
    >
      {/* Top color bar */}
      <div
        className={cn(
          'h-1.5',
          isHighlighted
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
            : 'bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10',
        )}
      />

      {/* Highlight badge */}
      {isHighlighted && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-cyan-500 text-white border-0 shadow-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            {pkg.badge}
          </Badge>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
          </div>
          {pkg.descriptionShort && (
            <p className="text-sm text-muted-foreground">{pkg.descriptionShort}</p>
          )}
          {pkg.description && !pkg.descriptionShort && (
            <p className="text-sm text-muted-foreground">{pkg.description}</p>
          )}
        </div>

        {/* Credits */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4 text-center">
          <p className="text-3xl font-bold text-foreground">{pkg.credits}</p>
          <p className="text-xs text-muted-foreground">
            {pkg.credits === 1 ? 'credito de teste' : 'creditos de teste'}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{formatBRL(pkg.price)}</span>
            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatBRL(pkg.originalPrice)}
              </span>
            )}
          </div>
          {discount && (
            <Badge variant="outline" className="mt-1 text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
              Economize {discount}%
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            {formatBRL(perTest)} por teste
          </p>
        </div>

        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <ul className="space-y-1.5 mb-6 flex-1">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
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
            'w-full gap-2 mt-auto',
            isHighlighted
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
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
        <p className="text-lg font-medium text-foreground">Nenhuma transacao</p>
        <p className="text-sm text-muted-foreground mt-1">
          Seu historico de creditos aparecera aqui apos a primeira compra.
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
            <TableHead>Descricao</TableHead>
            <TableHead className="text-right">Creditos</TableHead>
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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('loja');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

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
      toast.error('Voce precisa estar logado em uma empresa para comprar.');
      return;
    }

    setPurchasingId(pkg.id);
    try {
      const stripeService = await getStripeService();
      const result = await stripeService.createPackageCheckout({
        packageId: pkg.id,
        companyId: currentCompany.id,
        userId: user.id,
        environment: 'live' as StripeEnvironment,
        successUrl: `${window.location.origin}/empresa/pacotes?compra=sucesso&pacote=${pkg.slug}`,
        cancelUrl: `${window.location.origin}/empresa/pacotes?compra=cancelada`,
      });
      window.location.href = result.url;
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-cyan-600" />
            Pacotes de Testes
          </h1>
          <p className="text-muted-foreground mt-1">
            Compre creditos para enviar testes comportamentais aos seus colaboradores e candidatos.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="loja" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Loja
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <History className="w-4 h-4" />
              Historico
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Loja ── */}
          <TabsContent value="loja" className="space-y-6 mt-6">
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
                <p className="text-lg font-medium text-foreground">Nenhum pacote disponivel</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Novos pacotes serao adicionados em breve.
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

          {/* ── Tab: Historico ── */}
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
