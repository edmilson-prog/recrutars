/**
 * BottomNav Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 *
 * Bottom navigation bar para dispositivos móveis
 * - Aparece apenas em viewports < 768px
 * - 5 itens máximo (candidato/empresa)
 * - Oculta ao scrollar para baixo, reaparece ao scrollar para cima
 */

import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  MessageSquare,
  User,
  Briefcase,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollVisibility } from '@/hooks/useScrollDirection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BottomNavItem } from './BottomNavItem';

interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'messages' | 'savedJobs' | 'interviews';
}

// Navegação para candidatos (5 itens principais)
const candidateBottomNav: NavItemConfig[] = [
  { href: '/candidato', label: 'Início', icon: LayoutDashboard },
  { href: '/candidato/vagas', label: 'Vagas', icon: Search },
  { href: '/candidato/candidaturas', label: 'Candidaturas', icon: ClipboardList },
  { href: '/candidato/mensagens', label: 'Mensagens', icon: MessageSquare, badgeKey: 'messages' },
  { href: '/candidato/perfil', label: 'Perfil', icon: User },
];

// Navegação para empresas (5 itens principais)
const companyBottomNav: NavItemConfig[] = [
  { href: '/empresa', label: 'Início', icon: LayoutDashboard },
  { href: '/empresa/vagas', label: 'Vagas', icon: Briefcase },
  { href: '/empresa/candidatos', label: 'Candidatos', icon: Users },
  { href: '/empresa/mensagens', label: 'Mensagens', icon: MessageSquare, badgeKey: 'messages' },
  { href: '/empresa/configuracoes', label: 'Perfil', icon: User },
];

// Admin não tem bottom nav (funcionalidade desktop-only)
const adminBottomNav: NavItemConfig[] = [];

interface BottomNavProps {
  userType: 'admin' | 'company' | 'candidate';
  badges?: {
    messages?: number;
    savedJobs?: number;
    interviews?: number;
  };
  className?: string;
}

export function BottomNav({ userType, badges = {}, className }: BottomNavProps) {
  const location = useLocation();
  const isVisible = useScrollVisibility(50);
  const prefersReducedMotion = useReducedMotion();

  // Selecionar navegação baseado no tipo de usuário
  const navItems =
    userType === 'candidate'
      ? candidateBottomNav
      : userType === 'company'
      ? companyBottomNav
      : adminBottomNav;

  // Admin não tem bottom nav
  if (userType === 'admin' || navItems.length === 0) {
    return null;
  }

  // Verificar se rota está ativa (exata ou inicia com)
  const isActive = (href: string) => {
    if (href === '/candidato' || href === '/empresa') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Obter badge count para item
  const getBadge = (badgeKey?: string): number | null => {
    if (!badgeKey) return null;
    return badges[badgeKey as keyof typeof badges] ?? null;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className={cn(
            // Posicionamento fixo no bottom
            "fixed bottom-0 left-0 right-0 z-50",
            // Visível apenas em mobile
            "md:hidden",
            // Safe area para iPhone X+
            "pb-[env(safe-area-inset-bottom)]",
            // Estilo visual
            "bg-background/95 backdrop-blur-lg",
            "border-t border-border",
            // Sombra sutil para destaque
            "shadow-[0_-2px_10px_rgba(0,0,0,0.1)]",
            className
          )}
          role="navigation"
          aria-label="Navegação principal"
          initial={prefersReducedMotion ? {} : { y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? {} : { y: 100, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: prefersReducedMotion ? 0 : undefined,
          }}
        >
          {/* Container dos itens - altura mínima 56px */}
          <div className="flex items-stretch justify-around min-h-[56px] max-w-lg mx-auto">
            {navItems.map((item) => (
              <BottomNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href)}
                badge={getBadge(item.badgeKey)}
              />
            ))}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

// Re-export para facilitar imports
export { BottomNavItem } from './BottomNavItem';
