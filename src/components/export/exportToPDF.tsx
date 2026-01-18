/**
 * Export to PDF
 * PRD-032: Exportar Candidatos (Empresa)
 */

import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Candidate } from '@/types';
import type { ExportConfig, ExportContext, ExportSection, ExportOrder } from '@/types/export';
import { generateFileName, getSourceLabel } from '@/types/export';
import { isAnonymous, getDisplayName } from '@/utils/visibility';

// Cores do design system
const colors = {
  primary: '#0891b2',
  primaryDark: '#0e7490',
  navy: '#1e293b',
  navyLight: '#334155',
  text: '#1f2937',
  textLight: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  background: '#f9fafb',
  white: '#ffffff',
  success: '#16a34a',
  warning: '#ca8a04',
};

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    backgroundColor: colors.white,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 9,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  statItem: {
    fontSize: 9,
    color: colors.textLight,
  },
  candidateCard: {
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  candidateName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.navy,
  },
  candidateTitle: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 6,
  },
  infoItem: {
    fontSize: 9,
    color: colors.textLight,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: colors.text,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  skillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.background,
    borderRadius: 3,
    fontSize: 8,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.navyLight,
    marginTop: 8,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: colors.textMuted,
  },
});

function getMatchColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.textLight;
}

function formatSalary(salary: { min: number; max: number }): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  });
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
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

interface CandidatePDFProps {
  candidates: Candidate[];
  config: ExportConfig;
  context: ExportContext;
  calculateMatch?: (c: Candidate) => number;
}

function CandidatesPDFDocument({
  candidates,
  config,
  context,
  calculateMatch,
}: CandidatePDFProps) {
  const { sections } = config;
  const sortedCandidates = sortCandidates(candidates, config.orderBy, calculateMatch);
  const date = new Date().toLocaleDateString('pt-BR');
  const CANDIDATES_PER_PAGE = 4;

  // Dividir candidatos em páginas
  const pages: Candidate[][] = [];
  for (let i = 0; i < sortedCandidates.length; i += CANDIDATES_PER_PAGE) {
    pages.push(sortedCandidates.slice(i, i + CANDIDATES_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageCandidates, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header - apenas na primeira página */}
          {pageIndex === 0 && (
            <View style={styles.header}>
              <Text style={styles.companyName}>
                {context.companyName || 'RecrutaRS'}
              </Text>
              <Text style={styles.reportTitle}>
                Relatório de Candidatos - {getSourceLabel(context.source)}
                {context.jobTitle && ` • ${context.jobTitle}`}
              </Text>
              <Text style={styles.reportMeta}>
                Gerado em {date} • {candidates.length} candidato
                {candidates.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Lista de Candidatos */}
          {pageCandidates.map((candidate, index) => {
            const candidateIsAnonymous = isAnonymous(candidate);
            const displayName = getDisplayName(candidate);
            const matchScore = calculateMatch ? calculateMatch(candidate) : 0;
            const globalIndex = pageIndex * CANDIDATES_PER_PAGE + index + 1;

            return (
              <View key={candidate.id} style={styles.candidateCard}>
                <View style={styles.candidateHeader}>
                  <View>
                    <Text style={styles.candidateName}>
                      {globalIndex}. {displayName}
                    </Text>
                    {sections.includes('experience') && (
                      <Text style={styles.candidateTitle}>{candidate.title}</Text>
                    )}
                  </View>

                  {sections.includes('match') && (
                    <View
                      style={[
                        styles.matchBadge,
                        { backgroundColor: getMatchColor(matchScore) },
                      ]}
                    >
                      <Text style={styles.matchText}>{matchScore}%</Text>
                    </View>
                  )}
                </View>

                {/* Info básica */}
                {sections.includes('basicInfo') && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Local: </Text>
                      {candidate.location}
                    </Text>
                    {!candidateIsAnonymous && candidate.email && (
                      <Text style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email: </Text>
                        {candidate.email}
                      </Text>
                    )}
                  </View>
                )}

                {/* Experiência */}
                {sections.includes('experience') && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Experiência: </Text>
                      {candidate.experience} ano{candidate.experience !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}

                {/* Formação */}
                {sections.includes('education') && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Formação: </Text>
                      {candidate.education}
                    </Text>
                  </View>
                )}

                {/* DISC */}
                {sections.includes('disc') && candidate.testResult?.result && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoItem}>
                      <Text style={styles.infoLabel}>DISC: </Text>
                      {candidate.testResult.result.profile}
                    </Text>
                  </View>
                )}

                {/* Salário */}
                {sections.includes('salary') && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Pretensão: </Text>
                      {formatSalary(candidate.salary)}
                    </Text>
                  </View>
                )}

                {/* Habilidades */}
                {sections.includes('skills') && candidate.skills.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Habilidades</Text>
                    <View style={styles.skillsRow}>
                      {candidate.skills.slice(0, 5).map((skill, skillIndex) => (
                        <Text key={skillIndex} style={styles.skillBadge}>
                          {skill}
                        </Text>
                      ))}
                      {candidate.skills.length > 5 && (
                        <Text style={styles.skillBadge}>
                          +{candidate.skills.length - 5}
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </View>
            );
          })}

          {/* Footer */}
          <View style={styles.footer}>
            <Text>RecrutaRS • {getSourceLabel(context.source)}</Text>
            <Text>
              Página {pageIndex + 1} de {pages.length}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}

export async function exportToPDF(
  candidates: Candidate[],
  config: ExportConfig,
  context: ExportContext,
  calculateMatch?: (c: Candidate) => number
): Promise<void> {
  const doc = (
    <CandidatesPDFDocument
      candidates={candidates}
      config={config}
      context={context}
      calculateMatch={calculateMatch}
    />
  );

  const blob = await pdf(doc).toBlob();

  // Gerar nome do arquivo
  const fileName = generateFileName(context.source, 'pdf', context.jobTitle);

  // Criar link e baixar
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
