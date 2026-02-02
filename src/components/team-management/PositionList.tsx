import { Plus, Pencil, ToggleLeft, ToggleRight, Briefcase } from "lucide-react";

import type { Department, Position, HierarchyLevel } from "@/types/teamManagement";
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

interface PositionListProps {
  positions: Position[];
  departments: Department[];
  onEdit: (pos: Position) => void;
  onToggleActive: (posId: string) => void;
  onCreate: () => void;
}

const levelLabels: Record<HierarchyLevel, string> = {
  operational: "Operacional",
  tactical: "T\u00e1tico",
  strategic: "Estrat\u00e9gico",
};

const levelBadgeStyles: Record<HierarchyLevel, string> = {
  operational:
    "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  tactical:
    "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  strategic:
    "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
};

export default function PositionList({
  positions,
  departments,
  onEdit,
  onToggleActive,
  onCreate,
}: PositionListProps) {
  const deptMap = new Map(departments.map((d) => [d.id, d]));

  const grouped = departments.map((dept) => ({
    department: dept,
    positions: positions.filter((p) => p.departmentId === dept.id),
  })).filter((g) => g.positions.length > 0);

  const orphanPositions = positions.filter(
    (p) => !deptMap.has(p.departmentId)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Cargos</CardTitle>
        <Button size="sm" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Briefcase className="h-10 w-10 mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium">Nenhum cargo cadastrado</p>
            <p className="text-xs mt-1">
              Clique em &quot;Novo Cargo&quot; para criar o primeiro.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ department: dept, positions: deptPositions }) => (
              <div key={dept.id}>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {dept.name}
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-center">N\u00edvel</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">A\u00e7\u00f5es</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deptPositions.map((pos) => (
                      <TableRow key={pos.id}>
                        <TableCell className="font-medium">
                          {pos.title}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(levelBadgeStyles[pos.level])}
                          >
                            {levelLabels[pos.level]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={pos.isActive ? "default" : "secondary"}
                            className={cn(
                              pos.isActive
                                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                            )}
                          >
                            {pos.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(pos)}
                              title="Editar cargo"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onToggleActive(pos.id)}
                              title={pos.isActive ? "Desativar" : "Ativar"}
                            >
                              {pos.isActive ? (
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
              </div>
            ))}

            {orphanPositions.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Sem departamento
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-center">N\u00edvel</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">A\u00e7\u00f5es</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orphanPositions.map((pos) => (
                      <TableRow key={pos.id}>
                        <TableCell className="font-medium">
                          {pos.title}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(levelBadgeStyles[pos.level])}
                          >
                            {levelLabels[pos.level]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={pos.isActive ? "default" : "secondary"}
                            className={cn(
                              pos.isActive
                                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                            )}
                          >
                            {pos.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(pos)}
                              title="Editar cargo"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onToggleActive(pos.id)}
                              title={pos.isActive ? "Desativar" : "Ativar"}
                            >
                              {pos.isActive ? (
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
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
