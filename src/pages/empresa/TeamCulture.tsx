/**
 * Team Culture Page
 * PRD-057: Cultura Organizacional — DNA, Manifesto, Evolucao e Fit Cultural
 */

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, FlaskConical, Building2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers, usePositions } from '@/hooks/useTeamsQuery';
import { mockCultureSnapshots } from '@/data/teamManagementData';
import { PageHeader } from '@/components/layout/PageHeader';
import { calculateCompanyDNA, generateManifesto, calculateCulturalFit } from '@/utils/culturalFit';
import CultureDNARadar from '@/components/team-management/CultureDNARadar';
import CultureManifesto from '@/components/team-management/CultureManifesto';
import CultureEvolution from '@/components/team-management/CultureEvolution';
import CulturalFitBadge from '@/components/team-management/CulturalFitBadge';
import type { HierarchyLevel } from '@/types/teamManagement';
import type { DimensionScores } from '@/types/gaugePro';

export default function TeamCulture() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';
  const { data: allMembers = [], isLoading: membersLoading } = useTeamMembers({ companyId });
  const { data: allPositions = [], isLoading: positionsLoading } = usePositions('all');

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');

  const isLoading = membersLoading || positionsLoading;

  // Calculate company DNA from all mapped members
  const dnaInput = useMemo(() => {
    return allMembers
      .filter((m) => m.gaugeStatus === 'mapped' && m.gaugeScores)
      .map((m) => {
        const pos = allPositions.find((p) => p.id === m.positionId);
        return {
          scores: m.gaugeScores as DimensionScores,
          level: (pos?.level ?? 'operational') as HierarchyLevel,
        };
      });
  }, [allMembers, allPositions]);

  const companyDNA = useMemo(() => calculateCompanyDNA(dnaInput), [dnaInput]);
  const manifesto = useMemo(() => generateManifesto(companyDNA), [companyDNA]);

  // Mapped members for the fit simulator
  const mappedMembers = useMemo(
    () => allMembers.filter((m) => m.gaugeStatus === 'mapped' && m.gaugeScores),
    [allMembers],
  );

  // Calculate fit for selected "test candidate"
  const fitResult = useMemo(() => {
    if (!selectedCandidateId) return null;
    const member = mappedMembers.find((m) => m.id === selectedCandidateId);
    if (!member || !member.gaugeScores) return null;
    return calculateCulturalFit(member.gaugeScores, companyDNA);
  }, [selectedCandidateId, companyDNA, mappedMembers]);

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
              title="Cultura Organizacional"
              description="Analise e acompanhe o DNA cultural da sua equipe"
              howItWorks={[
                'O DNA cultural é calculado a partir dos perfis comportamentais mapeados',
                'O manifesto cultural é gerado automaticamente com base no DNA da equipe',
                'Acompanhe a evolução cultural ao longo do tempo no gráfico de snapshots',
                'Simule o fit cultural de membros com o perfil da empresa',
              ]}
            />
          </div>
        </div>

        {/* DNA Radar + Manifesto — top row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CultureDNARadar
            dnaScores={companyDNA}
            companyName="Empresa RecrutaRS"
          />
          <CultureManifesto
            manifesto={manifesto}
            dnaScores={companyDNA}
          />
        </div>

        {/* Culture Evolution */}
        <CultureEvolution snapshots={mockCultureSnapshots} />

        {/* Cultural Fit Simulator */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-cyan-600" />
              <div>
                <CardTitle className="text-base">Simulador de Fit Cultural</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecione um colaborador para verificar o alinhamento com o DNA cultural
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full sm:w-72">
                <Select
                  value={selectedCandidateId}
                  onValueChange={setSelectedCandidateId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {mappedMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {fitResult && (
                <div className="flex items-center gap-4">
                  <CulturalFitBadge
                    fitScore={fitResult.fitScore}
                    fitLevel={fitResult.fitLevel}
                    size="md"
                  />

                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Gaps por dimensao:</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {(['D1', 'D2', 'D3', 'D4', 'D5'] as const).map((dim) => {
                        const gap = fitResult.dimensionGaps[dim];
                        return (
                          <span key={dim} className="tabular-nums">
                            {dim}: <span className={gap > 0 ? 'text-green-600' : gap < 0 ? 'text-red-600' : ''}>{gap > 0 ? '+' : ''}{Math.round(gap * 10) / 10}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {!fitResult && selectedCandidateId === '' && (
                <p className="text-sm text-muted-foreground italic">
                  Selecione um colaborador para simular o fit cultural
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
