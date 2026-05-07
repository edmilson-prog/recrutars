// src/components/empresa/pdf/templates/PDFTemplateBaseEmpresa.tsx
//
// NOTE: The candidato templates (PDFTemplateClassic/Modern/Minimal) each return
// a full <Document>, so we cannot nest them inside our empresa <Document>.
// Strategy: render curriculum sections inline using empresa's CurriculumSections
// in a single empresa-styled Page. The `template` prop is preserved for future
// per-template styling tweaks but currently shares the empresa look-and-feel.
import { Page } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import { Header } from '../sections/Header';
import { Footer } from '../sections/Footer';
import {
  PersonalInfoSection,
  SummarySection,
  TechnicalSkillsSection,
  BehavioralSkillsSection,
  ExperienceSection,
  EducationSection,
  CoursesSection,
  SalarySection,
} from '../sections/CurriculumSections';
import { MatchScoreSection } from '../sections/MatchScoreSection';
import { GaugeProAnalysisSection } from '../sections/GaugeProAnalysisSection';
import { InternalNotesSection } from '../sections/InternalNotesSection';
import { ApplicationHistorySection } from '../sections/ApplicationHistorySection';
import { PracticalAnalysisSection } from '../sections/PracticalAnalysisSection';
import { InterviewsSection } from '../sections/InterviewsSection';
import { HighlightsSection } from '../sections/HighlightsSection';
import { FavoriteEvaluationSection } from '../sections/FavoriteEvaluationSection';
import { LanguagesSection } from '../sections/LanguagesSection';
import { AvailabilitySection } from '../sections/AvailabilitySection';
import { ActivityLogSection } from '../sections/ActivityLogSection';
import type {
  PDFEmpresaData,
  PDFEmpresaSectionConfig,
  PDFEmpresaTemplateType,
} from '../types';

interface Props {
  template: Exclude<PDFEmpresaTemplateType, 'dossie'>;
  data: PDFEmpresaData;
  sections: PDFEmpresaSectionConfig;
  includeLinks: boolean;
  generatedAt: string;
}

export function PDFTemplateBaseEmpresa({
  data,
  sections,
  generatedAt,
}: Props) {
  const c = data.curriculum;
  return (
    <Page size="A4" style={empresaStyles.page}>
      <Header
        companyName={data.company.name}
        companyLogo={data.company.logoUrl}
        candidateName={data.candidate.name}
      />
      {sections.personalInfo && (
        <PersonalInfoSection curriculum={c} candidate={data.candidate} />
      )}
      {sections.summary && c?.about && <SummarySection summary={c.about} />}
      {sections.technicalSkills && (
        <TechnicalSkillsSection skills={c?.skills} />
      )}
      {sections.behavioralSkills && (
        <BehavioralSkillsSection skills={c?.skills} />
      )}
      {sections.experience && (
        <ExperienceSection experiences={c?.experiences} />
      )}
      {sections.education && <EducationSection educations={c?.education} />}
      {sections.courses && <CoursesSection courses={c?.courses} />}
      {sections.salary && <SalarySection salary={c?.salary} />}
      {sections.matchScore && <MatchScoreSection data={data} />}
      {sections.gaugeProAnalysis && <GaugeProAnalysisSection data={data} />}
      {sections.languages && <LanguagesSection data={data} />}
      {sections.availability && <AvailabilitySection data={data} />}
      {sections.highlights && <HighlightsSection data={data} />}
      {sections.favoriteEvaluation && <FavoriteEvaluationSection data={data} />}
      {sections.practicalAnalysis && <PracticalAnalysisSection data={data} />}
      {sections.interviews && <InterviewsSection data={data} />}
      {sections.applicationHistory && <ApplicationHistorySection data={data} />}
      {sections.notesCandidate && <InternalNotesSection data={data} kind="candidate" />}
      {sections.notesApplication && <InternalNotesSection data={data} kind="application" />}
      {sections.activityLog && <ActivityLogSection data={data} />}
      <Footer companyName={data.company.name} generatedAt={generatedAt} />
    </Page>
  );
}
