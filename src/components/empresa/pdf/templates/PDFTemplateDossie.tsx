// src/components/empresa/pdf/templates/PDFTemplateDossie.tsx
import { Page } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData, PDFEmpresaSectionConfig } from '../types';
import { Header } from '../sections/Header';
import { Footer } from '../sections/Footer';
import { CoverPage } from '../sections/CoverPage';
import { ExecutiveSummary } from '../sections/ExecutiveSummary';
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

interface Props {
  data: PDFEmpresaData;
  sections: PDFEmpresaSectionConfig;
  generatedAt: string;
}

export function PDFTemplateDossie({ data, sections, generatedAt }: Props) {
  const c = data.curriculum;
  return (
    <>
      <CoverPage data={data} generatedAt={generatedAt} />
      <Page size="A4" style={empresaStyles.page}>
        <Header
          companyName={data.company.name}
          companyLogo={data.company.logoUrl}
          candidateName={data.candidate.name}
        />
        <ExecutiveSummary data={data} />
        {sections.matchScore && <MatchScoreSection data={data} />}
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
        {sections.gaugeProAnalysis && <GaugeProAnalysisSection data={data} />}
        {sections.experience && (
          <ExperienceSection experiences={c?.experiences} />
        )}
        {sections.education && <EducationSection educations={c?.education} />}
        {sections.courses && <CoursesSection courses={c?.courses} />}
        {sections.salary && <SalarySection salary={c?.salary} />}
        {sections.languages && <LanguagesSection data={data} />}
        {sections.availability && <AvailabilitySection data={data} />}
        {sections.highlights && <HighlightsSection data={data} />}
        {sections.favoriteEvaluation && <FavoriteEvaluationSection data={data} />}
        {sections.practicalAnalysis && <PracticalAnalysisSection data={data} />}
        {sections.interviews && <InterviewsSection data={data} />}
        {sections.applicationHistory && <ApplicationHistorySection data={data} />}
        {sections.internalNotes && <InternalNotesSection data={data} />}
        {sections.activityLog && <ActivityLogSection data={data} />}
        <Footer companyName={data.company.name} generatedAt={generatedAt} />
      </Page>
    </>
  );
}
