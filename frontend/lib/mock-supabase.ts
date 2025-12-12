import { DEFAULT_MOCK_USER_ID, MOCK_DOCUMENTS, MOCK_ISSUES, MOCK_MEDIA, MOCK_PROPERTIES, MOCK_USERS } from '@/lib/mock-data';
import type { SupabaseClient } from '@supabase/supabase-js';

type MockSession = {
  userId: string | null;
};

const MOCK_SESSION_KEY = 'ppuk_mock_session';

function readSession(): MockSession {
  if (typeof window === 'undefined') return { userId: DEFAULT_MOCK_USER_ID };
  const raw = window.localStorage.getItem(MOCK_SESSION_KEY);
  if (!raw) return { userId: DEFAULT_MOCK_USER_ID };
  try {
    return JSON.parse(raw) as MockSession;
  } catch {
    return { userId: DEFAULT_MOCK_USER_ID };
  }
}

function writeSession(session: MockSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
}

export function setMockUser(userId: string | null) {
  writeSession({ userId });
}

export function getMockUser() {
  const session = readSession();
  return MOCK_USERS.find((u) => u.id === session.userId) ?? MOCK_USERS[0];
}

export function createMockClient(): SupabaseClient {
  const mock: Partial<SupabaseClient> = {
    auth: {
      getUser: async () => {
        const user = getMockUser();
        return { data: { user: user ? { id: user.id, email: user.email } : null }, error: null } as any;
      },
      signInWithPassword: async ({ email }: { email: string }) => {
        const user = MOCK_USERS.find((u) => u.email === email) ?? MOCK_USERS[0];
        setMockUser(user.id);
        return { data: { user: { id: user.id, email: user.email } }, error: null } as any;
      },
      signOut: async () => {
        setMockUser(null);
        return { error: null } as any;
      },
    } as any,
    from: (table: string) => {
      switch (table) {
        case 'properties':
          return {
            select: () => Promise.resolve({ data: MOCK_PROPERTIES, error: null }),
            eq: (_col: string, _val: unknown) => ({
              maybeSingle: () => Promise.resolve({ data: MOCK_PROPERTIES[0] ?? null, error: null }),
              single: () => Promise.resolve({ data: MOCK_PROPERTIES[0] ?? null, error: null }),
            }),
          } as any;
        case 'documents':
          return {
            select: () => Promise.resolve({ data: MOCK_DOCUMENTS, error: null }),
          } as any;
        case 'media':
          return {
            select: () => Promise.resolve({ data: MOCK_MEDIA, error: null }),
          } as any;
        case 'property_flags':
          return {
            select: () => Promise.resolve({ data: MOCK_ISSUES, error: null }),
          } as any;
        default:
          return {
            select: () => Promise.resolve({ data: [], error: null }),
          } as any;
      }
    },
  };

  return mock as SupabaseClient;
}
