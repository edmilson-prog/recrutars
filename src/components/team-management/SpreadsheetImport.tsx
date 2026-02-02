/**
 * SpreadsheetImport
 * PRD-055: Modal de importação CSV/Excel com preview e validação.
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowLeft,
  ArrowRight,
  FileWarning,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TeamMember, Department, Position } from '@/types/teamManagement';

interface SpreadsheetImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (members: Partial<TeamMember>[]) => void;
  departments: Department[];
  positions: Position[];
}

interface ParsedRow {
  rowIndex: number;
  name: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  errors: string[];
}

interface ImportResult {
  imported: number;
  errors: number;
  errorDetails: Array<{ row: number; messages: string[] }>;
}

const MOCK_PARSED_ROWS: ParsedRow[] = [
  {
    rowIndex: 1,
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    department: 'Tecnologia',
    position: 'Desenvolvedor Jr',
    hireDate: '2025-01-15',
    errors: [],
  },
  {
    rowIndex: 2,
    name: 'Gabriel Souza',
    email: 'gabriel.souza@email.com',
    department: 'Comercial',
    position: 'Vendedor',
    hireDate: '2025-02-01',
    errors: [],
  },
  {
    rowIndex: 3,
    name: '',
    email: 'invalido',
    department: 'Marketing',
    position: 'Analista de Marketing',
    hireDate: '2025-03-10',
    errors: ['Nome é obrigatório', 'Formato de email inválido'],
  },
  {
    rowIndex: 4,
    name: 'Helena Torres',
    email: 'helena.t@email.com',
    department: 'Recursos Humanos',
    position: 'Analista de RH',
    hireDate: '2025-04-20',
    errors: [],
  },
  {
    rowIndex: 5,
    name: 'Igor Nascimento',
    email: 'igor.n@email.com',
    department: 'Tecnologia',
    position: 'Desenvolvedor Sr',
    hireDate: '2025-05-05',
    errors: [],
  },
];

export default function SpreadsheetImport({
  open,
  onOpenChange,
  onImport,
  departments,
  positions,
}: SpreadsheetImportProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalErrors = parsedRows.filter((r) => r.errors.length > 0).length;
  const validRows = parsedRows.filter((r) => r.errors.length === 0);

  function simulateParse(file: File) {
    setFileName(file.name);
    setParsedRows(MOCK_PARSED_ROWS);
    setStep(2);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) simulateParse(file);
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) simulateParse(file);
  }, []);

  function handleConfirmImport() {
    const errorDetails = parsedRows
      .filter((r) => r.errors.length > 0)
      .map((r) => ({ row: r.rowIndex, messages: r.errors }));

    const result: ImportResult = {
      imported: validRows.length,
      errors: totalErrors,
      errorDetails,
    };

    const membersToImport: Partial<TeamMember>[] = validRows.map((row) => {
      const dept = departments.find((d) => d.name === row.department);
      const pos = dept
        ? positions.find((p) => p.departmentId === dept.id && p.title === row.position)
        : undefined;

      return {
        name: row.name,
        email: row.email,
        departmentId: dept?.id ?? '',
        positionId: pos?.id ?? '',
        hireDate: new Date(row.hireDate).toISOString(),
        gaugeStatus: 'unmapped',
        isActive: true,
      };
    });

    setImportResult(result);
    onImport(membersToImport);
    setStep(3);
  }

  function handleReset() {
    setStep(1);
    setFileName('');
    setParsedRows([]);
    setImportResult(null);
    setIsDragging(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) handleReset();
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importar Planilha
            {step > 1 && (
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                Etapa {step} de 3
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50',
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('spreadsheet-file-input')?.click()}
              >
                <Upload
                  className={cn(
                    'h-10 w-10 mx-auto mb-3',
                    isDragging ? 'text-primary' : 'text-muted-foreground/50',
                  )}
                />
                <p className="text-sm font-medium">
                  {isDragging
                    ? 'Solte o arquivo aqui'
                    : 'Arraste um arquivo ou clique para selecionar'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: .csv, .xlsx, .xls
                </p>
                <input
                  id="spreadsheet-file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <Alert>
                <FileWarning className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  A planilha deve conter as colunas: <strong>Nome</strong>, <strong>Email</strong>,{' '}
                  <strong>Departamento</strong>, <strong>Cargo</strong> e{' '}
                  <strong>Data de Admissão</strong> (formato AAAA-MM-DD). A primeira linha deve ser
                  o cabeçalho.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 2: Preview and Validation */}
          {step === 2 && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{fileName}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {parsedRows.length} linhas
                  </Badge>
                </div>
                {totalErrors > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {totalErrors} erro{totalErrors > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {totalErrors > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {totalErrors} linha{totalErrors > 1 ? 's' : ''} com erros de validação.
                    Apenas as linhas válidas serão importadas.
                  </AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-[280px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 text-center">#</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Data Admissão</TableHead>
                      <TableHead className="w-10 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => {
                      const hasError = row.errors.length > 0;
                      return (
                        <TableRow
                          key={row.rowIndex}
                          className={cn(hasError && 'bg-red-50 dark:bg-red-950/20')}
                        >
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {row.rowIndex}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-sm',
                              !row.name && 'text-red-500 italic',
                            )}
                          >
                            {row.name || '(vazio)'}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-sm',
                              row.errors.some((e) => e.includes('email')) &&
                                'text-red-500',
                            )}
                          >
                            {row.email || '(vazio)'}
                          </TableCell>
                          <TableCell className="text-sm">{row.department}</TableCell>
                          <TableCell className="text-sm">{row.position}</TableCell>
                          <TableCell className="text-sm">{row.hireDate}</TableCell>
                          <TableCell className="text-center">
                            {hasError ? (
                              <X className="h-4 w-4 text-red-500 mx-auto" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Error details per row */}
              {parsedRows
                .filter((r) => r.errors.length > 0)
                .map((row) => (
                  <div
                    key={row.rowIndex}
                    className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-md px-3 py-2"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Linha {row.rowIndex}:</span>{' '}
                      {row.errors.join('; ')}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Step 3: Result */}
          {step === 3 && importResult && (
            <div className="py-6 space-y-5">
              <div className="text-center space-y-3">
                {importResult.errors === 0 ? (
                  <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
                ) : (
                  <AlertTriangle className="h-14 w-14 text-amber-500 mx-auto" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    Importação Concluída
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {importResult.imported} colaborador{importResult.imported !== 1 ? 'es' : ''}{' '}
                    importado{importResult.imported !== 1 ? 's' : ''} com sucesso
                    {importResult.errors > 0 && (
                      <>
                        {' '}
                        / {importResult.errors} linha{importResult.errors > 1 ? 's' : ''} com erro
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Summary badges */}
              <div className="flex items-center justify-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 px-3 py-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  {importResult.imported} importado{importResult.imported !== 1 ? 's' : ''}
                </Badge>
                {importResult.errors > 0 && (
                  <Badge variant="destructive" className="px-3 py-1">
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    {importResult.errors} erro{importResult.errors > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Error details */}
              {importResult.errorDetails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Detalhes dos erros:</p>
                  <ScrollArea className="max-h-[140px]">
                    <div className="space-y-1.5">
                      {importResult.errorDetails.map((detail) => (
                        <div
                          key={detail.row}
                          className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-md px-3 py-2"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Linha {detail.row}:</span>{' '}
                            {detail.messages.join('; ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          {step === 1 && (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
          )}

          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleConfirmImport} disabled={validRows.length === 0}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Importar {validRows.length} colaborador{validRows.length !== 1 ? 'es' : ''}
              </Button>
            </>
          )}

          {step === 3 && (
            <Button onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
