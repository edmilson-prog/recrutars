/**
 * CVReviewPersonal Component - PRD-038
 * Revisão de dados pessoais extraídos do currículo
 */

import { User } from 'lucide-react';
import { ParsedPersonalData } from '@/types/cvParser';
import { CVReviewSection, CVReviewField } from './CVReviewSection';

interface CVReviewPersonalProps {
  data: ParsedPersonalData;
  onChange: (data: ParsedPersonalData) => void;
}

export function CVReviewPersonal({ data, onChange }: CVReviewPersonalProps) {
  const handleFieldChange = (field: keyof ParsedPersonalData) => (value: string) => {
    onChange({
      ...data,
      [field]: value || null,
    });
  };

  return (
    <CVReviewSection
      title="Dados Pessoais"
      description="Informações básicas de contato"
      confidence={data.confidence}
      icon={<User className="w-5 h-5 text-gray-500" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CVReviewField
          label="Nome completo"
          value={data.name}
          onChange={handleFieldChange('name')}
          placeholder="Seu nome"
          className="md:col-span-2"
        />

        <CVReviewField
          label="E-mail"
          value={data.email}
          onChange={handleFieldChange('email')}
          type="email"
          placeholder="seu@email.com"
        />

        <CVReviewField
          label="Telefone"
          value={data.phone}
          onChange={handleFieldChange('phone')}
          type="tel"
          placeholder="(00) 00000-0000"
        />

        <CVReviewField
          label="Localização"
          value={data.location}
          onChange={handleFieldChange('location')}
          placeholder="Cidade - UF"
        />

        <CVReviewField
          label="LinkedIn"
          value={data.linkedin}
          onChange={handleFieldChange('linkedin')}
          placeholder="linkedin.com/in/seu-perfil"
        />
      </div>
    </CVReviewSection>
  );
}
