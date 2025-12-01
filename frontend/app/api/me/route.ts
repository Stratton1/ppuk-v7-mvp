import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server-user';

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json({ ...body, status, timestamp: new Date().toISOString() }, { status });

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return jsonResponse({ data: null, message: 'Unauthorized' }, 401);
    }
    return jsonResponse({ data: user, message: 'OK' }, 200);
  } catch (error) {
    console.error('Error loading session', error);
    return jsonResponse({ data: null, message: 'Internal server error' }, 500);
  }
}
