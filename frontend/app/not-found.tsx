export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}
