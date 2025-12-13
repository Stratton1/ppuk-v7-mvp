# PROPERTY PASSPORT UK v7 — DESIGN SYSTEM

Version: 2.0  
Status: Authoritative  
Audience: Engineering, Product, Design, AI Agents (Claude Code)  
Scope: Entire PPUK platform — app, public passport, marketing, admin

---

## 0. Design Contract (Non-Negotiable)

This document defines the **single source of truth** for UI, UX, layout, motion, and visual hierarchy across Property Passport UK.

Any automated UI change (including Claude Code) MUST:
- Follow this system
- Improve clarity, trust, and perceived quality
- Never alter business logic, auth, permissions, or data flow
- Never introduce visual inconsistency between roles or pages

---

## 1. Design Philosophy

PPUK UI must feel:

**Professional** — credible for legal, financial, and property use  
**Calm** — low cognitive load, no visual noise  
**Modern** — subtle motion, clean spacing, soft depth  
**Trustworthy** — predictable patterns, stable layouts  
**Data-first** — information is always scannable

Avoid:
- Flashy effects
- Excessive gradients
- Over-animation
- Marketing gimmicks inside the app

---

## 2. Core Principles

### 2.1 Hierarchy
- Page title → section → card → row → metadata
- Never flatten hierarchy
- Important data must stand out without colour abuse

### 2.2 Predictability
- Same action = same location everywhere
- Editing = drawers/modals only
- Navigation = left sidebar (desktop), top menu (mobile)

### 2.3 Domain Language (Strict)
Use **only** approved terms:
- Property Passport
- Completion Score
- Stakeholder
- Owner / Buyer / Tenant
- Viewer / Editor
- Task / Document / Media / Flag / Watchlist

Never invent synonyms.

---

## 3. Layout System

### 3.1 Global Structure

Top Navigation
└─ Sidebar (desktop)
└─ Main Content
├─ Page Header
├─ Sections
└─ Cards / Tables
Footer (minimal)

### 3.2 Spacing Scale
| Token | Value |
|-----|------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

Never invent new spacing values.

---

## 4. Typography

### Font
System UI stack (Inter preferred)

### Usage
| Purpose | Class |
|------|------|
| Page Title | text-3xl font-semibold |
| Section Title | text-xl font-medium |
| Card Title | text-lg font-medium |
| Body | text-base |
| Meta | text-sm text-muted |
| Caption | text-xs text-muted |

---

## 5. Colour System

### Primary
- Blue 600 → primary action
- Blue 700 → hover/focus
- Blue 900 → titles

### Semantic
- Success → Green 600
- Warning → Amber 600
- Error → Red 600
- Info → Blue 500

### Neutral
Slate 50–900

Rules:
- Colour = state, not decoration
- Never rely on colour alone for meaning

---

## 6. Elevation & Motion (Very Important)

### Elevation Tokens
- Base: `shadow-sm`
- Interactive hover: `hover:shadow-glow-sm`
- Active focus: `ring-2 ring-primary/20`

### Motion Rules
- Transitions only on:
  - hover
  - expand/collapse
  - loading completion
- Durations:
  - Fast: 150ms
  - Standard: 200–300ms
- Easing:
  - `ease-out` preferred

No infinite animations. No bouncing.

---

## 7. Components

### Cards
Must include:
- Title
- Optional description
- Content
- Optional action area

Always:
- `rounded-xl`
- `border-border/60`
- `bg-card/80`

### Buttons
Variants:
- primary
- secondary
- outline
- ghost
- destructive

Icons:
- Lucide only
- One icon max per button

---

## 8. Loading & Empty States

### Loading
- Skeletons preferred over spinners
- Skeleton shape must match final content
- No layout shift

### Empty States
- Calm tone
- Clear explanation
- Optional next action

Never show “blank” areas.

---

## 9. Public vs App UI

### App UI
- Dense, data-forward
- Minimal imagery
- Focus on progress & status

### Public / Marketing
- More whitespace
- Hero imagery allowed
- Still restrained and professional

---

## 10. Accessibility (Required)

- WCAG AA contrast
- Keyboard navigation
- Focus rings always visible
- Semantic headings
- ARIA where required

---

## 11. AI Agent Rules (Claude Code)

Claude Code MAY:
- Improve spacing, typography, hierarchy
- Add subtle motion per this spec
- Improve empty/loading states
- Align components visually

Claude Code MUST NOT:
- Change routes
- Change auth
- Change permissions
- Introduce new UI paradigms
- Redesign without reference to this file

✔ END — DESIGN SYSTEM v2.0