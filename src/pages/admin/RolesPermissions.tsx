/**
 * Admin Roles & Permissions Page
 * PRD-061: Matriz visual de permissoes por papel
 */

import { useState, useEffect, useMemo, Fragment } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Plus, Edit, Trash2, Lock, Save, X, Check, Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { useRoles, usePermissions } from '@/hooks/useRBACQuery';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Role, Permission } from '@/types/rbac';

// Group permissions by category
function getPermsByCategory(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);
}

function roleHasPermission(role: Role, code: string): boolean {
  if (role.permissions.includes('*')) return true;
  return role.permissions.includes(code);
}

interface RoleFormData {
  name: string;
  slug: string;
  description: string;
  type: 'admin' | 'company';
  level: number;
  permissions: string[];
}

const emptyRoleForm: RoleFormData = {
  name: '',
  slug: '',
  description: '',
  type: 'admin',
  level: 50,
  permissions: [],
};

export default function AdminRolesPermissions() {
  const { data: fetchedRoles = [], isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: fetchedPermissions = [], isLoading: permsLoading, error: permsError } = usePermissions();

  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoleFormData>(emptyRoleForm);

  // Sync fetched roles into local state on every RQ refetch
  useEffect(() => {
    if (fetchedRoles.length > 0) {
      setRoles([...fetchedRoles]);
    }
  }, [fetchedRoles]);

  const isLoading = rolesLoading || permsLoading;
  const error = rolesError || permsError;

  const permsByCategory = getPermsByCategory(fetchedPermissions);

  // Separate system vs custom
  const systemRoles = roles.filter(r => r.isSystem);
  const customRoles = roles.filter(r => !r.isSystem);

  const handleTogglePermission = (roleId: string, permCode: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== roleId || role.isSystem) return role;
      const hasIt = role.permissions.includes(permCode);
      return {
        ...role,
        permissions: hasIt
          ? role.permissions.filter(p => p !== permCode)
          : [...role.permissions, permCode],
      };
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyRoleForm);
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    if (role.isSystem) return;
    setEditingId(role.id);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description,
      type: role.type as 'admin' | 'company',
      level: role.level,
      permissions: [...role.permissions],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.slug.trim()) return;

    if (editingId) {
      setRoles(prev => prev.map(r =>
        r.id === editingId
          ? {
              ...r,
              name: form.name,
              slug: form.slug,
              description: form.description,
              type: form.type,
              level: form.level,
              permissions: form.permissions,
            }
          : r
      ));
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: form.name,
        slug: form.slug,
        type: form.type,
        level: form.level,
        description: form.description,
        isSystem: false,
        permissions: form.permissions,
        createdAt: new Date().toISOString(),
      };
      setRoles(prev => [...prev, newRole]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) return;
    setRoles(prev => prev.filter(r => r.id !== roleId));
  };

  const toggleFormPermission = (code: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter(c => c !== code)
        : [...prev.permissions, code],
    }));
  };

  // For the matrix, show only admin-type and system roles
  const matrixRoles = roles.filter(r => r.type === 'system' || r.type === 'admin');

  return (
    <DashboardLayout userType="admin">
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 py-12 justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Carregando papeis e permissoes...</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          <p>Erro ao carregar dados: {(error as Error).message}</p>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Papéis e Permissões</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gerencie papéis e visualize a matriz de permissões do sistema RBAC.
              </p>
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Papel
            </Button>
          </div>
        </motion.div>

        <AdminTabNav />

        {/* Role Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'bg-card rounded-xl p-5 shadow-soft border transition-shadow',
                role.isSystem && 'border-primary/20'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  role.isSystem
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {role.isSystem ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                {!role.isSystem && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(role)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(role.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-foreground">{role.name}</h3>
                {role.isSystem && (
                  <Badge variant="outline" className="text-[10px] px-1">Sistema</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{role.description}</p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Nivel: {role.level}</span>
                <span>Tipo: {role.type}</span>
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-[10px]">
                  {role.permissions.includes('*') ? 'Todas' : role.permissions.length} permissoes
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Permission Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl shadow-soft overflow-hidden"
        >
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-foreground">Matriz de Permissoes</h2>
            <p className="text-sm text-muted-foreground">
              Permissoes de papeis do tipo Sistema e Admin. Papeis de sistema nao podem ser editados.
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] sticky left-0 bg-card z-10">Permissao</TableHead>
                  {matrixRoles.map(role => (
                    <TableHead key={role.id} className="text-center min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold">{role.name}</span>
                        {role.isSystem && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(permsByCategory).map(([category, perms]) => (
                  <Fragment key={category}>
                    {/* Category header row */}
                    <TableRow>
                      <TableCell
                        colSpan={matrixRoles.length + 1}
                        className="bg-muted/50 font-semibold text-sm sticky left-0"
                      >
                        {category}
                      </TableCell>
                    </TableRow>
                    {/* Permission rows */}
                    {perms.map(perm => (
                      <TableRow key={perm.code}>
                        <TableCell className="sticky left-0 bg-card z-10">
                          <div>
                            <span className="text-sm font-medium">{perm.displayName}</span>
                            <span className="text-xs text-muted-foreground ml-2 font-mono hidden lg:inline">
                              {perm.code}
                            </span>
                          </div>
                        </TableCell>
                        {matrixRoles.map(role => {
                          const has = roleHasPermission(role, perm.code);
                          return (
                            <TableCell key={`${role.id}-${perm.code}`} className="text-center">
                              <Checkbox
                                checked={has}
                                disabled={role.isSystem}
                                onCheckedChange={() => handleTogglePermission(role.id, perm.code)}
                                aria-label={`${role.name} - ${perm.displayName}`}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Create/Edit Role Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Papel' : 'Novo Papel'}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Atualize as informacoes deste papel customizado.'
                  : 'Crie um novo papel com permissoes especificas.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Nome</Label>
                  <Input
                    id="role-name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Analista de Dados"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-slug">Slug</Label>
                  <Input
                    id="role-slug"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Ex: analyst"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-desc">Descricao</Label>
                <Input
                  id="role-desc"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva as responsabilidades deste papel..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm(prev => ({ ...prev, type: v as 'admin' | 'company' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="company">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-level">Nivel (1-100)</Label>
                  <Input
                    id="role-level"
                    type="number"
                    min={1}
                    max={100}
                    value={form.level}
                    onChange={(e) => setForm(prev => ({ ...prev, level: parseInt(e.target.value) || 50 }))}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-semibold">Permissoes</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione as permissoes para este papel.
                </p>
                <div className="space-y-6">
                  {Object.entries(permsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-foreground mb-2">{category}</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {perms.map(perm => (
                          <div key={perm.code} className="flex items-center gap-2">
                            <Checkbox
                              id={`rperm-${perm.code}`}
                              checked={form.permissions.includes(perm.code)}
                              onCheckedChange={() => toggleFormPermission(perm.code)}
                            />
                            <label htmlFor={`rperm-${perm.code}`} className="text-sm cursor-pointer">
                              {perm.displayName}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.name.trim() || !form.slug.trim()}>
                {editingId ? 'Salvar' : 'Criar Papel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      )}
    </DashboardLayout>
  );
}
