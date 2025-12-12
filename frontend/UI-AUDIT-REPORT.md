# PPUK v7 UI Audit Report

**Date:** 2025-12-12
**Scope:** Visual analysis of captured screenshots from Playwright visual tests
**Constraints:** No functional, auth, or data changes - purely visual/design improvements

---

## Executive Summary

The PPUK v7 frontend has a **well-designed homepage** with modern aesthetics, but suffers from **significant inconsistency** between public marketing pages and authentication flows. The login page is noticeably under-designed compared to the register page, creating a jarring user experience.

**Overall Assessment:** 6/10 - Good foundation, needs cohesion work

---

## Screenshots Analyzed

| Screenshot | Route | Description |
|------------|-------|-------------|
| public-homepage.png | `/` | Marketing homepage (927KB, full-page) |
| public-login.png | `/auth/login` | Login form |
| public-register.png | `/auth/register` | Registration form |
| *-unauth.png | Protected routes | All redirect to login (expected) |

---

## Detailed Findings

### 1. Homepage (`/`) - Rating: 9/10

**Strengths:**
- Modern gradient accents (primary/accent/success blend)
- Clean visual hierarchy with clear CTAs
- Polished "Passport Preview" card component
- Well-structured sections (Hero, Stats, Why, How, FAQ)
- Consistent use of `rounded-2xl` and `rounded-3xl` for cards
- Proper use of `backdrop-blur` and subtle shadows
- Good typography scale and spacing

**Minor Issues:**
- Footer text "Homepage complete. Ready for you to copy into Cursor." is visible (dev artifact)
- Third-party dev widgets visible in corners (Vercel/Next.js indicators)

**Component Mapping:**
- `components/home/HeroSection.tsx` - Excellent
- `components/home/PageWrapper.tsx` - Good utility components
- `components/home/*.tsx` - All well-designed

---

### 2. Login Page (`/auth/login`) - Rating: 3/10

**Critical Issues:**

| Issue | Severity | Description |
|-------|----------|-------------|
| No header/navigation | High | User cannot navigate back to homepage |
| No branding | High | No logo, no identity - feels like a template |
| Stark black button | Medium | `bg-black` conflicts with design system `bg-primary` |
| Missing "Forgot password" | Medium | Standard UX pattern missing |
| Missing "Create account" link | Medium | No path to registration |
| Basic input styling | Medium | Uses raw `rounded border p-2` not UI system |
| No visual interest | Low | Plain gray background, no gradients |

**Component Mapping:**
- `app/auth/login/page.tsx:18-29` - Inline layout, not using shared components
- `components/auth/LoginForm.tsx:64-91` - Raw HTML inputs, not `<Input>` component

**Root Cause:**
Login page was built separately from the public route group and doesn't use the established design system components (`Button`, `Input`, `Card`, `AppPageHeader`).

---

### 3. Register Page (`/auth/register`) - Rating: 8/10

**Strengths:**
- Uses `AppPageHeader` with breadcrumbs
- Proper `Card` component with `CardHeader`/`CardContent`
- Uses design system `Button` and `Input` components
- Has "Already have an account? Sign in" link
- Gradient accent in header matches homepage
- Navigation header visible

**Minor Issues:**
- Pre-filled placeholder email (`owner@ppuk.test`) looks odd
- Could benefit from password requirements hint

**Component Mapping:**
- `app/(public)/auth/register/page.tsx` - Good structure
- `app/(public)/auth/register/register-form.tsx` - Uses proper UI components

---

### 4. Protected Routes (Unauthenticated State)

All protected routes correctly redirect to login. However, this exposes the login page design issues for every protected route access.

---

## Design System Analysis

### What's Working

1. **CSS Variables:** Comprehensive design tokens in `globals.css`
   - Color system (brand navy, slate scale, accent colors)
   - Typography scale
   - Spacing scale
   - Border radius scale

2. **UI Components:** Well-built shadcn/ui components
   - `Button` with proper variants (default, secondary, outline, ghost)
   - `Input` with focus states and proper styling
   - `Card` with header/content structure
   - `Badge` with color variants

3. **Utility Classes:** Custom Tailwind utilities
   - `shadow-glow`, `shadow-glow-lg`, `shadow-glow-xs`
   - Gradient backgrounds

### What's Broken

1. **Inconsistent Component Usage:**
   - `LoginForm.tsx` uses raw `<input>` and `<button>` elements
   - Should use `<Input>` and `<Button>` from UI library

2. **Layout Inconsistency:**
   - Register page uses `AppPageHeader` + `Card`
   - Login page uses inline `div` with manual styling

3. **Route Group Mismatch:**
   - Login is at `app/auth/login/` (outside public group)
   - Register is at `app/(public)/auth/register/` (inside public group)
   - This causes different layouts to apply

---

## Component-to-Issue Mapping

| Component | File Path | Issues |
|-----------|-----------|--------|
| LoginForm | `components/auth/LoginForm.tsx` | Raw inputs, black button, no forgot password |
| Login Page | `app/auth/login/page.tsx` | No navigation, no branding, no AppPageHeader |
| Register Page | `app/(public)/auth/register/page.tsx` | Minor: placeholder email |

---

## UI Modernisation Plan

### Priority 1: Critical (Do First)

**1.1 Redesign Login Page**
- Move to `app/(public)/auth/login/` route group for consistent layout
- Add `AppPageHeader` with breadcrumbs
- Use `Card` component structure matching register page
- Update `LoginForm.tsx` to use `<Input>` and `<Button>` components
- Add "Forgot password?" link
- Add "Create account" link

**Files to modify:**
- `app/auth/login/page.tsx` (or move to `app/(public)/auth/login/page.tsx`)
- `components/auth/LoginForm.tsx`

**Estimated complexity:** Low-Medium

---

### Priority 2: Important (Do Second)

**2.1 Unify Auth Page Layout**
- Create shared `AuthLayout` or use existing `(public)` layout
- Ensure login/register/forgot-password all share same chrome

**2.2 Remove Dev Artifacts**
- Remove "Homepage complete" text from homepage footer
- Ensure Vercel/Next.js dev indicators don't appear in production screenshots

**Files to modify:**
- `app/(public)/page.tsx:26` - Remove dev text
- Build config for production screenshots

**Estimated complexity:** Low

---

### Priority 3: Polish (Incremental)

**3.1 Add Password Requirements UI**
- Show password strength indicator on register
- Show password requirements hint

**3.2 Improve Form Labels**
- Add proper `<Label>` components to login form
- Ensure consistent label styling across all forms

**3.3 Add Loading States**
- Ensure login button shows loading state during auth
- Match register page's "Creating account..." pattern

**Estimated complexity:** Low

---

### Leave Alone (No Changes Needed)

1. **Homepage** - Already excellent
2. **UI Component Library** - Well-designed shadcn/ui base
3. **Design Tokens** - Comprehensive CSS variables
4. **Register Page Structure** - Good reference implementation

---

## Implementation Checklist

```
Phase 1: Login Page Overhaul
[ ] Move login route to (public) group OR apply public layout
[ ] Add AppPageHeader with breadcrumbs
[ ] Wrap form in Card component
[ ] Replace raw inputs with Input component
[ ] Replace raw button with Button component
[ ] Add "Forgot password?" link
[ ] Add "Create account" link
[ ] Test visual consistency with register page

Phase 2: Cleanup
[ ] Remove dev artifact text from homepage
[ ] Verify production build doesn't show dev widgets

Phase 3: Polish
[ ] Add password requirements hint to register
[ ] Add proper Labels to login form
[ ] Add loading state to login button
```

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| Moving login route | Low | Test auth redirect still works |
| Updating LoginForm | Low | Pure visual, no auth logic changes |
| Removing dev text | None | Safe removal |

---

## Summary

The main issue is the **login page** which feels like an afterthought compared to the polished homepage and register page. The fix is straightforward: apply the same component patterns used in the register page to the login page.

**Recommended approach:** Start with Priority 1 (login page redesign) as it affects every user's first authenticated interaction with the app.
