// Design tokens for PPUK v7 frontend (Phase 3)
// Centralize spacing, radii, typography scale, and colors used in Tailwind classes.
// Keep in sync with Tailwind config choices to maintain consistency.

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
};

export const radii = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
};

export const typography = {
  display: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
  h1: 'text-3xl md:text-4xl font-semibold tracking-tight',
  h2: 'text-2xl md:text-3xl font-semibold tracking-tight',
  h3: 'text-xl font-semibold',
  body: 'text-base text-muted-foreground',
  small: 'text-sm text-muted-foreground',
};

export const elevations = {
  card: '',
  cardHover: 'hover:border-primary/50',
};

export const colors = {
  primary: 'text-primary',
  muted: 'text-muted-foreground',
  border: 'border-border',
  bgCard: 'bg-card',
};

export const layout = {
  section: 'space-y-6',
  gridGap: 'gap-4',
};
