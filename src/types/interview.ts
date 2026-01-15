/**
 * Interview Types
 * PRD-027: Agendamento de Entrevistas (Candidato)
 */

export type InterviewType = 'video' | 'phone' | 'in_person';

export type InterviewStatus =
  | 'pending_candidate'   // empresa propôs, candidato precisa responder
  | 'pending_company'     // candidato sugeriu, empresa precisa confirmar
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_candidate'
  | 'cancelled_by_company';

export interface ProposedSlot {
  datetime: string;
  selected?: boolean;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  candidateId: string;
  title: string; // "Entrevista Técnica", "Entrevista com RH", etc.
  type: InterviewType;
  status: InterviewStatus;

  // Horários propostos (quando pendente)
  proposedSlots?: ProposedSlot[];

  // Horários sugeridos pelo candidato
  suggestedSlots?: string[];
  suggestionReason?: string;

  // Horário confirmado
  confirmedDatetime?: string;
  duration: number; // minutos

  // Detalhes por tipo
  videoLink?: string;       // para video
  phoneNumber?: string;     // para phone
  address?: string;         // para in_person
  mapLink?: string;         // para in_person

  // Extras
  interviewerName?: string;
  interviewerRole?: string;
  notes?: string;           // observações da empresa

  // Datas
  responseDeadline?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancellationDetails?: string;
}

// Labels para tipos de entrevista
export const interviewTypeLabels: Record<InterviewType, string> = {
  video: 'Videochamada',
  phone: 'Telefone',
  in_person: 'Presencial',
};

// Ícones para tipos de entrevista
export const interviewTypeIcons: Record<InterviewType, string> = {
  video: 'Video',
  phone: 'Phone',
  in_person: 'MapPin',
};

// Labels para status de entrevista
export const interviewStatusLabels: Record<InterviewStatus, string> = {
  pending_candidate: 'Aguardando sua resposta',
  pending_company: 'Aguardando confirmação da empresa',
  confirmed: 'Confirmada',
  completed: 'Realizada',
  cancelled_by_candidate: 'Cancelada por você',
  cancelled_by_company: 'Cancelada pela empresa',
};

// Cores para status
export const interviewStatusColors: Record<InterviewStatus, string> = {
  pending_candidate: 'yellow',
  pending_company: 'yellow',
  confirmed: 'green',
  completed: 'gray',
  cancelled_by_candidate: 'red',
  cancelled_by_company: 'red',
};

// Motivos de cancelamento
export type CancellationReason =
  | 'accepted_other'
  | 'schedule_conflict'
  | 'withdrew'
  | 'personal'
  | 'other';

export const cancellationReasonLabels: Record<CancellationReason, string> = {
  accepted_other: 'Aceitei outra proposta',
  schedule_conflict: 'Problemas de agenda',
  withdrew: 'Desisti da vaga',
  personal: 'Motivos pessoais',
  other: 'Outro',
};
