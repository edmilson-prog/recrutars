/**
 * Export to Excel
 * PRD-032: Exportar Candidatos (Empresa)
 */

import * as XLSX from 'xlsx';
import type { Candidate } from '@/types';
import type { ExportConfig, ExportContext, ExportSection, ExportOrder } from '@/types/export';
import { generateFileName } from '@/types/export';
import { isAnonymous, getDisplayName } from '@/utils/visibility';

interface ExcelColumn {
  header: string;
  key: string;
  width: number;
}

function getColumnsForSections(sections: ExportSection[]): ExcelColumn[] {
  const columns: ExcelColumn[] = [];

  // Sempre incluir número da linha
  columns.push({ header: '#', key: 'index', width: 5 });

  if (sections.includes('basicInfo')) {
    columns.push({ header: 'Nome', key: 'name', width: 25 });
    columns.push({ header: 'Localização', key: 'location', width: 20 });
    columns.push({ header: 'Email', key: 'email', width: 30 });
    columns.push({ header: 'Telefone', key: 'phone', width: 15 });
  }

  if (sections.includes('experience')) {
    columns.push({ header: 'Cargo Atual', key: 'title', width: 25 });
    columns.push({ header: 'Anos de Exp.', key: 'experience', width: 12 });
  }

  if (sections.includes('education')) {
    columns.push({ header: 'Formação', key: 'education', width: 30 });
  }

  if (sections.includes('skills')) {
    columns.push({ header: 'Habilidades', key: 'skills', width: 40 });
  }

  if (sections.includes('disc')) {
    columns.push({ header: 'Perfil Comportamental', key: 'behavioralProfile', width: 20 });
  }

  if (sections.includes('match')) {
    columns.push({ header: 'Match', key: 'match', width: 10 });
  }

  if (sections.includes('salary')) {
    columns.push({ header: 'Pretensão Salarial', key: 'salary', width: 25 });
  }

  return columns;
}

function sortCandidates(
  candidates: Candidate[],
  orderBy: ExportOrder,
  calculateMatch?: (c: Candidate) => number
): Candidate[] {
  const sorted = [...candidates];

  switch (orderBy) {
    case 'match_desc':
      return sorted.sort((a, b) => {
        const matchA = calculateMatch ? calculateMatch(a) : 0;
        const matchB = calculateMatch ? calculateMatch(b) : 0;
        return matchB - matchA;
      });
    case 'match_asc':
      return sorted.sort((a, b) => {
        const matchA = calculateMatch ? calculateMatch(a) : 0;
        const matchB = calculateMatch ? calculateMatch(b) : 0;
        return matchA - matchB;
      });
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'experience_desc':
      return sorted.sort((a, b) => b.experience - a.experience);
    case 'recent':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default:
      return sorted;
  }
}

function formatSalary(salary: { min: number; max: number }): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  });
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
}

function candidateToRow(
  candidate: Candidate,
  index: number,
  sections: ExportSection[],
  calculateMatch?: (c: Candidate) => number
): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  const candidateIsAnonymous = isAnonymous(candidate);

  row['index'] = index + 1;

  if (sections.includes('basicInfo')) {
    row['name'] = getDisplayName(candidate);
    row['location'] = candidate.location ?? '-';
    row['email'] = candidateIsAnonymous ? '-' : (candidate.email ?? '-');
    row['phone'] = candidateIsAnonymous ? '-' : candidate.phone || '-';
  }

  if (sections.includes('experience')) {
    row['title'] = candidate.title;
    row['experience'] = candidate.experience;
  }

  if (sections.includes('education')) {
    row['education'] = candidate.education;
  }

  if (sections.includes('skills')) {
    row['skills'] = candidate.skills.slice(0, 5).join(', ');
  }

  if (sections.includes('disc')) {
    row['behavioralProfile'] = candidate.testResult?.result?.profile || 'Não avaliado';
  }

  if (sections.includes('match')) {
    const matchValue = calculateMatch ? calculateMatch(candidate) : 0;
    row['match'] = `${matchValue}%`;
  }

  if (sections.includes('salary')) {
    row['salary'] = formatSalary(candidate.salary);
  }

  return row;
}

export async function exportToExcel(
  candidates: Candidate[],
  config: ExportConfig,
  context: ExportContext,
  calculateMatch?: (c: Candidate) => number
): Promise<void> {
  // Ordenar candidatos
  const sortedCandidates = sortCandidates(candidates, config.orderBy, calculateMatch);

  // Obter colunas baseadas nas seções
  const columns = getColumnsForSections(config.sections);

  // Converter candidatos para linhas
  const rows = sortedCandidates.map((candidate, index) =>
    candidateToRow(candidate, index, config.sections, calculateMatch)
  );

  // Criar dados para a planilha
  const headers = columns.map((col) => col.header);
  const data = rows.map((row) => columns.map((col) => row[col.key] ?? ''));

  // Criar worksheet
  const worksheet = XLSX.utils.aoa_to_array([headers, ...data]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Configurar largura das colunas
  ws['!cols'] = columns.map((col) => ({ wch: col.width }));

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ws, 'Candidatos');

  // Gerar nome do arquivo
  const fileName = generateFileName(context.source, 'xlsx', context.jobTitle);

  // Baixar arquivo
  XLSX.writeFile(workbook, fileName);
}
