import type { PropertyPermission, PropertyStatus, ServerUserSession } from '@/types/auth';

/**
 * File: role-utils.ts
 * Purpose: Helper utilities for property roles and access management
 */

/**
 * Available access markers (statuses + permissions)
 */
export type PropertyRole = PropertyStatus | PropertyPermission | 'admin';

/**
 * Access status based on expiry date
 */
export type AccessStatus = 'active' | 'expiring' | 'expired';

/**
 * Roles allowed to upload media
 */
export const MEDIA_UPLOAD_ROLES = ['owner', 'editor', 'admin'] as const;

/**
 * Roles allowed to delete media
 */
export const MEDIA_DELETE_ROLES = ['owner', 'editor', 'admin'] as const;

/**
 * Roles allowed to delete documents
 */
export const DOCUMENT_DELETE_ROLES = ['owner', 'editor', 'admin'] as const;

/**
 * Role configuration with labels, icons, and descriptions
 */
export const ROLE_CONFIG: Record<
  PropertyRole,
  { label: string; icon: string; description: string; color: string }
> = {
  owner: {
    label: 'Owner',
    icon: '🏠',
    description: 'Property owner with full access',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  buyer: {
    label: 'Buyer',
    icon: '🛒',
    description: 'Interested buyer with viewing rights',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  tenant: {
    label: 'Tenant',
    icon: '🧾',
    description: 'Tenant with viewing rights',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  },
  editor: {
    label: 'Editor',
    icon: '✏️',
    description: 'Can edit property details, documents, media, and tasks',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  viewer: {
    label: 'Viewer',
    icon: '👁️',
    description: 'Read-only access to property information',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  admin: {
    label: 'Administrator',
    icon: '🛡️',
    description: 'System administrator with full access',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
};

/**
 * Get human-readable label for role
 */
export function getRoleLabel(role: string): string {
  return ROLE_CONFIG[role as PropertyRole]?.label || role;
}

/**
 * Get icon for role
 */
export function getRoleIcon(role: string): string {
  return ROLE_CONFIG[role as PropertyRole]?.icon || '👤';
}

/**
 * Get description for role
 */
export function getRoleDescription(role: string): string {
  return ROLE_CONFIG[role as PropertyRole]?.description || '';
}

/**
 * Get color classes for role
 */
export function getRoleColor(role: string): string {
  return ROLE_CONFIG[role as PropertyRole]?.color || 'bg-gray-100 text-gray-800';
}

/**
 * Calculate access status based on expiry date
 * @param expiresAt - ISO date string or null (null = never expires)
 * @returns 'active' | 'expiring' | 'expired'
 */
export function getAccessStatus(expiresAt: string | null): AccessStatus {
  // No expiry date = permanent access
  if (!expiresAt) {
    return 'active';
  }

  const now = new Date();
  const expiry = new Date(expiresAt);
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return 'expired';
  } else if (daysLeft <= 7) {
    return 'expiring';
  } else {
    return 'active';
  }
}

/**
 * Get badge variant based on access status
 */
export function getStatusVariant(status: AccessStatus): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'expiring':
      return 'secondary';
    case 'expired':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Calculate days remaining until expiry
 * @param expiresAt - ISO date string or null
 * @returns number of days remaining, or null if no expiry
 */
export function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) {
    return null;
  }

  const now = new Date();
  const expiry = new Date(expiresAt);
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return daysLeft;
}

/**
 * Format expiry date for display
 * @param expiresAt - ISO date string or null
 * @returns formatted string or 'No expiry'
 */
export function formatExpiryDate(expiresAt: string | null): string {
  if (!expiresAt) {
    return 'No expiry';
  }

  const expiry = new Date(expiresAt);
  const days = daysRemaining(expiresAt);

  // Format the date
  const formatted = expiry.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Add days remaining context
  if (days === null) {
    return formatted;
  } else if (days < 0) {
    return `${formatted} (expired ${Math.abs(days)} days ago)`;
  } else if (days === 0) {
    return `${formatted} (expires today)`;
  } else if (days === 1) {
    return `${formatted} (expires tomorrow)`;
  } else if (days <= 7) {
    return `${formatted} (${days} days left)`;
  } else {
    return formatted;
  }
}

/**
 * Sort access markers by priority
 * Owner > Editor > Viewer > Buyer > Tenant > Admin (fallback)
 */
export function sortRoles(roles: string[]): string[] {
  const priority: Record<string, number> = {
    owner: 1,
    editor: 2,
    viewer: 3,
    buyer: 4,
    tenant: 5,
    admin: 6,
  };

  return roles.sort((a, b) => {
    const aPriority = priority[a] ?? 999;
    const bPriority = priority[b] ?? 999;
    return aPriority - bPriority;
  });
}

// -----------------------------------------------------------------------------
// Session-aware helpers (v7)
// -----------------------------------------------------------------------------

export function isAdmin(session: ServerUserSession | null | undefined): boolean {
  return Boolean(session?.isAdmin || session?.primary_role === 'admin');
}

export function isOwner(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  if (!session) return false;
  if (isAdmin(session)) return true;
  return (session.property_roles[propertyId]?.status ?? []).includes('owner');
}

export function isBuyer(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  if (!session) return false;
  return (session.property_roles[propertyId]?.status ?? []).includes('buyer');
}

export function isTenant(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  if (!session) return false;
  return (session.property_roles[propertyId]?.status ?? []).includes('tenant');
}

export function isEditor(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  if (!session) return false;
  if (isAdmin(session)) return true;
  const info = session.property_roles[propertyId];
  if (!info) return false;
  return info.permission === 'editor' || (info.status ?? []).includes('owner');
}

export function isViewer(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  if (!session) return false;
  if (isAdmin(session)) return true;
  const info = session.property_roles[propertyId];
  const statuses = info?.status ?? [];
  return (
    isEditor(session, propertyId) ||
    info?.permission === 'viewer' ||
    statuses.includes('buyer') ||
    statuses.includes('tenant')
  );
}

export function canEditProperty(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  return isEditor(session, propertyId);
}

export function canViewProperty(
  session: ServerUserSession | null | undefined,
  propertyId: string,
  opts?: { isPublic?: boolean }
): boolean {
  if (isAdmin(session)) return true;
  if (opts?.isPublic) return true;
  return isViewer(session, propertyId);
}

export function canUploadDocument(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  return isEditor(session, propertyId);
}

export function canUploadMedia(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  return isEditor(session, propertyId);
}

export function canInvite(session: ServerUserSession | null | undefined, propertyId: string): boolean {
  if (!session) return false;
  if (isAdmin(session)) return true;
  return isOwner(session, propertyId);
}
