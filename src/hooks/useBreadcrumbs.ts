import { useLocation } from 'react-router-dom';
import { ADMIN_TAB_GROUPS } from '@/config/adminTabConfig';
import {
  BreadcrumbItemConfig,
  ROUTE_LABELS,
  SEGMENT_LABELS,
  isDynamicSegment,
} from '@/config/breadcrumbConfig';

interface NavItem {
  href: string;
  label: string;
}

const USER_PREFIXES: Record<string, string> = {
  admin: '/admin',
  company: '/empresa',
  candidate: '/candidato',
};

const DASHBOARD_PATHS = new Set(['/admin', '/empresa', '/candidato']);

/**
 * Computes breadcrumb items from the current pathname.
 * Returns an empty array when on the dashboard (no breadcrumbs needed).
 */
export function useBreadcrumbs(
  userType: 'admin' | 'company' | 'candidate',
  navItems: NavItem[],
): BreadcrumbItemConfig[] {
  const { pathname } = useLocation();
  const prefix = USER_PREFIXES[userType];

  // Dashboard — no breadcrumbs
  if (DASHBOARD_PATHS.has(pathname)) {
    return [];
  }

  const crumbs: BreadcrumbItemConfig[] = [
    { label: 'Dashboard', href: prefix },
  ];

  // Check full-path matches first (most specific)
  // Tier 1: navItem exact match for the full path
  const navMatch = navItems.find(item => item.href === pathname);
  if (navMatch && navMatch.label !== 'Dashboard') {
    crumbs.push({ label: navMatch.label });
    return crumbs;
  }

  // Tier 2: Admin tab group exact match
  if (userType === 'admin') {
    for (const group of ADMIN_TAB_GROUPS) {
      const tabMatch = group.tabs.find(tab => tab.href === pathname);
      if (tabMatch) {
        // Find the parent nav item for this group
        const parentNav = navItems.find(item => item.href === group.parentHref);
        if (parentNav && parentNav.label !== 'Dashboard') {
          crumbs.push({ label: parentNav.label, href: parentNav.href });
        }
        // Only add tab if it's different from the parent
        if (!parentNav || tabMatch.label !== parentNav.label) {
          crumbs.push({ label: tabMatch.label });
        } else {
          // Remove href from last crumb (it's the current page)
          crumbs[crumbs.length - 1] = { label: crumbs[crumbs.length - 1].label };
        }
        return crumbs;
      }
    }
  }

  // Tier 3: Static ROUTE_LABELS exact match
  if (ROUTE_LABELS[pathname]) {
    // Try to find a parent navItem for context
    const parentNav = findParentNavItem(pathname, navItems);
    if (parentNav) {
      crumbs.push({ label: parentNav.label, href: parentNav.href });
    }
    crumbs.push({ label: ROUTE_LABELS[pathname] });
    return crumbs;
  }

  // Build crumbs segment-by-segment for nested/dynamic paths
  const segments = pathname.split('/').filter(Boolean);
  // Skip the prefix segment (admin/empresa/candidato)
  const prefixSegments = prefix.split('/').filter(Boolean);
  const relevantSegments = segments.slice(prefixSegments.length);

  // Handle shared routes (/ajuda, /sobre) that don't start with user prefix
  if (!pathname.startsWith(prefix)) {
    if (ROUTE_LABELS[pathname]) {
      crumbs.push({ label: ROUTE_LABELS[pathname] });
    } else {
      crumbs.push({ label: capitalize(segments[segments.length - 1]) });
    }
    return crumbs;
  }

  let currentPath = prefix;

  for (let i = 0; i < relevantSegments.length; i++) {
    const segment = relevantSegments[i];
    currentPath += '/' + segment;
    const isLast = i === relevantSegments.length - 1;

    // Tier 1: navItem match for accumulated path
    const segNavMatch = navItems.find(item => item.href === currentPath);
    if (segNavMatch && segNavMatch.label !== 'Dashboard') {
      crumbs.push({
        label: segNavMatch.label,
        href: isLast ? undefined : currentPath,
      });
      continue;
    }

    // Tier 2: Admin tab match for accumulated path
    if (userType === 'admin') {
      let tabFound = false;
      for (const group of ADMIN_TAB_GROUPS) {
        const tabMatch = group.tabs.find(tab => tab.href === currentPath);
        if (tabMatch) {
          // Add parent nav if not already in crumbs
          const parentNav = navItems.find(item => item.href === group.parentHref);
          const lastCrumb = crumbs[crumbs.length - 1];
          if (parentNav && lastCrumb.label !== parentNav.label) {
            crumbs.push({ label: parentNav.label, href: parentNav.href });
          }
          crumbs.push({
            label: tabMatch.label,
            href: isLast ? undefined : currentPath,
          });
          tabFound = true;
          break;
        }
      }
      if (tabFound) continue;
    }

    // Tier 3: Static ROUTE_LABELS match for accumulated path
    if (ROUTE_LABELS[currentPath]) {
      crumbs.push({
        label: ROUTE_LABELS[currentPath],
        href: isLast ? undefined : currentPath,
      });
      continue;
    }

    // Tier 4: Dynamic segment or known segment label
    if (isDynamicSegment(segment)) {
      crumbs.push({
        label: 'Detalhes',
        href: isLast ? undefined : currentPath,
      });
    } else if (SEGMENT_LABELS[segment]) {
      crumbs.push({
        label: SEGMENT_LABELS[segment],
        href: isLast ? undefined : currentPath,
      });
    } else {
      crumbs.push({
        label: capitalize(segment),
        href: isLast ? undefined : currentPath,
      });
    }
  }

  // Ensure last crumb has no href (current page)
  if (crumbs.length > 1) {
    const last = crumbs[crumbs.length - 1];
    if (last.href) {
      crumbs[crumbs.length - 1] = { label: last.label };
    }
  }

  return crumbs;
}

/**
 * Find the closest parent navItem for a given path.
 */
function findParentNavItem(pathname: string, navItems: NavItem[]): NavItem | null {
  let bestMatch: NavItem | null = null;
  let bestLength = 0;

  for (const item of navItems) {
    if (
      pathname.startsWith(item.href + '/') &&
      item.href.length > bestLength
    ) {
      bestMatch = item;
      bestLength = item.href.length;
    }
  }

  return bestMatch;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
