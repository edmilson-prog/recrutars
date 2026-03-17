import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CompanySearchCombobox } from './CompanySearchCombobox';
import { Plus, Minus, ArrowRightLeft, Loader2, AlertTriangle } from 'lucide-react';
import {
  useAdminManualCredit,
  useAdminManualDebit,
  useAdminTransferCredits,
} from '@/hooks/useTestPackagesQuery';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreditOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'credit' | 'debit' | 'transfer';
  companyId: string;
  companyName: string;
  currentBalance: number;
}

const MODE_CONFIG = {
  credit: {
    title: 'Creditar Testes',
    description: 'Adicionar créditos manualmente à empresa',
    icon: Plus,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    buttonLabel: 'Creditar',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  debit: {
    title: 'Debitar Testes',
    description: 'Remover créditos da empresa',
    icon: Minus,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    buttonLabel: 'Debitar',
    buttonClass: 'bg-red-600 hover:bg-red-700',
  },
  transfer: {
    title: 'Transferir Créditos',
    description: 'Transferir créditos para outra empresa',
    icon: ArrowRightLeft,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    buttonLabel: 'Transferir',
    buttonClass: 'bg-amber-600 hover:bg-amber-700',
  },
};

export function CreditOperationDialog({
  open,
  onOpenChange,
  mode,
  companyId,
  companyName,
  currentBalance,
}: CreditOperationDialogProps) {
  const { user } = useAuth();
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  const [amount, setAmount] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [targetCompany, setTargetCompany] = useState<{
    id: string;
    name: string;
    cnpj: string;
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const creditMutation = useAdminManualCredit();
  const debitMutation = useAdminManualDebit();
  const transferMutation = useAdminTransferCredits();

  const isPending =
    creditMutation.isPending || debitMutation.isPending || transferMutation.isPending;

  const isFormValid =
    amount > 0 &&
    description.length >= 3 &&
    (mode !== 'transfer' || targetCompany !== null);

  function resetForm() {
    setAmount(1);
    setDescription('');
    setTargetCompany(null);
    setConfirmOpen(false);
  }

  function handleDialogOpenChange(value: boolean) {
    if (!value) {
      resetForm();
    }
    onOpenChange(value);
  }

  function handleSubmit() {
    setConfirmOpen(true);
  }

  function getConfirmationDescription(): string {
    if (mode === 'credit') {
      return `Adicionar ${amount} crédito(s) para ${companyName}?`;
    }
    if (mode === 'debit') {
      return `Remover ${amount} crédito(s) de ${companyName}? Saldo atual: ${currentBalance}`;
    }
    return `Transferir ${amount} crédito(s) de ${companyName} para ${targetCompany?.name}?`;
  }

  async function handleConfirmOperation() {
    if (!user?.id) return;

    try {
      if (mode === 'credit') {
        await creditMutation.mutateAsync({
          companyId,
          amount,
          description,
          createdBy: user.id,
        });
        toast.success(`${amount} crédito(s) adicionado(s) para ${companyName}.`);
      } else if (mode === 'debit') {
        await debitMutation.mutateAsync({
          companyId,
          amount,
          description,
          createdBy: user.id,
        });
        toast.success(`${amount} crédito(s) removido(s) de ${companyName}.`);
      } else if (mode === 'transfer' && targetCompany) {
        await transferMutation.mutateAsync({
          sourceCompanyId: companyId,
          targetCompanyId: targetCompany.id,
          amount,
          description,
          createdBy: user.id,
        });
        toast.success(
          `${amount} crédito(s) transferido(s) de ${companyName} para ${targetCompany.name}.`
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao executar operação de créditos.'
      );
    } finally {
      setConfirmOpen(false);
      resetForm();
      onOpenChange(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${config.bgColor}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <DialogTitle>{config.title}</DialogTitle>
                <DialogDescription>{config.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Quantidade</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                max={
                  mode === 'debit' || mode === 'transfer'
                    ? currentBalance
                    : undefined
                }
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Motivo</Label>
              <Textarea
                id="description"
                placeholder="Descreva o motivo da operação..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {mode === 'transfer' && (
              <div className="space-y-2">
                <Label>Empresa destino</Label>
                <CompanySearchCombobox
                  excludeId={companyId}
                  value={targetCompany}
                  onChange={setTargetCompany}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className={config.buttonClass}
              disabled={!isFormValid}
              onClick={handleSubmit}
            >
              {config.buttonLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmar operação
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium">Motivo:</span> {description}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmOperation();
              }}
              className={config.buttonClass}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                `Confirmar ${config.buttonLabel}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
