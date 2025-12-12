# Auth Debug Checklist (Local)

Use this to validate login and stop redirect loops.

1) Clear site data for `http://localhost:3000` (cookies + localStorage).
2) Ensure env in `frontend/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>`
3) Restart dev server: `npm run dev` (from `frontend`).
4) Open DevTools (Network + Application > Cookies).
5) Go to `/auth/login?redirect=/dashboard`.
6) Sign in with `admin@ppuk.test` / `password123`.
7) In Network, verify request to `http://localhost:54321/auth/v1/token?grant_type=password` succeeds.
8) In Cookies for `localhost:3000`, confirm `sb-localhost-auth-token` is present.
9) Visit `/dashboard`; confirm:
   - No 307 loop
   - Terminal logs show `[auth-proxy] ... hasUser: true`
   - Server logs show `[auth-session]` not firing a redirect.

