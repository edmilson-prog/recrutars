/**
 * BadgeUnlockModal Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Footprints,
  UserCheck,
  Brain,
  Send,
  Target,
  Rocket,
  TrendingUp,
  Eye,
  Flame,
  Calendar,
  FileCheck,
  Trophy,
  Sunrise,
  Moon,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfettiTrigger } from "@/components/ui/confetti";
import { cn } from "@/lib/utils";
import type { Badge } from "@/types/gamification";
import { getRarityColor, getRarityLabel } from "@/data/gamificationConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const iconMap: Record<string, LucideIcon> = {
  Footprints,
  UserCheck,
  Brain,
  Send,
  Target,
  Rocket,
  TrendingUp,
  Eye,
  Flame,
  Calendar,
  FileCheck,
  Trophy,
  Sunrise,
  Moon,
  Search,
};

interface BadgeUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: Badge | null;
}

export function BadgeUnlockModal({
  isOpen,
  onClose,
  badge,
}: BadgeUnlockModalProps) {
  const prefersReducedMotion = useReducedMotion();

  // Auto close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!badge) return null;

  const Icon = iconMap[badge.icon] || Trophy;
  const rarityColors = getRarityColor(badge.rarity);
  const isLegendary = badge.rarity === "legendary";
  const isEpic = badge.rarity === "epic";

  return (
    <>
      {(isLegendary || isEpic) && (
        <ConfettiTrigger
          trigger={isOpen}
          variant={isLegendary ? "stars" : "explosion"}
        />
      )}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className={cn(
            "sm:max-w-sm text-center border-2",
            rarityColors.border
          )}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                className="flex flex-col items-center py-4"
              >
                {/* Badge Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className={cn(
                    "relative w-24 h-24 rounded-2xl flex items-center justify-center mb-4",
                    rarityColors.bg,
                    "border-2",
                    rarityColors.border
                  )}
                >
                  <Icon className={cn("w-12 h-12", rarityColors.text)} />

                  {/* Legendary shimmer */}
                  {isLegendary && !prefersReducedMotion && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/30 to-yellow-400/0"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    Nova Conquista!
                  </p>
                  <h2 className={cn("text-2xl font-bold mb-1", rarityColors.text)}>
                    {badge.name}
                  </h2>
                  <span
                    className={cn(
                      "inline-block text-xs px-2 py-0.5 rounded-full mb-3",
                      rarityColors.bg,
                      rarityColors.text
                    )}
                  >
                    {getRarityLabel(badge.rarity)}
                  </span>
                  <p className="text-muted-foreground text-sm mb-4">
                    {badge.description}
                  </p>
                </motion.div>

                {/* XP Reward */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full"
                >
                  <div className="bg-primary/10 rounded-lg p-3 mb-4">
                    <span className="text-lg font-bold text-primary">
                      +{badge.xpReward} XP
                    </span>
                  </div>

                  <Button onClick={onClose} className="w-full" variant="outline">
                    Continuar
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

export default BadgeUnlockModal;
