/**
 * File: property-header.tsx
 * Purpose: Hero section with featured image, address, and status badge
 * Type: Server Component
 */

import Image from 'next/image';
import Link from 'next/link';
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

export async function PropertyHeader({ property, featuredMedia }: PropertyHeaderProps) {
  const supabase = createServerClient();
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

  // Determine status badge variant
  const statusVariant =
    property.status === 'active'
      ? 'default'
      : property.status === 'draft'
      ? 'secondary'
      : 'outline';

  const roleInfo = session?.property_roles?.[property.id];
  const roleBadges = [
    ...(roleInfo?.status ?? []).map((r) => ({ label: getRoleLabel(r), icon: getRoleIcon(r) })),
    roleInfo?.permission ? { label: getRoleLabel(roleInfo.permission), icon: getRoleIcon(roleInfo.permission) } : null,
  ].filter(Boolean) as Array<{ label: string; icon: string }>;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-md shadow-glow-xs">
      <div className="relative aspect-video w-full overflow-hidden bg-muted md:aspect-[21/9]">
        <Image src={imageUrl} alt={property.display_address} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Badge variant={statusVariant} className="capitalize shadow-lg">
            {property.status}
          </Badge>
          {property.public_visibility && (
            <Badge variant="secondary" className="shadow-md">
              Public
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            {property.display_address}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-mono">UPRN: {property.uprn}</span>
            {property.public_slug && (
              <Badge variant="outline" className="capitalize">
                Passport ready
              </Badge>
            )}
            {roleBadges.map((badge) => (
              <Badge key={badge.label} variant="secondary" className="gap-1 capitalize">
                <span>{badge.icon}</span>
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button asChild variant="outline">
              <Link href={`/properties/${property.id}/edit`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                Edit Property
              </Link>
            </Button>
            <form action={setPublicVisibilityAction}>
              <input type="hidden" name="propertyId" value={property.id} />
              <input type="hidden" name="visible" value="true" />
              <Button type="submit" variant="secondary">
                Generate Public Passport
              </Button>
            </form>
            {property.public_slug && (
              <>
                <Button asChild variant="ghost">
                  <Link href={`/p/${property.public_slug}`}>View Public URL</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  aria-label="Download property passport QR code"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Link
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/p/${property.public_slug}`
                    )}`}
                  >
                    Download QR Code
                  </Link>
                </Button>
              </>
            )}
            <Button asChild variant="outline">
              <Link href={`/invitations?propertyId=${property.id}`}>Invite</Link>
            </Button>
            <Button asChild variant="default">
              <Link href={`/properties/${property.id}#documents`}>Upload documents</Link>
            </Button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {session && (
            <WatchlistButton propertyId={property.id} variant="outline" size="sm" />
          )}
          <Button asChild size="sm" variant="ghost">
            <Link href={`/properties/${property.id}#key-facts`}>Key facts</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/properties/${property.id}#timeline`}>Timeline</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/properties/${property.id}#stakeholders`}>Stakeholders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
