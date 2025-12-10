import { Badge } from '@/components/ui/badge';

export function StakeholderStatus({ status }: { status?: 'invited' | 'accepted' | null }) {
  if (!status) return null;
  const variant = status === 'invited' ? 'secondary' : 'default';
  const label = status === 'invited' ? 'Invited' : 'Accepted';
  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  );
}
