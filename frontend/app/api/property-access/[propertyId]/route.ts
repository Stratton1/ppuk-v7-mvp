import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { canViewProperty } from '@/lib/role-utils';

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json({ ...body, status, timestamp: new Date().toISOString() }, { status });

// GET /api/property-access/[propertyId]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await context.params;

  try {
    const session = await getServerUser();
    if (!session?.id) {
      return jsonResponse({ access: false, message: 'Unauthorized' }, 401);
    }

    const supabase = await createServerClient();
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, public_visibility')
      .eq('id', propertyId)
      .maybeSingle();

    if (propertyError) {
      return jsonResponse({ access: false, message: 'Error fetching property', details: propertyError.message }, 500);
    }

    if (!property) {
      return jsonResponse({ access: false, message: 'Property not found' }, 404);
    }

    const access = session.isAdmin
      ? true
      : canViewProperty(session, propertyId, { isPublic: property.public_visibility ?? false });

    if (!access) {
      return jsonResponse({ access: false, message: 'Forbidden' }, 403);
    }

    return jsonResponse({ access: true, message: 'Access granted' }, 200);
  } catch (error) {
    console.error('Error checking property access', error);
    return jsonResponse({ access: false, message: 'Internal server error' }, 500);
  }
}
