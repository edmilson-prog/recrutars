/**
 * CompanyInterviewCard Component
 * PRD-034: Agendamento de Entrevistas (Empresa)
 */

import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Video,
  Phone,
  MapPin,
  Clock,
  Calendar,
  User,
  FileText,
  MessageSquare,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Interview } from '@/types/interview';
import { interviewTypeLabels } from '@/types/interview';
import { getCandidateInitials } from '@/lib/candidateDisplayName';
import {
  companyCancellationReasonLabels,
  type CompanyCancellationReason,
} from '@/hooks/useCompanyInterviews';

interface CompanyInterviewCardProps {
  interview: Interview;
  candidateAvatar?: string;
  candidateName?: string;
  onAcceptSuggestion?: () => void;
  onProposeNew?: () => void;
  onCancel?: () => void;
  onMessage?: () => void;
  onMarkCompleted?: () => void;
  onViewCandidate?: () => void;
  onRemind?: () => void;
}

const typeIcons = {
  video: Video,
  phone: Phone,
  in_person: MapPin,
};

function getStatusBadge(status: Interview['status']) {
  switch (status) {
    case 'pending_candidate':
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Aguardando candidato</Badge>;
    case 'pending_company':
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Candidato sugeriu horários</Badge>;
    case 'confirmed':
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Confirmada</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30">Realizada</Badge>;
    case 'cancelled_by_candidate':
      return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Cancelada pelo candidato</Badge>;
    case 'cancelled_by_company':
      return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Cancelada</Badge>;
    default:
      return null;
  }
}

function getCountdown(dateStr: string): { text: string; urgent: boolean } {
  const date = new Date(dateStr);
  if (isPast(date)) {
    return { text: 'Passou', urgent: false };
  }
  if (isToday(date)) {
    return { text: 'Hoje', urgent: true };
  }
  if (isTomorrow(date)) {
    return { text: 'Amanhã', urgent: true };
  }
  const days = differenceInDays(date, new Date());
  return { text: `Em ${days} dias`, urgent: days <= 3 };
}

export function CompanyInterviewCard({
  interview,
  candidateAvatar,
  candidateName,
  onAcceptSuggestion,
  onProposeNew,
  onCancel,
  onMessage,
  onMarkCompleted,
  onViewCandidate,
  onRemind,
}: CompanyInterviewCardProps) {
  const TypeIcon = typeIcons[interview.type];

  // Obter iniciais do candidato
  const candidateInitials = candidateName
    ? getCandidateInitials(candidateName)
    : 'C';

  // Renderizar card para entrevista aguardando resposta do candidato
  if (interview.status === 'pending_candidate') {
    return (
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            {getStatusBadge(interview.status)}
            {interview.responseDeadline && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Prazo: {format(new Date(interview.responseDeadline), 'dd/MM', { locale: ptBR })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{format(new Date(interview.responseDeadline), "dd 'de' MMMM 'as' HH:mm", { locale: ptBR })}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidateAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{candidateName ?? interview.title}</h3>
              {candidateName && (
                <p className="text-xs text-muted-foreground/70 truncate">{interview.title}</p>
              )}
              <p className="text-sm text-muted-foreground truncate">
                {interview.jobTitle}
              </p>
            </div>
          </div>

          <p className="text-sm mb-3">Horários propostos:</p>

          <div className="space-y-2 mb-4">
            {interview.proposedSlots?.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-md bg-background border"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(slot.datetime), "EEE, dd/MM 'as' HH:mm", { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <TypeIcon className="h-4 w-4" />
              {interviewTypeLabels[interview.type]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {interview.duration} min
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRemind} className="flex-1">
              <Bell className="h-4 w-4 mr-2" />
              Lembrete
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel} className="text-red-500 hover:text-red-600">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar card quando candidato sugeriu horários alternativos
  if (interview.status === 'pending_company') {
    return (
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-6">
          <div className="mb-4">
            {getStatusBadge(interview.status)}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidateAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{candidateName ?? interview.title}</h3>
              {candidateName && (
                <p className="text-xs text-muted-foreground/70 truncate">{interview.title}</p>
              )}
              <p className="text-sm text-muted-foreground truncate">
                {interview.jobTitle}
              </p>
            </div>
          </div>

          <p className="text-sm mb-3">O candidato sugeriu:</p>

          <div className="space-y-2 mb-4">
            {interview.suggestedSlots?.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-md bg-background border"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(slot), "EEE, dd/MM 'as' HH:mm", { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>

          {interview.suggestionReason && (
            <div className="p-3 rounded-md bg-muted/50 mb-4">
              <p className="text-sm text-muted-foreground italic">
                "{interview.suggestionReason}"
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <TypeIcon className="h-4 w-4" />
              {interviewTypeLabels[interview.type]}
            </span>
          </div>

          <div className="flex gap-2">
            <Button onClick={onAcceptSuggestion} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Aceitar Sugestão
            </Button>
            <Button variant="outline" onClick={onProposeNew} className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Propor Outros
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar card para entrevista confirmada
  if (interview.status === 'confirmed' && interview.confirmedDatetime) {
    const countdown = getCountdown(interview.confirmedDatetime);

    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            {getStatusBadge(interview.status)}
            <span className={`text-sm font-medium ${countdown.urgent ? 'text-orange-500' : 'text-muted-foreground'}`}>
              {countdown.text}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidateAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{candidateName ?? interview.title}</h3>
              {candidateName && (
                <p className="text-xs text-muted-foreground/70 truncate">{interview.title}</p>
              )}
              <p className="text-sm text-muted-foreground truncate">
                {interview.jobTitle}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(interview.confirmedDatetime), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(interview.confirmedDatetime), 'HH:mm', { locale: ptBR })} ({interview.duration} min)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {interviewTypeLabels[interview.type]}
                {interview.type === 'in_person' && interview.address && (
                  <span className="text-muted-foreground"> - {interview.address}</span>
                )}
              </span>
            </div>
            {interview.interviewerName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {interview.interviewerName}
                  {interview.interviewerRole && ` (${interview.interviewerRole})`}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {interview.type === 'video' && interview.videoLink && (
              <Button variant="outline" size="sm" asChild>
                <a href={interview.videoLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Entrar na Reunião
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensagem
            </Button>
            <Button variant="outline" size="sm" onClick={onMarkCompleted}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar Realizada
            </Button>
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar card para entrevista realizada
  if (interview.status === 'completed') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            {getStatusBadge(interview.status)}
            {interview.completedAt && (
              <span className="text-sm text-muted-foreground">
                {format(new Date(interview.completedAt), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidateAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{candidateName ?? interview.title}</h3>
              {candidateName && (
                <p className="text-xs text-muted-foreground/70 truncate">{interview.title}</p>
              )}
              <p className="text-sm text-muted-foreground truncate">
                {interview.jobTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <TypeIcon className="h-4 w-4" />
              {interviewTypeLabels[interview.type]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {interview.duration} min
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={onViewCandidate}>
            <ChevronRight className="h-4 w-4 mr-2" />
            Ver Candidato
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Renderizar card para entrevista cancelada
  if (interview.status === 'cancelled_by_candidate' || interview.status === 'cancelled_by_company') {
    return (
      <Card className="opacity-75">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            {getStatusBadge(interview.status)}
            {interview.cancelledAt && (
              <span className="text-sm text-muted-foreground">
                {format(new Date(interview.cancelledAt), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidateAvatar} />
              <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{candidateName ?? interview.title}</h3>
              {candidateName && (
                <p className="text-xs text-muted-foreground/70 truncate">{interview.title}</p>
              )}
              <p className="text-sm text-muted-foreground truncate">
                {interview.jobTitle}
              </p>
            </div>
          </div>

          {interview.cancellationReason && (
            <p className="text-sm text-muted-foreground">
              Motivo: {companyCancellationReasonLabels[interview.cancellationReason as CompanyCancellationReason] || interview.cancellationReason}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Fallback
  return null;
}
