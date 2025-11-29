import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-xl border bg-card p-8 text-card-foreground shadow-sm md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight text-primary">Property Passport UK</h1>
          <p className="text-muted-foreground">
            A single, secure, UPRN-anchored passport for every UK property. Validate data, share safely, and keep
            stakeholders aligned with RLS-backed access controls.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/auth/register">Get started</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
        </div>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Search a property</CardTitle>
            <CardDescription>UPRN-first lookup with secure data-sharing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Enter UPRN or postcode" />
            <Button className="w-full">Search</Button>
            <p className="text-xs text-muted-foreground">
              This is a placeholder. Integrate with Edge Function APIs and cache responses per blueprint.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Secure by design',
            desc: 'RLS, signed URLs, and sanitized errors across all endpoints.',
          },
          {
            title: 'Validated inputs',
            desc: 'Zod everywhere: forms, requests, edge functions, and config.',
          },
          {
            title: 'Observable & tested',
            desc: 'CI gates for lint/type/test/build; audit logs on critical actions.',
          },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
