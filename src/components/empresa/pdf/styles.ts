// src/components/empresa/pdf/styles.ts
import { StyleSheet } from '@react-pdf/renderer';

export const empresaColors = {
  primary: '#0F172A',     // navy
  accent: '#06B6D4',      // cyan
  accentDark: '#0E7490',
  text: '#1E293B',
  muted: '#64748B',
  border: '#E2E8F0',
  bgSubtle: '#F1F5F9',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  white: '#FFFFFF',
};

export const empresaStyles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: empresaColors.text,
    backgroundColor: empresaColors.white,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: empresaColors.border,
  },
  headerCompany: {
    fontSize: 9,
    color: empresaColors.muted,
    fontWeight: 'bold',
  },
  headerCandidate: {
    fontSize: 9,
    color: empresaColors.muted,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: empresaColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8,
    color: empresaColors.muted,
  },
  confidential: {
    fontWeight: 'bold',
    color: empresaColors.danger,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: empresaColors.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: empresaColors.accent,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 2,
    marginLeft: 12,
  },
  badge: {
    fontSize: 8,
    backgroundColor: empresaColors.bgSubtle,
    color: empresaColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  scoreBadge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: empresaColors.white,
    backgroundColor: empresaColors.accent,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    width: 80,
  },
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  coverLogo: {
    width: 100,
    height: 100,
    marginBottom: 32,
    objectFit: 'contain',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: empresaColors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 16,
    color: empresaColors.accent,
    marginBottom: 24,
    textAlign: 'center',
  },
  coverCandidateName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: empresaColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 11,
    color: empresaColors.muted,
    marginTop: 16,
  },
  coverConfidential: {
    position: 'absolute',
    bottom: 60,
    fontSize: 12,
    fontWeight: 'bold',
    color: empresaColors.danger,
    letterSpacing: 2,
  },
});

export function getScoreColor(score: number): string {
  if (score >= 80) return empresaColors.success;
  if (score >= 60) return empresaColors.warning;
  if (score >= 40) return '#EA580C';
  return empresaColors.danger;
}
