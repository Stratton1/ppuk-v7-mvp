/**
 * File: role-utils.ts
 * Purpose: Helper utilities for property roles and access management
 */

/**
 * Available property roles
 */
export type PropertyRole = 'owner' | 'buyer' | 'tenant' | 'agent' | 'surveyor' | 'conveyancer' | 'viewer' | 'admin';

/**
 * Access status based on expiry date
 */
export type AccessStatus = 'active' | 'expiring' | 'expired';

/**
 * Roles allowed to upload media
 */
export const MEDIA_UPLOAD_ROLES = ['owner', 'admin', 'agent', 'surveyor'] as const;

/**
 * Roles allowed to delete media
 */
export const MEDIA_DELETE_ROLES = ['owner', 'admin', 'agent', 'surveyor'] as const;

/**
 * Roles allowed to delete documents
 */
export const DOCUMENT_DELETE_ROLES = ['owner', 'admin', 'agent', 'conveyancer'] as const;

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
    icon: '💰',
    description: 'Prospective buyer with time-limited access',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  tenant: {
    label: 'Tenant',
    icon: '🔑',
    description: 'Current or prospective tenant',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  agent: {
    label: 'Estate Agent',
    icon: '🏢',
    description: 'Real estate agent managing the property',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  surveyor: {
    label: 'Surveyor',
    icon: '📐',
    description: 'Property surveyor with inspection access',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  conveyancer: {
    label: 'Conveyancer',
    icon: '⚖️',
    description: 'Legal conveyancer handling property transfer',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
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
 * Sort roles by priority
 * Owner > Admin > Agent > Conveyancer > Surveyor > Buyer > Tenant > Viewer
 */
export function sortRoles(roles: string[]): string[] {
  const priority: Record<string, number> = {
    owner: 1,
    admin: 2,
    agent: 3,
    conveyancer: 4,
    surveyor: 5,
    buyer: 6,
    tenant: 7,
    viewer: 8,
  };

  return roles.sort((a, b) => {
    const aPriority = priority[a] || 999;
    const bPriority = priority[b] || 999;
    return aPriority - bPriority;
  });
}
