export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  playerId: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  role: UserRole;
  playerId: string;
  email: string;
  fullName: string;
}