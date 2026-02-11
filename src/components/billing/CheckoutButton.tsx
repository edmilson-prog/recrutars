/**
 * CheckoutButton Component
 * PRD-075/076: Redirects to Stripe Checkout hosted page
 */

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateCheckoutSession } from '@/hooks/useStripeQuery';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { PlanPeriod, StripeEnvironment } from '@/types/plans';
import { cn } from '@/lib/utils';

interface CheckoutButtonProps {
  planId: string;
  planName: string;
  period: PlanPeriod;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
  environment?: StripeEnvironment;
}

export function CheckoutButton({
  planId,
  planName,
  period,
  variant = 'default',
  size = 'lg',
  className,
  children,
  environment = 'test',
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const createCheckout = useCreateCheckoutSession();
  const [loading, setLoading] = useState(false);

  const userType = user?.type === 'company' ? 'company' : 'candidate';
  const baseUrl = window.location.origin;

  const handleCheckout = async () => {
    if (!user?.id) {
      toast.error('Voce precisa estar logado para assinar.');
      return;
    }

    setLoading(true);
    try {
      const result = await createCheckout.mutateAsync({
        userId: user.id,
        userType,
        planId,
        period,
        environment,
        successUrl: `${baseUrl}/${userType === 'company' ? 'empresa' : 'candidato'}/checkout/sucesso?plan=${encodeURIComponent(planName)}`,
        cancelUrl: `${baseUrl}/${userType === 'company' ? 'empresa' : 'candidato'}/checkout/cancelado`,
      });

      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar sessao de checkout';
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Redirecionando...
        </>
      ) : children ? (
        children
      ) : (
        <>
          Assinar {planName.split(' ')[0]}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </Button>
  );
}
