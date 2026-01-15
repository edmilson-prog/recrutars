/**
 * LevelUpModal Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  Compass,
  Zap,
  Award,
  Crown,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfettiTrigger } from "@/components/ui/confetti";
import { cn } from "@/lib/utils";
import type { Level } from "@/types/gamification";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const iconMap: Record<string, LucideIcon> = {
  Sprout,
  Compass,
  Zap,
  Award,
  Crown,
};

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level;
}

export function LevelUpModal({ isOpen, onClose, level }: LevelUpModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = iconMap[level.icon] || Sprout;

  // Auto close after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <>
      <ConfettiTrigger trigger={isOpen} variant="explosion" />
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md text-center border-2 border-primary/20">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                className="flex flex-col items-center py-4"
              >
                {/* Animated Level Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center mb-6",
                    level.bgColor,
                    "shadow-lg"
                  )}
                >
                  <Icon className={cn("w-12 h-12", level.color)} />
                </motion.div>

                {/* Celebration Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm text-muted-foreground mb-2">
                    Parabéns! Você alcançou o nível
                  </p>
                  <h2 className={cn("text-3xl font-bold mb-2", level.color)}>
                    {level.name}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Continue assim! Cada passo te aproxima do seu objetivo.
                  </p>
                </motion.div>

                {/* Level Perks (decorative) */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="w-full"
                >
                  <Button
                    onClick={onClose}
                    className="w-full gradient-primary"
                    size="lg"
                  >
                    Continuar minha jornada
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LevelUpModal;
