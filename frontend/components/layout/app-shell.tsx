import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import type { ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
