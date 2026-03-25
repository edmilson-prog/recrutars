/**
 * LifecycleActionsDropdown
 * PRD-090 Phase 2: Dropdown menu for lifecycle actions in the member profile header.
 *
 * Shows different items based on member status:
 * - active:     Desligar, Desvincular, Afastamento, Promoção, Transferencia, Cargo
 * - on_leave:   Registrar Retorno, Desligar
 * - terminated: Recontratar, Solicitar Anonimização
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  UserMinus,
  Unlink,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  ArrowRightLeft,
  Briefcase,
  ShieldOff,
} from 'lucide-react';
import type { TeamMember } from '@/types/teamManagement';

interface LifecycleActionsDropdownProps {
  member: TeamMember;
  onTerminate: () => void;
  onUnlink: () => void;
  onReactivate: () => void;
  onStartLeave: () => void;
  onReturnFromLeave: () => void;
  onPromote: () => void;
  onTransferDepartment: () => void;
  onChangePosition: () => void;
  onAnonymize: () => void;
}

export function LifecycleActionsDropdown({
  member,
  onTerminate,
  onUnlink,
  onReactivate,
  onStartLeave,
  onReturnFromLeave,
  onPromote,
  onTransferDepartment,
  onChangePosition,
  onAnonymize,
}: LifecycleActionsDropdownProps) {
  const status = member.status ?? (member.isActive ? 'active' : 'inactive');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4 mr-2" />
          Ações
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Active member actions */}
        {status === 'active' && (
          <>
            <DropdownMenuItem
              onClick={onTerminate}
              title="Encerra o vínculo empregatício e registra a data de desligamento no histórico."
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Desligar Colaborador
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUnlink} title="Remove o colaborador da empresa sem excluir a conta dele na plataforma.">
              <Unlink className="h-4 w-4 mr-2" />
              Desvincular
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onStartLeave} title="Registra um período de afastamento por licença, férias ou motivo médico.">
              <PauseCircle className="h-4 w-4 mr-2" />
              Registrar Afastamento
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onPromote} title="Registra uma promoção com novo cargo e atualiza o histórico profissional.">
              <TrendingUp className="h-4 w-4 mr-2" />
              Promoção
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onTransferDepartment} title="Move o colaborador para outro departamento mantendo o cargo atual.">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transferência de Departamento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onChangePosition} title="Altera o cargo do colaborador dentro do mesmo departamento.">
              <Briefcase className="h-4 w-4 mr-2" />
              Mudança de Cargo
            </DropdownMenuItem>
          </>
        )}

        {/* On leave actions */}
        {status === 'on_leave' && (
          <>
            <DropdownMenuItem onClick={onReturnFromLeave} title="Encerra o período de afastamento e reativa o colaborador como ativo.">
              <PlayCircle className="h-4 w-4 mr-2" />
              Registrar Retorno
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onTerminate}
              title="Encerra o vínculo empregatício mesmo durante o período de afastamento."
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Desligar Colaborador
            </DropdownMenuItem>
          </>
        )}

        {/* Terminated member actions */}
        {status === 'terminated' && (
          <>
            <DropdownMenuItem onClick={onReactivate} title="Reativa o colaborador criando um novo vínculo com a empresa.">
              <RotateCcw className="h-4 w-4 mr-2" />
              Recontratar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onAnonymize}
              title="Solicita a remoção dos dados pessoais conforme a LGPD. Esta ação é irreversível."
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              Solicitar Anonimização
            </DropdownMenuItem>
          </>
        )}

        {/* Unlinked member actions */}
        {status === 'unlinked' && (
          <>
            <DropdownMenuItem onClick={onReactivate} title="Reativa o colaborador criando um novo vínculo com a empresa.">
              <RotateCcw className="h-4 w-4 mr-2" />
              Recontratar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onAnonymize}
              title="Solicita a remoção dos dados pessoais conforme a LGPD. Esta ação é irreversível."
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              Solicitar Anonimização
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
