# DESIGN SYSTEM (Phase 3)

This document codifies the UI/UX standards for PPUK v7. It complements Tailwind + shadcn primitives and the tokens in `frontend/styles/tokens.ts`.

## Foundations
- **Typography** (utility presets in `styles/tokens.ts`):
  - Display: `text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight`
  - H1: `text-3xl md:text-4xl font-semibold`
  - H2: `text-2xl md:text-3xl font-semibold`
  - H3: `text-xl font-semibold`
  - Body: `text-base text-muted-foreground`
  - Small: `text-sm text-muted-foreground`
- **Spacing**: use token sizes; default section spacing `space-y-6`.
- **Radii**: sm 0.375rem, md 0.5rem, lg 0.75rem, xl 1rem.
- **Elevation**: cards use `shadow-sm shadow-glow-xs`; hover `shadow-glow-sm`.
- **Colors**: prefer semantic Tailwind vars (`text-primary`, `text-muted-foreground`, `border-border/60`, `bg-card/80`).

## Primitives
Use shadcn components in `components/ui/*` as the single source for buttons, inputs, textarea, label, badge, card, dialog, tabs, skeleton, icon, toast.

## Layout
- **App shell**: `components/app/*` for PageHeader, Section, Shell, Sidebar, KPI, AccessUnavailable. Avoid legacy `components/layout/*`.
- **Sections**: wrap content in `AppSection`; title/description/actions in header; body padded by default.
- **Grid usage**: prefer responsive grids with consistent `gap-4`/`gap-6` and rounded cards.

## State Patterns
- **Loading**: use skeletons or text placeholders; avoid layout shift.
- **Empty**: concise message + optional CTA. Test IDs already added for admin/compare/watchlist/public/passport empties.
- **Error**: short description + retry where applicable; server actions should return structured errors.

## Domain Components
- **Dashboard**: `DashboardTabs` client-only, driven by server data; keep sections minimal and consistent (KPI cards, activity timeline, recommended properties).
- **Properties**: use `PropertyHeader`, `PropertyTabs`, and domain sections for docs/media/issues/tasks/timeline/stakeholders/access. Facts cards: EPC/Flood/Planning/Title/Crime. Prefer server components for data and client for forms/dialogs.
- **Issues**: list/card/timeline/badge/create form; keep severity/status badges consistent.
- **Documents/Media**: upload forms use shadcn inputs/buttons; list/grid with cards; signed URL usage hidden behind helpers.
- **Public passport**: hero/metadata/gallery/docs; keep minimal, fast, and consistent with marketing typography.
- **Marketing**: sections under `components/home/*` reuse Section/Container from PageWrapper; ensure headings follow the typography scale.

## Consistency Rules
- Do not invent new inline styles; use Tailwind + tokens.
- Avoid duplicate shells; use `AppShell`/`AppSection` instead of legacy layout components.
- Keep test IDs stable and deterministic for E2E.
- Keep server/client boundary clean: server for fetching/rendering, client for interactivity only.

## Performance Notes
- Batch expensive queries (e.g., compare counts) and keep signed URL caching via `signed-url-cache`.
- Limit data selections to needed columns; avoid N+1 fetches in loops.

## Extensibility
- Add new tokens to `styles/tokens.ts` if repeated patterns emerge (spacing, radii, typography variants).
- When creating new components, colocate in the appropriate domain folder: `components/property`, `components/dashboard`, `components/app`, etc.

## Testing & Accessibility
- Preserve `data-testid` attributes for critical flows.
- Forms must have labels; buttons/links must be descriptive; ensure focusable controls use standard shadcn components.

## Deprecations
- Plan to remove legacy `components/layout/*` and unused `components/app/PropertyLayout.tsx` after ensuring no references remain.
- Prefer `(public)/auth/login` over the duplicate `app/auth/login` route.
