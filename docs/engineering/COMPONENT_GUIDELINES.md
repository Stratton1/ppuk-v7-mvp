PROPERTY PASSPORT UK v7 — COMPONENT GUIDELINES

Version: 1.0

Audience: Frontend engineers, AI agents

Scope: Rules for React, Next.js, UI patterns, variants, and component composition.

1. Component Philosophy

PPUK components must be:

Composable (small, focused)

Typed (strict TypeScript)

Predictable (consistent props)

Accessible

Server-first unless interaction is needed

Aligned with the Design System

Relying on domain language

2. Component Types

2.1 Server Components (default)

Use for:

Static content

Reading from Supabase (SSR)

Layouts

Pages

Non-interactive visual sections

2.2 Client Components

Use only when:

React Query

Forms

Mutations

Interactivity

Dialogs, drawers, tabs

Uploads

Navigation events

Must include:

'use client';

3. Folder Structure

components/

  ui/            ← Shadcn-based primitives

  app/           ← Layout, shell, wrappers

  property/      ← Property domain components

  dashboard/     

  public-passport/

  admin/

  layout/

4. UI Component Rules

4.1 Must use Shadcn UI primitives for:

buttons

inputs

cards

dialogs

dropdowns

sheets

skeletons

4.2 Variant Rules

For any UI element, use consistent variants:

<Button variant="primary" size="sm" />

<Badge variant="warning" />

<Alert variant="error" />

Variants MUST be typed.

5. Domain Components

Domain-specific components live in:

components/property/*

components/dashboard/*

Examples:

PropertyHeader.tsx

PropertyDocuments.tsx

TaskList.tsx

StakeholderRow.tsx

Rules:

Typed props

Domain language enforced

RLS-aware UI

Property-scoped boundaries

6. Props Rules

Required:

Explicit prop types

No any

Descriptive naming

Optional props marked ?

Default values for optional behaviour

Example:

interface PropertyDocumentsProps {

  propertyId: string;

  canEdit: boolean;

}

7. Loading, Empty, and Error States

Every component with data fetching must implement:

Loading skeleton

Empty state

Error fallback

Use:

<Skeleton />

<EmptyState message="No documents yet" />

<ErrorState retry={() => ...} />

8. Testing Requirements

Every interactive component must include:

data-testid="property-documents-upload"

data-testid="dashboard-property-card"

E2E tests depend on these.

9. Accessibility Standards

Every component must:

use semantic HTML

include proper ARIA attributes

have accessible labels for inputs

ensure keyboard navigation

follow contrast rules

10. Forbidden Patterns

❌ Inline business logic

❌ Fetching in client components (unless React Query)

❌ CSS-in-JS (use Tailwind only)

❌ Passing raw Supabase response objects into children

❌ Storing large objects in local state

✔ END — COMPONENT GUIDELINES

