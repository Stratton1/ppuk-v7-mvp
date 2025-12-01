# Property Passport UK v7.0 - Authentication & Role Architecture Specification

**Version:** 1.0  
**Date:** January 2025  
**Status:** ARCHITECTURE SPECIFICATION  
**Purpose:** Complete auth and role system design for PPUK v7.0

---

## AUTH OVERVIEW

### Authentication Provider

**Supabase Auth** is the single source of truth for user authentication. All authentication flows go through Supabase Auth, which manages:

- User accounts (`auth.users` table)
- Email/password authentication
- OAuth providers (Google, etc.)
- Magic link / OTP authentication
- Session management (JWT tokens)
- Email verification
- Password reset flows

### User Identity Model

**Two-Tier User Model:**

1. **Supabase Auth (`auth.users`)**
   - Core authentication data
   - Email, password hash, email verification status
   - Session tokens (JWT)
   - Managed by Supabase Auth service

2. **PPUK User Profile (`public.users` + `public.profiles`)**
   - Extended user data for PPUK platform
   - `public.users`: Core profile (email, name, avatar, organisation, primary_role)
   - `public.profiles`: Additional metadata (phone, bio)
   - Linked via `public.users.id = auth.users.id` (1:1 relationship)

### Authentication Methods

**Primary Method:**
- Email/Password authentication
- Email verification required for new accounts
- Password requirements: Minimum 8 characters (configurable)

**Optional Methods:**
- Google OAuth (future)
- Magic link / OTP (future)
- Social providers (future expansion)

### Session Management

**Session Storage:**
- Server-side: JWT tokens in HTTP-only cookies
- Client-side: No token storage (secure by default)
- Session expiry: 1 hour (configurable via Supabase)
- Refresh tokens: Automatic rotation enabled

**Session Data:**
- User ID (`auth.uid()`)
- Email
- Email verification status
- Custom claims (if needed for roles)

---

## ROLES OVERVIEW

### Role Hierarchy

PPUK v7 uses a **two-tier role system**:

1. **Global Roles** (`public.user_roles` + `public.roles`)
   - System-wide permissions
   - Stored in `user_roles` table (many-to-many with `roles` catalog)
   - Examples: `admin`, `partner`

2. **Property Roles** (`public.property_stakeholders`)
   - Property-specific permissions
   - Stored in `property_stakeholders` table
   - Examples: `owner`, `agent`, `surveyor`, `conveyancer`, `buyer`, `tenant`, `viewer`

### Valid Roles (role_type enum)

| Role | Type | Scope | Description |
|------|------|-------|-------------|
| **admin** | Global | System-wide | Full system access, user management, override capabilities |
| **owner** | Property | Per-property | Full property control, grant access, manage documents |
| **buyer** | Property | Per-property | View shared properties, access approved documents |
| **agent** | Property | Per-property | Manage listings, upload marketing materials, coordinate |
| **conveyancer** | Property | Per-property | Access legal documents, upload certificates, manage completion |
| **surveyor** | Property | Per-property | Upload surveys and reports, view structural info |
| **viewer** | Property | Per-property | Read-only access to explicitly shared properties |
| **tenant** | Property | Per-property | Current tenants, limited read access to safety docs |

**Note:** `partner` role mentioned in blueprint but not in enum - may need to be added.

### Primary Role vs Effective Role

**Primary Role (`public.users.primary_role`):**
- Default role assigned on registration
- Used for UI defaults and initial permissions
- Can be changed by admin or user (depending on rules)
- Default: `'viewer'`

**Effective Role:**
- Computed at runtime based on context
- For system-wide operations: Check global roles (`user_roles`)
- For property operations: Check property-specific role (`property_stakeholders`)
- Highest privilege wins (admin > owner > professional > buyer > viewer)

### Role Permissions Matrix

**System-Wide Permissions:**

| Action | admin | owner | buyer | agent | surveyor | conveyancer | viewer | tenant |
|--------|-------|-------|-------|-------|-----------|-------------|--------|--------|
| Access Admin Panel | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage All Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Property-Level Permissions:**

| Action | admin | owner | buyer | agent | surveyor | conveyancer | viewer | tenant |
|--------|-------|-------|-------|-------|-----------|-------------|--------|--------|
| View Property | ✅ | ✅ Own | ✅ Shared | ✅ Assigned | ✅ Assigned | ✅ Assigned | ✅ Shared | ✅ Own |
| Edit Property | ✅ | ✅ Own | ❌ | ✅ Assigned | ❌ | ❌ | ❌ | ❌ |
| Upload Documents | ✅ | ✅ Own | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Documents | ✅ | ✅ All | ✅ Shared | ✅ Assigned | ✅ Assigned | ✅ Assigned | ❌ | ✅ Safety |
| Delete Documents | ✅ | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Upload Media | ✅ | ✅ Own | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Grant Property Roles | ✅ | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Tasks | ✅ | ✅ Own | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Tasks | ✅ | ✅ Own | ✅ Shared | ✅ Assigned | ✅ Assigned | ✅ Assigned | ✅ Shared | ✅ Own |

---

## ROLE ASSIGNMENT

### Initial Role Assignment

**On User Registration:**

1. **Supabase Auth creates user** in `auth.users`
2. **Trigger or server action creates** `public.users` record:
   - `id` = `auth.users.id`
   - `email` = from auth
   - `primary_role` = `'viewer'` (default)
   - `full_name` = from registration form (optional)
3. **Optional:** Create `public.profiles` record (can be deferred)
4. **No automatic global roles** assigned (except admin via seed/manual)

**Default Primary Role:**
- New users get `primary_role = 'viewer'` by default
- Can be changed during registration if self-selection allowed
- Can be changed by admin after registration

### Role Assignment Rules

**Who Can Assign Roles:**

| Role Type | Can Be Assigned By | Can Be Self-Selected |
|-----------|-------------------|---------------------|
| **admin** | Admin only | ❌ No |
| **owner** | Admin, existing owner (property) | ❌ No |
| **agent** | Admin, property owner | ✅ Yes (if invited) |
| **conveyancer** | Admin, property owner | ✅ Yes (if invited) |
| **surveyor** | Admin, property owner | ✅ Yes (if invited) |
| **buyer** | Admin, property owner | ✅ Yes (if invited) |
| **viewer** | Admin, property owner | ✅ Yes (if invited) |
| **tenant** | Admin, property owner | ✅ Yes (if invited) |

**Property Role Assignment:**

1. **Owner grants role:**
   - Property owner can grant any role (except `admin`) to any user
   - Creates record in `property_stakeholders`
   - Can set `expires_at` for time-bound access
   - Logged in `property_events`

2. **Admin grants role:**
   - Admin can grant any role (including `admin`) to any user
   - Can grant both global and property roles
   - Logged in `activity_log`

3. **Invitation flow:**
   - Owner/admin creates invitation in `invitations` table
   - Invitation sent via email (token-based)
   - User accepts invitation → creates `property_stakeholders` record
   - Invitation status updated to `'accepted'`

### Role Change Rules

**Primary Role Changes:**
- **Self-change:** Users can change their own `primary_role` (except to `admin`)
- **Admin change:** Admin can change any user's `primary_role`
- **Validation:** Must be valid `role_type` enum value

**Property Role Changes:**
- **Owner change:** Property owner can update/revoke any role on their property (except other owners)
- **Admin change:** Admin can update/revoke any role
- **Self-revoke:** Users can revoke their own property roles (except if last owner)
- **Expiry:** Roles with `expires_at < NOW()` are automatically inactive

### Role Escalation Prevention

**Rules:**
- Users cannot grant themselves roles (except via invitation acceptance)
- Users cannot escalate their own roles (buyer → owner)
- Only owners can grant owner roles (with admin override)
- Last owner protection: Cannot revoke last owner role (application-level check)

---

## SESSION MODEL

### Server Session Data

**What to Store in Server Session:**

```typescript
interface ServerUserSession {
  // From Supabase Auth
  userId: string;              // auth.uid()
  email: string;
  emailVerified: boolean;
  
  // From public.users
  fullName: string | null;
  avatarUrl: string | null;
  organisation: string | null;
  primaryRole: role_type;
  
  // From public.profiles (optional)
  phone: string | null;
  bio: string | null;
  
  // Computed
  globalRoles: role_type[];    // From user_roles table
  isAdmin: boolean;            // Computed: has 'admin' global role
}
```

**What NOT to Store:**
- Property-specific roles (load on-demand per property)
- Sensitive data (passwords, tokens)
- Full user object (only needed fields)

### getServerUser() Function

**Purpose:** Get authenticated user with full profile data from server-side code.

**Behavior:**

1. **Get Supabase session** from cookies
2. **If no session:** Return `null`
3. **If session exists:**
   - Query `public.users` where `id = auth.uid()`
   - Query `public.profiles` where `user_id = auth.uid()` (optional)
   - Query `public.user_roles` + `public.roles` for global roles
   - Combine into `ServerUserSession` object
   - Cache in request context (avoid duplicate queries)

**Return Type:**
```typescript
type ServerUser = ServerUserSession | null;
```

**Usage:**
- Server Actions
- Server Components
- API Routes
- Middleware (with caching)

### Effective Role Computation

**For System-Wide Operations:**

```typescript
function getEffectiveGlobalRole(user: ServerUserSession): role_type {
  // Admin always wins
  if (user.globalRoles.includes('admin')) return 'admin';
  
  // Otherwise use primary role
  return user.primaryRole;
}
```

**For Property-Specific Operations:**

```typescript
async function getPropertyRole(
  userId: string, 
  propertyId: string
): Promise<role_type | null> {
  // Query property_stakeholders
  // Check expires_at, deleted_at
  // Return highest privilege role (owner > agent > buyer > viewer)
  // Return null if no role or expired
}
```

**Role Priority (Highest to Lowest):**
1. `admin` (global)
2. `owner` (property)
3. `agent`, `conveyancer`, `surveyor` (property, equal)
4. `buyer` (property)
5. `viewer` (property)
6. `tenant` (property, limited)

### Property-Level Role Loading

**When to Load:**
- On property detail page load
- Before property-specific operations
- In property context providers

**How to Load:**
- Server-side: Query `property_stakeholders` table
- Client-side: Via React Query hook `usePropertyRole(propertyId)`
- Cache: Cache in React Query with property ID as key

**Caching Strategy:**
- Server: Per-request cache (no cross-request caching)
- Client: React Query cache (5 minute stale time)
- Invalidate: On role grant/revoke events

---

## ROUTE PROTECTION

### Route Categories

**1. Public Routes (No Auth Required)**
- `/` - Home page
- `/search` - Property search
- `/p/[slug]` - Public property passport (if `public_visibility = true`)
- `/about`, `/contact`, `/terms`, `/privacy` - Static pages

**2. Authenticated Routes (Any Logged-In User)**
- `/dashboard` - User dashboard
- `/settings` - User settings
- `/properties` - Property list (user's properties)
- `/properties/[id]` - Property detail (if user has access)

**3. Role-Specific Routes**
- `/admin/**` - Admin only
- `/properties/[id]/edit` - Owner/Admin only
- `/properties/[id]/documents` - Owner/Stakeholder only

### Route Protection Rules

#### `/dashboard`

**Access:** Any authenticated user  
**Redirect:** `/auth/login` if not authenticated  
**Behavior:**
- Show role-appropriate dashboard content
- Owners: Show owned properties
- Buyers: Show watchlist/shared properties
- Agents: Show assigned properties
- Admins: Show system overview

#### `/admin/**`

**Access:** Users with `admin` global role only  
**Redirect:** `/dashboard` if not admin  
**Fallback:** Show "Access Denied" message  
**Behavior:**
- Check `isAdmin` flag from session
- Block all non-admin users
- Log access attempts in `activity_log`

#### `/properties/[id]`

**Access:** 
- Property owner
- Property stakeholders (any role)
- Admin
- Public (if `public_visibility = true`)

**Redirect:** `/properties` if no access  
**Fallback:** Show "Property not found or access denied"  
**Behavior:**
- Check `property_stakeholders` for user's role
- Check `properties.public_visibility`
- Load property data based on role permissions

#### `/properties/[id]/edit`

**Access:** Property owner or admin only  
**Redirect:** `/properties/[id]` if not owner/admin  
**Fallback:** Show "You don't have permission to edit this property"  
**Behavior:**
- Verify `is_property_owner(propertyId)` or `isAdmin`
- Block all other users
- Show edit form with owner-level controls

#### `/properties/[id]/documents`

**Access:** 
- Property owner
- Property stakeholders (agent, surveyor, conveyancer, buyer)
- Admin

**Redirect:** `/properties/[id]` if no access  
**Fallback:** Show "Access denied" message  
**Behavior:**
- Check property role via `getPropertyRole()`
- Filter documents based on role (via RLS)
- Show appropriate document types per role

#### `/settings`

**Access:** Any authenticated user  
**Redirect:** `/auth/login` if not authenticated  
**Behavior:**
- Show user's own profile settings
- Allow editing own profile
- Show role information (read-only)
- Show connected properties

### Redirect Behavior

**Standard Redirects:**
- Unauthenticated → `/auth/login?redirect=/original-path`
- Unauthorized → `/dashboard` (or previous page)
- Not found → `/404`

**Redirect Preservation:**
- Store original URL in query param: `?redirect=/properties/123`
- After login, redirect to original URL
- Clear redirect param after use

### Fallback Behavior

**Access Denied:**
- Show friendly message: "You don't have permission to access this resource"
- Provide link back to dashboard
- Log access attempt (for security monitoring)

**Property Not Found:**
- Show: "Property not found or you don't have access"
- Don't reveal if property exists (security)
- Provide link to property search

---

## MIDDLEWARE

### Middleware Architecture

**Location:** `frontend/middleware.ts` (Next.js App Router)

**Execution Order:**
1. Check if route requires authentication
2. Get Supabase session from cookies
3. Validate session (not expired, valid token)
4. Load user data (cached per request)
5. Check route-specific role requirements
6. Allow or redirect

### Session Checking

**Implementation:**

```typescript
// Pseudo-code structure
async function middleware(request: NextRequest) {
  const supabase = createServerClient(request.cookies);
  const { data: { session } } = await supabase.auth.getSession();
  
  // Public routes - allow
  if (isPublicRoute(request.pathname)) {
    return NextResponse.next();
  }
  
  // Protected routes - require auth
  if (!session) {
    return redirectToLogin(request);
  }
  
  // Role-specific routes - check roles
  if (requiresAdmin(request.pathname)) {
    const user = await getServerUser(supabase);
    if (!user?.isAdmin) {
      return redirectToDashboard(request);
    }
  }
  
  // Property routes - check property access
  if (isPropertyRoute(request.pathname)) {
    const propertyId = extractPropertyId(request.pathname);
    const hasAccess = await checkPropertyAccess(user.id, propertyId);
    if (!hasAccess) {
      return redirectToProperties(request);
    }
  }
  
  return NextResponse.next();
}
```

### Role Checking in Middleware

**Global Role Check:**
- Query `user_roles` table for admin role
- Cache result in request context
- Use for `/admin/**` routes

**Property Role Check:**
- Extract `propertyId` from URL
- Query `property_stakeholders` table
- Check `expires_at` and `deleted_at`
- Cache result per property

**Performance:**
- Use request-level caching (avoid duplicate queries)
- Consider Redis for production (future)
- Limit middleware queries (don't load full user object)

### Request Headers

**What to Embed:**

```typescript
// Add to request headers for downstream use
request.headers.set('x-user-id', user.id);
request.headers.set('x-user-email', user.email);
request.headers.set('x-user-role', user.primaryRole);
request.headers.set('x-is-admin', user.isAdmin.toString());
```

**What NOT to Embed:**
- JWT tokens (security risk)
- Sensitive user data
- Property-specific roles (load on-demand)

### What to Block

**Middleware Should Block:**
- Unauthenticated access to protected routes
- Non-admin access to `/admin/**`
- Access to non-existent properties
- Expired sessions (redirect to login)

**Middleware Should NOT Block:**
- Property access (defer to RLS + page-level checks)
- Document access (defer to RLS)
- Fine-grained permissions (handle in components/actions)

**Rationale:**
- Middleware = coarse-grained protection
- RLS = fine-grained data protection
- Components = UI-level permission checks

---

## CLIENT HELPERS

### useUser() Hook

**Purpose:** Get current authenticated user in client components.

**Implementation:**
```typescript
function useUser() {
  const supabase = useSupabase();
  const query = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Fetch public.users + profiles
      const { data: profile } = await supabase
        .from('users')
        .select('*, profiles(*)')
        .eq('id', user.id)
        .single();
      
      return { ...user, ...profile };
    },
  });
  
  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
```

**Return Type:**
```typescript
{
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}
```

**Usage:**
- Client components that need user data
- Navigation components (show user name/avatar)
- Conditional rendering based on auth state

### useRole() Hook

**Purpose:** Get user's role for current context (global or property-specific).

**Implementation:**
```typescript
function useRole(propertyId?: string) {
  const { user } = useUser();
  
  const globalRoleQuery = useQuery({
    queryKey: ['user', 'global-roles'],
    queryFn: async () => {
      // Fetch user_roles
      const { data } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id);
      return data?.map(r => r.roles.name) || [];
    },
    enabled: !!user,
  });
  
  const propertyRoleQuery = useQuery({
    queryKey: ['property-role', propertyId],
    queryFn: async () => {
      // Fetch property_stakeholders
      const { data } = await supabase
        .from('property_stakeholders')
        .select('role')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();
      return data?.role || null;
    },
    enabled: !!user && !!propertyId,
  });
  
  return {
    globalRoles: globalRoleQuery.data || [],
    propertyRole: propertyRoleQuery.data,
    isAdmin: globalRoleQuery.data?.includes('admin'),
    isLoading: globalRoleQuery.isLoading || propertyRoleQuery.isLoading,
  };
}
```

**Return Type:**
```typescript
{
  globalRoles: role_type[];
  propertyRole: role_type | null;
  isAdmin: boolean;
  isLoading: boolean;
}
```

**Usage:**
- Property detail pages (check property role)
- Admin panels (check admin role)
- Conditional UI based on permissions

### useSupabase() Hook

**Purpose:** Get Supabase client instance in client components.

**Implementation:**
```typescript
function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context.client;
}
```

**Return Type:**
```typescript
SupabaseClient<Database>
```

**Usage:**
- All client components that need database access
- React Query query functions
- Form submissions

### getServerUser() Function

**Purpose:** Get authenticated user in server-side code (actions, components, API routes).

**Implementation:**
```typescript
async function getServerUser(
  supabase: SupabaseClient<Database>
): Promise<ServerUserSession | null> {
  // Get auth session
  const { data: { user: authUser }, error } = await supabase.auth.getUser();
  if (error || !authUser) return null;
  
  // Get public.users
  const { data: publicUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();
  
  if (!publicUser) return null;
  
  // Get profiles (optional)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .single();
  
  // Get global roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', authUser.id);
  
  const globalRoles = userRoles?.map(ur => ur.roles.name) || [];
  
  return {
    userId: authUser.id,
    email: authUser.email!,
    emailVerified: authUser.email_confirmed_at !== null,
    fullName: publicUser.full_name,
    avatarUrl: publicUser.avatar_url,
    organisation: publicUser.organisation,
    primaryRole: publicUser.primary_role,
    phone: profile?.phone || null,
    bio: profile?.bio || null,
    globalRoles,
    isAdmin: globalRoles.includes('admin'),
  };
}
```

**Return Type:**
```typescript
ServerUserSession | null
```

**Usage:**
- Server Actions
- Server Components
- API Routes
- Middleware (with caching)

### getServerClient() Function

**Purpose:** Create Supabase server client for server-side code.

**Implementation:**
```typescript
function getServerClient(cookies: ReadonlyRequestCookies) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookies.delete(name);
        },
      },
    }
  );
}
```

**Return Type:**
```typescript
SupabaseClient<Database>
```

**Usage:**
- Server Actions
- Server Components
- API Routes
- Middleware

### Additional Helper Functions

**getPropertyRole(userId, propertyId):**
- Query `property_stakeholders` for user's role on property
- Return highest privilege role
- Handle expiry and soft-delete

**hasPropertyAccess(userId, propertyId, requiredRole?):**
- Check if user has access to property
- Optionally check for specific role
- Return boolean

**canPerformAction(userId, propertyId, action):**
- Check if user can perform specific action
- Uses role permissions matrix
- Return boolean with reason

---

## REQUIRED CODE STRUCTURE

### New Server Actions

**Location:** `frontend/src/actions/auth/`

**Files to Create:**

1. **`register.ts`**
   - Handle user registration
   - Create `auth.users` via Supabase Auth
   - Create `public.users` record
   - Create `public.profiles` record (optional)
   - Set `primary_role` based on form input
   - Return success/error

2. **`login.ts`**
   - Handle email/password login
   - Use Supabase Auth sign in
   - Return session data

3. **`logout.ts`**
   - Handle user logout
   - Clear Supabase session
   - Clear cookies
   - Redirect to home

4. **`update-profile.ts`**
   - Update `public.users` record
   - Update `public.profiles` record
   - Validate permissions (own profile only)
   - Return success/error

5. **`change-primary-role.ts`**
   - Update `primary_role` in `public.users`
   - Validate: user can change own role (except to admin)
   - Log in `activity_log`
   - Return success/error

### New Server Utilities

**Location:** `frontend/src/lib/auth/`

**Files to Create:**

1. **`server-user.ts`**
   - `getServerUser()` function
   - `getServerClient()` function
   - Type definitions for `ServerUserSession`

2. **`server-roles.ts`**
   - `getPropertyRole()` function
   - `hasPropertyAccess()` function
   - `canPerformAction()` function
   - Role permission checks

3. **`server-session.ts`**
   - Session validation
   - Session refresh logic
   - Cookie management

### New Client Hooks

**Location:** `frontend/src/hooks/`

**Files to Create:**

1. **`use-user.ts`**
   - `useUser()` hook implementation
   - React Query integration
   - Error handling

2. **`use-role.ts`**
   - `useRole()` hook implementation
   - Global and property role queries
   - Permission helpers

3. **`use-property-access.ts`**
   - `usePropertyAccess(propertyId)` hook
   - Check property access
   - Load property role

### New Providers

**Location:** `frontend/src/providers/`

**Files to Create/Update:**

1. **`supabase-provider.tsx`**
   - Supabase client provider
   - Create client from cookies
   - Provide via React Context
   - Handle session refresh

2. **`auth-provider.tsx`** (optional)
   - Auth state provider
   - Wrap Supabase provider
   - Provide user/role data globally

### New Components

**Location:** `frontend/src/components/auth/`

**Files to Create:**

1. **`login-form.tsx`**
   - Email/password login form
   - Error handling
   - Redirect after login

2. **`register-form.tsx`**
   - Registration form
   - Role selection (if allowed)
   - Email verification notice

3. **`protected-route.tsx`**
   - Route protection wrapper
   - Check authentication
   - Check roles
   - Redirect if needed

4. **`role-guard.tsx`**
   - Role-based UI guard
   - Show/hide based on role
   - Children rendering

### Updated Middleware

**Location:** `frontend/middleware.ts`

**Updates Required:**

1. **Import server utilities:**
   - `getServerClient()`
   - `getServerUser()`
   - Route protection helpers

2. **Add route protection logic:**
   - Public route detection
   - Admin route protection
   - Property route access checks

3. **Add request headers:**
   - User ID
   - User role
   - Admin flag

### Updated App Structure

**Location:** `frontend/src/app/`

**Updates Required:**

1. **`layout.tsx`**
   - Wrap with `SupabaseProvider`
   - Wrap with `QueryProvider` (React Query)
   - Add auth state management

2. **`providers.tsx`** (if exists)
   - Export all providers
   - Provider composition

3. **Route Pages:**
   - Update `/dashboard` to use `getServerUser()`
   - Update `/admin/**` to check admin role
   - Update `/properties/[id]` to check property access
   - Update `/settings` to use server user

### Type Definitions

**Location:** `frontend/src/types/`

**Files to Create/Update:**

1. **`auth.ts`**
   - `ServerUserSession` type
   - `UserProfile` type
   - `Role` type
   - Auth-related types

2. **`supabase.ts`** (regenerate)
   - Run: `supabase gen types typescript --linked > frontend/src/types/supabase.ts`
   - Update after schema changes

---

## IMPLEMENTATION PHASES

### Phase 1: Core Auth Infrastructure

1. Create server utilities (`getServerUser`, `getServerClient`)
2. Create client hooks (`useUser`, `useSupabase`)
3. Update Supabase provider
4. Create auth server actions (login, register, logout)

### Phase 2: Role System

1. Create role helper functions
2. Create `useRole()` hook
3. Implement role assignment logic
4. Create role guard components

### Phase 3: Route Protection

1. Update middleware with route checks
2. Create `ProtectedRoute` component
3. Update all protected pages
4. Test redirect flows

### Phase 4: Property Access

1. Create property role helpers
2. Create `usePropertyAccess()` hook
3. Update property pages with access checks
4. Test property-level permissions

### Phase 5: Admin System

1. Create admin role checks
2. Protect `/admin/**` routes
3. Create admin dashboard
4. Test admin access controls

---

## SECURITY CONSIDERATIONS

### Authentication Security

- **Password Requirements:** Minimum 8 characters (enforced by Supabase)
- **Email Verification:** Required for new accounts
- **Session Security:** HTTP-only cookies, secure flag in production
- **CSRF Protection:** Supabase handles automatically
- **Rate Limiting:** Supabase Auth has built-in rate limiting

### Role Security

- **RLS Enforcement:** All database queries protected by RLS
- **Server-Side Validation:** Always validate roles server-side
- **Client-Side Checks:** UI-only, never trust for security
- **Role Escalation:** Prevented by application logic
- **Audit Logging:** All role changes logged in `activity_log`

### Data Security

- **No Client Secrets:** API keys never exposed to frontend
- **Signed URLs:** Document/media access via signed URLs
- **Input Validation:** Zod schemas for all inputs
- **SQL Injection:** Prevented by Supabase client (parameterized queries)

---

## TESTING REQUIREMENTS

### Authentication Tests

- [ ] User registration flow
- [ ] Email/password login
- [ ] Logout flow
- [ ] Session expiry handling
- [ ] Password reset flow
- [ ] Email verification

### Role Tests

- [ ] Initial role assignment
- [ ] Role change by admin
- [ ] Role change by user (if allowed)
- [ ] Property role assignment
- [ ] Role expiry enforcement
- [ ] Role revocation

### Route Protection Tests

- [ ] Public routes accessible without auth
- [ ] Protected routes redirect when unauthenticated
- [ ] Admin routes block non-admins
- [ ] Property routes check property access
- [ ] Redirect preservation after login

### Permission Tests

- [ ] Owner can perform owner actions
- [ ] Stakeholder can perform allowed actions
- [ ] Unauthorized users blocked
- [ ] RLS policies enforced
- [ ] Document access by role

---

## MIGRATION NOTES

### From v6 to v7

**Breaking Changes:**
- `users_extended` → `users` + `profiles`
- `user_property_roles` → `property_stakeholders`
- Helper functions updated to use new tables

**Migration Steps:**
1. Update all code references to new table names
2. Update helper function calls
3. Regenerate TypeScript types
4. Test all auth flows
5. Test all role checks

---

**END OF AUTH & ROLE ARCHITECTURE SPECIFICATION**

This document provides the complete architecture for implementing authentication and role management in PPUK v7.0. All code generation should follow this specification.

