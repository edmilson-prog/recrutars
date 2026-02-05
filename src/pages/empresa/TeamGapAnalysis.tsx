/**
 * Team Gap Analysis Page
 * PRD-057: Analise de lacunas comportamentais com radar, cards e recomendacoes
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
import { ArrowLeft, SearchCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers, useDepartments } from '@/hooks/useTeamsQuery';
import { Loader2 } from 'lucide-react';
import { performGapAnalysis } from '@/utils/gapAnalysis';
import GapAnalysisRadar from '@/components/team-management/GapAnalysisRadar';
import GapCardsPanel from '@/components/team-management/GapCardsPanel';
import GapRecommendation from '@/components/team-management/GapRecommendation';
import type { DimensionScores } from '@/types/gaugePro';

export default function TeamGapAnalysis() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';
  const { data: allMembers = [], isLoading: membersLoading } = useTeamMembers({ companyId });
  const { data: allDepartments = [], isLoading: deptsLoading } = useDepartments(companyId);

  const [selectedDept, setSelectedDept] = useState<string>('all');

  const isLoading = membersLoading || deptsLoading;

  const filteredMembers = useMemo(() => {
    const base = selectedDept === 'all'
      ? allMembers
      : allMembers.filter((m) => m.departmentId === selectedDept);
    return base.filter((m) => m.gaugeStatus === 'mapped' && m.gaugeScores);
  }, [selectedDept, allMembers]);

  const gapResult = useMemo(() => {
    const scores: DimensionScores[] = filteredMembers
      .map((m) => m.gaugeScores!)
      .filter(Boolean);
    return performGapAnalysis(
      scores,
      selectedDept === 'all' ? undefined : selectedDept,
    );
  }, [filteredMembers, selectedDept]);

  const deptLabel = useMemo(() => {
    if (selectedDept === 'all') return 'Toda a empresa';
    return allDepartments.find((d) => d.id === selectedDept)?.name ?? 'Departamento';
  }, [selectedDept, allDepartments]);

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
                <SearchCheck className="h-5 w-5 text-cyan-600" />
                <h1 className="text-2xl font-bold">Gap Analysis</h1>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Identifique lacunas comportamentais e de competencias na equipe
                {filteredMembers.length > 0 && (
                  <> &mdash; {filteredMembers.length} membros analisados ({deptLabel})</>
                )}
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

        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum membro mapeado encontrado para o filtro selecionado.
          </div>
        ) : (
          <>
            {/* Radar (left) + Gap Cards (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GapAnalysisRadar teamAverage={gapResult.teamAverage} />
              <div>
                <h2 className="text-lg font-semibold mb-3">Gaps e Excessos</h2>
                <GapCardsPanel
                  gaps={gapResult.gaps}
                  excesses={gapResult.excesses}
                />
              </div>
            </div>

            {/* Recommendation */}
            <GapRecommendation
              idealProfile={gapResult.idealProfile}
              recommendedArchetype={gapResult.recommendedArchetype}
            />
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
