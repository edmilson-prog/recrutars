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
import { ArrowLeft, Filter } from 'lucide-react';
import {
  mockTeamMembers,
  mockDepartments,
} from '@/data/teamManagementData';
import type { TeamMember } from '@/types/teamManagement';
import CompatibilityMatrix from '@/components/team-management/CompatibilityMatrix';
import TopPairsList from '@/components/team-management/TopPairsList';
import ConflictAlertsList from '@/components/team-management/ConflictAlertsList';
import PairDetailModal from '@/components/team-management/PairDetailModal';

export default function TeamCompatibility() {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedPair, setSelectedPair] = useState<{
    member1Id: string;
    member2Id: string;
  } | null>(null);
  const [pairModalOpen, setPairModalOpen] = useState(false);

  // Filter members by department
  const filteredMembers = useMemo(() => {
    const active = mockTeamMembers.filter((m) => m.isActive);
    if (selectedDeptId === 'all') return active;
    return active.filter((m) => m.departmentId === selectedDeptId);
  }, [selectedDeptId]);

  // Look up members for pair detail
  const memberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    mockTeamMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, []);

  const pairMember1 = selectedPair ? memberMap.get(selectedPair.member1Id) ?? null : null;
  const pairMember2 = selectedPair ? memberMap.get(selectedPair.member2Id) ?? null : null;

  const handlePairClick = (member1Id: string, member2Id: string) => {
    setSelectedPair({ member1Id, member2Id });
    setPairModalOpen(true);
  };

  return (
    <DashboardLayout userType="company">
      <motion.div {...pageTransition} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link to="/empresa/equipes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                Compatibilidade entre Membros
              </h1>
              <p className="text-muted-foreground">
                Analise a compatibilidade comportamental entre membros da equipe
              </p>
            </div>
          </div>

          {/* Department filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {mockDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
