// src/components/empresa/pdf/sections/Footer.tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';

interface FooterProps {
  companyName: string;
  generatedAt: string;
}

export function Footer({ companyName, generatedAt }: FooterProps) {
  return (
    <View style={empresaStyles.footer} fixed>
      <Text style={empresaStyles.confidential}>DOCUMENTO INTERNO — USO RESTRITO</Text>
      <Text>{companyName}</Text>
      <Text>Gerado em {generatedAt}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
    </View>
  );
}
