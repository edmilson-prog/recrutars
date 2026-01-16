/**
 * DashboardLayout Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 * - Sidebar oculta em mobile (<768px)
 * - Bottom Navigation Bar em mobile
 */

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Settings, LogOut,
  Briefcase, MessageSquare, Brain, FileText, Search, User, ClipboardList, Heart, Calendar, HelpCircle, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoriteJobs } from '@/hooks/useFavoriteJobs';
import { useFavoriteCandidates } from '@/hooks/useFavoriteCandidates';
import { useInterviews } from '@/hooks/useInterviews';
import { useCompanyInterviews } from '@/hooks/useCompanyInterviews';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlassHeader } from '@/components/layout/GlassHeader';
import { GlassFooter } from '@/components/layout/GlassFooter';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/notifications';
import { CompanyNotificationBell } from '@/components/notifications/CompanyNotificationBell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { BottomNav } from '@/components/navigation';
import { SkipLink, AccessibilityPanel } from '@/components/accessibility';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: 'savedJobs' | 'interviews' | 'savedCandidates' | 'companyInterviews'; // Chave para contadores dinâmicos
}

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { href: '/admin/candidatos', label: 'Candidatos', icon: Users },
  { href: '/ajuda', label: 'Central de Ajuda', icon: HelpCircle },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

const companyNav: NavItem[] = [
  { href: '/empresa', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/empresa/vagas', label: 'Minhas Vagas', icon: Briefcase },
  { href: '/empresa/candidaturas', label: 'Candidaturas', icon: ClipboardList },
  { href: '/empresa/entrevistas', label: 'Entrevistas', icon: Calendar, countKey: 'companyInterviews' },
  { href: '/empresa/candidatos', label: 'Banco de Talentos', icon: Users },
  { href: '/empresa/candidatos-salvos', label: 'Candidatos Salvos', icon: Heart, countKey: 'savedCandidates' },
  { href: '/empresa/testes', label: 'Testes', icon: Brain },
  { href: '/empresa/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/empresa/notificacoes', label: 'Notificações', icon: Bell },
  { href: '/ajuda', label: 'Central de Ajuda', icon: HelpCircle },
  { href: '/empresa/configuracoes', label: 'Configurações', icon: Settings },
];

const candidateNav: NavItem[] = [
  { href: '/candidato', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidato/curriculos', label: 'Currículos', icon: FileText },
  { href: '/candidato/vagas', label: 'Buscar Vagas', icon: Search },
  { href: '/candidato/vagas-salvas', label: 'Vagas Salvas', icon: Heart, countKey: 'savedJobs' },
  { href: '/candidato/candidaturas', label: 'Candidaturas', icon: ClipboardList },
  { href: '/candidato/entrevistas', label: 'Entrevistas', icon: Calendar, countKey: 'interviews' },
  { href: '/candidato/testes', label: 'Meus Testes', icon: Brain },
  { href: '/candidato/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/ajuda', label: 'Central de Ajuda', icon: HelpCircle },
  { href: '/candidato/configuracoes', label: 'Configurações', icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'admin' | 'company' | 'candidate';
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, currentCompany, currentCandidate } = useAuth();

  // PRD-003-dgn: Detectar viewport mobile
  const isMobile = useIsMobile();

  // Hook de favoritos para contador (PRD-024)
  const { favoritesCount } = useFavoriteJobs();

  // PRD-030: Hook de candidatos favoritos para contador
  const { favoritesCount: savedCandidatesCount } = useFavoriteCandidates();

  // Hook de entrevistas para contador (PRD-027)
  const { pendingCount: interviewsPendingCount } = useInterviews('candidate-1');

  // PRD-034: Hook de entrevistas da empresa para contador
  const { pendingCount: companyInterviewsPendingCount } = useCompanyInterviews('company-1');

  const navItems = userType === 'admin'
    ? adminNav
    : userType === 'company'
      ? companyNav
      : candidateNav;

  // Obter contadores para items do menu
  const getItemCount = (countKey?: string): number | null => {
    if (!countKey) return null;
    // PRD-030: Contador de candidatos salvos (empresa)
    if (countKey === 'savedCandidates' && userType === 'company') return savedCandidatesCount;
    // PRD-034: Contador de entrevistas pendentes (empresa)
    if (countKey === 'companyInterviews' && userType === 'company') return companyInterviewsPendingCount;
    // Contadores do candidato
    if (userType !== 'candidate') return null;
    if (countKey === 'savedJobs') return favoritesCount;
    if (countKey === 'interviews') return interviewsPendingCount;
    return null;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = userType === 'company' 
    ? currentCompany?.name 
    : userType === 'candidate'
      ? currentCandidate?.name
      : user?.name;

  const roleLabel = userType === 'admin' 
    ? 'Administrador' 
    : userType === 'company' 
      ? 'Empresa' 
      : 'Candidato';

  return (
    <div className="min-h-screen flex w-full">
      {/* PRD-003-dgn: Skip link para navegação por teclado */}
      <SkipLink href="#main-content" />

      {/* Sidebar - PRD-003-dgn: Oculta em mobile */}
      <aside className={cn(
        "w-64 bg-sidebar text-sidebar-foreground flex flex-col",
        // Ocultar em mobile
        "hidden md:flex"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <span className="text-xl font-bold text-sidebar-primary-foreground">R</span>
            </div>
            <span className="text-xl font-bold">RecrutaRS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const count = getItemCount(item.countKey);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive && "text-sidebar-primary"
                )} />
                <span className="font-medium flex-1">{item.label}</span>
                {count !== null && count > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 min-w-5 px-1.5 text-xs",
                      isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : ""
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="font-semibold text-sidebar-accent-foreground">
                {displayName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{displayName}</div>
              <div className="text-xs text-sidebar-foreground/60">{roleLabel}</div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* Glass Header */}
        <GlassHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                {navItems.find(item => item.href === location.pathname)?.label || 'Dashboard'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* PRD-003-dgn: Painel de acessibilidade */}
              <AccessibilityPanel />
              <ThemeToggle />
              {/* PRD-025: Notificações - candidatos */}
              {userType === 'candidate' && (
                <NotificationBell />
              )}
              {/* PRD-033: Notificações - empresas */}
              {userType === 'company' && (
                <CompanyNotificationBell />
              )}
            </div>
          </div>
        </GlassHeader>

        {/* Scrollable Content - PRD-003-dgn: padding extra para bottom nav em mobile */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-auto pb-12 md:pb-12 focus:outline-none"
          role="main"
          aria-label="Conteúdo principal"
        >
          <div className={cn(
            "p-4 md:p-8",
            // Padding bottom extra para bottom nav em mobile
            isMobile && "pb-24"
          )}>
            {children}
          </div>
        </main>

        {/* Glass Footer - offset for sidebar (desktop only) */}
        <GlassFooter className={cn(
          // Em mobile não tem sidebar, então sem offset
          !isMobile && "left-64"
        )} />
      </div>

      {/* PRD-003-dgn: Bottom Navigation Bar - mobile only */}
      <BottomNav
        userType={userType}
        badges={{
          messages: 0, // TODO: Integrar com contador de mensagens não lidas
          savedJobs: favoritesCount,
          interviews: interviewsPendingCount,
        }}
      />
    </div>
  );
}
