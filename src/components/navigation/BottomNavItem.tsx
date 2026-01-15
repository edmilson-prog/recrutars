/**
 * BottomNavItem Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 *
 * Item individual da bottom navigation bar
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface BottomNavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  badge?: number | null;
}

export function BottomNavItem({
  href,
  label,
  icon: Icon,
  isActive,
  badge,
}: BottomNavItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Link
      to={href}
      className={cn(
        // Base styles - touch target mínimo 48x48
        "flex flex-col items-center justify-center",
        "min-w-[48px] min-h-[48px] flex-1",
        "relative py-1 px-2",
        // Transições
        "transition-colors duration-200",
        // Focus state acessível
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        // Estados
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Ícone */}
      <div className="relative">
        <Icon
          className={cn(
            "w-6 h-6 transition-transform",
            isActive && !prefersReducedMotion && "scale-110"
          )}
        />

        {/* Badge de notificação */}
        {badge !== null && badge !== undefined && badge > 0 && (
          <motion.span
            className={cn(
              "absolute -top-1 -right-1.5",
              "min-w-[18px] h-[18px] px-1",
              "flex items-center justify-center",
              "text-[10px] font-bold",
              "bg-destructive text-destructive-foreground",
              "rounded-full"
            )}
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[10px] mt-1 font-medium",
          "truncate max-w-full"
        )}
      >
        {label}
      </span>

      {/* Indicador ativo */}
      {isActive && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full"
          layoutId="bottomNavIndicator"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}
