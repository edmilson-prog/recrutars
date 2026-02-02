import { useState, useEffect } from "react";

import type { Department } from "@/types/teamManagement";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface DepartmentFormProps {
  department?: Department | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Department, "id" | "createdAt">) => void;
}

export default function DepartmentForm({
  department,
  open,
  onOpenChange,
  onSave,
}: DepartmentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const isEditing = !!department;

  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description ?? "");
      setIsActive(department.isActive);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
    }
  }, [department, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      isActive,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Departamento" : "Novo Departamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dept-name">Nome *</Label>
            <Input
              id="dept-name"
              placeholder="Ex: Tecnologia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-description">Descri\u00e7\u00e3o</Label>
            <Textarea
              id="dept-description"
              placeholder="Descri\u00e7\u00e3o do departamento (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="dept-active" className="cursor-pointer">
                Departamento ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Departamentos inativos n\u00e3o aparecem nas listagens padr\u00e3o.
              </p>
            </div>
            <Switch
              id="dept-active"
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
            <Button type="submit" disabled={!name.trim()}>
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
