/**
 * Re-exported from the domain model so older imports keep working.
 *
 * Note the role names come from the backend: `REGISTERED_USER`, not `CUSTOMER`.
 */
export type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  Role,
  Role as UserRole,
  User,
  UserStatus,
} from './domain';

export { ROLE_LABELS } from './domain';
