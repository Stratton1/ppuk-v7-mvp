export type RoleType =
  | 'admin'
  | 'owner'
  | 'editor'
  | 'viewer';

export interface ServerUserSession {
  userId: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  organisation: string | null;
  primaryRole: RoleType;
  phone: string | null;
  bio: string | null;
  globalRoles: RoleType[];
  isAdmin: boolean;
}
