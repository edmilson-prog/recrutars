// PRD-023: Estilos compartilhados para templates de PDF

import { StyleSheet } from '@react-pdf/renderer';

// Cores do design system RecrutaRS
export const colors = {
  primary: '#0891b2',      // cyan-600
  primaryDark: '#0e7490',  // cyan-700
  navy: '#1e293b',         // slate-800
  navyLight: '#334155',    // slate-700
  text: '#1f2937',         // gray-800
  textLight: '#6b7280',    // gray-500
  textMuted: '#9ca3af',    // gray-400
  border: '#e5e7eb',       // gray-200
  background: '#f9fafb',   // gray-50
  white: '#ffffff',
};

// Configurações de seções para exportação
export interface PDFSectionConfig {
  personalInfo: boolean;
  summary: boolean;
  technicalSkills: boolean;
  behavioralSkills: boolean;
  experience: boolean;
  education: boolean;
  courses: boolean;
  salary: boolean;
}

// Tipo de template
export type PDFTemplateType = 'classic' | 'modern' | 'minimal';

// Estilos base compartilhados entre templates
export const baseStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    backgroundColor: colors.white,
  },
  // Headers
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: colors.primaryDark,
    marginBottom: 8,
  },
  // Seções
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Textos
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.text,
  },
  textSmall: {
    fontSize: 9,
    color: colors.textLight,
  },
  textMuted: {
    fontSize: 9,
    color: colors.textMuted,
  },
  // Links
  link: {
    fontSize: 9,
    color: colors.primary,
    textDecoration: 'none',
  },
  // Separadores
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 10,
  },
  separatorBold: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginVertical: 10,
  },
  // Layout em linha
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  // Espaçamentos
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  // Bullets
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
  },
});

// Estilos específicos do template clássico
export const classicStyles = StyleSheet.create({
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.navy,
    paddingBottom: 15,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 9,
    color: colors.textLight,
  },
  sectionUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
    marginBottom: 10,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  experienceRole: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.navy,
  },
  experienceCompany: {
    fontSize: 10,
    color: colors.text,
  },
  experiencePeriod: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'right',
  },
  currentBadge: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    marginLeft: 8,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  skillDotFilled: {
    backgroundColor: colors.primary,
  },
  skillDotEmpty: {
    backgroundColor: colors.border,
  },
});

// Estilos específicos do template moderno
export const modernStyles = StyleSheet.create({
  headerBg: {
    backgroundColor: colors.navy,
    marginHorizontal: -30,
    marginTop: -30,
    paddingHorizontal: 30,
    paddingVertical: 20,
    marginBottom: 20,
  },
  headerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 10,
  },
  headerContact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  headerContactItem: {
    fontSize: 9,
    color: '#cbd5e1', // slate-300
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  sidebar: {
    width: '30%',
  },
  mainContent: {
    width: '70%',
  },
  sidebarSection: {
    marginBottom: 20,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 4,
  },
  sidebarTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.navy,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  skillBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skillName: {
    fontSize: 9,
    color: colors.text,
    flex: 1,
  },
  skillLevel: {
    flexDirection: 'row',
    gap: 2,
  },
  skillLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mainSection: {
    marginBottom: 18,
  },
  mainSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primaryDark,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
    marginBottom: 12,
  },
});

// Estilos específicos do template minimalista
export const minimalStyles = StyleSheet.create({
  headerCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nameCenter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  titleCenter: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 12,
  },
  contactCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  contactDivider: {
    color: colors.textMuted,
    marginHorizontal: 8,
  },
  sectionCenter: {
    marginBottom: 20,
  },
  sectionTitleCenter: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  thinSeparator: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginVertical: 15,
  },
  experienceMinimal: {
    marginBottom: 12,
  },
  experienceMinimalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  experienceMinimalRole: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
  },
  experienceMinimalPeriod: {
    fontSize: 10,
    color: colors.textMuted,
  },
  experienceMinimalCompany: {
    fontSize: 10,
    color: colors.textLight,
    marginBottom: 4,
  },
  skillsLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  skillChip: {
    fontSize: 9,
    color: colors.text,
  },
});

// Helper para formatar níveis de habilidade
export function getSkillLevelDots(level: string): boolean[] {
  const levelMap: Record<string, number> = {
    basic: 1,
    beginner: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5,
  };
  const numLevel = levelMap[level] || 3;
  return Array.from({ length: 5 }, (_, i) => i < numLevel);
}

// Helper para formatar período de experiência
export function formatPeriod(startDate: string, endDate?: string, current?: boolean): string {
  const formatDate = (date: string) => {
    const [year, month] = date.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[parseInt(month) - 1]}/${year}`;
  };

  const start = formatDate(startDate);
  if (current) return `${start} - Atual`;
  if (endDate) return `${start} - ${formatDate(endDate)}`;
  return start;
}

// Helper para formatar salário
export function formatSalary(min: number, max: number): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}
