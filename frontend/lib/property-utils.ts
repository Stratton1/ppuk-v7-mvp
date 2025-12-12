import { getServerUser } from '@/lib/auth/server-user';
import { createClient } from '@/lib/supabase/server';

export async function canEditProperty(propertyId: string): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;
  if (user.isAdmin) return true;
  const supabase = await createClient();
  const { data } = await supabase.rpc('can_edit_property', { property_id: propertyId });
  return Boolean(data);
}
