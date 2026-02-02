/**
 * Team Reports Page
 * PRD-057: Pagina de relatorios PDF para gestao de equipes.
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Download, Users, TrendingUp, Heart, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { EvolutionPDFReport } from '@/components/team-management/pdf/EvolutionPDFReport';
import { CulturePDFReport } from '@/components/team-management/pdf/CulturePDFReport';
import {
  mockTeamMembers,
  mockDepartments,
  mockPositions,
  mockTestHistory,
  mockEvolutionAnnotations,
  mockCultureSnapshots,
} from '@/data/teamManagementData';
import { useToast } from '@/hooks/use-toast';

/** Download a @react-pdf/renderer document as a PDF file. */
async function downloadPDF(doc: React.ReactElement, filename: string) {
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Members that have at least one test history entry. */
const mappedMembers = mockTeamMembers.filter((m) => m.gaugeStatus === 'mapped');

/** Latest culture snapshot for current DNA scores and manifesto. */
const latestSnapshot = [...mockCultureSnapshots].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
)[0];

export default function TeamReports() {
  const { toast } = useToast();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [generatingEvolution, setGeneratingEvolution] = useState(false);
  const [generatingCulture, setGeneratingCulture] = useState(false);

  const handleGenerateEvolutionPDF = async () => {
    if (!selectedMemberId) {
      toast({ title: 'Selecione um colaborador', variant: 'destructive' });
      return;
    }

    setGeneratingEvolution(true);

    try {
      const member = mockTeamMembers.find((m) => m.id === selectedMemberId)!;
      const dept = mockDepartments.find((d) => d.id === member.departmentId);
      const position = mockPositions.find((p) => p.id === member.positionId);
      const history = mockTestHistory
        .filter((h) => h.memberId === member.id)
        .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
      const annotations = mockEvolutionAnnotations.filter((a) => a.memberId === member.id);

      const doc = (
        <EvolutionPDFReport
          member={{
            name: member.name,
            department: dept?.name || 'N/A',
            position: position?.title || 'N/A',
          }}
          history={history}
          annotations={annotations}
        />
      );

      const safeName = member.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();

      await downloadPDF(doc, `evolucao-${safeName}.pdf`);
      toast({ title: 'PDF gerado com sucesso', description: `Relatorio de evolucao de ${member.name}` });
    } catch {
      toast({ title: 'Erro ao gerar PDF', variant: 'destructive' });
    } finally {
      setGeneratingEvolution(false);
    }
  };

  const handleGenerateCulturePDF = async () => {
    setGeneratingCulture(true);

    try {
      const doc = (
        <CulturePDFReport
          companyName="Empresa Demo"
          dnaScores={latestSnapshot.dnaScores}
          manifesto={latestSnapshot.manifesto || ''}
          snapshots={mockCultureSnapshots.map((s) => ({
            date: s.date,
            dnaScores: s.dnaScores,
            totalMembers: s.totalMembers,
            mappedMembers: s.mappedMembers,
          }))}
          totalMembers={latestSnapshot.totalMembers}
          mappedMembers={latestSnapshot.mappedMembers}
        />
      );

      await downloadPDF(doc, 'cultura-organizacional.pdf');
      toast({ title: 'PDF gerado com sucesso', description: 'Relatorio de cultura organizacional' });
    } catch {
      toast({ title: 'Erro ao gerar PDF', variant: 'destructive' });
    } finally {
      setGeneratingCulture(false);
    }
  };

  return (
    <DashboardLayout userType="company">
      <motion.div {...pageTransition} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/empresa/equipes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Relatorios de Equipe</h1>
            <p className="text-muted-foreground">
              Gere e exporte relatorios detalhados sobre sua equipe
            </p>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Evolution per Member */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Evolucao por Colaborador</CardTitle>
                  <CardDescription>
                    Historico de testes, analise de evolucao e anotacoes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
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
              <Button
                className="w-full"
                onClick={handleGenerateEvolutionPDF}
                disabled={!selectedMemberId || generatingEvolution}
              >
                <Download className="h-4 w-4 mr-2" />
                {generatingEvolution ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Organizational Culture */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950">
                  <Heart className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Cultura Organizacional</CardTitle>
                  <CardDescription>
                    DNA cultural, manifesto e evolucao da cultura
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gera um relatorio completo com o DNA cultural atual, manifesto, evolucao historica e
                cobertura de mapeamento.
              </p>
              <Button
                className="w-full"
                onClick={handleGenerateCulturePDF}
                disabled={generatingCulture}
              >
                <Download className="h-4 w-4 mr-2" />
                {generatingCulture ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Team Overview (Placeholder) */}
          <Card className="opacity-75">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Visao Geral da Equipe</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Em breve
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Relatorio consolidado com KPIs, distribuicao de arquetipos e alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Um panorama completo da sua equipe incluindo metricas de mapeamento, distribuicao de
                perfis comportamentais, alertas ativos e progresso dos planos de desenvolvimento.
              </p>
              <Button className="w-full mt-4" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Em breve
              </Button>
            </CardContent>
          </Card>

          {/* Card 4: Compatibility (Placeholder) */}
          <Card className="opacity-75">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950">
                  <BarChart3 className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Compatibilidade</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Em breve
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Relatorio de compatibilidade entre pares e equipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Exporta a matriz de compatibilidade com os melhores pares, alertas de conflito e
                recomendacoes para formacao de times equilibrados.
              </p>
              <Button className="w-full mt-4" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
