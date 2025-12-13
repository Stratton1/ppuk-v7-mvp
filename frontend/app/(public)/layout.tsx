'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import '../globals.css';

const navLinks = [
  { href: '/auth/login', label: 'Login' },
  { href: '/auth/register', label: 'Register' },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
            Property Passport
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 transition ${
                  pathname === link.href ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
