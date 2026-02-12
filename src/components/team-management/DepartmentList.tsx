import { Plus, Pencil, ToggleLeft, ToggleRight, Building2 } from "lucide-react";

import type { Department, Position } from "@/types/teamManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DepartmentListProps {
  departments: Department[];
  positions: Position[];
  onEdit: (dept: Department) => void;
  onToggleActive: (deptId: string) => void;
  onCreate: () => void;
}

export default function DepartmentList({
  departments,
  positions,
  onEdit,
  onToggleActive,
  onCreate,
}: DepartmentListProps) {
  const positionCountByDept = (deptId: string) =>
    positions.filter((p) => p.departmentId === deptId).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Departamentos</CardTitle>
        <Button size="sm" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Departamento
        </Button>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Building2 className="h-10 w-10 mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium">Nenhum departamento cadastrado</p>
            <p className="text-xs mt-1">
              Clique em &quot;Novo Departamento&quot; para criar o primeiro.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Cargos</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-muted-foreground">
                    {dept.description || "\u2014"}
                  </TableCell>
                  <TableCell className="text-center">
                    {positionCountByDept(dept.id)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={dept.isActive ? "default" : "secondary"}
                      className={cn(
                        dept.isActive
                          ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      {dept.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(dept)}
                        title="Editar departamento"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleActive(dept.id)}
                        title={dept.isActive ? "Desativar" : "Ativar"}
                      >
                        {dept.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
