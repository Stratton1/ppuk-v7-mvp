Superseded by REPO_STRUCTURE.md (canonical). This file is retained temporarily.
Project Tree (key paths, Next.js-only)

.
├─ docs/
├─ frontend/
│  ├─ app/
│  │  ├─ dashboard/ (error.tsx, loading.tsx, page.tsx)
│  │  ├─ properties/ (error.tsx, loading.tsx, page.tsx)
│  │  ├─ search/page.tsx
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ providers.tsx
│  │  ├─ globals.css
│  │  ├─ not-found.tsx
│  │  └─ favicon.ico
│  ├─ actions/ (server actions for documents, media, roles, visibility, tasks, uploads)
│  ├─ components/
│  │  ├─ dashboard/ (access-card, activity-timeline, kpi-card, property-card, recent-activity)
│  │  ├─ layout/ (app-shell, footer, global-search, navbar, sidebar)
│  │  ├─ property/ (access, cards, docs, events, flags, gallery, header, list, meta, forms, dialogs, tasks)
│  │  ├─ public-passport/ (hero, metadata, gallery, documents)
│  │  └─ ui/ (badge, button, card, dialog, input, label, skeleton, textarea)
│  ├─ lib/
│  │  ├─ document-utils.ts
│  │  ├─ role-utils.ts
│  │  ├─ signed-url.ts
│  │  └─ supabase/ (client.ts, server.ts)
│  ├─ hooks/ (README.md)
│  ├─ utils/ (README.md)
│  ├─ providers/ (query-provider.tsx, supabase-provider.tsx)
│  ├─ types/ (supabase.ts)
│  ├─ public/ (svg assets)
│  ├─ middleware.ts
│  ├─ components.json
│  ├─ next.config.ts
│  ├─ tailwind.config.ts
│  ├─ tsconfig.json
│  └─ package.json
├─ supabase/ (migrations/, seed.sql, config.toml)
├─ package.json
├─ tsconfig.json
├─ eslint.config.js
├─ vercel.json
└─ vitest.config.ts
