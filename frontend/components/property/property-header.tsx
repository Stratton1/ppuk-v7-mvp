/**
 * File: property-header.tsx
 * Purpose: Hero section with featured image, address, and status badge
 * Type: Server Component
 */

import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Globe, ExternalLink, QrCode, UserPlus, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFeaturedMediaUrl, PLACEHOLDER_IMAGE } from '@/lib/signed-url';
import { setPublicVisibilityAction } from '@/actions/set-public-visibility';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { getRoleLabel, getRoleIcon } from '@/lib/role-utils';
import { WatchlistButton } from './watchlist-button';
import type { Database } from '@/types/supabase';

type Property = Database['public']['Tables']['properties']['Row'] & {
  public_slug?: string | null;
  public_visibility?: boolean | null;
};
type FeaturedMedia = { id: string; storage_path: string } | null;

interface PropertyHeaderProps {
  property: Property;
  featuredMedia: FeaturedMedia;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  draft: 'secondary',
  active: 'success',
  archived: 'warning',
};

export async function PropertyHeader({ property, featuredMedia }: PropertyHeaderProps) {
  const supabase = await createServerClient();
  const session = await getServerUser();

  // Check if user can edit property (owner or admin only)
  const hasPropertyRoleArgs: Database['public']['Functions']['has_property_role']['Args'] = {
    property_id: property.id,
    allowed_roles: ['owner', 'editor'],
  };
  // Type assertion needed due to Supabase RPC type inference issue
  const { data: canEdit } = await supabase.rpc('has_property_role', hasPropertyRoleArgs);

  // Generate signed URL for featured media
  let signedUrl: string | null = null;
  if (featuredMedia) {
    signedUrl = await getFeaturedMediaUrl(featuredMedia.storage_path);
  }

  const imageUrl = signedUrl || PLACEHOLDER_IMAGE;
  const badgeVariant = statusVariants[property.status ?? ''] ?? 'secondary';

  const roleInfo = session?.property_roles?.[property.id];
  const roleBadges = [
    ...(roleInfo?.status ?? []).map((r) => ({ label: getRoleLabel(r), icon: getRoleIcon(r) })),
    roleInfo?.permission
      ? { label: getRoleLabel(roleInfo.permission), icon: getRoleIcon(roleInfo.permission) }
      : null,
  ].filter(Boolean) as Array<{ label: string; icon: string }>;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Hero image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted md:aspect-[21/9]">
        <Image
          src={imageUrl}
          alt={property.display_address}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <Badge variant={badgeVariant} className="capitalize shadow-sm">
            {property.status}
          </Badge>
          {property.public_visibility && (
            <Badge variant="info" className="shadow-sm">
              <Globe className="mr-1 h-3 w-3" />
              Public
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Title and metadata */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
            {property.display_address}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs">UPRN: {property.uprn}</span>
            {roleBadges.map((badge) => (
              <Badge key={badge.label} variant="secondary" className="gap-1 text-xs capitalize">
                <span>{badge.icon}</span>
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {/* Primary actions (editor only) */}
          {canEdit && (
            <>
              <Button asChild variant="default" size="sm">
                <Link href={`/properties/${property.id}/edit`}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/properties/${property.id}#documents`}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Upload
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/invitations?propertyId=${property.id}`}>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Invite
                </Link>
              </Button>
              {!property.public_visibility && (
                <form action={setPublicVisibilityAction}>
                  <input type="hidden" name="propertyId" value={property.id} />
                  <input type="hidden" name="visible" value="true" />
                  <Button type="submit" variant="outline" size="sm">
                    <Globe className="mr-1.5 h-3.5 w-3.5" />
                    Make Public
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Public passport links */}
          {property.public_slug && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/p/${property.public_slug}`}>
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Public URL
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                aria-label="Download QR code"
              >
                <Link
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/p/${property.public_slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <QrCode className="mr-1.5 h-3.5 w-3.5" />
                  QR
                </Link>
              </Button>
            </>
          )}

          {/* Watchlist (always available when logged in) */}
          {session && (
            <div className="ml-auto">
              <WatchlistButton propertyId={property.id} variant="ghost" size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
