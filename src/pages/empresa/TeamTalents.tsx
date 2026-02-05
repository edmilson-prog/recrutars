/**
 * Team Talents Page
 * PRD-057: Identificacao de Talentos e Nine-Box Comportamental
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers, useDepartments } from '@/hooks/useTeamsQuery';
import { Loader2 } from 'lucide-react';
import TalentProfileCards from '@/components/team-management/TalentProfileCards';
import NineBoxChart from '@/components/team-management/NineBoxChart';

export default function TeamTalents() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';
  const { data: allMembers = [], isLoading: membersLoading } = useTeamMembers({ companyId });
  const { data: allDepartments = [], isLoading: deptsLoading } = useDepartments(companyId);

  const [selectedDept, setSelectedDept] = useState<string>('all');

  const isLoading = membersLoading || deptsLoading;

  const filteredMembers = useMemo(() => {
    if (selectedDept === 'all') return allMembers;
    return allMembers.filter((m) => m.departmentId === selectedDept);
  }, [selectedDept, allMembers]);

  const mappedCount = filteredMembers.filter(
    (m) => m.gaugeStatus === 'mapped' && m.gaugeScores,
  ).length;

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Link to="/empresa/equipes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-600" />
                <h1 className="text-2xl font-bold">Identificacao de Talentos</h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Descubra e mapeie os perfis de talento dentro da sua equipe ({mappedCount} membros mapeados)
              </p>
            </div>
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-56">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {allDepartments
                  .filter((d) => d.isActive)
                  .map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Talent Profile Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Perfis de Talento</h2>
          <TalentProfileCards members={filteredMembers} />
        </div>

        {/* Nine-Box Chart */}
        <NineBoxChart members={filteredMembers} />
      </motion.div>
    </DashboardLayout>
  );
}
