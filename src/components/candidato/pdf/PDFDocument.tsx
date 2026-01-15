// PRD-023: Componente wrapper para seleção de template PDF

import type { Curriculum } from '@/types';
import type { PDFSectionConfig, PDFTemplateType } from './styles';
import { PDFTemplateClassic } from './PDFTemplateClassic';
import { PDFTemplateModern } from './PDFTemplateModern';
import { PDFTemplateMinimal } from './PDFTemplateMinimal';

interface PDFDocumentProps {
  curriculum: Curriculum;
  template: PDFTemplateType;
  sections: PDFSectionConfig;
  includeLinks: boolean;
}

export function PDFDocument({
  curriculum,
  template,
  sections,
  includeLinks,
}: PDFDocumentProps) {
  const props = { curriculum, sections, includeLinks };

  switch (template) {
    case 'classic':
      return <PDFTemplateClassic {...props} />;
    case 'modern':
      return <PDFTemplateModern {...props} />;
    case 'minimal':
      return <PDFTemplateMinimal {...props} />;
    default:
      return <PDFTemplateModern {...props} />;
  }
}

// Re-exportar tipos para uso externo
export type { PDFSectionConfig, PDFTemplateType } from './styles';
