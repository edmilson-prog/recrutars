/**
 * Types for Users
 * PRD-004: Tipos e Interfaces TypeScript
 * PRD-061: RBAC fields
 */

import type { UserStatus } from './rbac';

export type UserType = 'admin' | 'company' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  avatar?: string;
  createdAt: string;
  roleId?: string;
  status?: UserStatus;
  lastAccessAt?: string;
  groupIds?: string[];
}
