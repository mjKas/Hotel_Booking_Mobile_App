export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}