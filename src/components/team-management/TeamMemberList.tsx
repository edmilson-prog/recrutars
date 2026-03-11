/**
 * TeamMemberList
 * PRD-055: Listagem de colaboradores com filtros, busca e modos lista/grid.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Upload,
  List,
  LayoutGrid,
  MoreHorizontal,
  Eye,
  Pencil,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import GaugeStatusBadge from "./GaugeStatusBadge";
import TeamMemberCard from "./TeamMemberCard";
import { getArchetypeDisplayName, determineArchetype } from "@/data/gaugeProArchetypes";
import { classifyAllDimensions } from "@/lib/gaugeProScoring";

import type {
  TeamMember,
  Department,
  Position,
  GaugeStatus,
} from "@/types/teamManagement";

/** Resolve archetype name: from DB field, or computed from scores as fallback */
function resolveArchetypeName(member: TeamMember): string | null {
  if (member.archetype) return getArchetypeDisplayName(member.archetype);
  if (member.gaugeScores) {
    const classifications = classifyAllDimensions(member.gaugeScores);
    const profile = determineArchetype(member.gaugeScores, classifications);
    return profile.name;
  }
  return null;
}

interface TeamMemberListProps {
  members: TeamMember[];
  departments: Department[];
  positions: Position[];
  onViewProfile: (memberId: string) => void;
  onEdit: (member: TeamMember) => void;
  onCreate: () => void;
}

type ViewMode = "list" | "grid";

const GAUGE_STATUS_OPTIONS: { value: GaugeStatus; label: string }[] = [
  { value: "unmapped", label: "Sem Teste" },
  { value: "invited", label: "Convite Enviado" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "mapped", label: "Mapeado" },
  { value: "retest_pending", label: "Reteste Pendente" },
];

export default function TeamMemberList({
  members,
  departments,
  positions,
  onViewProfile,
  onEdit,
  onCreate,
}: TeamMemberListProps) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Lookup maps
  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d])),
    [departments],
  );
  const positionMap = useMemo(
    () => new Map(positions.map((p) => [p.id, p])),
    [positions],
  );

  // Filtered members
  const filteredMembers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return members.filter((m) => {
      // Search by name or email
      if (
        query &&
        !m.name.toLowerCase().includes(query) &&
        !m.email.toLowerCase().includes(query)
      ) {
        return false;
      }

      // Department filter
      if (departmentFilter !== "all" && m.departmentId !== departmentFilter) {
        return false;
      }

      // Gauge status filter
      if (statusFilter !== "all" && m.gaugeStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [members, search, departmentFilter, statusFilter]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <Card>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg">
            Colaboradores{" "}
            <span className="text-muted-foreground font-normal text-base">
              ({members.length})
            </span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button size="sm" onClick={onCreate}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Department filter */}
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Departamentos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {GAUGE_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View mode toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("list")}
              aria-label="Visualização em lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode("grid")}
              aria-label="Visualização em grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-muted-foreground">
          {filteredMembers.length} colaborador
          {filteredMembers.length !== 1 ? "es" : ""} encontrado
          {filteredMembers.length !== 1 ? "s" : ""}
        </p>

        {/* List view */}
        {viewMode === "list" && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status Mapeamento</TableHead>
                  <TableHead>Arquétipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhum colaborador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => {
                    const dept = departmentMap.get(member.departmentId);
                    const pos = positionMap.get(member.positionId);

                    return (
                      <motion.tr
                        key={member.id}
                        variants={staggerItem}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted/50",
                          !member.isActive && "opacity-60",
                        )}
                        onClick={() => onViewProfile(member.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={member.avatar}
                                alt={member.name}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {dept?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {pos?.title ?? "—"}
                        </TableCell>
                        <TableCell>
                          <GaugeStatusBadge status={member.gaugeStatus} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {member.gaugeStatus === "mapped"
                            ? (resolveArchetypeName(member) ?? "—")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewProfile(member.id);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(member);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredMembers.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-12">
                Nenhum colaborador encontrado.
              </p>
            ) : (
              filteredMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  department={departmentMap.get(member.departmentId)}
                  position={positionMap.get(member.positionId)}
                  onClick={() => onViewProfile(member.id)}
                />
              ))
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
