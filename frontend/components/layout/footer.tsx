import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Search', href: '/search' },
    { label: 'How it works', href: '/#public-how-it-works' },
    { label: 'FAQ', href: '/#public-faq' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="text-lg font-semibold text-foreground">Property Passport UK</div>
            <p className="text-sm text-muted-foreground">
              The digital passport for UK properties. Faster, safer, transparent transactions.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-medium text-foreground">Product</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-medium text-foreground">Company</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-medium text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Property Passport UK. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with security-first principles.
          </p>
        </div>
      </div>
    </footer>
  );
};
