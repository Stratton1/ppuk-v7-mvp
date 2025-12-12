import { Section, Container } from './PageWrapper';

// Placeholder to preserve existing UI (no logo cloud currently on the page)
export function LogoCloud() {
  return (
    <Section className="py-0" dataTestId="public-logo-cloud">
      <Container dataTestId="public-logo-cloud-container">
        <span className="sr-only">Partner logos placeholder</span>
      </Container>
    </Section>
  );
}

export default LogoCloud;
