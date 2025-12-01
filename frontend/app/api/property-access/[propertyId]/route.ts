import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server-user';
import { canViewProperty } from '@/lib/role-utils';
import { createClient as createServerClient } from '@/lib/supabase/server';

// GET /api/property-access/[propertyId]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await context.params;

  const session = await getServerUser();

  if (!session?.id) {
    return NextResponse.json({ access: false }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data: property } = await supabase
    .from('properties')
    .select('id, public_visibility')
    .eq('id', propertyId)
    .maybeSingle();

  const access = canViewProperty(session, propertyId, { isPublic: property?.public_visibility ?? false });
  return NextResponse.json({ access });
}
