import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';

// GET /api/property-access/[propertyId]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await context.params;

  // 1. Load authenticated user + role info
  const session = await getServerUser();

  if (!session?.userId) {
    return NextResponse.json({ access: false }, { status: 401 });
  }

  // 2. Admins get access
  if (session.isAdmin) {
    return NextResponse.json({ access: true });
  }

  // 3. Check access via ownership or stakeholder role
  const supabase = createServerClient();

  const { data: stakeholderRows, error } = await supabase
    .from('property_stakeholders')
    .select('property_id')
    .eq('property_id', propertyId)
    .eq('user_id', session.userId)
    .is('deleted_at', null)
    .limit(1);

  if (error) {
    console.error('Error checking property access', error);
    return NextResponse.json({ access: false, error: 'Error checking access' }, { status: 500 });
  }

  const { data: ownedProperty } = await supabase
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('created_by_user_id', session.userId)
    .limit(1);

  const hasAccess = (stakeholderRows?.length ?? 0) > 0 || (ownedProperty?.length ?? 0) > 0;

  return NextResponse.json({ access: hasAccess });
}
