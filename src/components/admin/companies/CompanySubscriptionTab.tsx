import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Minus,
  ArrowRightLeft,
  Package,
  Inbox,
  Wallet,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCompanyCreditBalance,
  useCompanyCredits,
  useCreditTransactions,
} from '@/hooks/useTestPackagesQuery';
import { CreditOperationDialog } from './CreditOperationDialog';
import type { TestCredit, TestCreditTransaction } from '@/types/testPackages';

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const TRANSACTION_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  purchase: { label: 'Compra', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  consume: { label: 'Consumo', className: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
  refund: { label: 'Reembolso', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  manual_credit: { label: 'Crédito Manual', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  manual_debit: { label: 'Débito Manual', className: 'bg-red-500/10 text-red-500 border-red-500/30' },
  transfer_out: { label: 'Transf. Saída', className: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  transfer_in: { label: 'Transf. Entrada', className: 'bg-teal-500/10 text-teal-500 border-teal-500/30' },
};

const ORIGIN_CONFIG: Record<string, { label: string; className: string }> = {
  purchase: { label: 'Compra', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  manual: { label: 'Manual', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  transfer: { label: 'Transferência', className: 'bg-teal-500/10 text-teal-500 border-teal-500/30' },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-green-500/10 text-green-500 border-green-500/30' },
  exhausted: { label: 'Esgotado', className: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  refunded: { label: 'Reembolsado', className: 'bg-red-500/10 text-red-500 border-red-500/30' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CompanySubscriptionTabProps {
  companyId: string;
  companyName: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CompanySubscriptionTab({ companyId, companyName }: CompanySubscriptionTabProps) {
  const [dialogMode, setDialogMode] = useState<'credit' | 'debit' | 'transfer'>('credit');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Data hooks
  const { data: balance, isLoading: loadingBalance } = useCompanyCreditBalance(companyId);
  const { data: credits, isLoading: loadingCredits } = useCompanyCredits(companyId);
  const { data: transactions, isLoading: loadingTransactions } = useCreditTransactions(companyId);

  const creditsList = (credits ?? []) as TestCredit[];
  const transactionsList = (transactions ?? []) as TestCreditTransaction[];

  const totalPurchased = creditsList.reduce((sum, c) => sum + c.totalCredits, 0);
  const totalUsed = creditsList.reduce((sum, c) => sum + c.usedCredits, 0);

  const visibleTransactions = showAllTransactions
    ? transactionsList
    : transactionsList.slice(0, 10);

  const openDialog = (mode: 'credit' | 'debit' | 'transfer') => {
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const isBalanceZero = (balance ?? 0) === 0;

  return (
    <div className="space-y-6">
      {/* Header row: title + action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold">Créditos de Teste</h3>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => openDialog('credit')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Creditar
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      'border-red-500/50 text-red-500 hover:bg-red-500/10',
                      isBalanceZero && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={isBalanceZero}
                    onClick={() => openDialog('debit')}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Debitar
                  </Button>
                </span>
              </TooltipTrigger>
              {isBalanceZero && (
                <TooltipContent>Saldo insuficiente</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      'border-amber-500/50 text-amber-500 hover:bg-amber-500/10',
                      isBalanceZero && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={isBalanceZero}
                    onClick={() => openDialog('transfer')}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    Transferir
                  </Button>
                </span>
              </TooltipTrigger>
              {isBalanceZero && (
                <TooltipContent>Saldo insuficiente</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* KPI Cards */}
      {loadingBalance || loadingCredits ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Saldo Disponivel */}
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
              <Wallet className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Disponível</p>
              <p className="text-2xl font-bold">{balance ?? 0}</p>
            </div>
          </div>

          {/* Total Comprado */}
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Comprado</p>
              <p className="text-2xl font-bold">{totalPurchased}</p>
            </div>
          </div>

          {/* Total Usado */}
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
              <TrendingDown className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Usado</p>
              <p className="text-2xl font-bold">{totalUsed}</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compras Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCredits ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : creditsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Package className="h-10 w-10 mb-2 opacity-50" />
              <p>Nenhuma compra registrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Usado</TableHead>
                  <TableHead className="text-right">Restante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditsList.map((credit) => {
                  const originCfg = ORIGIN_CONFIG[credit.origin ?? 'purchase'] ?? ORIGIN_CONFIG.purchase;
                  const statusCfg = STATUS_CONFIG[credit.status] ?? STATUS_CONFIG.active;

                  return (
                    <TableRow key={credit.id}>
                      <TableCell>
                        <Badge variant="outline" className={originCfg.className}>
                          {originCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{credit.totalCredits}</TableCell>
                      <TableCell className="text-right">{credit.usedCredits}</TableCell>
                      <TableCell className="text-right">{credit.remainingCredits}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(credit.purchasedAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : transactionsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-50" />
              <p>Nenhuma transação registrada</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTransactions.map((tx) => {
                    const typeCfg = TRANSACTION_TYPE_CONFIG[tx.type] ?? {
                      label: tx.type,
                      className: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
                    };

                    return (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeCfg.className}>
                            {typeCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            tx.amount > 0 && 'text-green-500',
                            tx.amount < 0 && 'text-red-500'
                          )}
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </TableCell>
                        <TableCell>{tx.description || '\u2014'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {!showAllTransactions && transactionsList.length > 10 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllTransactions(true)}
                  >
                    Mostrar mais ({transactionsList.length - 10} restantes)
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Credit Operation Dialog */}
      <CreditOperationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        companyId={companyId}
        companyName={companyName}
      />
    </div>
  );
}
