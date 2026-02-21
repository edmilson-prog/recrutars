import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

interface NavItem {
  href: string;
  label: string;
}

interface DashboardBreadcrumbsProps {
  userType: 'admin' | 'company' | 'candidate';
  navItems: NavItem[];
}

export function DashboardBreadcrumbs({ userType, navItems }: DashboardBreadcrumbsProps) {
  const crumbs = useBreadcrumbs(userType, navItems);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isFirst = index === 0;
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast && !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href!}>
                      {isFirst && (
                        <Home className="h-3.5 w-3.5 inline-block align-text-bottom mr-1" />
                      )}
                      <span className={isFirst ? 'hidden sm:inline' : undefined}>
                        {crumb.label}
                      </span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
