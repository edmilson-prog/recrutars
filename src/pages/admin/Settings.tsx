/**
 * Admin Settings Page
 * PRD-045: Página de Configurações do Administrador
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfigLayout } from '@/components/settings/ConfigLayout';
import { adminSettingsCategories } from '@/data/settingsConfig';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();

  const {
    values,
    history,
    updateValue,
    saveSection,
    restoreDefaults,
    isLoading,
  } = useSettings({
    categories: adminSettingsCategories,
    panel: 'admin',
    userId: user?.id || 'admin-1',
    userName: user?.name || 'Administrador',
  });

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">
            Carregando configuracoes...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <ConfigLayout
        title="Configuracoes"
        subtitle="Gerencie os parametros e preferencias do sistema"
        categories={adminSettingsCategories}
        values={values}
        history={history}
        onValueChange={updateValue}
        onSave={saveSection}
        onRestoreDefaults={restoreDefaults}
      />
    </DashboardLayout>
  );
}
