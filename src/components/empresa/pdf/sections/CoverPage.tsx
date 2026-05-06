// src/components/empresa/pdf/sections/CoverPage.tsx
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { Footer } from './Footer';

interface CoverPageProps {
  data: PDFEmpresaData;
  generatedAt: string;
}

export function CoverPage({ data, generatedAt }: CoverPageProps) {
  return (
    <Page size="A4" style={empresaStyles.page}>
      <View style={empresaStyles.coverContainer}>
        {data.company.logoUrl ? (
          <Image src={data.company.logoUrl} style={empresaStyles.coverLogo} />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: empresaColors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <Text style={{ color: empresaColors.white, fontSize: 36, fontWeight: 'bold' }}>
              {data.company.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={empresaStyles.coverTitle}>Dossiê do Candidato</Text>
        <Text style={empresaStyles.coverSubtitle}>{data.company.name}</Text>
        <Text style={empresaStyles.coverCandidateName}>
          {data.candidate.name ?? 'Candidato'}
        </Text>
        {data.application?.jobTitle ? (
          <Text style={{ fontSize: 13, color: empresaColors.muted, marginTop: 4 }}>
            Vaga: {data.application.jobTitle}
          </Text>
        ) : null}
        <Text style={empresaStyles.coverDate}>Gerado em {generatedAt}</Text>
      </View>
      <Text style={empresaStyles.coverConfidential}>CONFIDENCIAL</Text>
      <Footer companyName={data.company.name} generatedAt={generatedAt} />
    </Page>
  );
}
