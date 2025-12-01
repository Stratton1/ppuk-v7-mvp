export interface ServerUserSession {
  id: string;
  email: string | null;
  full_name: string | null;
  primary_role: 'admin' | 'owner' | 'editor' | 'viewer';
  property_roles: Record<string, 'owner' | 'editor' | 'viewer'>;
  isAdmin: boolean;
}

export type RoleType = ServerUserSession['primary_role'];
