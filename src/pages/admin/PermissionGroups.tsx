/**
 * Admin Permission Groups Page
 * PRD-061: Gestao de Grupos de Permissao
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UsersRound, Plus, Edit, Trash2, Search, Shield, Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { mockUsers } from '@/data/mockData';
import { mockGroups, mockPermissions } from '@/data/rbacData';
import { cn } from '@/lib/utils';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import type { PermissionGroup } from '@/types/rbac';

// Group permissions by category
function getPermissionsByCategory() {
  return mockPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof mockPermissions>);
}

interface GroupFormData {
  name: string;
  description: string;
  permissionCodes: string[];
  memberUserIds: string[];
}

const emptyForm: GroupFormData = {
  name: '',
  description: '',
  permissionCodes: [],
  memberUserIds: [],
};

export default function AdminPermissionGroups() {
  const [groups, setGroups] = useState<PermissionGroup[]>([...mockGroups]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GroupFormData>(emptyForm);

  const permsByCategory = getPermissionsByCategory();

  const filteredGroups = groups.filter(g => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (group: PermissionGroup) => {
    setEditingId(group.id);
    setForm({
      name: group.name,
      description: group.description,
      permissionCodes: [...group.permissionCodes],
      memberUserIds: [...group.memberUserIds],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editingId) {
      setGroups(prev => prev.map(g =>
        g.id === editingId
          ? { ...g, name: form.name, description: form.description, permissionCodes: form.permissionCodes, memberUserIds: form.memberUserIds }
          : g
      ));
    } else {
      const newGroup: PermissionGroup = {
        id: `group-${Date.now()}`,
        name: form.name,
        description: form.description,
        permissionCodes: form.permissionCodes,
        memberUserIds: form.memberUserIds,
        createdAt: new Date().toISOString(),
      };
      setGroups(prev => [...prev, newGroup]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const togglePermission = (code: string) => {
    setForm(prev => ({
      ...prev,
      permissionCodes: prev.permissionCodes.includes(code)
        ? prev.permissionCodes.filter(c => c !== code)
        : [...prev.permissionCodes, code],
    }));
  };

  const toggleMember = (userId: string) => {
    setForm(prev => ({
      ...prev,
      memberUserIds: prev.memberUserIds.includes(userId)
        ? prev.memberUserIds.filter(id => id !== userId)
        : [...prev.memberUserIds, userId],
    }));
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user?.name || userId;
  };

  return (
    <DashboardLayout userType="admin">
      <AdminTabNav />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Grupos de Permissao</h1>
            <p className="text-muted-foreground">Organize usuarios em grupos com permissoes compartilhadas</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Grupo
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Groups Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-6 shadow-soft border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UsersRound className="w-5 h-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(group)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(group.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-1">{group.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {group.permissionCodes.length} permissoes
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {group.memberUserIds.length} membros
                </div>
              </div>

              {/* Permission preview */}
              <div className="flex flex-wrap gap-1 mt-3">
                {group.permissionCodes.slice(0, 3).map(code => (
                  <Badge key={code} variant="secondary" className="text-[10px]">
                    {code}
                  </Badge>
                ))}
                {group.permissionCodes.length > 3 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{group.permissionCodes.length - 3}
                  </Badge>
                )}
              </div>

              {/* Member avatars preview */}
              {group.memberUserIds.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-1">
                    {group.memberUserIds.slice(0, 4).map(userId => (
                      <Badge key={userId} variant="outline" className="text-[10px]">
                        {getUserName(userId)}
                      </Badge>
                    ))}
                    {group.memberUserIds.length > 4 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{group.memberUserIds.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <UsersRound className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nenhum grupo encontrado</p>
            <p className="text-sm">Crie um grupo para organizar permissoes de usuarios.</p>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Atualize as informacoes e permissoes do grupo.'
                  : 'Crie um novo grupo de permissao para organizar usuarios.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Nome do Grupo</Label>
                  <Input
                    id="group-name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Equipe de Suporte"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-desc">Descricao</Label>
                  <Input
                    id="group-desc"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o proposito deste grupo..."
                  />
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div>
                <Label className="text-base font-semibold">Permissoes</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione as permissoes que serao concedidas a todos os membros do grupo.
                </p>

                <div className="space-y-6">
                  {Object.entries(permsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-foreground mb-2">{category}</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {perms.map(perm => (
                          <div key={perm.code} className="flex items-center gap-2">
                            <Checkbox
                              id={`perm-${perm.code}`}
                              checked={form.permissionCodes.includes(perm.code)}
                              onCheckedChange={() => togglePermission(perm.code)}
                            />
                            <label
                              htmlFor={`perm-${perm.code}`}
                              className="text-sm cursor-pointer"
                              title={perm.description}
                            >
                              {perm.displayName}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Members */}
              <div>
                <Label className="text-base font-semibold">Membros</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione usuarios a este grupo.
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`member-${user.id}`}
                        checked={form.memberUserIds.includes(user.id)}
                        onCheckedChange={() => toggleMember(user.id)}
                      />
                      <label htmlFor={`member-${user.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                        <span>{user.name}</span>
                        <Badge variant="outline" className="text-[10px]">{user.type}</Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.name.trim()}>
                {editingId ? 'Salvar' : 'Criar Grupo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
