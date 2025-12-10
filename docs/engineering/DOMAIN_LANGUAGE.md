PROPERTY PASSPORT UK v7 — DOMAIN LANGUAGE SPECIFICATION

Version: 1.0

Audience: All engineers, AI agents, designers, product, marketing

Scope: Canonical dictionary of terms used across the system.

1. Purpose

To prevent ambiguity, enforce consistency, and improve AI reliability, PPUK uses a strict domain language.

Every UI string, server action, database field, migration comment, and test title must use these terms exactly.

2. Core Domain Terms

Property Passport

The unified digital record of a property.

This includes:

Documents

Media

Metadata

Tasks

Events

Flags

Stakeholders

Property

A single residential unit.

Not: home, house, dwelling, unit

Always: property

Stakeholder

A user assigned a status & permission on a property.

Statuses:

owner

buyer

tenant

Permissions:

viewer

editor

Completion Score

The percentage that measures property readiness.

Formula includes:

Metadata completeness

Number of required documents

Media coverage

Task completion

Flag resolution

3. User Roles (Global)

Use exactly:

consumer

agent

conveyancer

surveyor

admin

4. Operations (Action Verbs)

Use precise verbs:

Operation	Use Term

Add file	Upload Document

Delete file	Remove Document

Change property data	Edit Property

Invite someone	Invite Stakeholder

Accept invitation	Accept Invitation

Remove stakeholder	Remove Access

Mark task done	Complete Task

Reopen task	Reopen Task

Add flag	Raise Flag

Resolve flag	Resolve Flag

5. System Entities

Document

A file attached to a property.

Use:

document, not "file", "upload", or "attachment".

Media

Photos or videos.

Use:

media, not "images", "pics", or "gallery items".

Task

A single actionable item associated with a property.

Event

A recorded action in the immutable event log.

Events must be written in plain, past-tense English:

"Document uploaded"

"Stakeholder added"

"Property updated"

Flag

A marker indicating an issue or requirement needing attention.

Do NOT use: alert, issue, problem.

Watchlist

A personalized list of properties a user tracks.

Public Passport

The public-facing property page.

6. UX and UI Language Rules

Headings

Must use:

Property Passport

Documents

Media

Tasks

Stakeholders

Events

Flags

Public Passport

Button Labels

Use:

"Upload Document"

"Add Task"

"Invite Stakeholder"

"Edit Property"

"Set Public Visibility"

Never abbreviate.

Empty States

Must use:

"No documents uploaded yet"

"No tasks created"

"No flags raised"

"No events recorded"

7. AI Language Rules

AI agents must:

Use domain terms exactly

Not invent synonyms

Not abbreviate

Not convert nouns into verbs (e.g., "flagging" → use raise a flag)

Not shorten phrases (e.g., "prop" → "property")

Domain language consistency is essential for:

RLS rules

data integrity

UI accuracy

test determinism

cross-team clarity

✔ END — DOMAIN LANGUAGE

