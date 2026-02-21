/**
 * DashboardLayout Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 * - Sidebar flat com tabs nas páginas (sem sub-itens colapsáveis)
 * - Sidebar oculta em mobile (<768px)
 * - Bottom Navigation Bar em mobile
 */

import { ReactNode, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Settings, LogOut,
  Briefcase, MessageSquare, Brain, FileText, Search, User, ClipboardList, Heart, Calendar, HelpCircle, Bell,
  ChevronLeft, ChevronRight, Sparkles, Info, UsersRound,
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
import { NotificationBell } from '@/components/notifications';
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

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: 'savedJobs' | 'interviews' | 'savedCandidates' | 'companyInterviews' | 'recommendations';
}

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { href: '/admin/candidatos', label: 'Candidatos', icon: Users },
  { href: '/admin/planos', label: 'Planos & Assinaturas', icon: CreditCard },
  { href: '/admin/assinaturas/billing', label: 'Financeiro', icon: DollarSign },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
  { href: '/admin/usuarios', label: 'Usuários & Permissões', icon: ShieldCheck },
  { href: '/admin/avaliacoes/categorias', label: 'Avaliações', icon: Brain },
  { href: '/admin/vagas', label: 'Vagas', icon: Briefcase },
  { href: '/admin/relatorios/financeiro', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/admin/helpdesk', label: 'Helpdesk', icon: Headset },
  { href: '/sobre', label: 'Sobre', icon: Info },
];

const companyNav: NavItem[] = [
  { href: '/empresa', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/empresa/vagas', label: 'Minhas Vagas', icon: Briefcase },
  { href: '/empresa/candidaturas', label: 'Candidaturas', icon: ClipboardList },
  { href: '/empresa/entrevistas', label: 'Entrevistas', icon: Calendar, countKey: 'companyInterviews' },
  { href: '/empresa/candidatos', label: 'Banco de Talentos', icon: Users },
  { href: '/empresa/candidatos-salvos', label: 'Candidatos Salvos', icon: Heart, countKey: 'savedCandidates' },
  { href: '/empresa/testes', label: 'Testes', icon: Brain },
  { href: '/empresa/equipes', label: 'Gestão de Equipes', icon: UsersRound },
  { href: '/empresa/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/empresa/notificacoes', label: 'Notificações', icon: Bell },
  { href: '/ajuda', label: 'Central de Ajuda', icon: HelpCircle },
  { href: '/empresa/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/sobre', label: 'Sobre', icon: Info },
];

const candidateNav: NavItem[] = [
  { href: '/candidato', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidato/perfil', label: 'Meu Perfil', icon: FileText },
  { href: '/candidato/vagas-recomendadas', label: 'Vagas para Você', icon: Sparkles, countKey: 'recommendations' },
  { href: '/candidato/vagas', label: 'Buscar Vagas', icon: Search },
  { href: '/candidato/vagas-salvas', label: 'Vagas Salvas', icon: Heart, countKey: 'savedJobs' },
  { href: '/candidato/candidaturas', label: 'Candidaturas', icon: ClipboardList },
  { href: '/candidato/entrevistas', label: 'Entrevistas', icon: Calendar, countKey: 'interviews' },
  { href: '/candidato/teste-comportamental', label: 'Teste Comportamental', icon: Brain },
  { href: '/candidato/testes', label: 'Meus Testes', icon: Brain },

  { href: '/candidato/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/ajuda', label: 'Central de Ajuda', icon: HelpCircle },
  { href: '/candidato/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/sobre', label: 'Sobre', icon: Info },
];

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

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
          isCollapsed && "justify-center px-2",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent/50"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className={cn(
          "w-5 h-5 flex-shrink-0",
          isActive && "text-sidebar-primary"
        )} />
        {!isCollapsed && <span className="font-medium flex-1">{item.label}</span>}
        {!isCollapsed && count !== null && count > 0 && (
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
  };

  return (
    <div className="h-screen flex w-full overflow-hidden">
      {/* PRD-003-dgn: Skip link para navegação por teclado */}
      <SkipLink href="#main-content" />

      {/* Sidebar - PRD-003-dgn: Oculta em mobile */}
      <aside className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        // Ocultar em mobile
        "hidden md:flex"
      )}>
        {/* Logo */}
        <div className={cn(
          "p-6 border-b border-sidebar-border flex items-center",
          isCollapsed ? "justify-center relative" : "justify-between"
        )}>
          <Link to="/" className={cn(
            "flex items-center gap-2",
            isCollapsed && "justify-center"
          )}>
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-sidebar-primary-foreground">R</span>
            </div>
            {!isCollapsed && <span className="text-xl font-bold">RecrutaRS</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn(
              "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed && "absolute right-2"
            )}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(renderNavItem)}
        </nav>

        {/* User section - apenas botão de sair */}
        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background relative">
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
