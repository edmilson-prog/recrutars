/**
 * CheckoutCancel Page
 * PRD-075: Cancel/return page when user aborts Stripe Checkout
 */

import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function CheckoutCancel() {
  return (
    <DashboardLayout userType="company">
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Checkout cancelado
            </h1>
            <p className="text-muted-foreground">
              Voce cancelou o processo de checkout. Nenhuma cobranca foi realizada.
              Voce pode tentar novamente a qualquer momento.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" variant="outline">
              <Link to="/planos" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para os planos
              </Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link to="/empresa">
                Ir para o Dashboard
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
