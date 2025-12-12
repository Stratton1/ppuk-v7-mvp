import { describe, expect, it } from 'vitest';
import {
  canSeeAdminPanel,
  canViewDocumentsUI,
  canViewIssuesUI,
  canViewMediaUI,
  getDefaultDashboardTabs,
  getRoleDescription,
  getRoleIcon,
  getRoleLabel,
} from '@/lib/roles/domain';

describe('roles/domain helpers', () => {
  it('returns consistent role metadata', () => {
    expect(getRoleLabel('owner')).toBe('Owner');
    expect(getRoleIcon('admin')).toBe('🛡️');
    expect(getRoleDescription('buyer')).toContain('Prospective buyer');
  });

  it('applies document/media visibility rules correctly', () => {
    expect(canViewDocumentsUI('owner')).toBe(true);
    expect(canViewDocumentsUI('buyer')).toBe(false);
    expect(canViewMediaUI('conveyancer')).toBe(true);
    expect(canViewMediaUI('buyer')).toBe(false);
  });

  it('applies issues visibility rules correctly', () => {
    expect(canViewIssuesUI('owner')).toBe(true);
    expect(canViewIssuesUI('buyer')).toBe(false);
    expect(canViewIssuesUI('admin')).toBe(true);
  });

  it('only admins can see admin panel', () => {
    expect(canSeeAdminPanel('admin')).toBe(true);
    expect(canSeeAdminPanel('owner')).toBe(false);
    expect(canSeeAdminPanel('buyer')).toBe(false);
  });

  it('returns expected default dashboard tabs per role', () => {
    expect(getDefaultDashboardTabs('buyer')).toEqual(['overview', 'properties', 'invitations', 'issues', 'activity']);
    expect(getDefaultDashboardTabs('admin')).toContain('documents');
    expect(getDefaultDashboardTabs('agent')).toContain('media');
  });
});
