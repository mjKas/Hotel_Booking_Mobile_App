export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}