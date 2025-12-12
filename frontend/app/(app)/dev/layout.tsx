import { ReactNode } from 'react';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Developer Tools"
        description="Development utilities and component showcase for PPUK v7."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Developer' },
        ]}
      />
      {children}
    </div>
  );
}
