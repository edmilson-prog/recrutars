/**
 * Application Success Modal Component
 * PRD-007: Candidatura a Vagas
 * PRD-000-dgn: Design System e Microinterações
 * PRD-035: Banner de incentivo ao teste DISC
 */

import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatedCheckmark } from '@/components/ui/success-state';
import { ConfettiTrigger } from '@/components/ui/confetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DiscIncentiveBanner } from '@/components/candidato/DiscIncentiveBanner';

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onViewApplications: () => void;
  onContinueBrowsing: () => void;
}

export function ApplicationSuccessModal({
  isOpen,
  onViewApplications,
  onContinueBrowsing,
}: ApplicationSuccessModalProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <ConfettiTrigger trigger={isOpen} variant="explosion" />
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-4"
            >
              <AnimatedCheckmark size={64} animate={!prefersReducedMotion} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
                delay: prefersReducedMotion ? 0 : 0.3,
              }}
            >
              <DialogTitle className="text-xl">Candidatura Enviada!</DialogTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
                delay: prefersReducedMotion ? 0 : 0.4,
              }}
            >
              <DialogDescription className="text-center">
                Sua candidatura foi enviada com sucesso.
                <br />
                Acompanhe o status em "Minhas Candidaturas".
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              delay: prefersReducedMotion ? 0 : 0.5,
            }}
            className="flex flex-col gap-3 mt-4"
          >
            <Button onClick={onViewApplications} className="w-full gradient-primary">
              Ver Minhas Candidaturas
            </Button>
            <Button variant="outline" onClick={onContinueBrowsing} className="w-full">
              Continuar Buscando
            </Button>
          </motion.div>

          {/* PRD-035: Banner de incentivo ao teste DISC */}
          <DiscIncentiveBanner context="after_application" />
        </DialogContent>
      </Dialog>
    </>
  );
}
