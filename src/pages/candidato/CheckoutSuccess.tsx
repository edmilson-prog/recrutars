/**
 * CheckoutSuccess Page — Candidate
 * PRD-075: Success page after Stripe Checkout completes
 */

import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ConfettiTrigger } from '@/components/ui/confetti';

export default function CandidateCheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const planName = searchParams.get('plan') ?? 'seu plano';

  return (
    <DashboardLayout userType="candidate">
      <ConfettiTrigger trigger={true} variant="explosion" />
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Assinatura ativada!
            </h1>
            <p className="text-muted-foreground">
              Seu plano <strong>{planName}</strong> está ativo. Agora você tem acesso completo
              aos recursos do seu plano.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/candidato" className="gap-2">
                Ir para o Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/candidato/meu-plano" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Ver detalhes do plano
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
