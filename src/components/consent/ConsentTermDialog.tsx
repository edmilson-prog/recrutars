// src/components/consent/ConsentTermDialog.tsx
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileDown, Printer, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { maskCpfPartial, maskIpPartial } from '@/lib/piiMask';
import { CONSENT_TERM_VERSION } from '@/lib/consentTerm';
import { ConsentTermDocument } from './ConsentTermDocument';
import { printConsentTermHtml, type ConsentTermParties } from './consentTermHtml';
import type { DataDisclosure } from '@/types/consent';

export interface ConsentTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disclosure: DataDisclosure;
  parties: ConsentTermParties;
}

function formatDateBR(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ConsentTermDialog({
  open,
  onOpenChange,
  disclosure,
  parties,
}: ConsentTermDialogProps) {
  const [generating, setGenerating] = useState(false);
  const accepted = disclosure.status === 'accepted' && !!disclosure.acceptedAt;
  const docNumber = `TC-${disclosure.id.slice(0, 8).toUpperCase()}`;
  const data = { disclosure, parties };

  const handlePrint = () => {
    printConsentTermHtml(data);
  };

  const handleDownloadPdf = async () => {
    setGenerating(true);
    try {
      const blob = await pdf(<ConsentTermDocument disclosure={disclosure} parties={parties} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Termo_Consentimento_${docNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Termo gerado', { description: `Arquivo Termo_Consentimento_${docNumber}.pdf baixado.` });
    } catch (e) {
      console.error('Erro ao gerar termo:', e);
      toast.error('Erro ao gerar o termo', { description: 'Tente novamente em alguns instantes.' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Termo de Consentimento
          </DialogTitle>
          <DialogDescription>
            Documento nº {docNumber} · Versão {CONSENT_TERM_VERSION}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div>
            <p className="font-medium text-foreground">Partes</p>
            <p className="text-muted-foreground">
              Titular: {parties.candidateName}
              {parties.candidateCpf ? ` (CPF ${maskCpfPartial(parties.candidateCpf)})` : ''}
            </p>
            <p className="text-muted-foreground">
              Controladora: {parties.companyName} — vaga &quot;{parties.jobTitle}&quot;
            </p>
            <p className="text-muted-foreground">Operadora: {parties.operatorName}</p>
          </div>

          <Separator />

          <div>
            <p className="font-medium text-foreground">Dados compartilhados</p>
            <p className="text-muted-foreground">
              CPF, e-mail, telefone, data de nascimento e endereço.
            </p>
          </div>

          <Separator />

          <div>
            <p className="font-medium text-foreground">Base legal</p>
            <p className="text-muted-foreground">
              Consentimento do titular — Art. 7º, I, da Lei nº 13.709/2018 (LGPD).
            </p>
          </div>

          <Separator />

          <div>
            <p className="font-medium text-foreground">Auditoria</p>
            {accepted ? (
              <>
                <p className="text-muted-foreground">Liberado em: {formatDateBR(disclosure.acceptedAt)}</p>
                <p className="text-muted-foreground">
                  IP de origem: {disclosure.ip ? maskIpPartial(disclosure.ip) : '—'}
                </p>
              </>
            ) : (
              <p className="text-warning">Aguardando aceite do titular.</p>
            )}
            <p className="text-muted-foreground break-all">
              Hash (SHA-256): {disclosure.termHash ?? '—'}
            </p>
            <p className="text-muted-foreground">
              Versão do termo: {disclosure.termVersion ?? CONSENT_TERM_VERSION}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownloadPdf} disabled={generating}>
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando…</>
            ) : (
              <><FileDown className="h-4 w-4 mr-2" /> Baixar PDF</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
