/**
 * Team Compatibility Page
 * PRD-056: Compatibility matrix, top pairs, conflict alerts and pair detail.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers, useDepartments } from '@/hooks/useTeamsQuery';
import { PageHeader } from '@/components/layout/PageHeader';
import type { TeamMember } from '@/types/teamManagement';
import CompatibilityMatrix from '@/components/team-management/CompatibilityMatrix';
import TopPairsList from '@/components/team-management/TopPairsList';
import ConflictAlertsList from '@/components/team-management/ConflictAlertsList';
import PairDetailModal from '@/components/team-management/PairDetailModal';

export default function TeamCompatibility() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';
  const { data: allMembers = [], isLoading: membersLoading } = useTeamMembers({ companyId });
  const { data: allDepartments = [], isLoading: deptsLoading } = useDepartments(companyId);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedPair, setSelectedPair] = useState<{
    member1Id: string;
    member2Id: string;
  } | null>(null);
  const [pairModalOpen, setPairModalOpen] = useState(false);

  const isLoading = membersLoading || deptsLoading;

  // Filter members by department
  const filteredMembers = useMemo(() => {
    const active = allMembers.filter((m) => m.isActive);
    if (selectedDeptId === 'all') return active;
    return active.filter((m) => m.departmentId === selectedDeptId);
  }, [selectedDeptId, allMembers]);

  // Look up members for pair detail
  const memberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    allMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, [allMembers]);

  const pairMember1 = selectedPair ? memberMap.get(selectedPair.member1Id) ?? null : null;
  const pairMember2 = selectedPair ? memberMap.get(selectedPair.member2Id) ?? null : null;

  const handlePairClick = (member1Id: string, member2Id: string) => {
    setSelectedPair({ member1Id, member2Id });
    setPairModalOpen(true);
  };

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
              title="Compatibilidade entre Membros"
              description="Analise a compatibilidade comportamental entre membros da equipe"
              actions={
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue placeholder="Filtrar por departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os departamentos</SelectItem>
                      {allDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              }
              howItWorks={[
                'A matriz mostra o score de compatibilidade entre todos os membros com perfil mapeado',
                'Clique em uma célula para ver o detalhamento por dimensão comportamental (D1–D5)',
                'As "Melhores Duplas" destacam os pares com maior sinergia na equipe',
                'Os "Alertas de Conflito" identificam pares com compatibilidade abaixo de 30%',
                'Use o filtro de departamento para focar em equipes específicas',
              ]}
            />
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main: Compatibility matrix */}
          <div className="lg:col-span-8">
            <CompatibilityMatrix
              members={filteredMembers}
              onPairClick={handlePairClick}
            />
          </div>

          {/* Sidebar: Top Pairs + Conflict Alerts */}
          <div className="lg:col-span-4 space-y-6">
            <TopPairsList
              members={filteredMembers}
              limit={5}
              onPairClick={handlePairClick}
            />
            <ConflictAlertsList
              members={filteredMembers}
              onPairClick={handlePairClick}
            />
          </div>
        </div>

        {/* Pair detail modal */}
        <PairDetailModal
          member1={pairMember1}
          member2={pairMember2}
          open={pairModalOpen}
          onOpenChange={setPairModalOpen}
        />
      </motion.div>
    </DashboardLayout>
  );
}
