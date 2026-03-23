/**
 * Credit Summary Card
 * PRD-089: Card de resumo de créditos no Hub de Testes
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingDown, Wallet, ShoppingCart } from 'lucide-react';

interface CreditSummaryCardProps {
  creditsAvailable: number;
  creditsUsed: number;
}

export function CreditSummaryCard({ creditsAvailable, creditsUsed }: CreditSummaryCardProps) {
  const navigate = useNavigate();
  const total = creditsAvailable + creditsUsed;
  const isEmpty = creditsAvailable === 0;

  return (
    <Card className={isEmpty ? 'border-red-500/30' : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Créditos de Teste
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              Disponíveis
            </div>
            <span className={`text-lg font-bold ${isEmpty ? 'text-red-500' : 'text-emerald-600'}`}>
              {creditsAvailable}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5" />
              Consumidos
            </div>
            <span className="text-sm font-medium">{creditsUsed}</span>
          </div>
          {total > 0 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isEmpty ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (creditsAvailable / total) * 100)}%` }}
              />
            </div>
          )}
          {isEmpty && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
              onClick={() => navigate('/empresa/pacotes')}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Comprar Créditos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
