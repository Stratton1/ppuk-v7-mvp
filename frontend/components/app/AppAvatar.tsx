import React from 'react';
import { cn } from '@/lib/utils';

type AppAvatarProps = {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses: Record<NonNullable<AppAvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'PP';
}

export function AppAvatar({ name, email, imageUrl, size = 'md', className }: AppAvatarProps) {
  const initials = getInitials(name, email);
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary/80 via-accent/80 to-primary text-background shadow-glow-sm ring-2 ring-border/60',
        sizeClass,
        className
      )}
      aria-label={name || email || 'User'}
      role="img"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name || email || 'User avatar'}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="font-semibold tracking-tight">{initials}</span>
      )}
    </div>
  );
}

export default AppAvatar;
