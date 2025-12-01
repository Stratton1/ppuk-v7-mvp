import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AccessCardProps = {
  displayAddress: string;
  role: string;
  status: string;
  accessExpiresAt?: string | null;
  imageUrl?: string | null;
};

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-200 text-slate-800',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-amber-100 text-amber-800',
};

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const AccessCard = ({
  displayAddress,
  role,
  status,
  accessExpiresAt,
  imageUrl,
}: AccessCardProps) => {
  const statusClass = statusStyles[status] ?? 'bg-slate-200 text-slate-800';
  const expiresLabel = accessExpiresAt
    ? `Expires ${new Date(accessExpiresAt).toLocaleDateString()}`
    : 'No expiry set';

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
          <Badge className={statusClass}>{status}</Badge>
          <span className="text-muted-foreground">{roleLabels[role] ?? role}</span>
        </div>
        <span className="text-xs text-muted-foreground">{expiresLabel}</span>
      </CardContent>
    </Card>
  );
};
