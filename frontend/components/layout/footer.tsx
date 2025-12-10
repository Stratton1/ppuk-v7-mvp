export const Footer = () => {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Property Passport UK. All rights reserved.</span>
        <span>Built with security, RLS, and validation-first principles.</span>
      </div>
    </footer>
  );
};
