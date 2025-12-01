import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server-user';

export async function GET() {
  const user = await getServerUser();
  return NextResponse.json({ data: user });
}
