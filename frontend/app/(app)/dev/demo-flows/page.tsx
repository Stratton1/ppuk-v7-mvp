import Link from 'next/link';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const flows = [
  {
    id: 'dev-demo-owner',
    title: 'Owner — Day 1',
    steps: [
      'Login via /dev/test-users (Owner).',
      'Open /dashboard then create a property.',
      'Upload EPC and Title docs, upload media.',
      'Raise an issue from the property Issues tab.',
    ],
    links: ['/dashboard', '/properties'],
  },
  {
    id: 'dev-demo-buyer',
    title: 'Buyer — Due diligence',
    steps: [
      'Login via /dev/test-users (Buyer).',
      'Open /watchlist or /properties.',
      'View Passport, documents, history, and issues.',
    ],
    links: ['/watchlist', '/properties'],
  },
  {
    id: 'dev-demo-agent',
    title: 'Agent — Listing management',
    steps: [
      'Login via /dev/test-users (Agent).',
      'Review assigned properties on /dashboard.',
      'Update property details and upload media.',
    ],
    links: ['/dashboard', '/properties'],
  },
  {
    id: 'dev-demo-conveyancer',
    title: 'Conveyancer — Case review',
    steps: [
      'Login via /dev/test-users (Conveyancer).',
      'Open assigned property and review documents/issues.',
      'Add comments or update issue status as needed.',
    ],
    links: ['/properties'],
  },
  {
    id: 'dev-demo-admin',
    title: 'Admin — System overview',
    steps: [
      'Login via /dev/test-users (Admin).',
      'Open /dashboard and /admin to review system metrics.',
      'Use Test Data panel to reset/seed before E2E runs.',
    ],
    links: ['/dashboard', '/admin', '/dev/test-data'],
  },
];

export default function DevDemoFlowsPage() {
  return (
    <div className="space-y-6" data-testid="dev-demo-flows-page">
      <AppSection
        title="Dev demo flows"
        description="Scripted scenarios for internal QA. Use test users first, then follow the links."
      >
        <div className="space-y-4">
          {flows.map((flow) => (
            <Card key={flow.id} data-testid={flow.id}>
              <CardHeader>
                <CardTitle className="text-base">{flow.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-4">
                  {flow.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  {flow.links.map((href) => (
                    <Link key={href} href={href} className="text-primary underline">
                      {href}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AppSection>
    </div>
  );
}
