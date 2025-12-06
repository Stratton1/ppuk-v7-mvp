import { Badge } from '@/components/ui/badge';

type StakeholderRoleBadgeProps = {
  role: string | null | undefined;
};

const roleStyles: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  owner: { label: 'Owner', variant: 'default' },
  agent: { label: 'Agent', variant: 'secondary' },
  conveyancer: { label: 'Conveyancer', variant: 'secondary' },
  buyer: { label: 'Buyer', variant: 'outline' },
  tenant: { label: 'Tenant', variant: 'outline' },
  editor: { label: 'Editor', variant: 'secondary' },
  viewer: { label: 'Viewer', variant: 'outline' },
  admin: { label: 'Admin', variant: 'default' },
};

export function StakeholderRoleBadge({ role }: StakeholderRoleBadgeProps) {
  if (!role) {
    return (
      <Badge variant="outline" className="capitalize">
        Unknown
      </Badge>
    );
  }
  const style = roleStyles[role] ?? { label: role, variant: 'outline' as const };
  return (
    <Badge variant={style.variant} className="capitalize">
      {style.label}
    </Badge>
  );
}
