/**
 * TeamMemberForm
 * PRD-055: Dialog centralizado para criar/editar colaboradores.
 */

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import type { TeamMember, Department, Position } from "@/types/teamManagement";

/** Apply CPF mask: 999.999.999-99 */
function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Apply phone mask: (99) 99999-9999 */
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface TeamMemberFormProps {
  member?: TeamMember | null;
  departments: Department[];
  positions: Position[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<TeamMember>) => void;
}

export default function TeamMemberForm({
  member,
  departments,
  positions,
  open,
  onOpenChange,
  onSave,
}: TeamMemberFormProps) {
  const isEditing = !!member;

  // Form state
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Pre-fill when editing or reset on create
  useEffect(() => {
    if (open) {
      if (member) {
        setName(member.name ?? "");
        setCpf(member.cpf ?? "");
        setEmail(member.email ?? "");
        setPhone(member.phone ?? "");
        setDepartmentId(member.departmentId ?? "");
        setPositionId(member.positionId ?? "");
        setHireDate(member.hireDate ?? "");
        setIsActive(member.isActive);
      } else {
        setName("");
        setCpf("");
        setEmail("");
        setPhone("");
        setDepartmentId("");
        setPositionId("");
        setHireDate("");
        setIsActive(true);
      }
    }
  }, [open, member]);

  // Filter positions by selected department
  const filteredPositions = useMemo(
    () =>
      departmentId
        ? positions.filter((p) => p.departmentId === departmentId && p.isActive)
        : [],
    [positions, departmentId],
  );

  // Reset position when department changes (only if the current position does not belong)
  useEffect(() => {
    if (departmentId && positionId) {
      const belongsToDept = positions.some(
        (p) => p.id === positionId && p.departmentId === departmentId,
      );
      if (!belongsToDept) {
        setPositionId("");
      }
    }
  }, [departmentId, positionId, positions]);

  const cpfDigits = cpf.replace(/\D/g, "");
  const canSave =
    name.trim().length > 0 &&
    cpfDigits.length === 11 &&
    email.trim().length > 0 &&
    departmentId.length > 0 &&
    positionId.length > 0;

  const handleSave = () => {
    if (!canSave) return;

    const data: Partial<TeamMember> = {
      name: name.trim(),
      cpf: cpfDigits || undefined,
      email: email.trim(),
      phone: phone.replace(/\D/g, "") || undefined,
      departmentId,
      positionId,
      hireDate: hireDate || undefined,
      isActive,
    };

    if (isEditing && member) {
      data.id = member.id;
    }

    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do colaborador."
              : "Preencha os dados para adicionar um novo colaborador à equipe."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-5 py-1 px-1">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="member-name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="member-name"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="member-cpf">
                CPF <span className="text-destructive">*</span>
              </Label>
              <Input
                id="member-cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                maxLength={14}
                disabled={isEditing && !!member?.cpf}
              />
              {isEditing && !!member?.cpf && (
                <p className="text-xs text-muted-foreground">
                  CPF não pode ser alterado após o cadastro.
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="member-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="member-email"
                type="email"
                placeholder="email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Telefone (WhatsApp) */}
            <div className="space-y-2">
              <Label htmlFor="member-phone">Telefone (WhatsApp)</Label>
              <Input
                id="member-phone"
                placeholder="(99) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                Necessário para envio de convites via WhatsApp.
              </p>
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label>
                Departamento <span className="text-destructive">*</span>
              </Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    .filter((d) => d.isActive)
                    .map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label>
                Cargo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={positionId}
                onValueChange={setPositionId}
                disabled={!departmentId}
              >
                <SelectTrigger
                  className={cn(!departmentId && "opacity-60 cursor-not-allowed")}
                >
                  <SelectValue
                    placeholder={
                      departmentId
                        ? "Selecione um cargo"
                        : "Selecione um departamento primeiro"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredPositions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Admissão */}
            <div className="space-y-2">
              <Label htmlFor="member-hire-date">Data de Admissão</Label>
              <Input
                id="member-hire-date"
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
              />
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="member-active" className="cursor-pointer">
                  Colaborador Ativo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Colaboradores inativos não aparecem nos relatórios.
                </p>
              </div>
              <Switch
                id="member-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isEditing ? "Salvar Alterações" : "Adicionar Colaborador"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
