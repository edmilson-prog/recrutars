/**
 * RBAC Engine - Motor de Resolucao de Permissoes
 * PRD-061: Sistema RBAC "Guardian"
 *
 * Ordem de resolucao:
 *   1. Override direto do usuario (grant/deny) -> retorna imediatamente
 *   2. Grupos do usuario (uniao de permissoes de todos os grupos)
 *   3. Role do usuario (permissoes associadas ao slug da role)
 *   4. Negado por padrao
 *
 * Cache interno: Map<userId, Map<permissionCode, boolean>>
 *
 * Uso: chame configureRBAC(data) para injetar dados antes de usar hasPermission().
 */

import type {
  Role,
  PermissionGroup,
  UserPermissionOverride,
  PermissionResolution,
  PermissionExplanation,
  PermissionChainStep,
} from '@/types/rbac';

// ---------------------------------------------------------------------------
// Data store injetavel (substitui imports diretos de mock)
// ---------------------------------------------------------------------------

interface RBACUser {
  id: string;
  roleId?: string;
  groupIds?: string[];
}

interface RBACDataStore {
  users: RBACUser[];
  roles: Role[];
  rolePermissions: Record<string, string[]>;
  groups: PermissionGroup[];
  overrides: UserPermissionOverride[];
}

let _store: RBACDataStore = {
  users: [],
  roles: [],
  rolePermissions: {},
  groups: [],
  overrides: [],
};

/**
 * Injeta dados no RBAC engine. Deve ser chamado antes de usar hasPermission().
 * Invalida o cache automaticamente.
 */
export function configureRBAC(data: Partial<RBACDataStore>): void {
  _store = { ..._store, ...data };
  cache.clear();
}

/**
 * Retorna se o RBAC engine ja foi configurado com dados.
 */
export function isRBACConfigured(): boolean {
  return _store.roles.length > 0;
}

// ---------------------------------------------------------------------------
// Cache interno: userId -> (permissionCode -> resultado booleano)
// ---------------------------------------------------------------------------

const cache = new Map<string, Map<string, boolean>>();

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Retorna todos os group IDs aos quais o usuario pertence, unificando
 * a propriedade `groupIds` do User com a lista `memberUserIds` de cada grupo.
 */
function getUserGroupIds(userId: string): string[] {
  const user = _store.users.find((u) => u.id === userId);
  const fromUser = new Set<string>(user?.groupIds ?? []);

  for (const group of _store.groups) {
    if (group.memberUserIds.includes(userId)) {
      fromUser.add(group.id);
    }
  }

  return Array.from(fromUser);
}

/**
 * Retorna o slug da role do usuario, ou undefined se nao houver.
 */
function getUserRoleSlug(userId: string): string | undefined {
  const user = _store.users.find((u) => u.id === userId);
  if (!user?.roleId) return undefined;

  const role = _store.roles.find((r) => r.id === user.roleId);
  return role?.slug;
}

/**
 * Verifica se uma lista de permission codes contem o codigo solicitado,
 * levando em conta o wildcard '*' (super_admin).
 */
function codesInclude(codes: string[], permissionCode: string): boolean {
  return codes.includes('*') || codes.includes(permissionCode);
}

/**
 * Coleta todos os permission codes unicos de um conjunto de grupos.
 */
function collectGroupPermissions(groupIds: string[]): string[] {
  const codes = new Set<string>();
  for (const gid of groupIds) {
    const group = _store.groups.find((g) => g.id === gid);
    if (group) {
      for (const code of group.permissionCodes) {
        codes.add(code);
      }
    }
  }
  return Array.from(codes);
}

// ---------------------------------------------------------------------------
// API publica
// ---------------------------------------------------------------------------

/**
 * Verifica se o usuario possui determinada permissao.
 *
 * Resolucao:
 *   1. Override (grant -> true, deny -> false)
 *   2. Grupos (uniao de permissoes de todos os grupos do usuario)
 *   3. Role (permissoes mapeadas pelo slug da role)
 *   4. Negado por padrao (false)
 */
export function hasPermission(userId: string, permissionCode: string): boolean {
  // Consulta cache
  const userCache = cache.get(userId);
  if (userCache?.has(permissionCode)) {
    return userCache.get(permissionCode)!;
  }

  const result = resolvePermission(userId, permissionCode);

  // Armazena no cache
  if (!cache.has(userId)) {
    cache.set(userId, new Map());
  }
  cache.get(userId)!.set(permissionCode, result);

  return result;
}

/**
 * Resolve a permissao sem usar cache (logica pura).
 */
function resolvePermission(userId: string, permissionCode: string): boolean {
  // 1. Overrides
  const override = _store.overrides.find(
    (o) => o.userId === userId && o.permissionCode === permissionCode,
  );
  if (override) {
    return override.type === 'grant';
  }

  // 2. Grupos
  const groupIds = getUserGroupIds(userId);
  if (groupIds.length > 0) {
    const groupCodes = collectGroupPermissions(groupIds);
    if (codesInclude(groupCodes, permissionCode)) {
      return true;
    }
  }

  // 3. Role
  const roleSlug = getUserRoleSlug(userId);
  if (roleSlug) {
    const roleCodes = _store.rolePermissions[roleSlug] ?? [];
    if (codesInclude(roleCodes, permissionCode)) {
      return true;
    }
  }

  // 4. Negado por padrao
  return false;
}

/**
 * Retorna todas as permissoes efetivas de um usuario, indicando a fonte de
 * cada uma (override, group, role ou default).
 *
 * Percorre o catalogo completo de permission codes conhecidos e resolve
 * cada um individualmente.
 */
export function getEffectivePermissions(userId: string): PermissionResolution[] {
  // Coletar todos os codigos de permissao conhecidos no sistema
  const allCodes = new Set<string>();

  // Dos mapeamentos de role
  for (const codes of Object.values(_store.rolePermissions)) {
    for (const code of codes) {
      if (code !== '*') allCodes.add(code);
    }
  }

  // Dos grupos
  for (const group of _store.groups) {
    for (const code of group.permissionCodes) {
      allCodes.add(code);
    }
  }

  // Dos overrides
  for (const override of _store.overrides) {
    allCodes.add(override.permissionCode);
  }

  const results: PermissionResolution[] = [];

  for (const code of allCodes) {
    const explanation = getPermissionExplanation(userId, code);
    const lastStep = explanation.chain[explanation.chain.length - 1];

    let source: PermissionResolution['source'] = 'default';
    if (lastStep) {
      if (lastStep.source === 'override') source = 'override';
      else if (lastStep.source === 'group') source = 'group';
      else if (lastStep.source === 'role') source = 'role';
      else source = 'default';
    }

    results.push({
      code,
      granted: explanation.granted,
      source,
      detail: lastStep?.detail,
    });
  }

  return results;
}

/**
 * Retorna a cadeia completa de resolucao de uma permissao para um usuario,
 * mostrando cada etapa verificada, o resultado e o detalhe.
 */
export function getPermissionExplanation(
  userId: string,
  code: string,
): PermissionExplanation {
  const chain: PermissionChainStep[] = [];
  const user = _store.users.find((u) => u.id === userId);

  if (!user) {
    chain.push({
      step: 'Verificar usuario',
      source: 'default',
      result: false,
      detail: `Usuario "${userId}" nao encontrado no sistema.`,
    });
    return { code, granted: false, chain };
  }

  // ----- 1. Override -----
  const override = _store.overrides.find(
    (o) => o.userId === userId && o.permissionCode === code,
  );

  if (override) {
    const granted = override.type === 'grant';
    chain.push({
      step: 'Override direto',
      source: 'override',
      result: granted,
      detail: granted
        ? `Permissao "${code}" concedida via override direto. Motivo: ${override.reason}`
        : `Permissao "${code}" negada via override direto. Motivo: ${override.reason}`,
    });
    return { code, granted, chain };
  }

  chain.push({
    step: 'Override direto',
    source: 'override',
    result: false,
    detail: `Nenhum override encontrado para "${code}".`,
  });

  // ----- 2. Grupos -----
  const groupIds = getUserGroupIds(userId);

  if (groupIds.length > 0) {
    const matchingGroups: string[] = [];

    for (const gid of groupIds) {
      const group = _store.groups.find((g) => g.id === gid);
      if (group && group.permissionCodes.includes(code)) {
        matchingGroups.push(group.name);
      }
    }

    if (matchingGroups.length > 0) {
      chain.push({
        step: 'Grupos de permissao',
        source: 'group',
        result: true,
        detail: `Permissao "${code}" concedida via grupo(s): ${matchingGroups.join(', ')}.`,
      });
      return { code, granted: true, chain };
    }

    chain.push({
      step: 'Grupos de permissao',
      source: 'group',
      result: false,
      detail: `Usuario pertence a ${groupIds.length} grupo(s), mas nenhum concede "${code}".`,
    });
  } else {
    chain.push({
      step: 'Grupos de permissao',
      source: 'group',
      result: false,
      detail: 'Usuario nao pertence a nenhum grupo.',
    });
  }

  // ----- 3. Role -----
  const roleSlug = getUserRoleSlug(userId);

  if (roleSlug) {
    const roleCodes = _store.rolePermissions[roleSlug] ?? [];
    const role = _store.roles.find((r) => r.slug === roleSlug);
    const roleName = role?.name ?? roleSlug;

    if (codesInclude(roleCodes, code)) {
      const isWildcard = roleCodes.includes('*');
      chain.push({
        step: 'Role do usuario',
        source: 'role',
        result: true,
        detail: isWildcard
          ? `Permissao "${code}" concedida via role "${roleName}" (acesso total — wildcard).`
          : `Permissao "${code}" concedida via role "${roleName}".`,
      });
      return { code, granted: true, chain };
    }

    chain.push({
      step: 'Role do usuario',
      source: 'role',
      result: false,
      detail: `Role "${roleName}" nao inclui a permissao "${code}".`,
    });
  } else {
    chain.push({
      step: 'Role do usuario',
      source: 'role',
      result: false,
      detail: 'Usuario nao possui role atribuida.',
    });
  }

  // ----- 4. Negado por padrao -----
  chain.push({
    step: 'Padrao',
    source: 'default',
    result: false,
    detail: `Permissao "${code}" negada por padrao (nenhuma fonte concedeu acesso).`,
  });

  return { code, granted: false, chain };
}

/**
 * Invalida o cache de permissoes.
 *
 * @param userId - Se informado, invalida apenas o cache do usuario.
 *                 Se omitido, limpa o cache de todos os usuarios.
 */
export function invalidateCache(userId?: string): void {
  if (userId) {
    cache.delete(userId);
  } else {
    cache.clear();
  }
}
