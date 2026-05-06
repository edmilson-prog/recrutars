// src/components/empresa/pdf/ExportCandidateProfileModal.tsx
import { useEffect, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileDown, FileText, Loader2, Columns, AlignCenter, Sparkles, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PDFEmpresaDocument } from './PDFEmpresaDocument';
import type { PDFEmpresaData, PDFEmpresaSectionConfig, PDFEmpresaTemplateType, SectionKey } from './types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PDFEmpresaData;
}

const TEMPLATES: Array<{
  value: PDFEmpresaTemplateType; label: string; description: string; icon: typeof FileText;
}> = [
  { value: 'dossie',  label: 'Dossiê',       description: 'Capa + sumário + tudo', icon: Sparkles },
  { value: 'modern',  label: 'Moderno',      description: 'Duas colunas',          icon: Columns },
  { value: 'classic', label: 'Clássico',     description: 'Linear tradicional',    icon: FileText },
  { value: 'minimal', label: 'Minimalista',  description: 'Limpo e centralizado',  icon: AlignCenter },
];

interface SectionDef {
  key: SectionKey;
  label: string;
  group: 'base' | 'empresa';
  isAvailable: (d: PDFEmpresaData) => boolean;
  unavailableHint: string;
}

const SECTIONS: SectionDef[] = [
  { key: 'personalInfo',       label: 'Informações pessoais',         group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'summary',            label: 'Resumo profissional',          group: 'base',    isAvailable: d => !!(d.curriculum as { about?: string } | null | undefined)?.about, unavailableHint: 'Sem resumo no perfil' },
  { key: 'technicalSkills',    label: 'Habilidades técnicas',         group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'behavioralSkills',   label: 'Habilidades comportamentais',  group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'experience',         label: 'Experiência profissional',     group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'education',          label: 'Formação acadêmica',           group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'courses',            label: 'Cursos e certificações',       group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'salary',             label: 'Pretensão salarial',           group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'matchScore',         label: 'Match Score (vaga atual)',     group: 'empresa', isAvailable: d => !!d.matchResult && !!d.application,         unavailableHint: 'Requer candidatura ativa' },
  { key: 'gaugeProAnalysis',   label: 'Análise comportamental Gauge-Pro', group: 'empresa', isAvailable: d => !!d.gaugeProResult,                     unavailableHint: 'Sem teste Gauge-Pro' },
  { key: 'internalNotes',      label: 'Notas internas',               group: 'empresa', isAvailable: d => (d.candidateNotes?.length ?? 0) + (d.applicationNotes?.length ?? 0) > 0, unavailableHint: 'Sem notas registradas' },
  { key: 'applicationHistory', label: 'Histórico de candidaturas',    group: 'empresa', isAvailable: d => (d.applicationHistory?.length ?? 0) > 0,    unavailableHint: 'Sem histórico' },
  { key: 'practicalAnalysis',  label: 'Análise prática (IA)',         group: 'empresa', isAvailable: d => !!d.practicalAnalysis,                       unavailableHint: 'Análise não gerada' },
  { key: 'interviews',         label: 'Entrevistas',                  group: 'empresa', isAvailable: d => (d.interviews?.length ?? 0) > 0,             unavailableHint: 'Sem entrevistas' },
  { key: 'highlights',         label: 'Destaques da candidatura',     group: 'empresa', isAvailable: d => (d.highlights?.length ?? 0) > 0,             unavailableHint: 'Sem destaques' },
  { key: 'favoriteEvaluation', label: 'Avaliação interna',            group: 'empresa', isAvailable: d => !!d.favoriteEvaluation,                      unavailableHint: 'Sem avaliação' },
  { key: 'languages',          label: 'Idiomas',                      group: 'empresa', isAvailable: d => (d.languages?.length ?? 0) > 0,              unavailableHint: 'Sem idiomas registrados' },
  { key: 'availability',       label: 'Disponibilidade',              group: 'empresa', isAvailable: d => !!d.availability,                            unavailableHint: 'Sem disponibilidade declarada' },
  { key: 'activityLog',        label: 'Histórico de atividade',       group: 'empresa', isAvailable: d => (d.activityLog?.length ?? 0) > 0,            unavailableHint: 'Sem atividade' },
];

function buildDefaultSections(data: PDFEmpresaData): PDFEmpresaSectionConfig {
  const result = {} as PDFEmpresaSectionConfig;
  for (const s of SECTIONS) {
    result[s.key] = s.key === 'salary' ? false : s.isAvailable(data);
  }
  return result;
}

export function ExportCandidateProfileModal({ open, onOpenChange, data }: Props) {
  const [template, setTemplate] = useState<PDFEmpresaTemplateType>('dossie');
  const [sections, setSections] = useState<PDFEmpresaSectionConfig>(() => buildDefaultSections(data));
  const [includeLinks, setIncludeLinks] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Reset defaults when data identity changes
  useEffect(() => {
    setSections(buildDefaultSections(data));
  }, [data]);

  const toggle = (key: SectionKey) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const doc = (
        <PDFEmpresaDocument
          data={data}
          template={template}
          sections={sections}
          includeLinks={includeLinks}
        />
      );
      const blob = await pdf(doc).toBlob();

      const nameParts = (data.candidate.name ?? 'Candidato').split(' ');
      const firstName = nameParts[0] ?? 'Candidato';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const namePart = lastName ? `${firstName}${lastName}` : firstName;
      const d = new Date();
      const dateStr = `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${d.getFullYear()}`;
      const filename = `Dossie_${namePart}_${dateStr}.pdf`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF gerado', { description: `Arquivo ${filename} baixado.` });
      onOpenChange(false);
    } catch (e) {
      console.error('Erro PDF Dossiê:', e);
      toast.error('Erro ao gerar PDF', { description: 'Tente novamente em alguns instantes.' });
    } finally {
      setGenerating(false);
    }
  };

  const baseSections = SECTIONS.filter(s => s.group === 'base');
  const empresaSections = SECTIONS.filter(s => s.group === 'empresa');

  const renderSectionCheckbox = (s: SectionDef) => {
    const available = s.isAvailable(data);
    const checkbox = (
      <div className="flex items-center gap-2">
        <Checkbox
          id={`sec-${s.key}`}
          checked={sections[s.key]}
          disabled={!available}
          onCheckedChange={() => toggle(s.key)}
        />
        <Label
          htmlFor={`sec-${s.key}`}
          className={`text-sm cursor-pointer ${!available ? 'text-muted-foreground' : ''}`}
        >
          {s.label}
        </Label>
      </div>
    );
    return available ? (
      <div key={s.key}>{checkbox}</div>
    ) : (
      <Tooltip key={s.key}>
        <TooltipTrigger asChild><div>{checkbox}</div></TooltipTrigger>
        <TooltipContent>{s.unavailableHint}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            Exportar Dossiê do Candidato
          </DialogTitle>
          <DialogDescription>
            Documento interno confidencial. Escolha o template e selecione as seções a incluir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Templates */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Template</Label>
            <RadioGroup
              value={template}
              onValueChange={v => setTemplate(v as PDFEmpresaTemplateType)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {TEMPLATES.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.value}>
                    <RadioGroupItem value={t.value} id={`tpl-${t.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`tpl-${t.value}`}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <Icon className="h-5 w-5 mb-1 text-primary" />
                      <span className="text-sm font-medium">{t.label}</span>
                      <span className="text-[10px] text-muted-foreground text-center mt-0.5">{t.description}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <Separator />

          <TooltipProvider>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Currículo</Label>
              <div className="grid grid-cols-2 gap-2">
                {baseSections.map(renderSectionCheckbox)}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Visão da Empresa</Label>
              <div className="grid grid-cols-2 gap-2">
                {empresaSections.map(renderSectionCheckbox)}
              </div>
            </div>
          </TooltipProvider>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Opções</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-links"
                checked={includeLinks}
                onCheckedChange={c => setIncludeLinks(c as boolean)}
              />
              <Label htmlFor="include-links" className="text-sm cursor-pointer flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5" />
                Incluir link do LinkedIn
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={generating}>
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando…</>
            ) : (
              <><FileDown className="h-4 w-4 mr-2" /> Baixar PDF</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
