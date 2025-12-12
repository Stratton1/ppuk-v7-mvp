import type { ServerUserSession } from '@/types/auth';

export type DashboardRole = 'owner' | 'buyer' | 'agent' | 'conveyancer' | 'admin';

type RoleMeta = {
  label: string;
  icon: string;
  description: string;
};

const ROLE_META: Record<DashboardRole, RoleMeta> = {
  owner: { label: 'Owner', icon: '🏠', description: 'Property owner with full access' },
  buyer: { label: 'Buyer', icon: '🛒', description: 'Prospective buyer with view access' },
  agent: { label: 'Agent', icon: '📋', description: 'Agent managing listings' },
  conveyancer: { label: 'Conveyancer', icon: '📑', description: 'Legal reviewer' },
  admin: { label: 'Admin', icon: '🛡️', description: 'System administrator' },
};

export function getRoleLabel(role: DashboardRole) {
  return ROLE_META[role].label;
}

export function getRoleIcon(role: DashboardRole) {
  return ROLE_META[role].icon;
}

export function getRoleDescription(role: DashboardRole) {
  return ROLE_META[role].description;
}

export function isAdmin(user?: ServerUserSession | null) {
  return Boolean(user?.isAdmin);
}

export function isAgent(user?: ServerUserSession | null) {
  return user?.primary_role === 'agent';
}

export function isConveyancer(user?: ServerUserSession | null) {
  return user?.primary_role === 'conveyancer';
}

export function isOwner(user?: ServerUserSession | null) {
  if (!user) return false;
  return Object.values(user.property_roles ?? {}).some((role) => role.status.includes('owner'));
}

export function isBuyer(user?: ServerUserSession | null) {
  if (!user) return false;
  return (
    user.primary_role === 'consumer' ||
    Object.values(user.property_roles ?? {}).some((role) => role.status.includes('buyer'))
  );
}

export function canViewDocumentsUI(role: DashboardRole) {
  return role === 'owner' || role === 'agent' || role === 'conveyancer' || role === 'admin';
}

export function canViewIssuesUI(role: DashboardRole) {
  return role !== 'buyer';
}

export function canViewMediaUI(role: DashboardRole) {
  return role === 'owner' || role === 'agent' || role === 'conveyancer' || role === 'admin';
}

export function canSeeAdminPanel(role: DashboardRole) {
  return role === 'admin';
}

export function getDefaultDashboardTabs(role: DashboardRole): Array<
  'overview' | 'properties' | 'invitations' | 'issues' | 'documents' | 'media' | 'activity'
> {
  switch (role) {
    case 'buyer':
      return ['overview', 'properties', 'invitations', 'issues', 'activity'];
    case 'agent':
    case 'conveyancer':
      return ['overview', 'properties', 'invitations', 'issues', 'documents', 'media', 'activity'];
    case 'admin':
      return ['overview', 'properties', 'issues', 'documents', 'media', 'activity'];
    case 'owner':
    default:
      return ['overview', 'properties', 'invitations', 'issues', 'documents', 'media', 'activity'];
  }
}
