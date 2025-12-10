import Image from 'next/image';
import type { Database } from '@/types/supabase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRoleIcon, getRoleLabel } from '@/lib/role-utils';

type AccessCardProps = {
  displayAddress: string;
  statuses: Array<Database['public']['Enums']['property_status_type']>;
  permission: Database['public']['Enums']['property_permission_type'] | null;
  status: string;
  accessExpiresAt?: string | null;
  imageUrl?: string | null;
};

export const AccessCard = ({
  displayAddress,
  statuses,
  permission,
  status,
  accessExpiresAt,
  imageUrl,
}: AccessCardProps) => {
  const expiresLabel = accessExpiresAt
    ? `Expires ${new Date(accessExpiresAt).toLocaleDateString()}`
    : 'No expiry set';
  const statusBadges = statuses.length ? statuses : [];
  const permissionLabel = permission ? getRoleLabel(permission) : 'Viewer';

  return (
    <Card className="overflow-hidden">
      <div className="relative h-28 w-full bg-muted">
        <Image src={imageUrl || '/placeholder.svg'} alt={displayAddress} fill className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="text-base">{displayAddress}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm">
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="capitalize self-start">
            {status}
          </Badge>
          <div className="flex flex-wrap gap-1">
            {statusBadges.map((s) => (
              <Badge key={s} variant="secondary" className="capitalize">
                {getRoleIcon(s)} {getRoleLabel(s)}
              </Badge>
            ))}
          </div>
          <span className="text-muted-foreground">{permissionLabel}</span>
        </div>
        <span className="text-xs text-muted-foreground">{expiresLabel}</span>
      </CardContent>
    </Card>
  );
};
