/**
 * DashboardLayout Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 * - Sidebar flat com tabs nas páginas (sem sub-itens colapsáveis)
 * - Sidebar oculta em mobile (<768px)
 * - Bottom Navigation Bar em mobile
 */

import { ReactNode, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Users, Settings, LogOut,
  Briefcase, MessageSquare, Brain, FileText, Search, User, ClipboardList, ClipboardCheck, Heart, Calendar, HelpCircle, Bell,
  ChevronLeft, ChevronRight, Sparkles, Info, UserCog, MoreHorizontal,
  ShieldCheck, BarChart3, CreditCard, DollarSign, ToggleLeft, Headset,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAdminNavItemActive, getTabLabelForPath } from '@/config/adminTabConfig';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoriteJobs } from '@/hooks/useFavoriteJobs';
import { useFavoriteCandidates } from '@/hooks/useFavoriteCandidates';
import { useInterviews } from '@/hooks/useInterviews';
import { useCompanyInterviews } from '@/hooks/useCompanyInterviews';
import { useTopRecommendations } from '@/hooks/useJobRecommendations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { GlassHeader } from '@/components/layout/GlassHeader';
import { GlassFooter } from '@/components/layout/GlassFooter';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { NotificationBell, AdminNotificationBell } from '@/components/notifications';
import { CompanyNotificationBell } from '@/components/notifications/CompanyNotificationBell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { BottomNav } from '@/components/navigation';
import { SkipLink, AccessibilityPanel } from '@/components/accessibility';
import { TEST_CONFIG } from '@/data/testConfig';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { TrialBadge, TrialIndicator, TrialGuard } from '@/components/trial';
import { PaymentFailedBanner } from '@/components/billing/PaymentFailedBanner';
import { DashboardBreadcrumbs } from '@/components/navigation/DashboardBreadcrumbs';
import { usePlans } from '@/hooks/usePlans';
import { usePendingCSAT, useSubmitCSAT } from '@/hooks/useAdminTicketsQuery';
import { CSATPrompt } from '@/components/helpdesk/CSATPrompt';
import { useRBAC } from '@/contexts/RBACContext';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';
import { useUser } from '@/hooks/useUsersQuery';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: 'savedJobs' | 'interviews' | 'savedCandidates' | 'companyInterviews' | 'recommendations';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
      { href: '/admin/candidatos', label: 'Candidatos', icon: Users },
      { href: '/admin/vagas', label: 'Vagas', icon: Briefcase },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/admin/planos', label: 'Planos & Assinaturas', icon: CreditCard },
      { href: '/admin/assinaturas/billing', label: 'Financeiro', icon: DollarSign },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
      { href: '/admin/usuarios', label: 'Usuários & Permissões', icon: ShieldCheck },
      { href: '/admin/avaliacoes/categorias', label: 'Avaliações', icon: Brain },
      { href: '/admin/relatorios/financeiro', label: 'Relatórios', icon: BarChart3 },
    ],
  },
  {
    label: 'Suporte',
    items: [
      { href: '/admin/notificacoes', label: 'Notificações', icon: Bell },
      { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
      { href: '/admin/helpdesk', label: 'Helpdesk', icon: Headset },
      { href: '/sobre', label: 'Sobre', icon: Info },
    ],
  },
];

const companyNavGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { href: '/empresa', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/empresa/vagas', label: 'Minhas Vagas', icon: Briefcase },
      { href: '/empresa/candidaturas', label: 'Candidaturas', icon: ClipboardList },
      { href: '/empresa/entrevistas', label: 'Entrevistas', icon: Calendar, countKey: 'companyInterviews' },
    ],
  },
  {
    label: 'Talentos',
    items: [
      { href: '/empresa/candidatos', label: 'Banco de Talentos', icon: Users },
      { href: '/empresa/candidatos-salvos', label: 'Candidatos Salvos', icon: Heart, countKey: 'savedCandidates' },
      { href: '/empresa/testes', label: 'Testes', icon: Brain },
      { href: '/empresa/equipes', label: 'Gestão de Equipes', icon: UserCog },
    ],
  },
  {
    label: 'Comunicação',
    items: [
      { href: '/empresa/mensagens', label: 'Mensagens', icon: MessageSquare },
      { href: '/empresa/notificacoes', label: 'Notificações', icon: Bell },
    ],
  },
  {
    label: 'Geral',
    items: [
      { href: '/ajuda', label: 'Central de Ajuda', icon: HelpCircle },
      { href: '/empresa/configuracoes', label: 'Configurações', icon: Settings },
      { href: '/sobre', label: 'Sobre', icon: Info },
    ],
  },
];

const candidateNavGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { href: '/candidato', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/candidato/perfil', label: 'Meu Perfil', icon: FileText },
    ],
  },
  {
    label: 'Vagas',
    items: [
      { href: '/candidato/vagas-recomendadas', label: 'Vagas para Você', icon: Sparkles, countKey: 'recommendations' },
      { href: '/candidato/vagas', label: 'Buscar Vagas', icon: Search },
      { href: '/candidato/vagas-salvas', label: 'Vagas Salvas', icon: Heart, countKey: 'savedJobs' },
      { href: '/candidato/candidaturas', label: 'Candidaturas', icon: ClipboardList },
      { href: '/candidato/entrevistas', label: 'Entrevistas', icon: Calendar, countKey: 'interviews' },
    ],
  },
  {
    label: 'Avaliações',
    items: [
      { href: '/candidato/teste-comportamental', label: 'Teste Comportamental', icon: Brain },
      { href: '/candidato/testes', label: 'Meus Testes', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Geral',
    items: [
      { href: '/candidato/mensagens', label: 'Mensagens', icon: MessageSquare },
      { href: '/ajuda', label: 'Central de Ajuda', icon: HelpCircle },
      { href: '/candidato/configuracoes', label: 'Configurações', icon: Settings },
      { href: '/sobre', label: 'Sobre', icon: Info },
    ],
  },
];

/** Helper to flatten nav groups into flat NavItem array (for header label lookup, breadcrumbs, etc.) */
function flattenNavGroups(groups: NavGroup[]): NavItem[] {
  return groups.flatMap(g => g.items);
}

/** Encontra label do item ativo (incluindo tabs admin) */
function findActiveLabel(items: NavItem[], pathname: string, userType: string): string | undefined {
  for (const item of items) {
    if (item.href === pathname) return item.label;
  }
  // Para admin, verificar tabs
  if (userType === 'admin') {
    const tabLabel = getTabLabelForPath(pathname);
    if (tabLabel) return tabLabel;
  }
  return undefined;
}

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

  // Hook para sidebar recolhível
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();

  // Hook de favoritos para contador (PRD-024)
  const { favoritesCount } = useFavoriteJobs();

  // PRD-030: Hook de candidatos favoritos para contador
  const { favoritesCount: savedCandidatesCount } = useFavoriteCandidates();

  // Hook de entrevistas para contador (PRD-027)
  const { pendingCount: interviewsPendingCount } = useInterviews(currentCandidate?.id ?? '');

  // PRD-034: Hook de entrevistas da empresa para contador
  const { pendingCount: companyInterviewsPendingCount } = useCompanyInterviews(currentCompany?.id ?? '');

  // PRD-036: Hook de recomendações para contador de novas vagas
  const { newCount: recommendationsNewCount } = useTopRecommendations(
    currentCandidate?.id ?? '',
    5
  );

  // PRD-074: Trial status for company users
  const { isTrial, isExpired, daysRemaining, warningLevel } = useTrialStatus();

  // PRD-061: Impersonation banner support
  const { isImpersonating, impersonationSession, stopImpersonation, impersonationRemainingTime } = useRBAC();
  const { data: impersonatedUser } = useUser(
    isImpersonating && impersonationSession?.targetUserId ? impersonationSession.targetUserId : ''
  );

  // PRD-061: Wrap stopImpersonation to navigate back to admin user detail
  const handleStopImpersonation = useCallback(() => {
    const targetId = impersonationSession?.targetUserId;
    stopImpersonation();
    if (targetId) {
      navigate(`/admin/usuarios/${targetId}`);
    }
  }, [impersonationSession, stopImpersonation, navigate]);

  // Planos dinamicos para badge de plano no header
  const { candidatePlans, companyPlans } = usePlans();
  const candidatePlanObj = currentCandidate?.plan
    ? candidatePlans.find(p => p.name === currentCandidate.plan)
    : undefined;
  const companyPlanObj = currentCompany?.plan
    ? companyPlans.find(p => p.name === currentCompany.plan)
    : undefined;

  // PRD-082: CSAT prompt for candidate/company
  const { data: pendingCsat } = usePendingCSAT(
    (userType === 'candidate' || userType === 'company') ? (user?.id ?? '') : ''
  );
  const submitCsatMutation = useSubmitCSAT();
  const [csatDismissed, setCsatDismissed] = useState(false);

  const handleCsatSubmit = useCallback(async (rating: number, comment?: string) => {
    if (!pendingCsat || !user?.id) return;
    await submitCsatMutation.mutateAsync({
      ticketId: pendingCsat.ticketId,
      userId: user.id,
      rating,
      comment,
    });
    setCsatDismissed(true);
  }, [pendingCsat, user?.id, submitCsatMutation]);

  const prefersReducedMotion = useReducedMotion();

  const navGroups = userType === 'admin'
    ? adminNavGroups
    : userType === 'company'
      ? companyNavGroups
      : candidateNavGroups;

  const navItems = flattenNavGroups(navGroups);

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
    // PRD-036: Contador de recomendações novas
    if (countKey === 'recommendations') return recommendationsNewCount;
    return null;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = userType === 'company'
    ? currentCompany?.name
    : userType === 'candidate'
      ? (currentCandidate?.displayName || currentCandidate?.name)
      : user?.name;

  const avatarUrl = userType === 'company'
    ? currentCompany?.logo
    : userType === 'candidate'
      ? currentCandidate?.avatar
      : null;

  const roleLabel = userType === 'admin'
    ? 'Administrador'
    : userType === 'company'
      ? 'Empresa'
      : 'Candidato';

  const getProfileRoute = () => {
    switch (userType) {
      case 'candidate': return '/candidato/conta';
      case 'company': return '/empresa/configuracoes';
      case 'admin': return '/admin/configuracoes';
    }
  };

  /** Renderiza um item de navegação */
  const renderNavItem = (item: NavItem) => {
    const isActive = userType === 'admin'
      ? isAdminNavItemActive(item.href, location.pathname)
      : location.pathname === item.href;
    const count = getItemCount(item.countKey);
    const hasCount = count !== null && count > 0;
    const tooltipLabel = hasCount ? `${item.label} (${count})` : item.label;

    const linkContent = (
      <Link
        key={item.href}
        to={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          "relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
          isCollapsed && "justify-center px-2",
          isActive
            ? "bg-sidebar-primary/15 text-sidebar-accent-foreground"
            : "hover:bg-sidebar-foreground/5"
        )}
      >
        {/* Left-edge active indicator */}
        {isActive && (
          <motion.div
            layoutId={prefersReducedMotion ? undefined : "sidebar-active-indicator"}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-sidebar-primary"
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <div className="relative flex-shrink-0">
          <item.icon className={cn(
            "w-5 h-5",
            isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
          )} />
          {/* Badge dot when collapsed */}
          {isCollapsed && hasCount && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sidebar-primary" />
          )}
        </div>
        <span className={cn(
          "flex-1",
          isCollapsed ? "sr-only" : "",
          isActive ? "font-semibold" : "font-normal"
        )}>{item.label}</span>
        {!isCollapsed && hasCount && (
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

    if (isCollapsed) {
      return (
        <Tooltip key={item.href} delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {tooltipLabel}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  /** Renderiza grupos de navegação com labels de seção */
  const renderNavGroups = () => (
    <>
      {navGroups.map((group, groupIndex) => (
        <div key={group.label} role="group" aria-label={group.label}>
          {/* Section label or divider */}
          {groupIndex > 0 && (
            isCollapsed ? (
              <div className="h-px bg-sidebar-border mx-3 my-2" />
            ) : (
              <div className="text-[11px] uppercase tracking-wider font-semibold text-sidebar-foreground/40 px-4 pt-5 pb-1.5">
                {group.label}
              </div>
            )
          )}
          <div className="space-y-0.5">
            {group.items.map(renderNavItem)}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="h-screen flex w-full overflow-hidden">
      {/* PRD-003-dgn: Skip link para navegação por teclado */}
      <SkipLink href="#main-content" />

      {/* Sidebar - PRD-003-dgn: Oculta em mobile */}
      <TooltipProvider>
        <aside
          className={cn(
            "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-[width] duration-300",
            "shadow-[inset_-1px_0_0_hsl(var(--sidebar-border))]",
            isCollapsed ? "w-20" : "w-64",
            "hidden md:flex"
          )}
          aria-label="Menu principal"
        >
          {/* Logo */}
          <div className={cn(
            "p-6 border-b border-sidebar-border flex items-center",
            isCollapsed ? "justify-center relative" : "justify-between"
          )}>
            <Link to="/" className={cn(
              "flex items-center gap-2",
              isCollapsed && "justify-center"
            )}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sidebar-primary/20">
                <span className="text-xl font-bold text-sidebar-primary-foreground">R</span>
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={prefersReducedMotion ? false : { opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl font-bold overflow-hidden whitespace-nowrap"
                  >
                    RecrutaRS
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className={cn(
                "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-foreground/5",
                isCollapsed && "absolute right-2"
              )}
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 p-3 overflow-y-auto"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 8px, black calc(100% - 8px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8px, black calc(100% - 8px), transparent 100%)',
            }}
          >
            {renderNavGroups()}
          </nav>

          {/* User profile section */}
          <div className="p-3 border-t border-sidebar-border">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 p-2 rounded-lg">
                <Avatar className="w-9 h-9 rounded-lg flex-shrink-0">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName || ''} />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary/20 text-sidebar-primary text-sm font-semibold">
                    {displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate text-sidebar-foreground">{displayName}</div>
                  <div className="text-[11px] text-sidebar-foreground/60">{roleLabel}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5 flex-shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start" className="w-48">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(getProfileRoute())}>
                      <User className="w-4 h-4 mr-2" />
                      Conta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(
                      userType === 'admin' ? '/admin/configuracoes' :
                      userType === 'company' ? '/empresa/configuracoes' :
                      '/candidato/configuracoes'
                    )}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-lg">
                      <Avatar className="w-9 h-9 rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={avatarUrl || undefined} alt={displayName || ''} />
                        <AvatarFallback className="rounded-lg bg-sidebar-primary/20 text-sidebar-primary text-sm font-semibold">
                          {displayName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{roleLabel}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(getProfileRoute())}>
                      <User className="w-4 h-4 mr-2" />
                      Conta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(
                      userType === 'admin' ? '/admin/configuracoes' :
                      userType === 'company' ? '/empresa/configuracoes' :
                      '/candidato/configuracoes'
                    )}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </aside>
      </TooltipProvider>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* PRD-061: Impersonation Banner */}
        {isImpersonating && impersonationSession && (
          <ImpersonationBanner
            targetName={impersonatedUser?.name || 'Usuario'}
            targetType={impersonationSession.targetUserType}
            remainingTimeMs={impersonationRemainingTime()}
            onStop={handleStopImpersonation}
          />
        )}

        {/* Glass Header */}
        <GlassHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                {findActiveLabel(navItems, location.pathname, userType) || 'Dashboard'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* PRD-074: Trial badge for company users */}
              {userType === 'company' && isTrial && !isExpired && (
                <TrialBadge daysRemaining={daysRemaining} />
              )}
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
              {/* Notificações - admin */}
              {userType === 'admin' && (
                <AdminNotificationBell />
              )}
              {/* Avatar e nome do usuário com menu dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-2 border-l border-border ml-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="hidden sm:block text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-sm font-medium">{displayName}</span>
                        {userType === 'candidate' && currentCandidate?.plan && !candidatePlanObj?.isFree && (
                          <Badge className={cn(
                            "text-[10px] px-1.5 py-0 h-4 font-semibold border-0",
                            candidatePlanObj?.badge
                              ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white"
                              : (candidatePlanObj?.order ?? 0) >= 2
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                                : "bg-primary/15 text-primary"
                          )}>
                            {currentCandidate.plan}
                          </Badge>
                        )}
                        {userType === 'company' && currentCompany?.plan && !companyPlanObj?.isFree && !(companyPlanObj?.trialDurationDays) && (
                          <Badge className={cn(
                            "text-[10px] px-1.5 py-0 h-4 font-semibold border-0",
                            companyPlanObj?.badge
                              ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white"
                              : (companyPlanObj?.order ?? 0) >= 2
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                                : "bg-primary/15 text-primary"
                          )}>
                            {currentCompany.plan}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{roleLabel}</div>
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {displayName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getProfileRoute())}>
                    <User className="w-4 h-4 mr-2" />
                    Conta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </GlassHeader>

        {/* Scrollable Content - PRD-003-dgn: padding extra para bottom nav em mobile */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-auto pb-16 md:pb-16 focus:outline-none"
          role="main"
          aria-label="Conteúdo principal"
        >
          <div className={cn(
            "p-4 md:p-8",
            // Padding bottom extra para bottom nav e footer em mobile
            isMobile && "pb-32"
          )}>
            {/* PRD-076: Payment failed banner */}
            {(userType === 'company' || userType === 'candidate') && <PaymentFailedBanner />}

            {/* PRD-074: Trial warning indicator (banner/alert) */}
            {userType === 'company' && isTrial && !isExpired && warningLevel !== 'low' && (
              <TrialIndicator
                warningLevel={warningLevel}
                daysRemaining={daysRemaining}
                className="mb-4"
              />
            )}

            {/* Breadcrumbs — automatic navigation derived from URL */}
            <DashboardBreadcrumbs userType={userType} navItems={navItems} />

            {/* PRD-074: Block expired trials from accessing company features */}
            {userType === 'company' ? (
              <TrialGuard>{children}</TrialGuard>
            ) : (
              children
            )}
          </div>
        </main>

        {/* PRD-043: Footer com Glassmorphism */}
        <GlassFooter />
      </div>

      {/* PRD-082: CSAT Prompt for candidate/company */}
      {pendingCsat && !csatDismissed && (userType === 'candidate' || userType === 'company') && (
        <CSATPrompt
          ticketSubject={pendingCsat.subject}
          onSubmit={handleCsatSubmit}
          onDismiss={() => setCsatDismissed(true)}
        />
      )}

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
