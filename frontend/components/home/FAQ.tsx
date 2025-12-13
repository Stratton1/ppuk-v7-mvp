import { HelpCircle } from 'lucide-react';
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
      <Container className="space-y-8" dataTestId="public-faq-container">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Frequently asked questions</h2>
          <p className="text-muted-foreground">Common questions from property professionals and homeowners.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((q) => (
            <div key={q.title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{q.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{q.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default FAQ;
