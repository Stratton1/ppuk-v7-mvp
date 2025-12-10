import { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppTopbar } from '@/components/layout/app-topbar';
import { Toaster, ToastProvider } from '@/components/ui/use-toast';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 overflow-auto bg-background">
            <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
          </main>
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  );
}
