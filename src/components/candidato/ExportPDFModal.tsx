// PRD-023: Modal de Exportação de PDF do Currículo

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  FileDown,
  FileText,
  Layout,
  Loader2,
  Columns,
  AlignCenter,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Curriculum } from '@/types';
import { PDFDocument, type PDFSectionConfig, type PDFTemplateType } from './pdf';

interface ExportPDFModalProps {
  curriculum: Curriculum;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templateOptions: {
  value: PDFTemplateType;
  label: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    value: 'classic',
    label: 'Clássico',
    description: 'Layout tradicional e linear',
    icon: FileText,
  },
  {
    value: 'modern',
    label: 'Moderno',
    description: 'Duas colunas com header destacado',
    icon: Columns,
  },
  {
    value: 'minimal',
    label: 'Minimalista',
    description: 'Limpo e centralizado',
    icon: AlignCenter,
  },
];

const sectionOptions: {
  key: keyof PDFSectionConfig;
  label: string;
  disabled?: boolean;
}[] = [
  { key: 'personalInfo', label: 'Informações pessoais', disabled: true },
  { key: 'summary', label: 'Resumo profissional' },
  { key: 'technicalSkills', label: 'Habilidades técnicas' },
  { key: 'behavioralSkills', label: 'Habilidades comportamentais' },
  { key: 'experience', label: 'Experiência profissional' },
  { key: 'education', label: 'Formação acadêmica' },
  { key: 'courses', label: 'Cursos e certificações' },
  { key: 'salary', label: 'Pretensão salarial' },
];

export function ExportPDFModal({
  curriculum,
  open,
  onOpenChange,
}: ExportPDFModalProps) {
  const [template, setTemplate] = useState<PDFTemplateType>('modern');
  const [sections, setSections] = useState<PDFSectionConfig>({
    personalInfo: true,
    summary: true,
    technicalSkills: true,
    behavioralSkills: true,
    experience: true,
    education: true,
    courses: true,
    salary: false,
  });
  const [includeLinks, setIncludeLinks] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleSectionToggle = (key: keyof PDFSectionConfig) => {
    setSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDownload = async () => {
    setGenerating(true);

    try {
      const doc = (
        <PDFDocument
          curriculum={curriculum}
          template={template}
          sections={sections}
          includeLinks={includeLinks}
        />
      );

      const blob = await pdf(doc).toBlob();

      // Nome do arquivo: Curriculo_NomeSobrenome_DDMMAAAA.pdf
      const nameParts = (curriculum.title || 'Candidato').split(' ');
      const firstName = nameParts[0] || 'Candidato';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const nameSuffix = lastName ? `${firstName}${lastName}` : firstName;
      const date = new Date();
      const dateStr = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
      const filename = `Curriculo_${nameSuffix}_${dateStr}.pdf`;

      // Criar link e baixar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF gerado com sucesso!', {
        description: `Arquivo ${filename} baixado.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-cyan-600" />
            Exportar Currículo em PDF
          </DialogTitle>
          <DialogDescription>
            Escolha o template e as seções para incluir no PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seleção de Template */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Escolha o template:</Label>
            <RadioGroup
              value={template}
              onValueChange={(value) => setTemplate(value as PDFTemplateType)}
              className="grid grid-cols-3 gap-3"
            >
              {templateOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={`template-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`template-${option.value}`}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-cyan-600 peer-data-[state=checked]:bg-cyan-50 [&:has([data-state=checked])]:border-cyan-600 cursor-pointer transition-colors"
                    >
                      <Icon className="h-6 w-6 mb-2 text-cyan-600" />
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {option.description}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Seleção de Seções */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Seções a incluir:</Label>
            <div className="grid grid-cols-2 gap-3">
              {sectionOptions.map((option) => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`section-${option.key}`}
                    checked={sections[option.key]}
                    onCheckedChange={() => handleSectionToggle(option.key)}
                    disabled={option.disabled}
                  />
                  <Label
                    htmlFor={`section-${option.key}`}
                    className={`text-sm cursor-pointer ${
                      option.disabled ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Opções Adicionais */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opções:</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-links"
                checked={includeLinks}
                onCheckedChange={(checked) => setIncludeLinks(checked as boolean)}
              />
              <Label htmlFor="include-links" className="text-sm cursor-pointer flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Incluir link do LinkedIn
              </Label>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleDownload}
            disabled={generating}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Baixar PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
