PROPERTY PASSPORT UK v7 — AI ENGINEERING RULES

Version: 1.0

Audience: AI Agents (Cursor, Claude Code, Copilot), Engineering Leads

Scope: Behaviour constraints, coding rules, generation boundaries, safety, architecture alignment.

1. Purpose

This document defines how all AI tools must:

generate code

modify files

follow architecture

test behaviours

avoid forbidden patterns

pass RLS rules

create migrations safely

respect design system

maintain domain language

It prevents AI hallucinations and ensures architectural consistency.

2. Global Principles

AI agents MUST:

Follow PPUK domain language

Default to strict TypeScript

Use Server Components unless interactivity is required

Never bypass RLS

Never generate client-side Supabase writes

Always validate Server Action inputs with Zod

Provide tests for mutations

Maintain consistent naming

Log all property mutations

Follow the Design System rules

3. Forbidden Output (AI must NEVER do)

❌ Generate database migrations modifying existing enums directly

❌ Suggest bypassing RLS

❌ Create client-side Supabase mutation code

❌ Use fetch to call our own API routes

❌ Create CSS-in-JS

❌ Introduce global client state for server data

❌ Generate server actions without input validation

❌ Generate UI without data-testid attributes

❌ Modify schema without referencing Supabase standards

4. Required AI Output Patterns

4.1 Server Actions

AI must always generate:

'use server'

import { z } from 'zod';

import { getServerUser } from '@/lib/auth';

import { revalidatePath } from 'next/cache';

export async function someAction(formData: FormData) {

  const user = await getServerUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const schema = z.object({

    propertyId: z.string().uuid(),

  });

  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { success: false, error: 'Invalid input' };

  // Supabase call

  // Revalidation

  // Return shape

}

4.2 Component Creation

AI must:

Use Tailwind

Use Shadcn-based primitives

Use typed props

Include data-testid attributes

5. AI Test Generation Rules

AI must generate:

RLS matrix coverage

Server Action tests

E2E Playwright tests

Snapshot tests where appropriate

6. AI File Modification Rules

When modifying existing files AI must:

preserve imports

maintain component order

maintain consistent naming

avoid unnecessary rewrites

update tests when components change

7. AI Commit Rules (Cursor Agents)

Agents must:

group related changes

not modify unrelated files

include tests when adding features

update documentation when architecture changes

never commit commented-out code

8. AI Role and Permission Awareness

Whenever generating:

UI

Server logic

Data fetchers

Migrations

AI must enforce:

owner = full access

buyer = view only

tenant = view only

agent = editor

conveyancer = editor

surveyor = view only

admin bypass with helper function

✔ END — AI RULES

