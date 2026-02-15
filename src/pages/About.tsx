/**
 * About Page
 * PRD-044: Página "Sobre" e Tooltip de Versão no Footer
 */

import { useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useChangelog } from '@/hooks/useChangelog';
import { AboutHeroCard, DeveloperCard, VersionHistory } from '@/components/about';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AboutPage() {
  const { user } = useAuth();
  const historyRef = useRef<HTMLDivElement>(null);

  const {
    versions,
    filteredVersions,
    currentVersion,
    isLoading,
    error,
    filters,
    setReleaseType,
    setDateRange,
    setSearch,
  } = useChangelog();

  // Determine user type for layout
  const userType = user?.type || 'candidate';

  const handleViewHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout userType={userType}>
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout userType={userType}>
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h2 className="text-lg font-semibold mb-2">Erro ao carregar dados</h2>
              <p className="text-muted-foreground">
                Não foi possível carregar o histórico de versões.
                Tente novamente mais tarde.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Card com versão atual */}
        {currentVersion && (
          <AboutHeroCard
            version={currentVersion}
            onViewHistory={handleViewHistory}
          />
        )}

        {/* Card do desenvolvedor - horizontal abaixo do hero */}
        <DeveloperCard />

        {/* Histórico de versões - largura total */}
        <VersionHistory
          ref={historyRef}
          versions={versions}
          filteredVersions={filteredVersions}
          search={filters.search}
          releaseType={filters.releaseType}
          dateRange={filters.dateRange}
          onSearchChange={setSearch}
          onReleaseTypeChange={setReleaseType}
          onDateRangeChange={setDateRange}
        />
      </div>
    </DashboardLayout>
  );
}
