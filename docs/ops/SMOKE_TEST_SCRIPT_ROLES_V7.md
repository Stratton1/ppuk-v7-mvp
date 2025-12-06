PPUK v7 Roles & Access Smoke Test
=================================

Prereqs
- Frontend running locally (npm run dev) and Supabase linked.
- Use two browsers or one browser plus an incognito window to simulate multiple users.
- Have access to a mailbox you can read for multiple test accounts (or use plus-aliases).

Conventions
- “Owner” = consumer account that creates the property.
- “Buyer Viewer” = invited consumer with status=buyer, permission=viewer.
- “Agent Editor” = professional account with primary_role=agent granted editor permission.
- Replace placeholder emails with real ones you can access.

1) New consumer signup + property creation
1. Open http://localhost:3000/auth/register and sign up with Email A (consumer).
   - Expect successful redirect to dashboard.
2. Create a new property (Properties > Create).
   - Expect property appears on dashboard cards.
3. Open that property page.
   - Expect Access list to show you as Owner (Editor).

2) Owner viewing vs editing
1. As the owner (Email A), open the property.
2. Edit property details (e.g., change display address or status).
   - Expect change saves without error.
3. Upload a document (Documents tab) and a photo (Gallery).
   - Expect uploads succeed and render in UI.
4. Create a task.
   - Expect task appears in list.

3) Public visibility
1. As owner, on the property page click “Generate Public Passport” or toggle visibility on.
   - Expect no error; copy the public URL `/p/[slug]`.
2. Open an incognito window (logged out) and visit the public URL.
   - Expect to see the public passport (hero, gallery, documents list).
3. Turn visibility OFF as owner.
4. Refresh the public URL in incognito.
   - Expect a not-found/blocked view (no property data).

4) Buyer invitation (viewer)
1. As owner, open Access & Roles and click Grant Access.
2. Enter Email B, choose Status=Buyer (optional) and Permission=Viewer, submit.
   - Expect success toast/message.
3. In incognito, register/login as Email B (consumer), then accept invitation via dashboard (property should appear).
4. Open the property as Email B.
   - Expect badges showing Buyer + Viewer.
   - Expect you can view details and documents but cannot edit or upload (no edit buttons or permission errors).

5) Professional access (agent)
1. Register a third account Email C with primary_role=agent (use admin console or update profiles if needed).
2. As owner (Email A), Grant Access to Email C with Permission=Editor (leave status empty).
   - Expect success.
3. Log in as Email C.
   - Expect the granted property appears on dashboard.
   - Expect you can edit property details and upload docs/media for that property.
   - Confirm you cannot see properties you were not granted.

6) Last-owner protection
1. On a property with exactly one owner (Email A), attempt to Remove Access for that owner.
   - Expect an error preventing removal (cannot remove last owner).
2. If multiple owners exist, remove a non-final owner and confirm it succeeds.

7) Admin behaviour (optional if you can create admin)
1. Log in as an admin account.
   - Expect all properties visible on dashboard and access lists.
2. Verify admin can toggle visibility and grant/revoke access.
3. Visit a public URL while logged out; verify behaviour still respects public_visibility (admin access does not leak to public).

General failure signs
- Grant/removal fails silently or leaves stale roles in the Access list.
- Public passport shows data when visibility is off (bug).
- Professionals gain access without being granted (bug).
- Last-owner removal succeeds (bug).
