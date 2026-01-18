/**
 * Export Candidates Modal
 * PRD-032: Exportar Candidatos (Empresa)
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Candidate } from '@/types';
import type {
  ExportFormat,
  ExportSection,
  ExportOrder,
  ExportConfig,
  ExportContext,
} from '@/types/export';
import {
  EXPORT_SECTION_OPTIONS,
  EXPORT_ORDER_OPTIONS,
  getSourceLabel,
} from '@/types/export';
import { exportToExcel } from './exportToExcel';
import { exportToPDF } from './exportToPDF';
import { isAnonymous } from '@/utils/visibility';

interface ExportCandidatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
  context: ExportContext;
  calculateMatch?: (candidate: Candidate) => number;
}

export function ExportCandidatesModal({
  open,
  onOpenChange,
  candidates,
  context,
  calculateMatch,
}: ExportCandidatesModalProps) {
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [sections, setSections] = useState<Record<ExportSection, boolean>>(() => {
    const initial: Record<ExportSection, boolean> = {} as Record<ExportSection, boolean>;
    EXPORT_SECTION_OPTIONS.forEach((opt) => {
      initial[opt.key] = opt.defaultChecked;
    });
    return initial;
  });
  const [orderBy, setOrderBy] = useState<ExportOrder>('match_desc');
  const [exporting, setExporting] = useState(false);

  const selectedSections = useMemo(
    () => Object.entries(sections).filter(([, v]) => v).map(([k]) => k as ExportSection),
    [sections]
  );

  const hasAnonymousCandidates = useMemo(
    () => candidates.some((c) => isAnonymous(c)),
    [candidates]
  );

  const handleSectionToggle = (key: ExportSection) => {
    setSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const canExport = selectedSections.length > 0;

  const handleExport = async () => {
    if (!canExport) {
      toast.error('Selecione pelo menos uma seção para exportar');
      return;
    }

    setExporting(true);

    try {
      const config: ExportConfig = {
        format,
        sections: selectedSections,
        orderBy,
      };

      if (format === 'xlsx') {
        await exportToExcel(candidates, config, context, calculateMatch);
      } else {
        await exportToPDF(candidates, config, context, calculateMatch);
      }

      toast.success('Exportação concluída!', {
        description: `Arquivo ${format.toUpperCase()} gerado com sucesso.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Exportar Candidatos
          </DialogTitle>
          <DialogDescription>
            Exportar {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} do{' '}
            {getSourceLabel(context.source)}
            {context.jobTitle && ` - ${context.jobTitle}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Formato */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato de Exportação</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="format-xlsx"
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  format === 'xlsx'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="xlsx" id="format-xlsx" className="sr-only" />
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <span className="font-medium">XLSX</span>
                <span className="text-xs text-muted-foreground text-center">
                  Excel - Para análise
                </span>
              </Label>

              <Label
                htmlFor="format-pdf"
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  format === 'pdf'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="pdf" id="format-pdf" className="sr-only" />
                <FileText className="h-8 w-8 text-red-600" />
                <span className="font-medium">PDF</span>
                <span className="text-xs text-muted-foreground text-center">
                  Documento - Para apresentar
                </span>
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          {/* Seções */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Campos a Incluir</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {EXPORT_SECTION_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <Checkbox
                    id={`section-${option.key}`}
                    checked={sections[option.key]}
                    onCheckedChange={() => handleSectionToggle(option.key)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`section-${option.key}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ordenação */}
          <div className="space-y-3">
            <Label htmlFor="order-by" className="text-sm font-medium">
              Ordenar por
            </Label>
            <Select value={orderBy} onValueChange={(v) => setOrderBy(v as ExportOrder)}>
              <SelectTrigger id="order-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_ORDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aviso sobre anônimos */}
          {hasAnonymousCandidates && (
            <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Candidatos em modo anônimo serão exportados como "Perfil Anônimo #XXXX"
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={!canExport || exporting}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
