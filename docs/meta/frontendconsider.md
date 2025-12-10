Create a modern web application for my project: [PROJECT NAME].

[ADD SCREENSHOTS FOR DESIGN REFERENCE HERE]

RESEARCH PHASE (complete all before implementation):

1. Latest Next.js version features (App Router, Turbopack, experimental flags)
2. Latest Bun.js version capabilities (runtime optimizations, package management)
3. Latest shadcn/ui components and Tailwind v4 integration patterns
4. Tailwind CSS v4 config-free implementation (@theme directive, CSS-only approach)
5. Production-ready Next.js + Bun + shadcn architecture patterns

Note: Perform fresh internet research for each topic above to ensure latest information.

IMPLEMENTATION REQUIREMENTS:

- Initialize project: `[PROJECT-NAME]`
- Package manager: Bun (use `bunx create-next-app --yes`)
- Styling: Tailwind v4 without config file (research implementation first)
- Design: Implement UI inspired by provided screenshots
- Architecture: Turbopack-optimized, RSC-first, performance-focused

CODE ORGANIZATION:

- Create reusable components in organized structure (components/ui/, components/sections/)
- Modularize CSS with proper layers (@layer base/components/utilities)
- Implement proper component composition patterns
- Create utility functions in lib/utils.ts

QUALITY CHECKS (run all before completion):

- Type check: `bun run type-check` (ensure no TypeScript errors)
- Build test: `bun run build` (verify production build succeeds)
- Linting: `bun run lint` (fix all linting issues)
- Formatting: `bun run format` (ensure consistent code style)

DEVELOPMENT VERIFICATION:

- Start dev server: `bun run dev > /tmp/[PROJECT-NAME].log 2>&1 &`
- Verify running: `curl http://localhost:3000` and check response
- Monitor logs: `tail -f /tmp/[PROJECT-NAME].log` for errors
- Test in browser and verify all styles load correctly

If any phase encounters issues, research current solutions online before proceeding.
Document any issues found and fixes applied.