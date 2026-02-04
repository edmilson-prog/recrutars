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
  Settings, CreditCard, BarChart3, ToggleLeft,
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
    id: 'vagas',
    parentHref: '/admin/vagas',
    tabs: [
      { href: '/admin/vagas', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/vagas/lista', label: 'Todas as Vagas', icon: List },
      { href: '/admin/vagas/moderacao', label: 'Moderação', icon: Shield },
      { href: '/admin/vagas/finalizadas', label: 'Finalizadas', icon: CheckCircle },
      { href: '/admin/vagas/entrevistas', label: 'Entrevistas', icon: Calendar },
      { href: '/admin/vagas/contratacoes', label: 'Contratações', icon: UserCheck },
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
  {
    id: 'configuracoes',
    parentHref: '/admin/configuracoes',
    tabs: [
      { href: '/admin/configuracoes', label: 'Geral', icon: Settings },
      { href: '/admin/planos', label: 'Planos', icon: CreditCard },
      { href: '/admin/planos/capabilities', label: 'Features por Plano', icon: List },
      { href: '/admin/assinaturas', label: 'Assinaturas', icon: UserCheck },
      { href: '/admin/assinaturas/dashboard', label: 'Dash Assinaturas', icon: BarChart3 },
      { href: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
      { href: '/admin/vagas/configuracoes', label: 'Moderação', icon: Shield },
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

  return group.tabs.some(
    tab => pathname === tab.href || pathname.startsWith(tab.href + '/')
  );
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
