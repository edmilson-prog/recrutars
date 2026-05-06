// src/components/empresa/pdf/PDFEmpresaDocument.tsx
import { Document } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDFTemplateDossie } from './templates/PDFTemplateDossie';
import { PDFTemplateBaseEmpresa } from './templates/PDFTemplateBaseEmpresa';
import type {
  PDFEmpresaData,
  PDFEmpresaSectionConfig,
  PDFEmpresaTemplateType,
} from './types';

interface PDFEmpresaDocumentProps {
  data: PDFEmpresaData;
  template: PDFEmpresaTemplateType;
  sections: PDFEmpresaSectionConfig;
  includeLinks?: boolean;
}

export function PDFEmpresaDocument({
  data,
  template,
  sections,
  includeLinks = false,
}: PDFEmpresaDocumentProps) {
  const generatedAt = format(new Date(), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  return (
    <Document
      title={`Dossiê ${data.candidate.name ?? 'Candidato'}`}
      author={data.company.name}
      subject="Documento Interno - Uso Restrito"
    >
      {template === 'dossie' ? (
        <PDFTemplateDossie
          data={data}
          sections={sections}
          generatedAt={generatedAt}
        />
      ) : (
        <PDFTemplateBaseEmpresa
          template={template}
          data={data}
          sections={sections}
          includeLinks={includeLinks}
          generatedAt={generatedAt}
        />
      )}
    </Document>
  );
}
