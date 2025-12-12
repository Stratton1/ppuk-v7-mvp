import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const links = [
  {
    href: '/dev/test-users',
    title: 'Test Users',
    description: 'Quick login with seeded accounts for each role.',
    testId: 'dev-link-test-users',
  },
  {
    href: '/dev/test-data',
    title: 'Test Data',
    description: 'Reset and seed demo data for QA and Playwright.',
    testId: 'dev-link-test-data',
  },
  {
    href: '/dev/components',
    title: 'Components Gallery',
    description: 'Preview UI components and patterns.',
    testId: 'dev-link-components',
  },
  {
    href: '/test/login',
    title: 'Test Login',
    description: 'Manual login panel for automation flows.',
    testId: 'dev-link-test-login',
  },
  {
    href: '#reset-info',
    title: 'Reset State',
    description: 'Use /api/test/reset via the Test Data panel.',
    testId: 'dev-link-reset-info',
  },
  {
    href: '/dev/demo-flows',
    title: 'Demo Flows',
    description: 'Scripted scenarios per role.',
    testId: 'dev-link-demo-flows',
  },
];

export default function DevIndexPage() {
  return (
    <div className="space-y-6" data-testid="dev-index-root">
      <div className="rounded-lg border border-amber-500/50 bg-amber-50 p-4 dark:bg-amber-950/20">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Development Environment
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          These tools are only available in development or test environments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((route) => (
          <Link key={route.href} href={route.href} data-testid={route.testId}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{route.title}</CardTitle>
                <CardDescription>{route.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary hover:underline">Open →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div id="reset-info" className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Use the <Link href="/dev/test-data" className="text-primary underline">Test Data</Link> panel
        to run `/api/test/reset` and `/api/test/seed`. These routes are guarded and safe to call only in dev/test.
      </div>
    </div>
  );
}
