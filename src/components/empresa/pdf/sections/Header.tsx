// src/components/empresa/pdf/sections/Header.tsx
import { View, Text, Image } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';

interface HeaderProps {
  companyName: string;
  companyLogo?: string | null;
  candidateName?: string;
}

export function Header({ companyName, companyLogo, candidateName }: HeaderProps) {
  return (
    <View style={empresaStyles.header} fixed>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {companyLogo ? (
          <Image src={companyLogo} style={{ width: 24, height: 24, objectFit: 'contain' }} />
        ) : null}
        <Text style={empresaStyles.headerCompany}>{companyName}</Text>
      </View>
      {candidateName ? (
        <Text style={empresaStyles.headerCandidate}>{candidateName}</Text>
      ) : null}
    </View>
  );
}
