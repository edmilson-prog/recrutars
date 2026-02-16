/**
 * MemberProfile
 * PRD-055: Perfil detalhado de um colaborador com dados Gauge-Pro.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pencil,
  RefreshCw,
  TrendingUp,
  LineChart,
  Calendar,
  Mail,
  Building2,
  Briefcase,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import GaugeStatusBadge from './GaugeStatusBadge';
import { GaugeProRadarChart } from '@/components/corporate-tests/GaugeProRadarChart';
import { DimensionBarsGaugePro } from '@/components/corporate-tests/DimensionBarsGaugePro';
import { PracticalAnalysisCard } from '@/components/aiAnalysis/PracticalAnalysisCard';
import { GaugeProResponsesCard } from '@/components/gaugePro/GaugeProResponsesCard';
import type { TeamMember, Department, Position } from '@/types/teamManagement';
import type { DimensionScores, GaugeProAssessment, GaugeProResult } from '@/types/gaugePro';

interface MemberProfileProps {
  member: TeamMember;
  department?: Department;
  position?: Position;
  testHistory?: Array<{
    id: string;
    scores: DimensionScores;
    archetype: string;
    completedAt: string;
  }>;
  candidateId?: string;
  gaugeProAssessment?: GaugeProAssessment;
  gaugeProResult?: GaugeProResult;
  onEdit: () => void;
  onScheduleRetest: () => void;
  onViewDevelopment: () => void;
  onViewEvolution: () => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function MemberProfile({
  member,
  department,
  position,
  testHistory = [],
  candidateId,
  gaugeProAssessment,
  gaugeProResult,
  onEdit,
  onScheduleRetest,
  onViewDevelopment,
  onViewEvolution,
}: MemberProfileProps) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isMapped = member.gaugeStatus === 'mapped' && member.gaugeScores;

  return (
    <div className="space-y-6">
      {/* ── Section 1: Header ──────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 shrink-0 mx-auto sm:mx-0">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold">{member.name}</h2>
                <GaugeStatusBadge status={member.gaugeStatus} />
                {!member.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inativo
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {member.email}
                </span>
                {department && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {department.name}
                  </span>
                )}
                {position && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {position.title}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Admissão: {formatDate(member.hireDate)}
                </span>
              </div>

              {member.archetype && (
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                  <Brain className="h-3 w-3 mr-1" />
                  {member.archetype}
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={onScheduleRetest}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Agendar Reteste
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Gauge-Pro Results ───────────────────────────────── */}
      {isMapped && member.gaugeScores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-cyan-600" />
              Resultados Gauge-Pro
              {member.archetype && (
                <Badge variant="secondary" className="ml-auto bg-cyan-100 text-cyan-800 text-xs">
                  {member.archetype}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Radar Chart */}
              <div className="flex items-center justify-center">
                <GaugeProRadarChart
                  scores={member.gaugeScores}
                  candidateName={member.name}
                  size="md"
                />
              </div>

              {/* Dimension Bars */}
              <div className="flex flex-col justify-center">
                <DimensionBarsGaugePro scores={member.gaugeScores} />
              </div>
            </div>

            {member.lastTestDate && (
              <p className="text-xs text-muted-foreground mt-4 text-right">
                Último teste: {formatDate(member.lastTestDate)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Section 3: AI Analysis ──────────────────────────────────────── */}
      {candidateId && isMapped && (
        <PracticalAnalysisCard
          candidateId={candidateId}
          candidateName={member.name}
        />
      )}

      {/* ── Section 4: Quick Actions ────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
          onClick={onViewDevelopment}
        >
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Plano de Desenvolvimento</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Objetivos, metas e acompanhamento de crescimento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
          onClick={onViewEvolution}
        >
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Linha do Tempo de Evolução</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Histórico de testes, anotações e marcos profissionais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 5: Test Responses ────────────────────────────────── */}
      {gaugeProAssessment && gaugeProResult && gaugeProAssessment.phase === 'completed' && (
        <GaugeProResponsesCard
          assessment={gaugeProAssessment}
          result={gaugeProResult}
        />
      )}

      {/* ── Section 6: Test History ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Testes</CardTitle>
        </CardHeader>
        <CardContent>
          {testHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Brain className="h-10 w-10 mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium">Nenhum teste realizado</p>
              <p className="text-xs mt-1">
                O colaborador ainda não completou nenhuma avaliação Gauge-Pro.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Arquétipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {formatDate(entry.completedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {entry.archetype}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
