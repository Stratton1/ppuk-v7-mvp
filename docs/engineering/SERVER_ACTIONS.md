PROPERTY PASSPORT UK v7 — SERVER ACTIONS STANDARDS

Version: 1.0

Audience: Frontend engineers, AI agents

Scope: Structure, security, validation, and rules for all server actions.

1. Purpose of Server Actions

PPUK uses Next.js Server Actions for:

secure mutations

validating user permissions

form submissions

file uploads

property changes

stakeholder role changes

task management

visibility toggles

flags & watchlist changes

All critical write logic flows through Server Actions, not client-side code.

2. File Naming & Location

Server actions must live in:

frontend/actions/*.ts

Naming:

upload-property-document.ts

delete-property-media.ts

grant-property-role.ts

task-actions.ts

property-flags.ts

watchlist.ts

Always kebab-case.

3. Export Pattern

Every server action must:

be exported as a named async function

not export default

include JSDoc header

Example:

'use server';

export async function uploadPropertyDocument(formData: FormData) {

  // ...

}

4. Authentication Handling

Always retrieve the user:

const user = await getServerUser();

if (!user) return { success: false, error: 'Unauthorized' };

Never trust client-supplied IDs.

5. Validation (Zod Required)

Every server action must:

validate FormData

parse inputs

return good error messages

Example:

const schema = z.object({

  propertyId: z.string().uuid(),

});

const parsed = schema.safeParse(values);

if (!parsed.success) return { success: false, error: 'Invalid input' };

6. Permission Enforcement

Must call Supabase helper RPC or RLS-friendly query.

Example:

const { data: allowed } = await supabase.rpc('can_edit_property', { 

  property_id: propertyId 

});

if (!allowed) return { success: false, error: 'Forbidden' };

7. Error Safe Return Shape

All server actions MUST return:

{

  success: boolean;

  error?: string;

  data?: any;

}

This prevents UI crashes.

8. Revalidation Rules

If the action mutates data:

revalidatePath(`/properties/${propertyId}`);

revalidatePath('/dashboard');

Always revalidate affected pages.

9. File Upload Rules

Uploads must:

go through Supabase storage

validate MIME type

validate max size

attach metadata (type, propertyId)

create database record with RLS

10. Event Logging

All mutations must write to:

property_events

Either via:

RPC

database trigger

server action insert

Never skip event logging.

11. Naming Rules for Internal Functions

assertCanEditProperty()

assertCanViewProperty()

createDocumentRecord()

uploadToBucket()

12. Forbidden Patterns

❌ Using fetch to call your own API

❌ Using client-side Supabase for writes

❌ Using any types

❌ Mutating state without revalidation

❌ Throwing uncaught errors

✔ END — SERVER ACTIONS STANDARDS

