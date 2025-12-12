import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Section } from './PageWrapper';

const faqItems = [
  {
    title: 'Is this legally binding?',
    desc: 'Passports centralize evidence and verification; your existing legal process still governs completion.',
  },
  {
    title: 'Who controls access?',
    desc: 'Owners and admins grant and revoke permissions. Public views require explicit visibility toggles.',
  },
  {
    title: 'How is data secured?',
    desc: 'Row Level Security, signed URLs, audit trails, and least-privilege roles by default.',
  },
  {
    title: 'What about legacy documents?',
    desc: 'Upload any file type, tag it, and assign verification status. Replace when superseded.',
  },
];

export function FAQ() {
  return (
    <Section dataTestId="public-faq">
      <Container className="space-y-6" dataTestId="public-faq-container">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">FAQ</h2>
          <p className="text-muted-foreground">What founders, conveyancers, and agents ask first.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((q) => (
            <Card key={q.title} className="border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">{q.title}</CardTitle>
                <CardDescription>{q.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default FAQ;
