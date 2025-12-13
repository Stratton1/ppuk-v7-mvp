import Link from 'next/link';
import { Mail, MessageSquare, Clock, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const contactMethods = [
  {
    title: 'Email Support',
    description: 'For general enquiries and account questions.',
    icon: Mail,
    action: 'support@propertypassport.uk',
    actionType: 'email' as const,
  },
  {
    title: 'Technical Support',
    description: 'For platform issues, bugs, or integration help.',
    icon: MessageSquare,
    action: 'tech@propertypassport.uk',
    actionType: 'email' as const,
  },
];

const resources = [
  {
    title: 'FAQ',
    description: 'Common questions about Property Passport.',
    icon: HelpCircle,
    href: '/#public-faq',
  },
  {
    title: 'How It Works',
    description: 'Learn how property passports work.',
    icon: FileText,
    href: '/#public-how-it-works',
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Contact Us
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Have a question or need help? We're here to assist you with your property passport journey.
        </p>
      </section>

      {/* Contact Methods */}
      <section className="grid gap-4 md:grid-cols-2">
        {contactMethods.map((method) => {
          const Icon = method.icon;
          return (
            <Card key={method.title} className="border-border">
              <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{method.title}</CardTitle>
                <CardDescription>{method.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {method.actionType === 'email' ? (
                  <a
                    href={`mailto:${method.action}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {method.action}
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">{method.action}</span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Contact Form */}
      <section className="rounded-xl border border-border bg-card p-8 md:p-10">
        <div className="mx-auto max-w-2xl">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Send us a message</h2>
            <p className="text-muted-foreground">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>
          <form className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Smith" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your enquiry..."
                rows={5}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Send message
            </Button>
          </form>
        </div>
      </section>

      {/* Response Time */}
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Response times</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We aim to respond to all enquiries within 24 hours during business days (Monday–Friday, 9am–5pm GMT).
              For urgent technical issues affecting live transactions, please include "URGENT" in your subject line.
            </p>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">Helpful Resources</h2>
          <p className="mt-2 text-muted-foreground">
            You might find your answer in our existing documentation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Link key={resource.title} href={resource.href}>
                <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{resource.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
