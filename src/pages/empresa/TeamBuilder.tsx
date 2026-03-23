/**
 * Team Builder Page
 * PRD-056: Drag-and-drop team composition with behavioral profile balance.
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers } from '@/hooks/useTeamsQuery';
import { mockTeamBuilderScenarios } from '@/data/teamManagementData';
import { PageHeader } from '@/components/layout/PageHeader';
import type { TeamBuilderScenario } from '@/types/teamManagement';
import TeamBuilderLayout from '@/components/team-management/TeamBuilderLayout';
import ScenarioManager from '@/components/team-management/ScenarioManager';

export default function TeamBuilder() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';
  const { data: allMembers = [], isLoading } = useTeamMembers({ companyId });

  const [scenarios, setScenarios] = useState<TeamBuilderScenario[]>([
    ...mockTeamBuilderScenarios,
  ]);
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [currentTeams, setCurrentTeams] = useState<
    Array<{ id: string; name: string; memberIds: string[] }>
  >([]);
  const [scenarioToLoad, setScenarioToLoad] = useState<TeamBuilderScenario | null>(null);

  const handleSaveScenario = useCallback(
    (
      name: string,
      description: string | undefined,
      teams: Array<{ id: string; name: string; memberIds: string[] }>,
    ) => {
      const now = new Date().toISOString();
      const newScenario: TeamBuilderScenario = {
        id: `scenario-${Date.now()}`,
        name,
        description,
        teams: teams.map((t) => ({ ...t, memberIds: [...t.memberIds] })),
        createdAt: now,
        updatedAt: now,
      };
      setScenarios((prev) => [...prev, newScenario]);
    },
    [],
  );

  const handleLoadScenario = useCallback((scenario: TeamBuilderScenario) => {
    setScenarioToLoad(scenario);
  }, []);

  const handleDeleteScenario = useCallback((scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
  }, []);

  const handleTeamsChange = useCallback(
    (teams: Array<{ id: string; name: string; memberIds: string[] }>) => {
      setCurrentTeams(teams);
    },
    [],
  );

  // Only pass mapped members to the builder
  const mappedMembers = allMembers.filter(
    (m) => m.gaugeStatus === 'mapped' && m.gaugeScores && m.isActive,
  );

  if (isLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <motion.div {...pageTransition} className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link to="/empresa/equipes" className="shrink-0 mt-0.5">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0 space-y-4">
            <PageHeader
              title="Team Builder"
              description="Monte equipes ideais com base em perfis comportamentais"
              actions={
                <Button
                  variant="outline"
                  onClick={() => setScenarioDialogOpen(true)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Cenários
                </Button>
              }
              howItWorks={[
                'Arraste membros entre grupos para montar equipes equilibradas',
                'Analise o equilíbrio comportamental de cada equipe formada',
                'Salve cenários para comparar diferentes composições',
                'Apenas membros com perfil mapeado (Gauge-Pro) participam da montagem',
              ]}
            />
          </div>
        </div>

        {/* Team Builder Layout */}
        <TeamBuilderLayout
          members={mappedMembers}
          scenarios={scenarios}
          onSaveScenario={handleSaveScenario}
          onLoadScenario={handleLoadScenario}
          onDeleteScenario={handleDeleteScenario}
          onTeamsChange={handleTeamsChange}
          loadScenario={scenarioToLoad}
        />

        {/* Scenario Manager dialog (triggered by header button) */}
        <ScenarioManager
          scenarios={scenarios}
          currentTeams={currentTeams}
          onSave={(name, desc) =>
            handleSaveScenario(name, desc, currentTeams)
          }
          onLoad={(scenario) => {
            handleLoadScenario(scenario);
            setScenarioDialogOpen(false);
          }}
          onDelete={handleDeleteScenario}
          open={scenarioDialogOpen}
          onOpenChange={setScenarioDialogOpen}
        />
      </motion.div>
    </DashboardLayout>
  );
}
