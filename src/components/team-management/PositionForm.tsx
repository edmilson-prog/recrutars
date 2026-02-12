import { useState, useEffect } from "react";

import type { Department, Position, HierarchyLevel } from "@/types/teamManagement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";

interface PositionFormProps {
  position?: Position | null;
  departments: Department[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Position, "id">) => void;
}

const levelOptions: { value: HierarchyLevel; label: string }[] = [
  { value: "operational", label: "Operacional" },
  { value: "tactical", label: "Tático" },
  { value: "strategic", label: "Estratégico" },
];

export default function PositionForm({
  position,
  departments,
  open,
  onOpenChange,
  onSave,
}: PositionFormProps) {
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState<HierarchyLevel>("operational");
  const [isActive, setIsActive] = useState(true);

  const isEditing = !!position;

  useEffect(() => {
    if (position) {
      setTitle(position.title);
      setDepartmentId(position.departmentId);
      setLevel(position.level);
      setIsActive(position.isActive);
    } else {
      setTitle("");
      setDepartmentId("");
      setLevel("operational");
      setIsActive(true);
    }
  }, [position, open]);

  const canSubmit = title.trim() !== "" && departmentId !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSave({
      title: title.trim(),
      departmentId,
      level,
      isActive,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cargo" : "Novo Cargo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pos-title">Título *</Label>
            <Input
              id="pos-title"
              placeholder="Ex: Desenvolvedor Sênior"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pos-department">Departamento *</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id="pos-department">
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

          <div className="space-y-2">
            <Label htmlFor="pos-level">Nível hierárquico *</Label>
            <Select value={level} onValueChange={(v) => setLevel(v as HierarchyLevel)}>
              <SelectTrigger id="pos-level">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="pos-active" className="cursor-pointer">
                Cargo ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Cargos inativos não aparecem nas listagens padrão.
              </p>
            </div>
            <Switch
              id="pos-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
