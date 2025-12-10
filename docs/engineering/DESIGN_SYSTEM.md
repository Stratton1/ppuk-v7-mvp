PROPERTY PASSPORT UK v7 — DESIGN SYSTEM

Version: 1.0

Audience: Engineering, Product, AI Agents

Scope: Complete visual, interaction, layout, and UX system across PPUK.

1. Design Philosophy

PPUK's design system is built for:

Clarity → users must instantly understand property status and progress

Trust → legal/security-focused flows must appear credible and robust

Speed → users complete transactions faster with predictable patterns

Consistency → all roles (owners, buyers, agents, conveyancers, surveyors) see the same UI rules

Accessibility → AA-level accessibility required

Data-first → timelines, events, documents, tasks must be scannable

2. Core Principles

2.1 Hierarchy

Use layout to guide the eye:

Large, bold page titles

Iconography for document types

Consistent section headings

Summary cards → detail panels → data tables

2.2 Domain Language

Must use PPUK terms consistently:

Property Passport

Completion Score

Stakeholder

Viewer/Editor

Owner/Buyer/Tenant

Task

Document

Media

Flags

Watchlist

2.3 Predictability

Every UI pattern must match user expectations:

Documents always open in a side panel

Editing always occurs in drawers or modals

Navigation always appears in the left sidebar

Action buttons always appear top-right of a section

Error messages always appear inline and non-blocking

3. Layout System

3.1 Global Layout Anatomy

┌──────────────────────────────────────────────┐

│  Top Nav (branding, profile menu, breadcrumbs)

├──────────────────────────────────────────────┤

│  Sidebar Navigation (permanent on desktop)   │

│                                              │

│  Property Passport / Dashboard Content (main)│

│                                              │

├──────────────────────────────────────────────┤

│  Footer (links, policies, developer routes)  │

└──────────────────────────────────────────────┘

3.2 Spacing Tokens

xs: 4px

sm: 8px

md: 16px

lg: 24px

xl: 32px

2xl: 48px

3.3 Breakpoints

sm: 480px

md: 768px

lg: 1024px

xl: 1280px

2xl: 1536px

Rules:

Sidebar collapses at < 1024px

Data tables become cards at < 768px

Forms become single-column below 640px

4. Typography System

4.1 Typeface

System font stack: Inter / San Francisco / Segoe UI

Use semibold headers, regular body, medium labels

4.2 Text Styles

Purpose	Style

Page titles	text-3xl font-semibold

Section titles	text-xl font-medium

Card titles	text-lg font-medium

Labels	text-sm font-medium text-muted

Body text	text-base

Captions	text-xs text-muted

5. Colour System

Primary Palette

Blue 600 → Primary action

Blue 700 → Hover / focus

Blue 900 → Titles

Semantic Colours

Success → Green 600

Warning → Amber 600

Error → Red 600

Info → Blue 500

Neutral Palette

Slate 50–900 for backgrounds, borders, text

Rules:

Avoid excessive colour

Use colour to signal state, not decoration

6. Components

6.1 Buttons

Variants:

primary

secondary

outline

ghost

destructive

Sizes:

sm

md

lg

Icons:

Left or right only

Use Lucide icons

Do not nest multiple icons

6.2 Cards

Card layouts must include:

Title

Description or supporting text

Action region (top-right or footer)

Optional metadata

Consistent padding (p-4 minimum)

Examples:

Property Summary Card

Completion Score Card

Document Summary Card

Task Overview Card

6.3 Tables

Tables must support:

Sorting

Filtering

Density controls (comfortable/compact)

Sticky headers

Mobile collapse into cards

6.4 Forms

Standards:

Zod validation on the server

Fieldsets for grouped info

Destructive actions → confirmation modals

Required fields marked with *

Inline error messages

6.5 Navigation

Left Sidebar:

Dashboard

Properties

Tasks

Documents

Flags

Settings

Admin Sidebar:

Users

Invitations

System Activity

Analytics

Footer Links:

Accessibility

Developer Routes

Test Login

Admin Login

7. Interaction Patterns

Drawers

Used for:

Editing property details

Editing documents

Role assignment

Modals

Used for:

Confirmations

Destructive actions

File deletions

Tabs

Used for:

Documents

Media

Tasks

Stakeholders

Events

Toasts

Used for:

Success

Error

Network failure

8. Domain-Specific UX

8.1 Completion Score

Must always reflect:

% documents uploaded

% tasks completed

% flags resolved

% metadata completed

Display:

Circular badge

Tooltip showing breakdown

8.2 Stakeholder UX

Stakeholders must display:

Role badge

Permission badge

Invitation state

Remove/upgrade actions

8.3 Document UX

Each document row includes:

File type icon

File name

Uploaded by

Uploaded at

View / Replace / Delete actions

Viewer → can only view

Editor → can upload/delete

8.4 Events Timeline

Each event must include:

Icon

Summary sentence

User

Timestamp

Group by date

9. Accessibility Requirements

WCAG AA contrast

Focus rings on all interactive elements

Keyboard-accessible dialogs

Semantic headings

Aria attributes for complex controls

✔ END — DESIGN SYSTEM

