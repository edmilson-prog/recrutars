/**
 * Candidate Settings Page
 * PRD-045: Página de Configurações do Candidato
 * Preferências (Notificações, Aparência)
 * Segurança e Conta disponíveis em /candidato/conta
 */

import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfigLayout } from '@/components/settings/ConfigLayout';
import { candidateSettingsCategories } from '@/data/settingsConfig';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';

// Filtra categorias que serão gerenciadas pelo ConfigLayout (exclui "Meu Perfil")
const filteredCategories = candidateSettingsCategories.filter(
  (cat) => cat.key !== 'profile'
);

export default function CandidateSettings() {
  const { user } = useAuth();

  // Settings hook (para categorias de preferências)
  const {
    values,
    history,
    updateValue,
    saveSection,
    restoreDefaults,
    isLoading: settingsLoading,
  } = useSettings({
    categories: filteredCategories,
    panel: 'candidate',
    userId: user?.id || '',
    userName: user?.name || 'Candidato',
    entityId: user?.id,
  });

  if (settingsLoading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando configurações...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e dados da conta</p>
        </div>

        {/* ConfigLayout for preferences */}
        <ConfigLayout
          title="Preferências"
          subtitle="Configure suas preferências de vagas, notificações, privacidade e aparência"
          categories={filteredCategories}
          values={values}
          history={history}
          panel="candidate"
          onValueChange={updateValue}
          onSave={saveSection}
          onRestoreDefaults={restoreDefaults}
        />
      </div>
    </DashboardLayout>
  );
}
