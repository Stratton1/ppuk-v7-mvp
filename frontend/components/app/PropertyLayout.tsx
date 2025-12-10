import React from 'react';
import { cn } from '@/lib/utils';

type PropertyLayoutProps = {
  header: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
};

export function PropertyLayout({ header, children, sidebar, className }: PropertyLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {header}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">{children}</div>
        {sidebar && <div className="space-y-6">{sidebar}</div>}
      </div>
    </div>
  );
}

export default PropertyLayout;
