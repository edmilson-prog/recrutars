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
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers, useDepartments } from '@/hooks/useTeamsQuery';
import { PageHeader } from '@/components/layout/PageHeader';
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
        <div className="flex items-start gap-4">
          <Link to="/empresa/equipes" className="shrink-0 mt-0.5">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0 space-y-4">
            <PageHeader
              title="Identificação de Talentos"
              description={`Descubra e mapeie os perfis de talento dentro da sua equipe (${mappedCount} membros mapeados)`}
              actions={
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
              }
              howItWorks={[
                'Visualize os perfis de talento da equipe em cards detalhados',
                'Posicione membros no Nine-Box comportamental (potencial × desempenho)',
                'Identifique estrelas, talentos emergentes e áreas de desenvolvimento',
                'Filtre por departamento para focar em equipes específicas',
              ]}
            />
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
