/**
 * Excel Export Hub
 * PRD-054: Export Excel multi-abas
 */

import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog } from '@/utils/auditLog';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import { getFitScoreLabel } from '@/utils/fitScore';
import type { CompanyTest, CompanyTestResult, TestInvitation } from '@/types/companyTest';

interface ExcelExportHubProps {
  test: CompanyTest;
  results: CompanyTestResult[];
  invitations: TestInvitation[];
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export function ExcelExportHub({ test, results, invitations }: ExcelExportHubProps) {
  const { toast } = useToast();

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Tab 1: Resumo
    const resumo = [
      ['Relatório de Teste Comportamental'],
      [''],
      ['Teste', test.name],
      ['Template', test.templateId],
      ['Status', test.status],
      ['Vaga', test.jobTitle || '—'],
      ['Prazo', test.deadline || '—'],
      ['Criado em', new Date(test.createdAt).toLocaleDateString('pt-BR')],
      [''],
      ['Pesos por Dimensão'],
      ...DIMENSIONS.map(d => [DIMENSION_SHORT_NAMES[d], test.weights[d].toFixed(1) + 'x']),
      [''],
      ['Total de Convites', invitations.length],
      ['Concluídos', invitations.filter(i => i.status === 'completed').length],
      ['Resultados', results.length],
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    wsResumo['!cols'] = [{ wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    // Tab 2: Resultados Individuais
    const resHeaders = ['#', 'Candidato', 'Email', 'Arquétipo', ...DIMENSIONS.map(d => DIMENSION_SHORT_NAMES[d]), 'Fit Score', 'Classificação', 'Shortlist'];
    const resData = results.map((r, i) => [
      i + 1,
      r.candidateName,
      r.candidateEmail,
      r.archetype.name,
      ...DIMENSIONS.map(d => r.scores[d]),
      r.fitScore !== undefined ? `${r.fitScore.toFixed(1)}%` : '—',
      r.fitClassification ? getFitScoreLabel(r.fitClassification) : '—',
      r.shortlisted ? 'Sim' : 'Não',
    ]);
    const wsRes = XLSX.utils.aoa_to_sheet([resHeaders, ...resData]);
    wsRes['!cols'] = [{ wch: 4 }, { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, wsRes, 'Resultados');

    // Tab 3: Estatísticas
    const stats: (string | number)[][] = [
      ['Estatísticas Agregadas'],
      [''],
      ['Dimensão', 'Média', 'Mínimo', 'Máximo', 'Desvio Padrão'],
    ];
    DIMENSIONS.forEach(d => {
      const scores = results.map(r => r.scores[d]);
      if (scores.length === 0) return;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
      stats.push([DIMENSION_SHORT_NAMES[d], Math.round(avg), min, max, Math.round(Math.sqrt(variance))]);
    });
    if (results.some(r => r.fitScore !== undefined)) {
      const fitScores = results.filter(r => r.fitScore !== undefined).map(r => r.fitScore!);
      const avgFit = fitScores.reduce((a, b) => a + b, 0) / fitScores.length;
      stats.push([''], ['Fit Score Médio', Math.round(avgFit * 10) / 10]);
    }
    const wsStats = XLSX.utils.aoa_to_sheet(stats);
    wsStats['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estatísticas');

    // Tab 4: Convites
    const invHeaders = ['#', 'Candidato', 'Email', 'Método', 'Status', 'Enviado em', 'Concluído em', 'Expira em'];
    const invData = invitations.map((inv, i) => [
      i + 1,
      inv.candidateName,
      inv.candidateEmail,
      inv.method === 'email' ? 'Email' : inv.method === 'public_link' ? 'Link Público' : 'Interno',
      inv.status,
      new Date(inv.sentAt).toLocaleDateString('pt-BR'),
      inv.completedAt ? new Date(inv.completedAt).toLocaleDateString('pt-BR') : '—',
      new Date(inv.expiresAt).toLocaleDateString('pt-BR'),
    ]);
    const wsInv = XLSX.utils.aoa_to_sheet([invHeaders, ...invData]);
    wsInv['!cols'] = [{ wch: 4 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsInv, 'Convites');

    // Download
    const fileName = `recrutars-teste-${test.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    addAuditLog('excel_downloaded', 'user-comp-1', 'Maria Recrutadora', 'test', test.id, test.name, 'Excel consolidado');
    toast({ title: 'Excel exportado', description: 'Planilha baixada com sucesso.' });
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Exportar Excel ({results.length} resultados, {invitations.length} convites)
    </Button>
  );
}
