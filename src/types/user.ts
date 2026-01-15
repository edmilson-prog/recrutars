/**
 * Types for Users
 * PRD-004: Tipos e Interfaces TypeScript
 */

export type UserType = 'admin' | 'company' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  avatar?: string;
  createdAt: string;
}
