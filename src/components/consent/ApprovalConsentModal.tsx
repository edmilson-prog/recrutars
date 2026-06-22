/**
 * ApprovalConsentModal — Concept A.
 * Single celebratory + authorization modal shown when a candidate is approved
 * (application 'offer' with a 'pending' data disclosure). Offers three resolving
 * actions, all of which unlock the platform:
 *   - Accept the offer AND release sensitive data (records LGPD consent)
 *   - Refuse data only (keeps the offer pending, data stays hidden — reversible)
 *   - Decline the job (withdraws the application)
 *
 * In `blocking` mode (mounted by PendingApprovalGate) the modal cannot be
 * dismissed by Esc, outside-click, or an X button — the candidate must pick one
 * of the three actions. LGPD Art. 7º, I requires consent to be free, so the two
 * refusal paths carry the same visual weight as the accept path.
 */
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  PartyPopper,
  Briefcase,
  ShieldCheck,
  ShieldOff,
  Fingerprint,
  Mail,
  Phone,
  Cake,
  MapPin,
  History,
  Loader2,
  FileText,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useConsentDecision } from '@/hooks/useConsentDecision';
import { useUpdateApplicationStatus, applicationKeys } from '@/hooks/useApplicationsQuery';
import { consentKeys } from '@/hooks/useConsentStatus';
import { computeTermHash, CONSENT_TERM_VERSION, CONSENT_TERM_TEXT } from '@/lib/consentTerm';
import { ConsentTermDialog } from '@/components/consent/ConsentTermDialog';
import type { ConsentTermParties } from '@/components/consent/consentTermHtml';
import { toast } from 'sonner';
import type { Application } from '@/types';
import type { DataDisclosure } from '@/types/consent';

const SHARED_DATA = [
  { icon: Fingerprint, label: 'CPF' },
  { icon: Mail, label: 'E-mail' },
  { icon: Phone, label: 'Telefone' },
  { icon: Cake, label: 'Data de nascimento' },
  { icon: MapPin, label: 'Endereço' },
] as const;

export interface ApprovalConsentModalProps {
  open: boolean;
  application: Application;
  disclosure: DataDisclosure;
  /** When true: no Esc / outside-click / X — the candidate must decide. */
  blocking?: boolean;
  /** 1-based position in the pending queue (shown only when queueTotal > 1). */
  queueIndex?: number;
  queueTotal?: number;
  onOpenChange?: (open: boolean) => void;
  /** Called after any of the three actions succeeds. */
  onResolved?: () => void;
}

export function ApprovalConsentModal({
  open,
  application,
  disclosure,
  blocking = false,
  queueIndex,
  queueTotal,
  onOpenChange,
  onResolved,
}: ApprovalConsentModalProps) {
  const { currentCandidate } = useAuth();
  const { accept, refuse } = useConsentDecision();
  const updateStatus = useUpdateApplicationStatus();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [consentChecked, setConsentChecked] = useState(false);
  const [declineConfirm, setDeclineConfirm] = useState(false);
  const [showTerm, setShowTerm] = useState(false);

  const busy = accept.isPending || refuse.isPending || updateStatus.isPending;
  const showQueue = !!queueTotal && queueTotal > 1;

  const parties: ConsentTermParties = {
    candidateName: currentCandidate?.name ?? application.candidateName ?? 'Candidato',
    candidateCpf: currentCandidate?.cpf ?? undefined,
    companyName: application.companyName ?? '',
    companyLogo: null,
    jobTitle: application.jobTitle ?? '',
    operatorName: 'RecrutaRS',
  };

  const close = () => onOpenChange?.(false);

  const handleAccept = async () => {
    if (!consentChecked) return;
    try {
      const termHash = await computeTermHash(CONSENT_TERM_TEXT);
      await accept.mutateAsync({
        applicationId: application.id,
        termVersion: CONSENT_TERM_VERSION,
        termHash,
      });
      onResolved?.();
      close();
    } catch {
      // toast handled by useConsentDecision.onError
    }
  };

  const handleRefuseData = async () => {
    try {
      await refuse.mutateAsync(application.id);
      onResolved?.();
      close();
    } catch {
      // toast handled by useConsentDecision.onError
    }
  };

  const handleDeclineJob = async () => {
    try {
      await updateStatus.mutateAsync({
        id: application.id,
        status: 'withdrawn',
        reason: 'Candidato recusou a proposta',
      });
      // useUpdateApplicationStatus only invalidates applicationKeys.lists(); the
      // gate reads the candidate's applications via byCandidate, so invalidate the
      // candidate-scoped caches explicitly to unlock the platform immediately.
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({
        queryKey: consentKeys.byCandidate(application.candidateId),
      });
      toast.success('Candidatura recusada', {
        description: 'Você desistiu desta proposta. Seus dados seguem ocultos.',
      });
      onResolved?.();
      setDeclineConfirm(false);
      close();
    } catch (e) {
      toast.error('Erro ao recusar a vaga', {
        description: e instanceof Error ? e.message : 'Tente novamente em instantes.',
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!blocking) onOpenChange?.(o);
        }}
      >
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
          hideClose={blocking}
          onEscapeKeyDown={blocking ? (e) => e.preventDefault() : undefined}
          onPointerDownOutside={blocking ? (e) => e.preventDefault() : undefined}
          onInteractOutside={blocking ? (e) => e.preventDefault() : undefined}
          onOpenAutoFocus={(e) => {
            // Land initial focus on the (non-interactive) title rather than on
            // the first control, so the consent decision is never pre-focused.
            e.preventDefault();
            titleRef.current?.focus();
          }}
        >
          <DialogHeader className="items-center text-center">
            {showQueue && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Aprovação {queueIndex} de {queueTotal}
              </span>
            )}
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10"
            >
              <PartyPopper className="h-8 w-8 text-primary" aria-hidden="true" />
            </motion.div>
            <DialogTitle ref={titleRef} tabIndex={-1} className="text-xl outline-none">
              Parabéns! Você foi aprovado
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{application.companyName}</span> aprovou
              sua candidatura para{' '}
              <span className="font-medium text-foreground">&quot;{application.jobTitle}&quot;</span>.
              Conclua as etapas abaixo para concretizar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-success/40 bg-success/10">
                <Briefcase className="h-4 w-4 text-success" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium text-foreground">1. Aceitar a proposta</p>
                <p className="text-muted-foreground">Confirme seu interesse na vaga oferecida.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="font-medium text-foreground">2. Liberar seus dados sensíveis</p>
                <p className="mb-2 text-muted-foreground">
                  Hoje ocultos. Ao autorizar, a empresa poderá vê-los para formalizar a contratação.
                </p>
                <ul className="mb-2 flex flex-wrap gap-1.5">
                  {SHARED_DATA.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground"
                    >
                      <Icon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                      {label}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  Base legal: consentimento — LGPD Art. 7º, I
                </span>
              </div>
            </div>

            <label
              htmlFor="approval-consent-acknowledge"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/40 p-3"
            >
              <Checkbox
                id="approval-consent-acknowledge"
                checked={consentChecked}
                onCheckedChange={(c) => setConsentChecked(c === true)}
                disabled={busy}
                className="mt-0.5"
              />
              <span className="text-sm leading-snug">
                Li e <span className="font-medium">autorizo</span> o compartilhamento dos meus dados
                pessoais com a empresa para fins de contratação.
              </span>
            </label>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              Registramos data, hora, IP e versão do termo para auditoria.
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            {declineConfirm ? (
              <div className="w-full rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                <p className="mb-3 flex items-start gap-2 text-sm text-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" aria-hidden="true" />
                  Tem certeza? Isso encerra esta candidatura e ela passará a constar como desistência.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeclineConfirm(false)}
                    disabled={busy}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleDeclineJob}
                    disabled={busy}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {updateStatus.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recusando…</>
                    ) : (
                      'Sim, recusar a vaga'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleAccept}
                  disabled={!consentChecked || busy}
                  className="w-full bg-success text-success-foreground hover:bg-success/90"
                >
                  {accept.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando…</>
                  ) : (
                    <><ShieldCheck className="mr-2 h-4 w-4" /> Aceitar vaga e liberar dados</>
                  )}
                </Button>

                <div className="grid w-full grid-cols-2 gap-2">
                  <Button variant="ghost" onClick={handleRefuseData} disabled={busy}>
                    {refuse.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldOff className="mr-2 h-4 w-4" />
                    )}
                    Recusar dados
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setDeclineConfirm(true)}
                    disabled={busy}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Recusar vaga
                  </Button>
                </div>

                <Button
                  variant="link"
                  onClick={() => setShowTerm(true)}
                  className="h-auto p-0 text-xs text-muted-foreground"
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Ver termo completo
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Você pode recusar livremente — sua decisão é registrada e seus dados seguem ocultos
                  até você autorizar.
                </p>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConsentTermDialog
        open={showTerm}
        onOpenChange={setShowTerm}
        disclosure={disclosure}
        parties={parties}
      />
    </>
  );
}
