export type PrimaryRole = 'consumer' | 'agent' | 'conveyancer' | 'surveyor' | 'admin';

export type PropertyStatus = 'owner' | 'buyer' | 'tenant';
export type PropertyPermission = 'editor' | 'viewer';

export interface PropertyRoleInfo {
  status: PropertyStatus[];
  permission: PropertyPermission | null;
}

export interface ServerUserSession {
  id: string;
  email: string | null;
  full_name: string | null;
  primary_role: PrimaryRole | null;
  property_roles: Record<string, PropertyRoleInfo>;
  isAdmin: boolean;
}

export type RoleType = PrimaryRole;
