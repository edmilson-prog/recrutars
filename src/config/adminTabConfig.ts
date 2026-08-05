/**
 * Admin Tab Groups Configuration
 * Configuração centralizada dos grupos de tabs para páginas admin.
 * Substitui os submenus colapsáveis do sidebar.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Users, UsersRound, Shield, ScrollText,
  FolderTree, FileQuestion,
  LayoutDashboard, List, CheckCircle, Calendar, UserCheck,
  DollarSign, TrendingUp, Activity, Rss, Download,
  CreditCard, BarChart3, ToggleLeft, Webhook, FlaskConical, Settings,
  Headset, MessageSquare, BookOpen, Phone,
  Type, UserCircle, Wallet,
} from 'lucide-react';

export interface AdminTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminTabGroup {
  id: string;
  parentHref: string;
  tabs: AdminTab[];
}

export const ADMIN_TAB_GROUPS: AdminTabGroup[] = [
  {
    id: 'usuarios',
    parentHref: '/admin/usuarios',
    tabs: [
      { href: '/admin/usuarios', label: 'Usuários', icon: Users },
      { href: '/admin/grupos-permissao', label: 'Grupos', icon: UsersRound },
      { href: '/admin/papeis-permissoes', label: 'Papéis', icon: Shield },
      { href: '/admin/auditoria', label: 'Auditoria', icon: ScrollText },
    ],
  },
  {
    id: 'avaliacoes',
    parentHref: '/admin/avaliacoes/categorias',
    tabs: [
      { href: '/admin/avaliacoes/categorias', label: 'Categorias', icon: FolderTree },
      { href: '/admin/avaliacoes/perguntas', label: 'Perguntas', icon: FileQuestion },
    ],
  },
  {
    id: 'gauge-pro',
    parentHref: '/admin/gauge-pro/adjetivos',
    tabs: [
      { href: '/admin/gauge-pro/adjetivos', label: 'Adjetivos', icon: Type },
      { href: '/admin/gauge-pro/cenarios', label: 'Cenários', icon: BookOpen },
      { href: '/admin/gauge-pro/arquetipos', label: 'Arquétipos', icon: UserCircle },
    ],
  },
  {
    id: 'planos',
    parentHref: '/admin/planos',
    tabs: [
      { href: '/admin/planos', label: 'Planos', icon: CreditCard },
      { href: '/admin/planos/capabilities', label: 'Features por Plano', icon: List },
      { href: '/admin/assinaturas', label: 'Assinaturas', icon: UserCheck },
    ],
  },
  {
    id: 'financeiro',
    parentHref: '/admin/assinaturas/dashboard',
    tabs: [
      { href: '/admin/assinaturas/dashboard', label: 'Dashboard', icon: BarChart3 },
      { href: '/admin/assinaturas/billing', label: 'Financeiro', icon: DollarSign },
      { href: '/admin/assinaturas/webhooks', label: 'Webhooks', icon: Webhook },
    ],
  },
  {
    id: 'fluxo-caixa',
    parentHref: '/admin/financeiro',
    tabs: [
      { href: '/admin/financeiro', label: 'Visão Geral', icon: BarChart3 },
      { href: '/admin/financeiro/lancamentos', label: 'Lançamentos', icon: List },
      { href: '/admin/financeiro/categorias', label: 'Categorias', icon: FolderTree },
    ],
  },
  {
    id: 'feature-flags',
    parentHref: '/admin/feature-flags',
    tabs: [
      { href: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
      { href: '/admin/feature-flags/simulador', label: 'Simulador', icon: FlaskConical },
      { href: '/admin/feature-flags/auditoria', label: 'Auditoria', icon: ScrollText },
    ],
  },
  {
    id: 'vagas',
    parentHref: '/admin/vagas',
    tabs: [
      { href: '/admin/vagas', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/vagas/lista', label: 'Todas as Vagas', icon: List },
      { href: '/admin/vagas/moderacao', label: 'Moderação', icon: Shield },
      { href: '/admin/vagas/finalizadas', label: 'Finalizadas', icon: CheckCircle },
      { href: '/admin/vagas/entrevistas', label: 'Entrevistas', icon: Calendar },
      { href: '/admin/vagas/contratacoes', label: 'Contratações', icon: UserCheck },
      { href: '/admin/vagas/configuracoes', label: 'Config. Moderação', icon: Settings },
    ],
  },
  {
    id: 'helpdesk',
    parentHref: '/admin/helpdesk',
    tabs: [
      { href: '/admin/helpdesk', label: 'Tickets', icon: Headset },
    ],
  },
  {
    id: 'relatorios',
    parentHref: '/admin/relatorios/financeiro',
    tabs: [
      { href: '/admin/relatorios/financeiro', label: 'Financeiro', icon: DollarSign },
      { href: '/admin/relatorios/crescimento', label: 'Crescimento', icon: TrendingUp },
      { href: '/admin/relatorios/operacional', label: 'Operacional', icon: Activity },
      { href: '/admin/relatorios/activity-feed', label: 'Activity Feed', icon: Rss },
      { href: '/admin/relatorios/exportar', label: 'Exportar', icon: Download },
    ],
  },
];

/** Retorna o grupo de tabs se o pathname bater exatamente com alguma tab */
export function getTabGroupForPath(pathname: string): AdminTabGroup | null {
  for (const group of ADMIN_TAB_GROUPS) {
    if (group.tabs.some(tab => tab.href === pathname)) {
      return group;
    }
  }
  return null;
}

/** Verifica se um item do sidebar admin deve estar ativo para o pathname atual */
export function isAdminNavItemActive(itemHref: string, pathname: string): boolean {
  if (pathname === itemHref) return true;

  const group = ADMIN_TAB_GROUPS.find(g => g.parentHref === itemHref);
  if (!group) return false;

  // Find matching tabs in this group
  const matchingTabs = group.tabs.filter(
    tab => pathname === tab.href || pathname.startsWith(tab.href + '/')
  );
  if (matchingTabs.length === 0) return false;

  const bestMatchLen = Math.max(...matchingTabs.map(t => t.href.length));

  // Check if another group has a more specific (longer) match — longest prefix wins
  for (const otherGroup of ADMIN_TAB_GROUPS) {
    if (otherGroup.id === group.id) continue;
    for (const otherTab of otherGroup.tabs) {
      if ((pathname === otherTab.href || pathname.startsWith(otherTab.href + '/'))
          && otherTab.href.length > bestMatchLen) {
        return false;
      }
    }
  }

  return true;
}

/** Retorna o label da tab ativa para o pathname (para o header) */
export function getTabLabelForPath(pathname: string): string | null {
  for (const group of ADMIN_TAB_GROUPS) {
    for (const tab of group.tabs) {
      if (pathname === tab.href) return tab.label;
    }
    // Checar sub-rotas (detail pages)
    for (const tab of group.tabs) {
      if (pathname.startsWith(tab.href + '/')) return tab.label;
    }
  }
  return null;
}
